
const STORAGE_KEY = 'wap_prospeccao_v1_leads';

let leads = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let leadMensagemAtual = null;

const $ = s => document.querySelector(s);
const lista = $('#listaLeads');
const vazio = $('#vazio');
const modalLead = $('#modalLead');
const modalMensagem = $('#modalMensagem');

function salvar(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  render();
}

function escapeHtml(text=''){
  return String(text).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

function formatarData(data){
  if(!data) return '—';
  const [a,m,d] = data.split('-');
  return `${d}/${m}/${a}`;
}

function atualizarResumo(){
  $('#mTotal').textContent = leads.length;
  $('#mContatados').textContent = leads.filter(l => ['Contato realizado','Respondeu','Apresentação enviada','Negociação','Fechado'].includes(l.status)).length;
  $('#mResponderam').textContent = leads.filter(l => ['Respondeu','Apresentação enviada','Negociação','Fechado'].includes(l.status)).length;
  $('#mPropostas').textContent = leads.filter(l => ['Apresentação enviada','Negociação','Fechado'].includes(l.status)).length;
  $('#mFechados').textContent = leads.filter(l => l.status === 'Fechado').length;
}

function render(){
  const busca = $('#busca').value.toLowerCase().trim();
  const filtro = $('#filtroStatus').value;
  const filtrados = leads.filter(l => {
    const texto = `${l.empresa} ${l.bairro} ${l.cidade} ${l.responsavel}`.toLowerCase();
    return (!busca || texto.includes(busca)) && (!filtro || l.status === filtro);
  });

  lista.innerHTML = filtrados.map(l => `
    <tr>
      <td><strong>${escapeHtml(l.empresa)}</strong><br><span style="color:#7a8699">${escapeHtml(l.responsavel || 'Responsável não informado')}</span></td>
      <td>${escapeHtml([l.bairro,l.cidade].filter(Boolean).join(' • ') || '—')}</td>
      <td>${escapeHtml(l.whatsapp || '—')}<br><span style="color:#7a8699">${escapeHtml(l.canal || '')}</span></td>
      <td>${escapeHtml(l.oportunidade || '—')}</td>
      <td><span class="status">${escapeHtml(l.status)}</span></td>
      <td>${formatarData(l.followup)}</td>
      <td>
        <div class="actions-cell">
          <button class="small whatsapp" onclick="gerarMensagem('${l.id}')">Mensagem</button>
          <button class="small secondary" onclick="editarLead('${l.id}')">Editar</button>
          <button class="small danger" onclick="excluirLead('${l.id}')">Excluir</button>
        </div>
      </td>
    </tr>
  `).join('');

  $('#contadorLeads').textContent = `${filtrados.length} registro${filtrados.length===1?'':'s'}`;
  vazio.style.display = filtrados.length ? 'none' : 'block';
  atualizarResumo();
}

function limparForm(){
  $('#formLead').reset();
  $('#leadId').value = '';
  $('#tituloModal').textContent = 'Novo potencial cliente';
}

$('#btnNovo').onclick = () => { limparForm(); modalLead.showModal(); };
$('#fecharModal').onclick = () => modalLead.close();
$('#cancelarModal').onclick = () => modalLead.close();

$('#formLead').addEventListener('submit', e => {
  e.preventDefault();
  const id = $('#leadId').value || Date.now().toString();
  const lead = {
    id,
    empresa: $('#empresa').value.trim(),
    responsavel: $('#responsavel').value.trim(),
    whatsapp: $('#whatsapp').value.trim().replace(/\D/g,''),
    canal: $('#canal').value.trim(),
    bairro: $('#bairro').value.trim(),
    cidade: $('#cidade').value.trim(),
    oportunidade: $('#oportunidade').value,
    status: $('#status').value,
    followup: $('#followup').value,
    observacoes: $('#observacoes').value.trim()
  };

  const idx = leads.findIndex(l => l.id === id);
  if(idx >= 0) leads[idx] = lead; else leads.unshift(lead);
  modalLead.close();
  salvar();
});

window.editarLead = id => {
  const l = leads.find(x => x.id === id);
  if(!l) return;
  $('#leadId').value = l.id;
  $('#empresa').value = l.empresa || '';
  $('#responsavel').value = l.responsavel || '';
  $('#whatsapp').value = l.whatsapp || '';
  $('#canal').value = l.canal || '';
  $('#bairro').value = l.bairro || '';
  $('#cidade').value = l.cidade || '';
  $('#oportunidade').value = l.oportunidade || 'Sem site';
  $('#status').value = l.status || 'Novo';
  $('#followup').value = l.followup || '';
  $('#observacoes').value = l.observacoes || '';
  $('#tituloModal').textContent = 'Editar potencial cliente';
  modalLead.showModal();
};

window.excluirLead = id => {
  const l = leads.find(x => x.id === id);
  if(!l) return;
  if(confirm(`Excluir ${l.empresa}?`)){
    leads = leads.filter(x => x.id !== id);
    salvar();
  }
};

function criarTexto(l){
  const nome = l.responsavel ? ` ${l.responsavel}` : '';
  const local = l.bairro ? ` na região de ${l.bairro}` : '';
  const motivo = {
    'Sem site':'percebi uma oportunidade de facilitar seus pedidos com uma página própria, simples e direta',
    'Site desatualizado':'percebi que sua presença digital pode ser modernizada para facilitar o acesso ao cardápio e aos pedidos',
    'Somente Instagram':'vi que vocês trabalham bastante pelo Instagram e existe uma oportunidade de ter uma página própria para organizar cardápio e pedidos',
    'Cardápio pouco prático':'percebi uma oportunidade de deixar o cardápio mais rápido e fácil para o cliente acessar pelo celular',
    'Pedidos manuais no WhatsApp':'percebi uma oportunidade de organizar melhor os pedidos que chegam pelo WhatsApp',
    'Baixa presença digital':'percebi uma oportunidade de fortalecer a presença digital da pizzaria e facilitar o contato com novos clientes',
    'Outra oportunidade':'identifiquei uma oportunidade digital que pode facilitar a experiência dos seus clientes'
  }[l.oportunidade] || 'identifiquei uma oportunidade digital para a pizzaria';

  return `Olá${nome}, tudo bem?

Meu nome é Wagner, da WAP Consultoria Digital.

Conheci a ${l.empresa}${local} e ${motivo}.

Eu desenvolvo soluções digitais simples para pizzarias, com cardápio online, apresentação dos produtos e direcionamento do pedido para o WhatsApp.

Já tenho um modelo funcional que posso te apresentar sem compromisso. A ideia é mostrar na prática como ficaria para a sua pizzaria.

Posso te enviar uma demonstração?`;
}

window.gerarMensagem = id => {
  const l = leads.find(x => x.id === id);
  if(!l) return;
  leadMensagemAtual = l;
  $('#textoMensagem').value = criarTexto(l);
  modalMensagem.showModal();
};

$('#fecharMensagem').onclick = () => modalMensagem.close();

$('#copiarMensagem').onclick = async () => {
  await navigator.clipboard.writeText($('#textoMensagem').value);
  const b = $('#copiarMensagem');
  const original = b.textContent;
  b.textContent = 'Copiado!';
  setTimeout(()=> b.textContent = original, 1200);
};

$('#abrirWhatsapp').onclick = () => {
  if(!leadMensagemAtual) return;
  if(!leadMensagemAtual.whatsapp){
    alert('Cadastre o WhatsApp deste cliente primeiro.');
    return;
  }
  const texto = encodeURIComponent($('#textoMensagem').value);
  window.open(`https://wa.me/${leadMensagemAtual.whatsapp}?text=${texto}`, '_blank');
  const idx = leads.findIndex(x => x.id === leadMensagemAtual.id);
  if(idx >= 0 && leads[idx].status === 'Novo'){
    leads[idx].status = 'Contato realizado';
    salvar();
  }
};

$('#busca').addEventListener('input', render);
$('#filtroStatus').addEventListener('change', render);

// Exemplo inicial apenas quando o sistema está completamente vazio.
if(leads.length === 0){
  leads = [{
    id:'demo1',
    empresa:'Pizzaria Exemplo',
    responsavel:'Carlos',
    whatsapp:'',
    canal:'@pizzariaexemplo',
    bairro:'Centro',
    cidade:'São Paulo',
    oportunidade:'Somente Instagram',
    status:'Novo',
    followup:'',
    observacoes:'Registro demonstrativo. Pode editar ou excluir.'
  }];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

render();
