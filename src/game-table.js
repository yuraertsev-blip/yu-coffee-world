import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {installGameUI} from './games/ui.js';
import {GAMES} from './games/registry.js';
import {isTap} from './barista-interaction.js';
export function installGameTable({scene,canvas,camera,world,keys,interaction,isWalking}){
 const boxes=[];
 for(const [tx,tz] of [[-.72,.85],[1.12,1.25]])GAMES.forEach((g,i)=>{
  const group=new T.Group();group.name='board-game-'+g.id;group.position.set(tx+(i===4?0:(i%2?1:-1)*.105),i===4?.783:.736,tz+(i===4?0:(i<2?-1:1)*.078));group.rotation.y=(i%2?-.06:.05);scene.add(group);
  const mat=new T.MeshStandardMaterial({color:g.color,roughness:.82});const box=new T.Mesh(new RoundedBoxGeometry(.19,.045,.137,3,.004),mat);group.add(box);
  const cover=document.createElement('canvas');cover.width=512;cover.height=384;const ctx=cover.getContext('2d');ctx.fillStyle=g.color;ctx.fillRect(0,0,512,384);ctx.strokeStyle='#fff0c5';ctx.lineWidth=5;ctx.strokeRect(18,18,476,348);ctx.fillStyle='#fff1d1';ctx.textAlign='center';ctx.font=g.id==='croissant'?'bold 43px Arial':'bold 62px Arial';ctx.fillText(g.name,256,108);ctx.font='100px Georgia';ctx.fillText(g.icon,256,239);ctx.font='22px Arial';ctx.fillText('Ю КОФЕ · ДАВАЙТЕ ИГРАТЬ',256,330);const texture=new T.CanvasTexture(cover);texture.colorSpace=T.SRGBColorSpace;
  const face=new T.Mesh(new T.PlaneGeometry(.181,.128),new T.MeshStandardMaterial({map:texture,roughness:.75}));face.rotation.x=-Math.PI/2;face.position.y=.023;group.add(face);group.userData.gameId=g.id;boxes.push(group);
 });
 const launcher=document.createElement('button');launcher.className='quiet';launcher.textContent='Игры ♟';launcher.id='open-games';document.querySelector('.header-actions').prepend(launcher);
 const ui=installGameUI({onOpen:()=>{keys.clear();document.exitPointerLock?.();interaction.hide();},onClose:()=>{keys.clear();launcher.focus({preventScroll:true});}});launcher.onclick=()=>ui.open();
 const ray=new T.Raycaster(),pointer=new T.Vector2();let down=null;
 canvas.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});canvas.addEventListener('click',e=>{if(!isWalking()||ui.opened||!isTap(down,e))return;const r=canvas.getBoundingClientRect(),locked=document.pointerLockElement===canvas;pointer.set(locked?0:(e.clientX-r.left)/r.width*2-1,locked?0:1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(boxes,true)[0];if(!hit||hit.distance>3.5)return;if(ray.intersectObjects(Object.values(world.groups),true).some(h=>h.distance<hit.distance-.015&&!h.object.material?.transparent))return;e.preventDefault();e.stopImmediatePropagation();let p=hit.object;while(p&&!p.userData.gameId)p=p.parent;ui.open(p?.userData.gameId);},true);
 return ui;
}
