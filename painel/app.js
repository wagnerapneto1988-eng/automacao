const SUPABASE_URL = 'https://osjdrnttwmcaiwbxeqjk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Owpbh695uOMHpXhzK9O0Pg_4DAcBJXB';
const PHONE = '5511915193477';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let leads = [];
let prospects = [];
const statuses = ['novo','contato','orcamento','fechado'];
const statusLabels = {novo:'Novo',contato:'Contato',orcamento:'Orçamento',fechado:'Fechado',perdido:'Perdido'};

const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const fmtDate=s=>s?new Date(s+'T12:00:00').toLocaleDateString('pt-BR'):'A definir';

function wa(l){
  const phone = String(l.whatsapp || l.telefone || '').replace(/\D/g,'');
  const finalPhone = phone.startsWith('55') ? phone : '55'+phone;
  const msg = `Olá, ${l.nome}! Aqui é do Buffet Vó Sabina. Podemos conversar sobre seu ${String(l.tipo_evento||'evento').toLowerCase()}?`;
  return `https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`;
}

async function ensureSession(){
  const { data } = await sb.auth.getSession();
  if(data.session){
    document.querySelector('#loginScreen').classList.add('hidden');
    await loadAll();
  }else{
    document.querySelector('#loginScreen').classList.remove('hidden');
  }
}

document.querySelector('#loginForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const username=document.querySelector('#loginUser').value.trim().toLowerCase();
  const email = username.includes('@') ? username : `${username}@vosabina.local`;
  const password=document.querySelector('#loginPassword').value;
  const msg=document.querySelector('#loginMsg');
  msg.textContent='Entrando...';
  const { error } = await sb.auth.signInWithPassword({email,password});
  if(error){ msg.textContent=error.message; return; }
  msg.textContent='';
  document.querySelector('#loginScreen').classList.add('hidden');
  await loadAll();
});

document.querySelector('#logoutBtn')?.addEventListener('click', async ()=>{
  await sb.auth.signOut();
  document.querySelector('#loginScreen').classList.remove('hidden');
});

async function loadAll(){
  const [leadRes, prospectRes] = await Promise.all([
    sb.from('leads').select('*').order('created_at',{ascending:false}),
    sb.from('prospeccao_clientes').select('*').order('created_at',{ascending:false})
  ]);

  if(leadRes.error){
    alert('Erro ao carregar leads: '+leadRes.error.message);
    return;
  }

  if(prospectRes.error){
    alert('Erro ao carregar prospecção: '+prospectRes.error.message);
    return;
  }

  leads = leadRes.data || [];
  prospects = prospectRes.data || [];
  render();
}

async function saveLead(payload){
  const { data, error } = await sb.from('leads').insert(payload).select().single();
  if(error) throw error;
  return data;
}

async function updateLead(id, patch){
  const { error } = await sb.from('leads').update(patch).eq('id',id);
  if(error) throw error;
}

async function deleteLead(id){
  const { error } = await sb.from('leads').delete().eq('id',id);
  if(error) throw error;
}


async function updateProspect(id, patch){
  const { error } = await sb.from('prospeccao_clientes').update(patch).eq('id',id);
  if(error) throw error;
}

async function deleteProspect(id){
  const { error } = await sb.from('prospeccao_clientes').delete().eq('id',id);
  if(error) throw error;
}

function prospectWa(p){
  const phone = String(p.whatsapp || p.telefone || '').replace(/\D/g,'');
  if(!phone) return '#';
  const finalPhone = phone.startsWith('55') ? phone : '55'+phone;
  const msg = `Olá, ${p.nome}! Aqui é do Buffet Vó Sabina. Vi que você demonstrou interesse em ${String(p.tipo_evento||'evento').toLowerCase()}. Posso preparar uma proposta para você?`;
  return `https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`;
}

function render(){
 document.querySelector('#mLeads').textContent=leads.filter(x=>x.status!=='perdido').length + prospects.filter(x=>!['indisponivel','sem_interesse'].includes(x.status)).length;
 document.querySelector('#mQuotes').textContent=leads.filter(x=>x.status==='orcamento').length;
 document.querySelector('#mEvents').textContent=leads.filter(x=>x.status==='fechado').length;
 document.querySelector('#mRevenue').textContent=money(leads.filter(x=>x.status==='fechado').reduce((s,x)=>s+Number(x.valor_estimado||0),0));

 const max=Math.max(1,...statuses.map(s=>leads.filter(x=>x.status===s).length));
 document.querySelector('#funnel').innerHTML=statuses.map(s=>{
   const n=leads.filter(x=>x.status===s).length;
   return `<div class="funnel-row"><span>${statusLabels[s]}</span><div class="bar"><i style="width:${n/max*100}%"></i></div><b>${n}</b></div>`;
 }).join('');

 const events=leads.filter(x=>x.status==='fechado').sort((a,b)=>(a.data_evento||'9999').localeCompare(b.data_evento||'9999'));
 document.querySelector('#nextEvents').innerHTML=events.length?events.map(x=>`
   <div class="eventline"><div><b>${x.nome}</b><small>${x.tipo_evento||'Evento'} • ${x.convidados||'?'} convidados</small></div><strong>${fmtDate(x.data_evento)}</strong></div>`
 ).join(''):'<small>Nenhum evento confirmado.</small>';

 document.querySelector('#followups').innerHTML=leads.filter(x=>!['fechado','perdido'].includes(x.status)).slice(0,6).map(x=>`
   <tr><td>${x.nome}</td><td>${x.tipo_evento||'-'}</td><td><span class="status">${statusLabels[x.status]||x.status}</span></td><td><a class="wa" target="_blank" href="${wa(x)}">Chamar no WhatsApp</a></td></tr>`
 ).join('');

 document.querySelector('#kanban').innerHTML = `
   <div class="column"><h3>PROSPECÇÃO • ${prospects.length}</h3>
     ${prospects.map(p=>`
       <div class="leadcard">
         <b>${p.nome}</b>
         <small>${p.tipo_evento||'Evento'} • ${p.regiao||'-'} • ${p.convidados||'?'} convidados</small>
         <small>Prioridade: ${(p.prioridade||'media').toUpperCase()} • ${money(p.valor_potencial)}</small>
         <small>Status: ${p.status||'novo'}</small>
         <div class="actions">
           ${p.whatsapp || p.telefone ? `<a class="sendbtn" target="_blank" href="${prospectWa(p)}">WhatsApp</a>` : ''}
           ${p.link_fonte ? `<a class="sendbtn" target="_blank" href="${p.link_fonte}">Fonte</a>` : ''}
           <button data-prospect-move="${p.id}">Virar lead</button>
           <button data-prospect-delete="${p.id}">Excluir</button>
         </div>
       </div>`).join('')}
   </div>
   ${statuses.map(s=>`
   <div class="column"><h3>${statusLabels[s].toUpperCase()} • ${leads.filter(x=>x.status===s).length}</h3>
   ${leads.filter(x=>x.status===s).map(x=>`
     <div class="leadcard">
       <b>${x.nome}</b>
       <small>${x.tipo_evento||'Evento'} • ${x.convidados||'?'} convidados</small>
       <small>${fmtDate(x.data_evento)} • ${money(x.valor_estimado)}</small>
       <div class="actions">
         <a class="sendbtn" target="_blank" href="${wa(x)}">WhatsApp</a>
         <button data-move="${x.id}" data-dir="-1">←</button>
         <button data-move="${x.id}" data-dir="1">Avançar →</button>
         <button data-delete="${x.id}">Excluir</button>
       </div>
     </div>`).join('')}
   </div>`).join('')}`;

 document.querySelector('#clientsTable').innerHTML=leads.map(x=>`
   <tr><td>${x.nome}</td><td>${x.telefone||x.whatsapp||'-'}</td><td>${x.tipo_evento||'-'}</td><td>${statusLabels[x.status]||x.status}</td><td><a class="wa" target="_blank" href="${wa(x)}">WhatsApp</a></td></tr>`
 ).join('');

 document.querySelector('#quotesTable').innerHTML=leads.filter(x=>['orcamento','fechado'].includes(x.status)).map(x=>`
   <tr><td>${x.nome}</td><td>${x.tipo_evento||'-'}</td><td>${x.convidados||'-'}</td><td>${money(x.valor_estimado)}</td><td>${statusLabels[x.status]}<br><a class="wa" target="_blank" href="${wa(x)}">Enviar no WhatsApp</a></td></tr>`
 ).join('');

 document.querySelector('#calendar').innerHTML=leads.filter(x=>x.data_evento).sort((a,b)=>a.data_evento.localeCompare(b.data_evento)).map(x=>`
   <article class="calcard"><time>${fmtDate(x.data_evento)}</time><h3>${x.nome}</h3><p>${x.tipo_evento||'Evento'} • ${x.convidados||'?'} convidados</p><span class="status">${statusLabels[x.status]||x.status}</span></article>`
 ).join('');

 const closed=leads.filter(x=>x.status==='fechado');
 const total=closed.reduce((s,x)=>s+Number(x.valor_estimado||0),0);
 const entry=total*.3;
 document.querySelector('#financeMetrics').innerHTML=`
   <article><span>CONTRATADO</span><strong>${money(total)}</strong><small>eventos fechados</small></article>
   <article><span>ENTRADAS (30%)</span><strong>${money(entry)}</strong><small>estimativa de sinal</small></article>
   <article><span>SALDO</span><strong>${money(total-entry)}</strong><small>a receber</small></article>
   <article><span>TICKET MÉDIO</span><strong>${money(closed.length?total/closed.length:0)}</strong><small>por evento</small></article>`;
 document.querySelector('#financeTable').innerHTML=closed.map(x=>{
   const e=Number(x.valor_estimado||0)*.3;
   return `<tr><td>${x.nome}</td><td>${money(x.valor_estimado)}</td><td>${money(e)}</td><td>${money(Number(x.valor_estimado||0)-e)}</td><td><span class="status">Contratado</span></td></tr>`;
 }).join('');
 bindDynamic();
}

function bindDynamic(){
 document.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('click', async ()=>{
   const l=leads.find(x=>x.id===b.dataset.move);
   const i=Math.max(0,Math.min(statuses.length-1,statuses.indexOf(l.status)+Number(b.dataset.dir)));
   try{
     await updateLead(l.id,{status:statuses[i]});
     await loadAll();
   }catch(err){ alert(err.message); }
 }));
 document.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click', async ()=>{
   if(!confirm('Excluir este contato?')) return;
   try{
     await deleteLead(b.dataset.delete);
     await loadAll();
   }catch(err){ alert(err.message); }
 }));

 document.querySelectorAll('[data-prospect-delete]').forEach(b=>b.addEventListener('click', async ()=>{
   if(!confirm('Excluir esta oportunidade da prospecção?')) return;
   try{
     await deleteProspect(b.dataset.prospectDelete);
     await loadAll();
   }catch(err){ alert(err.message); }
 }));

 document.querySelectorAll('[data-prospect-move]').forEach(b=>b.addEventListener('click', async ()=>{
   const p = prospects.find(x=>x.id===b.dataset.prospectMove);
   if(!p) return;
   try{
     await saveLead({
       nome:p.nome,
       telefone:p.telefone || null,
       whatsapp:p.whatsapp || null,
       tipo_evento:p.tipo_evento || null,
       convidados:Number(p.convidados||0),
       data_evento:null,
       valor_estimado:Number(p.valor_potencial||0),
       status:'novo',
       origem:'prospeccao',
       observacoes:`Origem pública: ${p.fonte||''} ${p.link_fonte||''} ${p.observacoes||''}`.trim()
     });
     await updateProspect(p.id,{status:'contatado'});
     await loadAll();
   }catch(err){ alert('Erro ao converter oportunidade em lead: '+err.message); }
 }));
}

const titles={dashboard:'Visão geral',leads:'Captação de clientes',clientes:'Clientes',orcamentos:'Orçamentos',agenda:'Agenda',financeiro:'Financeiro'};
function go(v){
 document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id===v));
 document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x.dataset.view===v));
 document.querySelector('#pageTitle').textContent=titles[v];
 document.querySelector('.sidebar').classList.remove('open');
}
document.querySelectorAll('#nav button').forEach(b=>b.addEventListener('click',()=>go(b.dataset.view)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
document.querySelector('#menu').addEventListener('click',()=>document.querySelector('.sidebar').classList.toggle('open'));

const modal=document.querySelector('#modalbg');
const openModal=()=>modal.classList.add('show');
const closeModal=()=>modal.classList.remove('show');

document.querySelector('#newLead').addEventListener('click',openModal);
document.querySelector('#addLead2').addEventListener('click',openModal);
document.querySelector('#close').addEventListener('click',closeModal);
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});

document.querySelector('#leadForm').addEventListener('submit', async e=>{
 e.preventDefault();
 const payload={
   nome:document.querySelector('#name').value.trim(),
   telefone:document.querySelector('#phone').value.trim(),
   whatsapp:document.querySelector('#phone').value.trim(),
   tipo_evento:document.querySelector('#eventType').value,
   convidados:Number(document.querySelector('#guests').value||0),
   data_evento:document.querySelector('#date').value||null,
   valor_estimado:Number(document.querySelector('#value').value||0),
   status:'novo',
   origem:document.querySelector('#source').value.toLowerCase(),
   observacoes:document.querySelector('#notes').value.trim()
 };
 try{
   await saveLead(payload);
   e.target.reset();
   closeModal();
   await loadAll();
   go('leads');
 }catch(err){ alert('Erro ao salvar: '+err.message); }
});

document.querySelector('#sendWhatsApp')?.addEventListener('click',()=>{
  const msg='Olá! Aqui é do Buffet Vó Sabina. Gostaria de falar sobre seu evento e preparar um orçamento personalizado para você.';
  window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`,'_blank');
});

sb.auth.onAuthStateChange((event)=>{
  if(event==='SIGNED_OUT') document.querySelector('#loginScreen').classList.remove('hidden');
});

ensureSession();
