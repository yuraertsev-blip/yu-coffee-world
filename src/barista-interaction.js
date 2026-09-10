import {Vector3} from 'three';
// A click/tap opens the menu; dragging continues to look around the café.
export function isTap(start,event){return !!start&&Math.hypot(event.clientX-start.x,event.clientY-start.y)<7;}
export function installBaristaInteraction({canvas,camera,scene,characters,service,onInspect,world,keys,isWalking,raycaster,vector}){
 const popup=document.querySelector('#barista-popup'),next=document.querySelector('#next-barista'),close=document.querySelector('#close-barista'),label=document.querySelector('#barista-label'),badge=document.querySelector('#barista-badge');
 let down=null,opened=false;const anchor=new Vector3();
 function hide(){opened=false;popup.hidden=true;badge.setAttribute('aria-expanded','false');}
 function refresh(){label.textContent=`${characters.index+1} / 3 · ${characters.profile.label}`;badge.textContent=`Бариста · ${characters.index+1}/3`;badge.setAttribute('aria-label',`Бариста: ${characters.profile.label}. Выбрать другого бариста`);}
 function open(){if(!characters.ready)return;opened=true;keys.clear();document.exitPointerLock?.();popup.hidden=false;popup.style.left=`${Math.max(130,Math.min(innerWidth-130,parseFloat(badge.style.left)||innerWidth/2))}px`;popup.style.top=`${Math.max(90,Math.min(innerHeight-430,(parseFloat(badge.style.top)||150)+30))}px`;badge.setAttribute('aria-expanded','true');refresh();next.focus({preventScroll:true});}
 // Capture click before the world handler requests pointer lock.
 canvas.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});
 canvas.addEventListener('click',e=>{
  if(!isWalking()||!isTap(down,e))return;
  const locked=document.pointerLockElement===canvas;
  const rect=canvas.getBoundingClientRect();vector.set(locked?0:((e.clientX-rect.left)/rect.width)*2-1,locked?0:-((e.clientY-rect.top)/rect.height)*2+1);
  raycaster.setFromCamera(vector,camera);
  if(characters.hit(raycaster,Object.values(world.groups))){e.stopImmediatePropagation();e.preventDefault();open();}else hide();
 },true);
 badge.onclick=open;close.onclick=()=>{hide();badge.focus({preventScroll:true});};
 next.onclick=()=>{characters.select(characters.index+1);try{localStorage.setItem('yu-coffee-barista',String(characters.index));}catch{}refresh();};
 document.addEventListener('keydown',e=>{if(e.code==='Escape'&&opened){e.preventDefault();hide();badge.focus({preventScroll:true});}});
 refresh();
 const order=document.querySelector('#order-coffee'),status=document.querySelector('#barista-status'),notice=document.querySelector('#coffee-notice');
 let lastCompleted=0;
 order.onclick=()=>{if(service.order()){status.textContent=service.state.label;order.disabled=true;notice.hidden=true;}};
 document.querySelector('#inspect-coffee').onclick=()=>{hide();notice.hidden=true;onInspect();};
 document.querySelector('#dismiss-coffee').onclick=()=>notice.hidden=true;
 function update(){
  const state=service.state;status.textContent=state.label;order.disabled=state.busy;order.textContent=state.activity==='pastry'?'Подаю кекс…':state.busy?'Капучино готовится…':'заказать кофе';
  document.querySelector('#coffee-progress').hidden=!state.busy;
  document.querySelector('#coffee-progress').textContent=state.busy?state.label+'…':'';
  if(state.completed>lastCompleted){lastCompleted=state.completed;notice.querySelector('span').textContent=`Латте-арт «${state.design?.name||'Розетта'}» · ${state.design?.id+1||1}/36`;notice.hidden=false;}

  anchor.copy(characters.root.position);anchor.y+=characters.profile.height;const distance=camera.position.distanceTo(characters.root.position);anchor.project(camera);
  const visible=isWalking()&&characters.ready&&distance<8&&anchor.z>-1&&anchor.z<1&&Math.abs(anchor.x)<.94&&Math.abs(anchor.y)<.94&&!document.querySelector('dialog[open]');
  badge.hidden=!visible||opened;
  if(!visible){if(opened&&(!isWalking()||document.querySelector('dialog[open]')))hide();return;}
  const x=(anchor.x*.5+.5)*innerWidth,y=(-anchor.y*.5+.5)*innerHeight;
  badge.style.left=`${Math.max(90,Math.min(innerWidth-90,x))}px`;badge.style.top=`${Math.max(150,y-15)}px`;
 }
 return {update,hide,get opened(){return opened;}};
}
