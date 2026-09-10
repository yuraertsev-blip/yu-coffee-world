import * as T from 'three';
import {tailoredSurface} from './character-surfaces.js';
const standard=(color,metalness=0)=>new T.MeshStandardMaterial({color,roughness:metalness?.32:.85,metalness,side:T.DoubleSide});
export function dressBarista(vrm,profile,index){
 let body=null;
 vrm.scene.traverse(o=>{if(!o.isMesh)return;const mats=Array.isArray(o.material)?o.material:[o.material];if(mats.every(m=>m.isOutline)){o.visible=false;return;} const convert=m=>{const n=new T.MeshStandardMaterial({name:m.name,map:m.map,color:m.color,roughness:.82,side:m.side,transparent:m.transparent,opacity:m.opacity,alphaTest:m.alphaTest,depthWrite:m.depthWrite});return n;};o.material=Array.isArray(o.material)?mats.map(convert):convert(mats[0]);for(const m of (Array.isArray(o.material)?o.material:[o.material])){
  if(m.name.includes('Body_00_SKIN'))body=o;
  if(m.name.includes('HAIR')){m.color.set(profile.hair);if(m.shadeColorFactor)m.shadeColorFactor.copy(m.color).multiplyScalar(.78);}
  if(m.name.includes('Tops')){m.color.set(profile.top);if(m.shadeColorFactor)m.shadeColorFactor.copy(m.color).multiplyScalar(.8);}
  if(m.name.includes('Bottoms'))m.color.set(index===2?'#6b4c4b':'#323138');
  if(m.name.includes('SKIN'))m.color.set('#efd1bd');
  if(m.name.includes('EyeIris'))m.color.set(profile.eyes);
  if(m.outlineWidthFactor!==undefined)m.outlineWidthFactor=.0008;
 }});
 if(!body)return;
 const raw=key=>vrm.humanoid.getRawBoneNode(key),boneIndex=key=>body.skeleton.bones.indexOf(raw(key));
 const hip=boneIndex('hips'),chest=boneIndex('chest');
 function garment(name,geometry,material,rig='torso'){
  const pos=geometry.attributes.position,indices=[],weights=[];
  for(let i=0;i<pos.count;i++){const w=rig==='hips'?0:T.MathUtils.smoothstep(pos.getY(i),.93,1.17);indices.push(Math.max(0,chest),Math.max(0,hip),0,0);weights.push(w,1-w,0,0);}
  geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
  const mesh=new T.SkinnedMesh(geometry,material);mesh.name=name;mesh.bind(body.skeleton,body.bindMatrix.clone());mesh.frustumCulled=false;vrm.scene.add(mesh);return mesh;
 }
 function ribbon(name,points,width,material){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return garment(name,new T.TubeGeometry(curve,24,width,8,false),material);}
 const gold=standard('#c9a557',.7),cream=standard('#efdfbb');
 if(index===1){
  const positions=[],uvs=[],ids=[],rows=20,cols=16;for(let r=0;r<=rows;r++){const y=.78+r/rows*.46,w=y>1.12?.09:.14;for(let c=0;c<=cols;c++){const x=(c/cols*2-1)*w;positions.push(x,y,.15-Math.pow(x/.17,2)*.037);uvs.push(c/cols,r/rows);}}
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const a=r*(cols+1)+c,b=a+cols+1;ids.push(a,a+1,b,b,a+1,b+1);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.setIndex(ids);geo.computeVertexNormals();garment('fitted-black-apron',geo,standard('#28262b'));
  for(const side of [-1,1]){ribbon('apron-shoulder-strap',[[side*.08,1.20,.143],[side*.11,1.31,.07],[side*.10,1.30,-.09]],.008,standard('#302c2c'));const ring=new T.TorusGeometry(.011,.002,8,24);ring.translate(side*.081,1.204,.15);garment('brass-apron-ring',ring,gold);}
  ribbon('apron-pocket-seam',[[-.075,1.03,.15],[-.075,.94,.152],[.075,.94,.152],[.075,1.03,.15]],.0012,standard('#8d8274'));
 }
 if(index===2){
  garment('draped-pink-kimono',tailoredSurface([[.10,.18,.13],[.16,.181,.13],[.58,.17,.115],[.87,.157,.112],[1.02,.145,.11]],48),standard('#dca194'),'hips');
  garment('gold-patterned-obi',tailoredSurface([[.94,.16,.117],[.95,.162,.119],[1.09,.16,.119],[1.10,.157,.115]],48),standard('#4c402d'));
  for(const side of [-1,1])ribbon('kimono-lapel',[[side*.044,1.325,.04],[side*.026,1.20,.141],[-side*.115,1.09,.12]],.009,standard('#edb3a6'));
  for(let j=0;j<22;j++){const x=-.135+(j%11)*.027,y=.975+Math.floor(j/11)*.076,z=.12-Math.pow(x/.18,2)*.008;const shape=new T.Shape();shape.moveTo(0,-.015);shape.quadraticCurveTo(-.014,.0,0,.017);shape.quadraticCurveTo(.014,0,0,-.015);const geo=new T.ShapeGeometry(shape);geo.rotateZ(j*.8);geo.translate(x,y,z+.001);garment('obi-gold-leaf',geo,gold);}
 }
 const head=raw('head');vrm.scene.updateMatrixWorld(true);
 function attachHead(object,position){object.position.copy(head.worldToLocal(vrm.scene.localToWorld(new T.Vector3(...position))));head.add(object);}
 function branch(parent,points,r,mat){const mesh=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),20,r,8,false),mat);parent.add(mesh);}
 if(index===0){const crown=new T.Group();attachHead(crown,[0,1.59,.01]);for(const side of [-1,1]){branch(crown,[[side*.055,0,0],[side*.10,.055,0],[side*.09,.12,0],[side*.11,.17,0]],.0028,gold);branch(crown,[[side*.10,.06,0],[side*.145,.095,0],[side*.15,.13,0]],.002,gold);branch(crown,[[side*.09,.11,0],[side*.055,.14,0]],.002,gold);
   for(let f=0;f<3;f++){const flower=new T.Group();flower.position.set(side*(.055+f*.02),-.01-f*.008,.055-f*.016);crown.add(flower);for(let j=0;j<6;j++){const a=j*Math.PI/3,p=new T.Mesh(new T.SphereGeometry(.009,12,8),f===1?standard('#799cb5'):cream);p.scale.set(1.3,.65,.3);p.rotation.z=a;p.position.set(Math.cos(a)*.008,Math.sin(a)*.008,0);flower.add(p);}const center=new T.Mesh(new T.SphereGeometry(.004,10,6),gold);center.position.z=.003;flower.add(center);}
  }}
 if(index===2){const bun=new T.Mesh(new T.SphereGeometry(.05,24,18),standard(profile.hair));bun.scale.set(1,.8,.85);attachHead(bun,[0,1.42,-.15]);}
}
