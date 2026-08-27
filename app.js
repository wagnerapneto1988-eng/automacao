const PHONE='5511915193477';
const baseMessage='Olá, Buffet Vó Sabina! Gostaria de solicitar um orçamento para meu evento.';
const wa='https://wa.me/'+PHONE+'?text='+encodeURIComponent(baseMessage);

document.querySelector('#whatsappFloat').href=wa;
document.querySelector('#orcamentoTop').href=wa;
document.querySelector('#orcamentoMain').href=wa;

const panel=document.querySelector('#panel');
const backdrop=document.querySelector('#panelBackdrop');
const content=document.querySelector('#panelContent');

const sections={
  sobre:{
    title:'Sobre Nós',
    body:`<p>O Buffet Vó Sabina une gastronomia, decoração e organização para transformar celebrações em experiências completas.</p>
          <p>Cada evento é tratado de forma personalizada, de acordo com o número de convidados, o estilo da comemoração e o formato desejado.</p>`
  },
  servicos:{
    title:'Serviços',
    body:`<ul>
      <li>Buffet completo</li>
      <li>Culinária em geral</li>
      <li>Decoração de ambientes</li>
      <li>Organização de eventos</li>
    </ul>`
  },
  eventos:{
    title:'Eventos',
    body:`<ul>
      <li>Casamentos</li>
      <li>Aniversários</li>
      <li>Confraternizações</li>
      <li>Eventos corporativos</li>
      <li>Eventos sociais</li>
    </ul>`
  },
  galeria:{
    title:'Galeria',
    body:`<p>Alguns momentos e estilos de evento atendidos pelo Buffet Vó Sabina.</p>
          <div class="gallery">
            <div>💍</div><div>🎂</div><div>🌸</div><div>🍽️</div>
          </div>`
  },
  depoimentos:{
    title:'Depoimentos',
    body:`<p>“Comida muito saborosa e atendimento excelente.”</p>
          <p>“Organização, carinho e qualidade em cada detalhe.”</p>`
  },
  contato:{
    title:'Contato',
    body:`<p>Para solicitar orçamento, fale diretamente com o Buffet Vó Sabina pelo WhatsApp.</p>
          <a class="cta" href="${wa}" target="_blank" rel="noopener">Abrir WhatsApp</a>`
  },
  doces:{
    title:'Doces Gourmet',
    body:`<p>Encomendas de doces gourmet para festas, eventos, lembranças e momentos especiais.</p>
          <a class="cta" href="${'https://wa.me/'+PHONE+'?text='+encodeURIComponent('Olá, Buffet Vó Sabina! Gostaria de saber mais sobre os doces gourmet.')}" target="_blank" rel="noopener">Pedir pelo WhatsApp</a>`
  }
};

function openPanel(key){
  if(key==='inicio'){window.scrollTo({top:0,behavior:'smooth'});return}
  const s=sections[key]; if(!s)return;
  content.innerHTML=`<h2>${s.title}</h2>${s.body}`;
  panel.classList.add('open');
  backdrop.classList.add('show');
  panel.setAttribute('aria-hidden','false');
}
function closePanel(){
  panel.classList.remove('open');
  backdrop.classList.remove('show');
  panel.setAttribute('aria-hidden','true');
}

document.querySelectorAll('[data-section]').forEach(el=>{
  el.addEventListener('click',()=>openPanel(el.dataset.section));
});
document.querySelector('#closePanel').addEventListener('click',closePanel);
backdrop.addEventListener('click',closePanel);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closePanel()});
