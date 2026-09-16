// Each pointer owns a voice: moving one finger never retunes or releases another.
export function createMusicGestures({sustained,start,onHighlight=()=>{},onNote=()=>{},onError=()=>{}}){
 const fingers=new Map(),holds=new Map();
 function highlight(index,delta){if(index===null)return;const count=(holds.get(index)||0)+delta;if(count>0)holds.set(index,count);else holds.delete(index);onHighlight(index,count>0);}
 async function strike(finger,index){
  try{
   const release=await start(index,finger.velocity);
   if(!sustained)return;
   if(fingers.get(finger.id)!==finger){release?.();return;}
   finger.release=release;
   if(finger.index!==index)release?.glide?.(finger.index);
  }catch(error){onError(error);}
 }
 function enter(id,index){
  const finger=fingers.get(id);if(!finger||index===finger.index)return;
  if(index===null&&sustained)return; // Carry the breath across gaps between fields.
  highlight(finger.index,-1);finger.index=index;highlight(index,1);
  if(index===null)return;
  onNote(index);
  if(sustained){finger.release?.glide?.(index);}else strike(finger,index);
 }
 function end(id){const finger=fingers.get(id);if(!finger)return;fingers.delete(id);highlight(finger.index,-1);if(sustained)finger.release?.();}
 function begin(id,index,velocity=.8){end(id);const finger={id,index,velocity};fingers.set(id,finger);highlight(index,1);onNote(index);strike(finger,index);}
 function clear(){for(const id of [...fingers.keys()])end(id);}
 return {begin,enter,end,clear,has:id=>fingers.has(id)};
}

export function installMusicPointers(area,{sustained,start,onNote}){
 const pads=[...area.querySelectorAll('[data-note]')],positions=new Map();
 const gestures=createMusicGestures({sustained,start,onNote,onHighlight:(index,held)=>pads[index]?.classList.toggle('held',held)});
 const padAt=(x,y)=>{const pad=document.elementFromPoint(x,y)?.closest('[data-note]');return pad&&area.contains(pad)&&!pad.disabled?Number(pad.dataset.note):null;};
 area.onpointerdown=e=>{
  if(e.button!==0)return;const index=padAt(e.clientX,e.clientY);if(index===null)return;
  e.preventDefault();pads[index].focus({preventScroll:true});area.setPointerCapture(e.pointerId);
  positions.set(e.pointerId,{x:e.clientX,y:e.clientY});gestures.begin(e.pointerId,index,e.shiftKey?1:e.pointerType==='pen'?Math.max(.25,e.pressure):.8);
 };
 area.onpointermove=e=>{
  if(!gestures.has(e.pointerId))return;e.preventDefault();
  const coalesced=e.getCoalescedEvents?.()||[],events=coalesced.length?coalesced:[e];
  for(const point of events){const from=positions.get(e.pointerId),dx=point.clientX-from.x,dy=point.clientY-from.y;
   // Hit-test along the path too, so a fast sweep doesn't skip intermediate notes.
   const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/8));
   for(let n=1;n<=steps;n++)gestures.enter(e.pointerId,padAt(from.x+dx*n/steps,from.y+dy*n/steps));
   positions.set(e.pointerId,{x:point.clientX,y:point.clientY});
  }
 };
 area.onpointerup=area.onpointercancel=area.onlostpointercapture=e=>{gestures.end(e.pointerId);positions.delete(e.pointerId);};
 const clear=()=>{gestures.clear();positions.clear();};
 const dispose=()=>{clear();area.onpointerdown=area.onpointermove=area.onpointerup=area.onpointercancel=area.onlostpointercapture=null;};
 dispose.clear=clear;return dispose;
}
