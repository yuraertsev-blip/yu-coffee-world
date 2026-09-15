import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {VRMLoaderPlugin} from '@pixiv/three-vrm';
import {assetUrl} from './asset-url.js';
import {dressBarista} from './barista-outfits.js';
import {attachInModelSpace} from './character-rig.js';
import {guestProfile} from './guest-profiles.js';
let sourcePromise;const templates=new Map();
const mat=(color,roughness=.72)=>new T.MeshStandardMaterial({color,roughness});
function ellipsoid(root,name,pos,scale,material){const o=new T.Mesh(new T.SphereGeometry(1,28,20),material);o.name=name;o.position.set(...pos);o.scale.set(...scale);root.add(o);return o;}
function curve(root,name,points,r,material){const o=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),20,r,8,false),material);o.name=name;root.add(o);return o;}
async function source(){if(!sourcePromise)sourcePromise=(async()=>{
 const loader=new GLTFLoader();loader.register(p=>new VRMLoaderPlugin(p));const vrm=(await loader.loadAsync(assetUrl('models/barista-base.vrm'))).userData.vrm;
 const remove=[];vrm.scene.traverse(o=>{if(o.constructor.name.includes('SpringBoneCollider'))remove.push(o);});remove.forEach(o=>o.removeFromParent());
 const boneNames={};for(const [name,b] of Object.entries(vrm.humanoid.rawHumanBones))boneNames[name]=b.node.name;
 for(const [side,sign] of [['left',1],['right',-1]]){vrm.humanoid.getNormalizedBoneNode(side+'UpperArm').rotation.set(0,-sign*.10,-sign*1.25);vrm.humanoid.getNormalizedBoneNode(side+'LowerArm').rotation.set(0,-sign*.15,0);}
 vrm.update(0);vrm.scene.updateMatrixWorld(true);const standing=clone(vrm.scene);
 for(const side of ['left','right']){vrm.humanoid.getNormalizedBoneNode(side+'UpperLeg').rotation.set(-Math.PI/2,0,0);vrm.humanoid.getNormalizedBoneNode(side+'LowerLeg').rotation.set(Math.PI/2,0,0);}
 vrm.update(0);vrm.scene.updateMatrixWorld(true);return {standing,seated:clone(vrm.scene),boneNames};
 })().catch(e=>{sourcePromise=null;throw e;});return sourcePromise;}

function accessories(vrm,p){
 const head=vrm.humanoid.getRawBoneNode('head'),root=new T.Group();root.name='guest-head-details';attachInModelSpace(vrm.scene,head,root,[0,1.48,.005]);
 const hair=mat(p.hair,.54),gold=mat('#b69958',.35),cream=mat('#e7d5b7');
 if(p.category==='men'){
  ellipsoid(root,'short-sculpted-hair',[0,.06,-.025],[.102,.105,.092],hair);
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const lock=ellipsoid(root,'short-hair-lock',[Math.sin(a)*.078,.10+Math.cos(a*2)*.012,Math.cos(a)*.061],[.030,.037,.025],hair);lock.rotation.z=-.3;}
  if(p.style==='curly')for(let i=0;i<18;i++)ellipsoid(root,'soft-curl',[(i%6-2.5)*.029,.125+Math.floor(i/6)*.009,.03-Math.floor(i/6)*.04],[.022,.023,.023],hair);
  if(p.style==='sweep'){const sweep=ellipsoid(root,'side-swept-fringe',[-.027,.108,.067],[.075,.022,.027],hair);sweep.rotation.z=.3;}
 }
 if(p.style==='bun')ellipsoid(root,'low-hair-bun',[0,-.005,-.12],[.061,.055,.055],hair);
 if(p.style==='beanie'||p.style==='beret'){
  const cap=mat(p.style==='beret'?'#88744f':'#bb8e59');ellipsoid(root,'wool-hat',[p.style==='beret'?-.016:0,.105,-.022],[.112,p.style==='beret'?.052:.083,.103],cap);
  const band=new T.Mesh(new T.TorusGeometry(.092,.011,10,48),cap);band.rotation.x=Math.PI/2;band.position.set(0,.072,-.018);root.add(band);
 }
 if(p.style==='ribbon'){for(const side of [-1,1]){const bow=ellipsoid(root,'velvet-hair-bow',[side*.041,.084,-.095],[.045,.023,.015],mat('#c89382'));bow.rotation.z=side*.4;}}
 if(p.style==='glasses'){
  for(const side of [-1,1]){const frame=new T.Mesh(new T.TorusGeometry(.031,.0022,8,40),gold);frame.scale.y=.86;frame.position.set(side*.038,-.005,.093);root.add(frame);curve(root,'spectacle-arm',[[side*.07,0,.09],[side*.098,.005,.05],[side*.10,.0,-.015]],.0018,gold);}
  curve(root,'spectacle-bridge',[[-.007,0,.094],[0,.004,.097],[.007,0,.094]],.002,gold);
 }
 if(p.category==='women')for(const side of [-1,1])ellipsoid(root,'small-gold-earring',[side*.095,-.051,.012],[.004,.008,.004],gold);
 if(!p.animal)return;
 const fur=hair,dark=mat('#322b28'),inner=mat('#bd8d83'),muzzle=mat(p.animal==='bear'?'#b99a73':'#eee0ca'),eyes=mat(p.eyes,.3);
 ellipsoid(root,'animal-sculpted-head',[0,0,0],[p.animal==='bear'?.124:.11,.115,.097],fur);
 for(const side of [-1,1]){
  const ear=ellipsoid(root,'animal-ear',[side*(p.animal==='rabbit'?.057:.087),p.animal==='rabbit'?.17:.103,-.013],[p.animal==='rabbit'?.029:.045,p.animal==='rabbit'?.105:.052,.026],fur);ear.rotation.z=side*(p.animal==='rabbit'?-.14:-.34);
  const inset=ellipsoid(root,'soft-inner-ear',[side*(p.animal==='rabbit'?.057:.088),p.animal==='rabbit'?.177:.107,.008],[p.animal==='rabbit'?.016:.026,p.animal==='rabbit'?.079:.035,.009],inner);inset.rotation.z=ear.rotation.z;
  if(['fox','cat'].includes(p.animal)){
   const shape=new T.Shape();shape.moveTo(-.038,0);shape.quadraticCurveTo(-.031,.045,0,.105);shape.quadraticCurveTo(.03,.04,.038,0);const pointed=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.015,bevelEnabled:true,bevelThickness:.006,bevelSize:.007,bevelSegments:3,steps:1,curveSegments:14}),fur);pointed.position.set(side*.076,.065,-.007);pointed.rotation.z=-side*.17;root.add(pointed);
  }
  if(p.animal==='fox'){const cheek=ellipsoid(root,'fox-cream-cheek',[side*.067,-.035,.067],[.044,.040,.029],muzzle);cheek.rotation.z=side*.35;}
  if(p.animal==='raccoon'){const mask=ellipsoid(root,'raccoon-eye-mask',[side*.050,-.005,.078],[.054,.035,.022],dark);mask.rotation.z=-side*.27;}
  ellipsoid(root,'animal-eye-white',[side*.043,.002,.091],[.026,.028,.012],cream);
  ellipsoid(root,'animal-iris',[side*.041,.001,.102],[.015,.020,.008],eyes);
  ellipsoid(root,'animal-pupil',[side*.041,.001,.108],[.007,.014,.004],dark);
  ellipsoid(root,'eye-catchlight',[side*.041-.005,.009,.112],[.004,.005,.002],mat('#fff7df',.2));
  ellipsoid(root,'sculpted-muzzle',[side*.025,-.046,.096],[.037,.027,p.animal==='fox'?.037:.022],muzzle);
  if(p.animal!=='bear')for(let i=0;i<3;i++)curve(root,'fine-whisker',[[side*.04,-.038-i*.009,.114],[side*.081,-.03-i*.012,.114],[side*.125,-.02-i*.015,.10]],.0006,dark);
 }
 ellipsoid(root,'animal-nose',[0,-.033,p.animal==='fox'?.131:.116],[.015,.011,.009],dark);
 curve(root,'small-smile',[[0,-.043,.122],[0,-.06,.12],[.016,-.067,.114]],.0015,dark);
 const hips=vrm.humanoid.getRawBoneNode('hips'),tail=new T.Group();tail.name='animal-tail';attachInModelSpace(vrm.scene,hips,tail,[0,.78,-.11]);
 if(p.animal==='rabbit')ellipsoid(tail,'cottontail',[0,0,-.055],[.062,.061,.054],muzzle);
 else if(p.animal==='bear')ellipsoid(tail,'bear-tail',[0,0,-.04],[.04,.04,.04],fur);
 else {const points=[[0,0,0],[.10,-.1,-.10],[.19,-.10,-.18],[.25,.02,-.19],[.21,.16,-.13]];curve(tail,'curved-animal-tail',points,p.animal==='cat'?.021:.049,fur);ellipsoid(tail,'tail-tip',[.21,.16,-.13],[.045,.052,.045],p.animal==='cat'?dark:muzzle);
  if(p.animal==='raccoon')for(let i=0;i<4;i++){const pos=new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a))).getPoint(.15+i*.20);ellipsoid(tail,'raccoon-tail-band',pos.toArray(),[.052,.018,.052],dark);}
 }
}
export async function createGuestModel(id,{seated=false}={}){
 const profile=guestProfile(id),key=profile.id+':'+seated;
 if(!templates.has(key))templates.set(key,(async()=>{
  const original=await source(),scene=clone(original[seated?'seated':'standing']),boneNames=original.boneNames;
  const humanoid={getRawBoneNode:name=>scene.getObjectByName(boneNames[name])};const vrm={scene,humanoid};
  dressBarista(vrm,profile,profile.id==='woman-rose'?2:-1);
  scene.traverse(o=>{if(!o.isMesh)return;o.frustumCulled=false;o.castShadow=false;const materials=Array.isArray(o.material)?o.material:[o.material];
   if(materials.some(m=>m.name.includes('HAIR'))&&(profile.category==='men'||profile.animal))o.visible=false;
   if(profile.animal&&materials.some(m=>/Face|Eye|Brow|Eyelash|Mouth/i.test(m.name)))o.visible=false;
   if(profile.category==='women'&&['bob','bun'].includes(profile.style)&&materials.some(m=>m.name.includes('HAIR'))){o.geometry=o.geometry.clone();const pos=o.geometry.attributes.position,cut=profile.style==='bob'?1.32:1.40;for(let i=0;i<pos.count;i++){const y=pos.getY(i);if(y<cut){pos.setY(i,cut+(y-cut)*.12);pos.setX(i,pos.getX(i)*(.72+.28*Math.max(0,1-(cut-y)*3)));}}o.geometry.computeVertexNormals();}
   if((profile.category==='men'||profile.animal)&&materials.some(m=>/Tops|Body.*SKIN/.test(m.name))){o.geometry=o.geometry.clone();const pos=o.geometry.attributes.position;for(let i=0;i<pos.count;i++){const y=pos.getY(i),z=pos.getZ(i);if(y>1.02&&y<1.30&&z>.035)pos.setZ(i,.035+(z-.035)*.78);}o.geometry.computeVertexNormals();}
   for(const m of materials){if(m.name.includes('SKIN'))m.color.set(profile.skin);if(m.name.includes('Bottoms'))m.color.set(profile.category==='women'?'#4b4240':'#3e4143');}
  });
  accessories(vrm,profile);scene.name='avatar-'+profile.id;scene.userData.avatarId=profile.id;
  const stature=profile.category==='men'?1.08:profile.animal?.98:1;scene.scale.set(profile.category==='men'?1.1:1,stature,1);if(seated)scene.position.y=-.37;
  scene.updateMatrixWorld(true);return scene;
 })().catch(e=>{templates.delete(key);throw e;}));
 return clone(await templates.get(key));
}
