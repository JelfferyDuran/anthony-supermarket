'use strict';
let draft=null;let baseline=null;let staticMode=false;
const $=id=>document.getElementById(id);
const msg=(s,bad=false)=>{ $('message').textContent=s; $('message').className=bad?'error':'good';};
const LS_DRAFT='kitchen-os-draft';const LS_APPROVED='kitchen-os-approved-v2';
async function request(url,options){const r=await fetch(url,options);const data=await r.json();if(!r.ok)throw Error(data.error||'Request failed');return data;}
async function load(){
  try{
    draft=await request('/api/draft');staticMode=false;baseline=structuredClone(draft);render();msg('Draft loaded from local staging.');
  }catch(e){
    // Static preview mode (Vercel/static hosting): backend absent, use browser localStorage.
    staticMode=true;
    const saved=localStorage.getItem(LS_DRAFT);
    if(saved){draft=JSON.parse(saved);}else{const r=await fetch('data/seed.json');draft=await r.json();}
    baseline=structuredClone(draft);render();msg('STATIC PREVIEW MODE: draft saved in this browser only (localStorage). Python server not running.');
  }
}
function render(){const tbody=$('items');tbody.replaceChildren();const category=$('filter').value;for(const item of draft.items){if(category!=='all'&&item.category!==category)continue;if($('hideUnavailable').checked&&!item.available)continue;const tr=document.createElement('tr');const tdName=document.createElement('td');const name=document.createElement('input');name.type='text';name.value=item.name;name.addEventListener('input',()=>{item.name=name.value});tdName.append(name);tr.append(tdName);const tdPrice=document.createElement('td');const price=document.createElement('input');price.type='number';price.min='0';price.max='10000';price.step='0.01';price.value=item.price;price.addEventListener('change',()=>{const val=Number(price.value);if(!Number.isFinite(val)||val<0||val>10000){msg('Invalid price',true);return;}item.price=Math.round(val*100)/100;if(baseline.items.find(x=>x.id===item.id)?.price!==item.price){item.status='pending';item.available=false;render();msg('Price changed: marked pending and unavailable until confirmed.');}});tdPrice.append(price);tr.append(tdPrice);const tdCat=document.createElement('td');tdCat.textContent=item.category;tr.append(tdCat);const tdStatus=document.createElement('td');const select=document.createElement('select');for(const value of ['confirmed','proposed','pending']){const opt=document.createElement('option');opt.value=value;opt.textContent=value;select.append(opt)}select.value=item.status;select.addEventListener('change',()=>{item.status=select.value;if(item.status!=='confirmed')item.available=false;render();});tdStatus.append(select);tr.append(tdStatus);const tdAvailable=document.createElement('td');const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=item.available;checkbox.disabled=item.status!=='confirmed';checkbox.addEventListener('change',()=>item.available=checkbox.checked);tdAvailable.append(checkbox);tr.append(tdAvailable);tbody.append(tr);}}
function refresh(){document.querySelectorAll('iframe').forEach(f=>{f.contentWindow.location.reload()});}
async function save(){
  if(staticMode){
    localStorage.setItem(LS_DRAFT,JSON.stringify(draft));msg('Draft saved in this browser (static preview mode); TVs unchanged.');
    return;
  }
  await request('/api/draft',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(draft)});msg('Draft saved locally; TVs unchanged.');
}
$('save').onclick=async()=>{try{await save()}catch(e){msg(e.message,true)}};
$('approve').onclick=async()=>{if(!confirm('Approve this LOCAL preview snapshot? This does NOT publish to production TVs.'))return;try{
  if(staticMode){
    const bad=draft.items.find(i=>i.available&&i.status!=='confirmed');
    if(bad){msg('Static mode: available items must be confirmed before approval',true);return;}
    const prev=JSON.parse(localStorage.getItem(LS_APPROVED)||'{"version":0}');
    const version=(prev.version||0)+1;
    const approved=structuredClone(draft);approved.version=version;approved.approvedAt=new Date().toISOString();approved.approvalScope='LOCAL_PREVIEW_ONLY';
    localStorage.setItem(LS_APPROVED,JSON.stringify(approved));
    baseline=structuredClone(draft);msg(`Static preview version ${version} approved in this browser only; production untouched.`);refresh();
    return;
  }
  const r=await request('/api/approve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(draft)});baseline=structuredClone(draft);msg(`Local preview version ${r.version} approved; production untouched.`);refresh();}catch(e){msg(e.message,true)}};
$('reset').onclick=async()=>{if(!confirm('Reset local draft to original seed? Approved preview is retained.'))return;try{
  if(staticMode){
    const r=await fetch('data/seed.json');draft=await r.json();baseline=structuredClone(draft);localStorage.setItem(LS_DRAFT,JSON.stringify(draft));render();msg('Draft reset to seed (static preview mode).');return;
  }
  await request('/api/reset',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({confirm:'RESET_DRAFT'})});await load()}catch(e){msg(e.message,true)}};
$('reload').onclick=refresh;
$('export').onclick=()=>{const blob=new Blob([JSON.stringify(draft,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='anthonys-kitchen-draft.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)};
$('filter').onchange=render;$('hideUnavailable').onchange=render;
load().catch(e=>msg('Start with python server.py — '+e.message,true));
