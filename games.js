
// Quiz
let quizLocked=false,quizScore=0;
const qfb=document.getElementById("quizFeedback"), qscore=document.getElementById("quizScore");
document.querySelectorAll("#quizOptions button").forEach(btn=>{
  btn.addEventListener("click",()=>{
    if(quizLocked)return; quizLocked=true;
    const ok=btn.dataset.correct==="true";
    btn.classList.add(ok?"correct":"wrong");
    if(!ok) document.querySelector('#quizOptions button[data-correct="true"]').classList.add("correct");
    quizScore=ok?10:0;
    qscore.textContent=`Pontuação: ${quizScore}`;
    qfb.textContent=ok?"Correto: PHP é a principal linguagem do core e dos plugins do Moodle.":"Resposta correta: PHP.";
  });
});
document.getElementById("quizReset").addEventListener("click",()=>{
  quizLocked=false;quizScore=0;qscore.textContent="Pontuação: 0";qfb.textContent="Escolha uma alternativa.";
  document.querySelectorAll("#quizOptions button").forEach(b=>b.classList.remove("correct","wrong"));
});

// Memory
const memoryValues=["Moodle","JS","PHP","LMS","Moodle","JS","PHP","LMS"];
let first=null,second=null,lock=false,matches=0;
const memoryGrid=document.getElementById("memoryGrid");
function shuffle(arr){return [...arr].sort(()=>Math.random()-.5)}
function buildMemory(){
  first=second=null;lock=false;matches=0;memoryGrid.innerHTML="";
  document.getElementById("memoryStatus").textContent="Pares: 0/4";
  shuffle(memoryValues).forEach(v=>{
    const b=document.createElement("button");b.className="memory-card";b.textContent="?";b.dataset.value=v;
    b.addEventListener("click",()=>flipMemory(b));memoryGrid.appendChild(b);
  });
}
function flipMemory(b){
  if(lock||b.classList.contains("matched")||b===first)return;
  b.textContent=b.dataset.value;b.classList.add("revealed");
  if(!first){first=b;return}
  second=b;lock=true;
  if(first.dataset.value===second.dataset.value){
    first.classList.add("matched");second.classList.add("matched");matches++;
    document.getElementById("memoryStatus").textContent=`Pares: ${matches}/4`;
    first=second=null;lock=false;
  }else{
    setTimeout(()=>{first.textContent="?";second.textContent="?";first.classList.remove("revealed");second.classList.remove("revealed");first=second=null;lock=false},650)
  }
}
document.getElementById("memoryReset").addEventListener("click",buildMemory);
buildMemory();

// Sequence
const colors=["blue","green","orange","purple"]; let seq=[],userSeq=[],playing=false;
const seqButtons=[...document.querySelectorAll(".seq")];
const seqStatus=document.getElementById("seqStatus");
function flash(color,delay){
  setTimeout(()=>{const b=document.querySelector(`.seq[data-color="${color}"]`);b.classList.add("active");setTimeout(()=>b.classList.remove("active"),320)},delay)
}
function nextRound(){
  userSeq=[];seq.push(colors[Math.floor(Math.random()*colors.length)]);playing=true;
  seqStatus.textContent=`Nível ${seq.length}: observe a sequência.`;
  seq.forEach((c,i)=>flash(c,500+i*520));
  setTimeout(()=>{playing=false;seqStatus.textContent=`Nível ${seq.length}: repita a sequência.`},500+seq.length*520)
}
seqButtons.forEach(b=>b.addEventListener("click",()=>{
  if(playing||!seq.length)return;
  flash(b.dataset.color,0);userSeq.push(b.dataset.color);
  const i=userSeq.length-1;
  if(userSeq[i]!==seq[i]){seqStatus.textContent="Sequência incorreta. Clique em iniciar para tentar de novo.";seq=[];userSeq=[];return}
  if(userSeq.length===seq.length){seqStatus.textContent="Acertou! Próximo nível...";setTimeout(nextRound,700)}
}));
document.getElementById("seqStart").addEventListener("click",()=>{seq=[];userSeq=[];nextRound()});
