const PHONE='5511915193477';
let leads=JSON.parse(localStorage.getItem('vs_leads')||'null')||[
{id:1,name:'Mariana',phone:'11987654321',type:'Casamento',guests:120,date:'2026-10-17',value:6800,status:'Orçamento',source:'Indicação',notes:''},
{id:2,name:'Carlos',phone:'11976543210',type:'Aniversário',guests:60,date:'2026-09-12',value:3200,status:'Contato',source:'WhatsApp',notes:''},
{id:3,name:'Empresa Alfa',phone:'11965432109',type:'Corporativo',guests:80,date:'2026-09-25',value:4500,status:'Fechado',source:'Prospecção',notes:''}
];
const statuses=['Novo','Contato','Orçamento','Fechado'];
const save=()=>localStorage.setItem('vs_leads',JSON.stringify(leads));
const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const fmtDate=s=>s?new Date(s+'T12:00:00').toLocaleDateString('pt-BR'):'A definir';
function wa(l){return `https://wa.me/55${String(l.phone).replace(/\D/g,'').replace(/^55/,'')}?text=${encodeURIComponent('Olá, '+l.name+'! Aqui é do Buffet Vó Sabina. Podemos conversar sobre seu '+l.type.toLowerCase()+'?')}`}

function render(){
 document.querySelector('#mLeads').textContent=leads.length;
 document.querySelector('#mQuotes').textContent=leads.filter(x=>x.status==='Orçamento').length;
 document.querySelector('#mEvents').textContent=leads.filter(x=>x.status==='Fechado').length;
 document.querySelector('#mRevenue').textContent=money(leads.filter(x=>x.status==='Fechado').reduce((s,x)=>s+Number(x.value||0),0));
 const max=Math.max(1,...statuses.map(s=>leads.filter(x=>x.status===s).length));
 document.querySelector('#funnel').innerHTML=statuses.map(s=>{let n=leads.filter(x=>x.status===s).length;return `<div class="funnel-row"><span>${s}</span><div class="bar"><i style="width:${n/max*100}%"></i></div><b>${n}</b></div>`}).join('');
 const events=leads.filter(x=>x.status==='Fechado').sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));
 document.querySelector('#nextEvents').innerHTML=events.length?events.map(x=>`<div class="eventline"><div><b>${x.name}</b><small>${x.type} • ${x.guests||'?'} convidados</small></div><strong>${fmtDate(x.date)}</strong></div>`).join(''):'<small>Nenhum evento confirmado.</small>';
 document.querySelector('#followups').innerHTML=leads.filter(x=>x.status!=='Fechado').slice(0,6).map(x=>`<tr><td>${x.name}</td><td>${x.type}</td><td><span class="status">${x.status}</span></td><td><a class="wa" target="_blank" href="${wa(x)}">Chamar no WhatsApp</a></td></tr>`).join('');
 document.querySelector('#kanban').innerHTML=statuses.map(s=>`<div class="column"><h3>${s.toUpperCase()} • ${leads.filter(x=>x.status===s).length}</h3>${leads.filter(x=>x.status===s).map(x=>`<div class="leadcard"><b>${x.name}</b><small>${x.type} • ${x.guests||'?'} convidados</small><small>${fmtDate(x.date)} • ${money(x.value)}</small><div class="actions"><a class="sendbtn" target="_blank" href="${wa(x)}">WhatsApp</a><button data-move="${x.id}" data-dir="-1">←</button><button data-move="${x.id}" data-dir="1">Avançar →</button><button data-delete="${x.id}">Excluir</button></div></div>`).join('')}</div>`).join('');
 document.querySelector('#clientsTable').innerHTML=leads.map(x=>`<tr><td>${x.name}</td><td>${x.phone}</td><td>${x.type}</td><td>${x.status}</td><td><a class="wa" target="_blank" href="${wa(x)}">WhatsApp</a></td></tr>`).join('');
 document.querySelector('#quotesTable').innerHTML=leads.filter(x=>['Orçamento','Fechado'].includes(x.status)).map(x=>`<tr><td>${x.name}</td><td>${x.type}</td><td>${x.guests||'-'}</td><td>${money(x.value)}</td><td>${x.status}<br><a class="wa" target="_blank" href="${wa(x)}">Enviar no WhatsApp</a></td></tr>`).join('');
 document.querySelector('#calendar').innerHTML=leads.filter(x=>x.date).sort((a,b)=>a.date.localeCompare(b.date)).map(x=>`<article class="calcard"><time>${fmtDate(x.date)}</time><h3>${x.name}</h3><p>${x.type} • ${x.guests||'?'} convidados</p><span class="status">${x.status}</span></article>`).join('');
 let closed=leads.filter(x=>x.status==='Fechado'),total=closed.reduce((s,x)=>s+Number(x.value||0),0),entry=total*.3;
 document.querySelector('#financeMetrics').innerHTML=`<article><span>CONTRATADO</span><strong>${money(total)}</strong><small>eventos fechados</small></article><article><span>ENTRADAS (30%)</span><strong>${money(entry)}</strong><small>estimativa de sinal</small></article><article><span>SALDO</span><strong>${money(total-entry)}</strong><small>a receber</small></article><article><span>TICKET MÉDIO</span><strong>${money(closed.length?total/closed.length:0)}</strong><small>por evento</small></article>`;
 document.querySelector('#financeTable').innerHTML=closed.map(x=>{let e=Number(x.value||0)*.3;return `<tr><td>${x.name}</td><td>${money(x.value)}</td><td>${money(e)}</td><td>${money(Number(x.value||0)-e)}</td><td><span class="status">Contratado</span></td></tr>`}).join('');
 bindDynamic();
}
function bindDynamic(){
 document.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('click',()=>{let l=leads.find(x=>x.id==b.dataset.move),i=statuses.indexOf(l.status);i=Math.max(0,Math.min(statuses.length-1,i+Number(b.dataset.dir)));l.status=statuses[i];save();render()}));
 document.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>{if(confirm('Excluir este contato?')){leads=leads.filter(x=>x.id!=b.dataset.delete);save();render()}}));
}
const titles={dashboard:'Visão geral',leads:'Captação de clientes',clientes:'Clientes',orcamentos:'Orçamentos',agenda:'Agenda',financeiro:'Financeiro'};
function go(v){document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id===v));document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x.dataset.view===v));document.querySelector('#pageTitle').textContent=titles[v];document.querySelector('.sidebar').classList.remove('open')}
document.querySelectorAll('#nav button').forEach(b=>b.addEventListener('click',()=>go(b.dataset.view)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
document.querySelector('#menu').addEventListener('click',()=>document.querySelector('.sidebar').classList.toggle('open'));
const modal=document.querySelector('#modalbg');function openModal(){modal.classList.add('show')}function closeModal(){modal.classList.remove('show')}
document.querySelector('#newLead').addEventListener('click',openModal);document.querySelector('#addLead2').addEventListener('click',openModal);document.querySelector('#close').addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
document.querySelector('#leadForm').addEventListener('submit',e=>{e.preventDefault();leads.unshift({id:Date.now(),name:document.querySelector('#name').value.trim(),phone:document.querySelector('#phone').value.trim(),type:document.querySelector('#eventType').value,guests:Number(document.querySelector('#guests').value||0),date:document.querySelector('#date').value,value:Number(document.querySelector('#value').value||0),status:'Novo',source:document.querySelector('#source').value,notes:document.querySelector('#notes').value.trim()});save();e.target.reset();closeModal();render();go('leads')});
render();
document.querySelector('#sendWhatsApp')?.addEventListener('click',()=>{
  const msg='Olá! Aqui é do Buffet Vó Sabina. Gostaria de falar sobre seu evento e preparar um orçamento personalizado para você.';
  window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`,'_blank');
});
