/* Anthony's Supermarket — interactions: i18n (ES/EN), lunch tabs, reveal, tilt, particles, theme */
(function(){
"use strict";

/* ---------------- i18n ---------------- */
const STR = {
  es: {
    brandSub:"SUPERMARKET", navDepts:"Departamentos", navLunch:"Almuerzos", navCatering:"Catering", navVisit:"Visítanos",
    call:"Llamar", heroEyebrow:"Desde 2010 · Kearny, New Jersey",
    heroTitle:"Bueno & Barato,<br>todos los días.",
    heroSub:"Tu supermercado de barrio: abarrotes latinos, carnicería, deli, frutas frescas, desayunos y almuerzos calientes hechos en casa.",
    directions:"Cómo llegar", heroCaption:"288 Kearny Ave · Kearny, NJ 07032",
    deptsTitle:"Todo lo que cargas, bajo un mismo techo",
    deptsSub:"Productos internacionales, peruanos, ecuatorianos, dominicanos y más — buenos y baratos.",
    d1t:"Abarrotes", d1d:"Arroz, habichuelas, guandules, aceites, sazones y todo lo de la canasta básica — marcas latinas y americanas.",
    d2t:"Carnicería", d2d:"Res, cerdo, pollo y chivo frescos, cortados a tu gusto. Pregunta por los especiales de la semana.",
    d3t:"Deli", d3d:"Quesos, embutidos y fiambres para tus sándwiches y picaderas de fin de semana.",
    d4t:"Frutas y Verduras", d4d:"Produce fresco todos los días: plátanos, yuca, aguacate, ajíes y más para tu cocina.",
    d5t:"Comida Caliente", d5d:"Almuerzos del día, frituras y especiales de lunes a sábado. La favorita del barrio.",
    d6t:"Desayunos", d6d:"Empieza el día con un desayuno criollo caliente, hecho en casa.",
    cardVisit:"Visítanos →", cardCall:"Llamar →", cardMenu:"Ver menú →", cardOrder:"Ordenar →",
    lunchTitle:"Especiales de Almuerzo",
    lunchSub:"Servidos con moro blanco y habichuela o arroz blanco. Precios pequeño / grande.",
    mon:"Lun", tue:"Mar", wed:"Mié", thu:"Jue", fri:"Vie", sat:"Sáb",
    lunchNote:"Los especiales de almuerzo se sirven de lunes a sábado.",
    studentT:"Student Special — $6.95",
    studentD:"Tenders con papas (2pc), wings con fries (4pc), cheeseburger con papa, salchicha con papa o arroz, habichuela y carne del día. ¡Soda o agua gratis!",
    kidsT:"Kids Menu — $5.95",
    kidsD:"Chicken tenders (2pc) con papa, quesadilla con papa o salchicha con papa. Para los más pequeños.",
    cateringTitle:"Catering para tus fiestas",
    cateringSub:"Bandejas en tres tamaños: pequeña, mediana y grande. Llámanos o escríbenos para ordenar.",
    szS:"Peq.", szM:"Med.", szL:"Grnd.", sidesTitle:"Sides",
    cateringCta:"Ordenar catering por WhatsApp",
    visitTitle:"Visítanos", addrT:"Dirección", hoursT:"Horario",
    monSat:"Lun – Sáb", sun:"Domingo", contactT:"Contacto", callUs:"(llámanos)",
    follow:"Síguenos", footerNote:"Bueno & barato desde 2010. Gracias por comprar local."
  },
  en: {
    brandSub:"SUPERMARKET", navDepts:"Departments", navLunch:"Lunch", navCatering:"Catering", navVisit:"Visit Us",
    call:"Call", heroEyebrow:"Since 2010 · Kearny, New Jersey",
    heroTitle:"Good & Affordable,<br>every single day.",
    heroSub:"Your neighborhood supermarket: Latin groceries, butcher shop, deli, fresh produce, breakfasts and hot homemade lunches.",
    directions:"Get directions", heroCaption:"288 Kearny Ave · Kearny, NJ 07032",
    deptsTitle:"Everything on your list, under one roof",
    deptsSub:"International products — Peruvian, Ecuadorian, Dominican and more — good and affordable.",
    d1t:"Grocery", d1d:"Rice, beans, pigeon peas, oils, seasonings and all the staples — Latin and American brands.",
    d2t:"Butcher Shop", d2d:"Fresh beef, pork, chicken and goat, cut to order. Ask about this week's specials.",
    d3t:"Deli", d3d:"Cheeses, cold cuts and more for your sandwiches and weekend gatherings.",
    d4t:"Produce", d4d:"Fresh produce every day: plantains, yuca, avocado, peppers and more for your kitchen.",
    d5t:"Hot Food", d5d:"Daily lunches, frituras and specials Monday–Saturday. The neighborhood favorite.",
    d6t:"Breakfast", d6d:"Start the day with a hot homemade Latin breakfast.",
    cardVisit:"Visit us →", cardCall:"Call →", cardMenu:"See menu →", cardOrder:"Order →",
    lunchTitle:"Lunch Specials",
    lunchSub:"Served with white moro & beans or white rice. Small / large prices.",
    mon:"Mon", tue:"Tue", wed:"Wed", thu:"Thu", fri:"Fri", sat:"Sat",
    lunchNote:"Lunch specials are served Monday through Saturday.",
    studentT:"Student Special — $6.95",
    studentD:"Tenders with fries (2pc), wings with fries (4pc), cheeseburger with fries, sausage with fries, or rice, beans & meat of the day. Free soda or water!",
    kidsT:"Kids Menu — $5.95",
    kidsD:"Chicken tenders (2pc) with fries, quesadilla with fries, or sausage with fries. For the little ones.",
    cateringTitle:"Catering for your parties",
    cateringSub:"Trays in three sizes: small, medium and large. Call or message us to order.",
    szS:"Sm.", szM:"Md.", szL:"Lg.", sidesTitle:"Sides",
    cateringCta:"Order catering on WhatsApp",
    visitTitle:"Visit Us", addrT:"Address", hoursT:"Hours",
    monSat:"Mon – Sat", sun:"Sunday", contactT:"Contact", callUs:"(call us)",
    follow:"Follow us", footerNote:"Good & affordable since 2010. Thanks for shopping local."
  }
};

const DAY_NAMES = {1:["Lunes / Monday","Monday"],2:["Martes / Tuesday","Tuesday"],3:["Miércoles / Wednesday","Wednesday"],4:["Jueves / Thursday","Thursday"],5:["Viernes / Friday","Friday"],6:["Sábado / Saturday","Saturday"]};

/* Transcribed from the store's printed flyer (Oct 2026). Dish names stay in Spanish — they're proper names. */
const MENU = {
  1:[["CARNE RES GUISADA","$9.99"],["POLLO GUISADO","$9.99"],["CHOFAN","$8.99"],["PERNIL","$9.99"],["POLLO AL HORNO","$9.99"],["FILETE DE PESCADO","$12.99"],["SANCOCHO","$7.99 / $11.99"]],
  2:[["SPAGHETTI","$8.99"],["CHOFAN","$9.99"],["CERDO GUISADO","$9.99"],["POLLO AL HORNO","$9.99"],["CHIVO GUISADO","$9.99"],["COSTILLA AL HORNO","$11.99"],["SOPA DE GALLINA","$5.99 / $9.99"]],
  3:[["BISTEC GUISADO","$9.99"],["POLLO GUISADO","$9.99"],["CHOFAN","$9.99"],["PERNIL","$9.99"],["POLLO AL HORNO","$9.99"],["FILETE TILAPIA FRITA","$12.99"],["SOPA DE POLLO","$5.99 / $9.99"]],
  4:[["SPAGHETTI","$8.99"],["CHOFAN","$9.99"],["PUERCO GUISADO","$9.99"],["PERNIL","$9.99"],["BACALAO","$9.99"],["CHIVO GUISADO","$11.99"],["SANCOCHO","$6.99 / $11.99"]],
  5:[["RES GUISADA","$9.99"],["POLLO GUISADO","$9.99"],["CHOFAN","$9.99"],["CERDO GUISADO","$9.99"],["POLLO AL HORNO","$9.99"],["COSTILLA AL HORNO","$11.99"],["RABO ENCENDIDO","$14.99"],["MONDONGO","$7.99 / $11.99"]],
  6:[["SPAGHETTI","$8.99"],["CHOFAN","$9.99"],["CERDO GUISADO","$9.99"],["PERNIL","$9.99"],["CHIVO","$11.99"],["PESCADO FRITO","$12.99"],["SANCOCHO","$7.99 / $11.99"]]
};
const CATERING = [
  ["ARROZ BLANCO","$35","$50","$70"],
  ["ARROZ CON GUANDULEZ","$45","$55","$75"],
  ["MORO ROJO","$45","$55","$75"],
  ["MORO NEGRO","$45","$55","$75"],
  ["PERNIL (55 PIEZA)","$55 c/u","$55 c/u","$55 c/u"],
  ["CARNE RES GUISADA","$95","$160","$235"],
  ["POLLO GUISADO","$60","$100","$150"],
  ["POLLO HORNEADO","$60","$90","$120"]
];
const SIDES = [
  ["MADUROS","$45","$75","$95"],
  ["YUCA","$45","$75","$95"],
  ["GUINEITOS","$35","$55","$75"],
  ["ENSALADA VERDE","$45","$65","$90"]
];

let lang = localStorage.getItem("anthonys-lang") || "es";

function applyLang(){
  document.documentElement.lang = lang;
  const dict = STR[lang];
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const k = el.getAttribute("data-i18n");
    if(dict[k] !== undefined) el.innerHTML = dict[k];
  });
  document.getElementById("langToggle").textContent = lang === "es" ? "EN" : "ES";
  const active = document.querySelector('.day-tabs button[aria-selected="true"]');
  if(active) renderDay(parseInt(active.dataset.day,10));
}
document.getElementById("langToggle").addEventListener("click",()=>{
  lang = lang === "es" ? "en" : "es";
  localStorage.setItem("anthonys-lang",lang);
  applyLang();
});

/* ---------------- lunch day tabs ---------------- */
function renderDay(day){
  const title = document.getElementById("menuDayTitle");
  title.textContent = DAY_NAMES[day][lang === "es" ? 0 : 1];
  const list = document.getElementById("menuList");
  list.innerHTML = "";
  MENU[day].forEach(([dish,price])=>{
    const li = document.createElement("li");
    const d = document.createElement("span"); d.className="dish"; d.textContent=dish;
    const p = document.createElement("span"); p.className="price";
    if(price.includes("/")){
      const [s,l] = price.split("/");
      p.innerHTML = "<small>Peq. "+s.trim()+"</small> · Grnd. "+l.trim();
    } else p.textContent = price;
    li.appendChild(d); li.appendChild(p); list.appendChild(li);
  });
  document.querySelectorAll(".day-tabs button").forEach(b=>
    b.setAttribute("aria-selected", b.dataset.day==String(day) ? "true":"false"));
}
document.querySelectorAll(".day-tabs button").forEach(b=>
  b.addEventListener("click",()=>renderDay(parseInt(b.dataset.day,10))));
(function initDay(){
  const today = new Date().getDay(); // 0=Sun
  renderDay(today>=1 && today<=6 ? today : 1);
})();

/* ---------------- catering & sides tables ---------------- */
function fillTable(id, rows){
  const tb = document.getElementById(id);
  rows.forEach(r=>{
    const tr=document.createElement("tr");
    r.forEach((c,i)=>{ const td=document.createElement("td"); td.textContent=c; tr.appendChild(td); });
    tb.appendChild(tr);
  });
}
fillTable("cateringBody",CATERING);
fillTable("sidesBody",SIDES);

/* ---------------- scroll reveal: slide up + dissolve ---------------- */
const io = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target);} });
},{threshold:.12,rootMargin:"0px 0px -40px 0px"});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));

/* ---------------- card tilt (desktop pointers) ---------------- */
if(window.matchMedia("(pointer:fine)").matches){
  document.querySelectorAll(".tilt").forEach(card=>{
    card.addEventListener("pointermove",e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
      card.style.setProperty("--mx",(x*100)+"%");
      card.style.setProperty("--my",(y*100)+"%");
      card.style.transform=`perspective(900px) rotateY(${(x-.5)*7}deg) rotateX(${(.5-y)*7}deg) translateY(-3px)`;
    });
    card.addEventListener("pointerleave",()=>{ card.style.transform=""; });
  });
}

/* ---------------- hero particles ---------------- */
(function(){
  const cv=document.getElementById("heroParticles"); if(!cv) return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx=cv.getContext("2d"); let W,H,ps=[];
  function size(){ W=cv.width=cv.offsetWidth; H=cv.height=cv.offsetHeight; }
  size(); window.addEventListener("resize",size);
  const N = window.innerWidth<700 ? 26 : 46;
  for(let i=0;i<N;i++) ps.push({x:Math.random(),y:Math.random(),r:1+Math.random()*2.6,s:.0004+Math.random()*.0012,o:.25+Math.random()*.45});
  (function tick(){
    ctx.clearRect(0,0,W,H);
    const dark = document.documentElement.dataset.theme==="dark";
    ps.forEach(p=>{
      p.y-=p.s; if(p.y<-.05){p.y=1.05;p.x=Math.random();}
      ctx.beginPath(); ctx.arc(p.x*W,p.y*H,p.r,0,7);
      ctx.fillStyle = dark ? `rgba(122,199,79,${p.o})` : `rgba(78,154,31,${p.o*.8})`;
      ctx.fill();
    });
    requestAnimationFrame(tick);
  })();
})();

/* ---------------- theme ---------------- */
const themeBtn=document.getElementById("themeToggle");
function setTheme(t){
  document.documentElement.dataset.theme=t;
  localStorage.setItem("anthonys-theme",t);
  themeBtn.textContent = t==="dark" ? "☀" : "☾";
}
themeBtn.addEventListener("click",()=>
  setTheme(document.documentElement.dataset.theme==="dark"?"light":"dark"));
setTheme(localStorage.getItem("anthonys-theme") || "light");

applyLang();
})();
