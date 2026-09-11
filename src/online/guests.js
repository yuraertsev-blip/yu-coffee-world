import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {VRMLoaderPlugin} from '@pixiv/three-vrm';
import {dressBarista} from '../barista-outfits.js';
import {BARISTAS} from '../baristas.js';
import {assetUrl} from '../asset-url.js';
import {isTap} from '../barista-interaction.js';

export function guestPlacement(index){return index===0?{x:-1.38,y:0,z:.65,rotation:Math.PI/2,seated:true}:{x:2.55+Math.floor((index-1)/12)*.7,y:0,z:6+(index-1)%12*.72,rotation:Math.PI,seated:false};}
export function installGuests({scene,canvas,camera,world,onSelect}){
 const root=new T.Group();root.name='online-guests';scene.add(root);let list=[],models=null,loading=false;const visitors=new Map();
 async function load(){if(loading)return;loading=true;try{const loader=new GLTFLoader();loader.register(p=>new VRMLoaderPlugin(p));const gltf=await loader.loadAsync(assetUrl('models/barista-base.vrm'));const vrm=gltf.userData.vrm;dressBarista(vrm,BARISTAS[1],1);const size=new T.Box3().setFromObject(vrm.scene).getSize(new T.Vector3());vrm.scene.scale.setScalar(1.68/size.y);
  const pose=(name,x,y,z)=>{const b=vrm.humanoid.getNormalizedBoneNode(name);if(b)b.rotation.set(x,y,z);};
  for(const [side,n] of [['left',1],['right',-1]]){pose(side+'UpperArm',0,-n*.10,-n*1.25);pose(side+'LowerArm',0,-n*.15,0);}vrm.update(0);vrm.scene.updateMatrixWorld(true);const standing=clone(vrm.scene);
  for(const side of ['left','right']){pose(side+'UpperLeg',-Math.PI/2,0,0);pose(side+'LowerLeg',Math.PI/2,0,0);}vrm.update(0);vrm.scene.updateMatrixWorld(true);const seated=clone(vrm.scene);seated.position.y-=.38;models={standing,seated};refresh();
 }catch{loading=false;}}
 function label(name){const c=document.createElement('canvas');c.width=512;c.height=96;const x=c.getContext('2d');x.fillStyle='#173c32';x.beginPath();x.roundRect(2,2,508,92,28);x.fill();x.fillStyle='#fff4db';x.font='600 32px Arial';x.textAlign='center';x.fillText(name,256,60,475);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,depthTest:true}));sprite.scale.set(.95,.178,1);return sprite;}
 function disposeVisitor(group){group.traverse(o=>{if(o.isSprite){o.material.map.dispose();o.material.dispose();}});root.remove(group);}
 function refresh(){for(const g of visitors.values())disposeVisitor(g);visitors.clear();list.forEach((p,index)=>{const pos=guestPlacement(index),g=new T.Group();g.name='guest-'+p.id;g.userData.guestId=p.id;g.position.set(pos.x,pos.y,pos.z);g.rotation.y=pos.rotation;if(models){const body=clone(models[pos.seated?'seated':'standing']);body.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.castShadow=false;}});g.add(body);}const badge=label(p.name+(p.busy?' · играет':''));badge.position.y=pos.seated?1.55:1.88;g.add(badge);root.add(g);visitors.set(p.id,g);});}
 let signature='';function update(guests,self){const next=guests.filter(g=>g.id!==self).sort((a,b)=>a.joined-b.joined||a.id.localeCompare(b.id));const sig=JSON.stringify(next);if(sig===signature)return;signature=sig;list=next;if(list.length&&!models)load();refresh();}
 const ray=new T.Raycaster();let down=null;canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});canvas.addEventListener('click',e=>{if(document.querySelector('dialog[open]')||!isTap(down,e))return;const r=canvas.getBoundingClientRect(),locked=document.pointerLockElement===canvas;ray.setFromCamera(new T.Vector2(locked?0:(e.clientX-r.left)/r.width*2-1,locked?0:1-(e.clientY-r.top)/r.height*2),camera);const hit=ray.intersectObject(root,true)[0];if(!hit)return;if(ray.intersectObjects(Object.values(world.groups),true).some(h=>h.distance<hit.distance-.02&&!h.object.material?.transparent))return;let g=hit.object;while(g&&!g.userData.guestId)g=g.parent;if(g){e.preventDefault();e.stopImmediatePropagation();onSelect(g.userData.guestId);}},true);
 return {update};
}
