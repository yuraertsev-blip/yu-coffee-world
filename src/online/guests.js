import * as T from 'three';
import {createGuestModel} from '../guest-models.js';
import {cleanAvatar} from '../guest-profiles.js';
import {isTap} from '../barista-interaction.js';

export function guestPlacement(index){return index===0?{x:-1.38,y:0,z:.65,rotation:Math.PI/2,seated:true}:{x:2.55+Math.floor((index-1)/12)*.7,y:0,z:6+(index-1)%12*.72,rotation:Math.PI,seated:false};}
export function installGuests({scene,canvas,camera,world,onSelect}){
 const root=new T.Group();root.name='online-guests';scene.add(root);let list=[],revision=0;const visitors=new Map();
 function label(name){const c=document.createElement('canvas');c.width=512;c.height=96;const x=c.getContext('2d');x.fillStyle='#173c32';x.beginPath();x.roundRect(2,2,508,92,28);x.fill();x.fillStyle='#fff4db';x.font='600 32px Arial';x.textAlign='center';x.fillText(name,256,60,475);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,depthTest:true}));sprite.scale.set(.95,.178,1);return sprite;}
 function disposeVisitor(group){group.traverse(o=>{if(o.isSprite){o.material.map.dispose();o.material.dispose();}});root.remove(group);}
 function refresh(){const version=++revision;for(const g of visitors.values())disposeVisitor(g);visitors.clear();list.forEach((p,index)=>{const pos=guestPlacement(index),g=new T.Group();g.name='guest-'+p.id;g.userData.guestId=p.id;g.userData.avatarId=cleanAvatar(p.avatar);g.position.set(pos.x,pos.y,pos.z);g.rotation.y=pos.rotation;const badge=label(p.name+(p.busy?' · играет':''));badge.position.y=pos.seated?1.55:1.95;g.add(badge);root.add(g);visitors.set(p.id,g);
 createGuestModel(p.avatar,{seated:pos.seated}).then(body=>{if(version===revision&&g.parent)g.add(body);}).catch(()=>{badge.material.color.set('#d9b687');});});}
 let signature='';function update(guests,self){const next=guests.filter(g=>g.id!==self).sort((a,b)=>a.joined-b.joined||a.id.localeCompare(b.id));const sig=JSON.stringify(next);if(sig===signature)return;signature=sig;list=next;refresh();}
 const ray=new T.Raycaster();let down=null;canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});canvas.addEventListener('click',e=>{if(document.querySelector('dialog[open]')||!isTap(down,e))return;const r=canvas.getBoundingClientRect(),locked=document.pointerLockElement===canvas;ray.setFromCamera(new T.Vector2(locked?0:(e.clientX-r.left)/r.width*2-1,locked?0:1-(e.clientY-r.top)/r.height*2),camera);const hit=ray.intersectObject(root,true)[0];if(!hit)return;if(ray.intersectObjects(Object.values(world.groups),true).some(h=>h.distance<hit.distance-.02&&!h.object.material?.transparent))return;let g=hit.object;while(g&&!g.userData.guestId)g=g.parent;if(g){e.preventDefault();e.stopImmediatePropagation();onSelect(g.userData.guestId);}},true);
 return {update};
}
