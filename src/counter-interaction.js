import * as T from 'three';
import {isTap} from './barista-interaction.js';
const smooth=t=>{t=T.MathUtils.clamp(t,0,1);return t*t*(3-2*t);};
export function createCounterService(scene,characters,coffee){
 const objects=[];scene.traverse(o=>{if(o.userData.counterAction)objects.push(o);});
 const muffins=objects.filter(o=>o.userData.counterAction==='muffin'),cloche=objects.find(o=>o.userData.counterAction==='cloche');
 const served=new Set();let job=null,time=0;
 const lidHome=cloche.position.clone();
 function request(muffin){if(job||coffee.state.busy)return 'Бариста закончит текущий заказ и сможет подать кекс.';if(!characters.ready)return 'Бариста ещё загружается.';muffin=muffin&&!served.has(muffin)?muffin:muffins.find(m=>!served.has(m));if(!muffin)return 'Все кексы уже на стойке. Угощайтесь!';
  const bounds=new T.Box3().setFromObject(muffin),center=bounds.getCenter(new T.Vector3());job={muffin,phase:'approach',elapsed:0,start:muffin.position.clone(),center,target:new T.Vector3(-.27+served.size*.105,1.159+(bounds.max.y-bounds.min.y)/2,-1.075)};coffee.setOverride({busy:true,activity:'pastry',label:'Иду за кексом'});return 'Сейчас подам кекс!';}
 function update(dt){time+=dt;if(!job)return;const root=characters.root;job.elapsed+=dt;
  const target=new T.Vector3(-.14,.025,-2.20),dx=target.x-root.position.x,dz=target.z-root.position.z,distance=Math.hypot(dx,dz),moving=job.phase==='approach'&&distance>.025;
  if(moving){const step=Math.min(distance,dt*.8);root.position.x+=dx/distance*step;root.position.z+=dz/distance*step;}
  root.position.y=.025;characters.animate(time,moving,'pastry');characters.face(moving?Math.atan2(dx,dz):0,dt);
  const c=characters.collider;c.minX=root.position.x-.18;c.maxX=root.position.x+.18;c.minZ=root.position.z-.16;c.maxZ=root.position.z+.16;
  function next(phase,label){job.phase=phase;job.elapsed=0;coffee.setOverride({busy:true,activity:'pastry',label});}
  if(job.phase==='approach'&&distance<=.025)next('lift','Открываю колпак');
  let lift=job.phase==='lift'?smooth(job.elapsed/1.1):job.phase==='carry'?1:job.phase==='close'?1-smooth(job.elapsed/1.1):0;
  cloche.position.copy(lidHome).add(new T.Vector3(-.20*lift,.34*lift,-.06*lift));
  if(job.phase!=='approach'){characters.reach(-1,new T.Vector3(-.10,1.595,-1.64).add(cloche.position).sub(lidHome));}
  if(job.phase==='lift'&&job.elapsed>=1.1)next('carry','Ставлю кекс на стойку');
  if(job.phase==='carry'){
   const t=smooth(job.elapsed/2),point=job.center.clone().lerp(job.target,t);point.y+=Math.sin(t*Math.PI)*.15;job.muffin.position.copy(job.start).add(point.clone().sub(job.center));characters.reach(1,point.clone().add(new T.Vector3(0,.015,-.04)));
   if(job.elapsed>=2){served.add(job.muffin);job.muffin.userData.served=true;next('close','Закрываю колпак');}
  }
  if(job.phase==='close'&&job.elapsed>=1.1){cloche.position.copy(lidHome);job=null;coffee.setOverride(null);}
 }
 return {objects,muffins,cloche,request,update,get busy(){return !!job;},get servedCount(){return served.size;}};
}
export function installCounterInteraction({canvas,camera,world,characters,coffee,isWalking,isMenuOpen}){
 const service=createCounterService(world.scene,characters,coffee),ray=new T.Raycaster(),pointer=new T.Vector2();let down=null,audio=null;
 const notice=document.createElement('div');notice.className='counter-notice';notice.setAttribute('role','status');notice.hidden=true;document.body.append(notice);let noticeTime=0;
 const controls=document.createElement('div');controls.className='counter-actions';controls.hidden=true;controls.setAttribute('aria-label','Предметы на стойке');
 controls.innerHTML='<button type="button" data-counter="0" aria-label="Нажать зелёную кнопку на стойке">Зелёная кнопка ♪</button><button type="button" data-counter="1" aria-label="Нажать синюю кнопку на стойке">Синяя кнопка ♪</button><button type="button" data-counter="cake">Кекс под колпаком</button>';document.body.append(controls);
 const bells=service.objects.filter(o=>o.userData.counterAction==='bell'),pulses=new Map();
 function say(text){notice.textContent=text;notice.hidden=false;noticeTime=3;}
 async function sound(voice){try{const Context=window.AudioContext||window.webkitAudioContext;if(!Context){say('Этот браузер не поддерживает звук.');return;}audio??=new Context();await audio.resume();say(voice?'Пиу-пиу! ♪':'Буууип! ♪');const t=audio.currentTime;for(let i=0;i<(voice?3:1);i++){const osc=audio.createOscillator(),gain=audio.createGain(),start=t+i*.105;osc.type=voice?'triangle':'sine';osc.frequency.setValueAtTime(voice?500+i*160:760,start);osc.frequency.exponentialRampToValueAtTime(voice?250+i*80:110,start+.25);gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.15,start+.012);gain.gain.exponentialRampToValueAtTime(.001,start+.28);osc.connect(gain);gain.connect(audio.destination);osc.start(start);osc.stop(start+.3);osc.onended=()=>{osc.disconnect();gain.disconnect();};}}catch{say('Не удалось включить звук. Нажмите кнопку ещё раз.');}}
 function ring(bell){pulses.set(bell,.3);sound(bell.userData.voice);}
 controls.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.counter==='cake')say(service.request());else ring(bells.find(o=>o.userData.voice===Number(b.dataset.counter)));});
 canvas.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});
 canvas.addEventListener('click',e=>{if(!isWalking()||isMenuOpen()||!isTap(down,e))return;const r=canvas.getBoundingClientRect(),locked=document.pointerLockElement===canvas;pointer.set(locked?0:(e.clientX-r.left)/r.width*2-1,locked?0:1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(service.objects,true);if(!hits.length||hits[0].distance>3)return;
  const h=hits[0];const blocked=ray.intersectObjects(Object.values(world.groups),true).some(x=>x.distance<h.distance-.015&&!x.object.material?.transparent);if(blocked)return;
  let object=h.object;while(object&&!object.userData.counterAction)object=object.parent;if(!object)return;e.stopImmediatePropagation();e.preventDefault();
  if(object.userData.counterAction==='bell')ring(object);else{const muffinHit=hits.find(x=>{let p=x.object;while(p){if(p.userData.counterAction==='muffin'&&!p.userData.served)return true;p=p.parent;}return false;});let muffin=muffinHit?.object;while(muffin&&muffin.userData.counterAction!=='muffin')muffin=muffin.parent;say(service.request(muffin));}
 },true);
 function update(dt){service.update(dt);for(const [bell,t] of pulses){const next=t-dt;const top=bell.getObjectByName('coloured-service-bell');top.position.y=1.20-Math.sin(Math.max(0,next)/.3*Math.PI)*.016;if(next<=0)pulses.delete(bell);else pulses.set(bell,next);}
  if(noticeTime>0){noticeTime-=dt;if(noticeTime<=0)notice.hidden=true;}const visible=isWalking()&&!isMenuOpen()&&!document.querySelector('dialog[open]')&&camera.position.distanceTo(new T.Vector3(.1,1.6,-1.4))<2.5;controls.hidden=!visible;
 }
 return {update,service};
}
