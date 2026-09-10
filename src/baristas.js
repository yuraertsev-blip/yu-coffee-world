import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {VRMLoaderPlugin} from '@pixiv/three-vrm';
import {assetUrl} from './asset-url.js';
import {solveArm} from './character-rig.js';
import {dressBarista} from './barista-outfits.js';
export const BARISTAS=[
 {id:'flowers',label:'Цветочный ободок',height:1.94,hair:'#926a49',top:'#efe4d2',eyes:'#6c9188'},
 {id:'apron',label:'Тёмный фартук',height:1.79,hair:'#493329',top:'#35353b',eyes:'#947550'},
 {id:'kimono',label:'Розовое кимоно',height:1.79,hair:'#292a34',top:'#dfa69a',eyes:'#80654f'}
];
export const nextBaristaIndex=index=>(index+1)%BARISTAS.length;
const q=new T.Quaternion(),euler=new T.Euler();
export function createBaristas(scene,{initial=0,onReady=()=>{},onError=()=>{},loadTextures=typeof document!=='undefined'}={}){
 const root=new T.Group();root.name='switchable-barista';root.position.set(-.55,.025,-2.28);scene.add(root);
 const entries=BARISTAS.map(profile=>({profile,vrm:null,error:null}));let active=Number.isInteger(initial)&&initial>=0&&initial<3?initial:0,lastTime=0,delta=1/60;
 const loader=new GLTFLoader();loader.register(parser=>new VRMLoaderPlugin(parser));
 // Fetch one binary, then parse independent skeletons. Textures are cached by
 // the browser; no avatar depends on a third-party URL at runtime.
 let binary=null;
 async function load(){try{binary=await fetch(assetUrl('models/barista-base.vrm')).then(r=>{if(!r.ok)throw new Error('Не удалось загрузить модель бариста');return r.arrayBuffer();});
  for(let i=0;i<3;i++){const gltf=await loader.parseAsync(binary.slice(0),'');const vrm=gltf.userData.vrm;const group=vrm.scene;group.name='barista-'+BARISTAS[i].id;group.visible=i===active;root.add(group);
   const bounds=new T.Box3().setFromObject(group),size=bounds.getSize(new T.Vector3());group.scale.setScalar(1.74/size.y);group.position.y=-bounds.min.y*group.scale.y;
   group.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.castShadow=false;o.receiveShadow=false;}});
   dressBarista(vrm,BARISTAS[i],i);entries[i].vrm=vrm;vrm.expressionManager?.setValue('relaxed',.15);onReady();
  }
 }catch(error){entries.forEach(x=>{if(!x.vrm)x.error=error.message;});onError(error);}}
 if(loadTextures)load();
 function select(index){active=((index%3)+3)%3;entries.forEach((entry,i)=>{if(entry.vrm)entry.vrm.scene.visible=i===active;});return BARISTAS[active];}
 function rotate(vrm,name,x,y,z,blend=.23){const node=vrm.humanoid.getNormalizedBoneNode(name);if(node){q.setFromEuler(euler.set(x,y,z));node.quaternion.slerp(q,blend);}}
 function animate(time,moving,task){delta=Math.min(.05,Math.max(.001,time-lastTime));lastTime=time;const vrm=entries[active].vrm;if(!vrm)return;
  const phase=(time+active*.9)%4.4,blink=phase<.16?Math.sin(phase/.16*Math.PI):0;
  vrm.expressionManager?.setValue('blink',blink);vrm.expressionManager?.setValue('happy',.08);vrm.expressionManager?.setValue('relaxed',.10);
  rotate(vrm,'spine',Math.sin(time*1.8)*.006,0,Math.sin(time*1.8)*.008);rotate(vrm,'neck',-.025,Math.sin(time*.48)*.025,0);rotate(vrm,'head',.015,Math.sin(time*.48)*.025,Math.sin(time*.7)*.012);
  for(const [prefix,side] of [['left',1],['right',-1]]){
   const swing=moving?Math.sin(time*7+side*Math.PI/2):0;
   rotate(vrm,prefix+'UpperArm',moving?swing*.10:0,-side*.18,-side*1.25,1);
   rotate(vrm,prefix+'LowerArm',0,-side*.22,0,1);
   rotate(vrm,prefix+'Hand',0,0,0,1);
   rotate(vrm,prefix+'UpperLeg',swing*.22,0,0);rotate(vrm,prefix+'LowerLeg',Math.max(0,-swing)*.30,0,0);
   for(const finger of ['Index','Middle','Ring','Little'])for(const segment of ['Proximal','Intermediate','Distal'])rotate(vrm,prefix+finger+segment,0,-side*(task==='wipe'?.06:.24),0,.3);
  }
  root.updateMatrixWorld(true);
 }
 function reach(side,worldTarget){const vrm=entries[active].vrm;if(!vrm)return worldTarget.clone();const prefix=side>0?'left':'right';const a=vrm.humanoid.getNormalizedBoneNode(prefix+'UpperArm'),b=vrm.humanoid.getNormalizedBoneNode(prefix+'LowerArm'),c=vrm.humanoid.getNormalizedBoneNode(prefix+'Hand');root.updateMatrixWorld(true);
  return solveArm(root,a,b,c,worldTarget,side);
 }
 function face(direction,dt){const diff=direction-root.rotation.y;root.rotation.y+=Math.atan2(Math.sin(diff),Math.cos(diff))*Math.min(1,dt*4);}
 function update(){const vrm=entries[active].vrm;if(vrm){vrm.springBoneManager?.reset();vrm.update(delta);}}
 function hit(raycaster,occluders){const vrm=entries[active].vrm;if(!vrm)return false;root.updateMatrixWorld(true);const found=raycaster.intersectObject(vrm.scene,true)[0];if(!found||found.distance>8)return false;return !raycaster.intersectObjects(occluders,true).some(h=>h.distance<found.distance-.02&&h.object.material&&!h.object.material.transparent);}
 return {root,select,animate,reach,face,update,hit,get index(){return active;},get profile(){return BARISTAS[active];},get ready(){return !!entries[active].vrm;},get error(){return entries[active].error;},collider:{minX:-.73,maxX:-.37,minZ:-2.44,maxZ:-2.12}};
}
