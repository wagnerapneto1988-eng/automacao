
const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
if(toggle && nav){
  toggle.addEventListener("click",()=>nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));
}
document.addEventListener("keydown",e=>{
  if(e.key==="Escape") document.querySelectorAll(".modal.open").forEach(m=>m.classList.remove("open"));
});
document.querySelectorAll("[data-modal]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const modal=document.getElementById("modal");
    if(!modal) return;
    document.getElementById("modalTitle").textContent=btn.dataset.title||"Demonstração";
    document.getElementById("modalText").textContent=btn.dataset.text||"Modelo demonstrativo.";
    modal.classList.add("open");
  });
});
document.querySelectorAll(".modal-close").forEach(b=>b.addEventListener("click",()=>b.closest(".modal").classList.remove("open")));
document.querySelectorAll(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)m.classList.remove("open")}));
