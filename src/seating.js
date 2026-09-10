import * as T from 'three';
// Furniture observed at 02:05, 02:25, 02:35 and 05:10. No generic sofa arms.
export function createSeating(m,p){
 const {box,rod}=p;
 const grey=m.standard('#898b8e',{roughness:1,bumpMap:m.photo('weave',5,5),bumpScale:.0015});
 const black=m.standard('#25262a',{roughness:1,bumpMap:m.photo('weave',4,4),bumpScale:.001});
 const edge=m.standard('#727477',{roughness:1});
 function softBlock(parent,name,x,y,z,w,h,d,material,tuft=false){
  const root=new T.Group();root.name=name;root.position.set(x,y,z);parent.add(root);
  const geom=new T.BoxGeometry(w,h,d,56,20,32),pos=geom.attributes.position;
  const radius=Math.min(.038,h*.37,d*.32),core=new T.Vector3(w/2-radius,h/2-radius,d/2-radius);
  const back=name.includes('back');
  for(let i=0;i<pos.count;i++){
   const original=new T.Vector3().fromBufferAttribute(pos,i),q=original.clone().clamp(core.clone().negate(),core);
   const point=original.clone().sub(q).normalize().multiplyScalar(radius).add(q);
   const xx=point.x,zz=point.z,u=xx/w+.5,v=zz/d+.5;
   if(original.y>h*.45&&!back){
    const fade=Math.pow(Math.max(0,Math.sin(Math.PI*u)*Math.sin(Math.PI*v)),.6);let delta=.032*fade;
    if(tuft)for(const a of [-.26,.26])for(const b of [-.22,.22]){const dx=xx-a*w,dz=zz-b*d;delta-=.077*Math.exp(-(dx*dx+dz*dz)/.006);delta-=.011*Math.exp(-Math.abs(dx+dz)*65)*Math.exp(-(dx*dx+dz*dz)/.025);}
    else {delta-=.021*Math.exp(-((xx-.12)**2+zz*zz)/.11);delta+=.012*Math.sin(xx*25+zz*11)*Math.exp(-Math.abs(zz-.21)*9)*fade;}
    point.y+=delta;
   }
   if(back&&original.z>0){const v=point.y/h+.5;point.z+=.014*Math.sin(xx*18+v*9)*Math.sin(v*Math.PI)+.02*Math.sin(v*Math.PI);}
   if(name.includes('slipcover')&&original.z>0)point.z+=.007*Math.sin(xx*32+point.y*4)*(.5-point.y);
   pos.setXYZ(i,point.x,point.y,point.z);
  }
  geom.computeVertexNormals();const o=new T.Mesh(geom,material);o.name=name+'-fabric';o.castShadow=o.receiveShadow=true;root.add(o);
  const pts=[];for(let i=0;i<=64;i++){const a=i/64*Math.PI*2,co=Math.cos(a),si=Math.sin(a);const xx=Math.sign(co)*Math.pow(Math.abs(co),.24)*(w/2-.012);pts.push(back?new T.Vector3(xx,Math.sign(si)*Math.pow(Math.abs(si),.24)*(h/2-.016),d/2-.01):new T.Vector3(xx,h/2-.025,Math.sign(si)*Math.pow(Math.abs(si),.24)*(d/2-.012)));}
  const seam=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),80,.0024,4,false),material===grey?edge:black);seam.name='cushion-piped-edge';root.add(seam);return root;
 }

 function pillow(parent,x,y,z,colour,w=.43,h=.45,tilt=0){
  const g=new T.Group();g.name='loose-square-pillow';g.position.set(x,y,z);g.rotation.set(-.16,0,tilt);parent.add(g);
  const geom=new T.SphereGeometry(1,40,24),pos=geom.attributes.position;
  for(let i=0;i<pos.count;i++){let a=pos.getX(i),b=pos.getY(i),c=pos.getZ(i);const power=v=>Math.sign(v)*Math.pow(Math.abs(v),.34);pos.setXYZ(i,power(a)*w*.5,power(b)*h*.5,power(c)*.082*(.85+.15*Math.cos(a*5+b*3)));}
  geom.computeVertexNormals();const mat=colour==='grey'?grey:m.standard(colour,{roughness:1,bumpMap:m.photo('weave',3,3),bumpScale:.001});const o=new T.Mesh(geom,mat);o.name='soft-pillow';o.castShadow=o.receiveShadow=true;g.add(o);
  const points=[];for(let i=0;i<=64;i++){const a=i/64*Math.PI*2;points.push(new T.Vector3(Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),.25)*w*.495,Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),.25)*h*.495,0));}
  g.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),64,.0035,4),mat));return g;
 }
 function animalCushion(parent,x,y,z,name,w,h){
  const g=new T.Group();g.name=name+'-printed-pillow';g.position.set(x,y,z);g.rotation.x=-.16;parent.add(g);
  const outlines={
   'dog-pillow':[[18,335],[30,286],[70,210],[120,140],[152,98],[164,65],[182,60],[194,100],[226,110],[244,94],[255,95],[260,110],[239,151],[232,192],[207,218],[188,269],[184,324],[170,348],[106,366],[42,359]],
   'cat-pillow':[[184,284],[205,198],[230,172],[235,135],[255,144],[265,190],[276,240],[274,285],[262,302],[220,305]],
   'cow-pillow':[[535,196],[550,176],[582,167],[605,170],[639,166],[655,176],[668,200],[660,252],[675,292],[669,337],[640,345],[603,339],[570,328],[543,303],[532,273]]};
  const points=outlines[name],xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),minX=Math.min(...xs),minY=Math.min(...ys),sx=Math.max(...xs)-minX,sy=Math.max(...ys)-minY;
  const shape=new T.Shape(points.map(([a,b])=>new T.Vector2(((a-minX)/sx-.5)*w,(.5-(b-minY)/sy)*h)));
  const body=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:true,bevelSize:.012,bevelThickness:.018,bevelSegments:3,steps:1}),m.standard('#bcb5a7',{roughness:1,bumpMap:m.photo('weave',3,3),bumpScale:.001}));body.position.z=.012;body.castShadow=true;body.name='padded-animal-outline';g.add(body);
  const tex=m.photo(name);const face=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:tex,transparent:true,alphaTest:.3,side:T.FrontSide,roughness:1}));face.name=name+'-video-face';face.position.z=.076;face.castShadow=true;g.add(face);

 }
 function bench(parent,x,z,length,rot){
  const g=new T.Group();g.name='grey-armless-banquette';g.userData.reference='02:25 / 05:10';g.position.set(x,0,z);g.rotation.y=rot;parent.add(g);
  box(g,'continuous-grey-box-base',0,.235,0,length,.45,.69,grey,.009);
  // Separate tied chair pads on the front section, two larger pads in the recess.
  const segments=[.52,.52,.87,.87,.74];const sum=segments.reduce((a,b)=>a+b,0),ratio=length/sum;let start=-length/2;
  for(let i=0;i<segments.length;i++){const w=segments[i]*ratio;softBlock(g,'quilted-seat-pad',start+w/2,.49,.012,w-.018,.105,.67,grey,true);start+=w;}
  // Loose back cushions rest against the wall; the bench has no structural backrest.
  pillow(g,-.02,.78,-.24,'grey',.46,.48,.045);
  pillow(g,.62,.78,-.24,'#c1a13e',.44,.44,-.08);
  pillow(g,1.31,.78,-.24,'#c6a943',.46,.44,.09);
  pillow(g,1.8,.77,-.24,'grey',.44,.46,-.05);
  animalCushion(g,.27,.77,-.12,'dog-pillow',.29,.5);
  animalCushion(g,.49,.7,-.12,'cat-pillow',.18,.3);
  animalCushion(g,.96,.69,-.08,'cow-pillow',.32,.32);
  return g;
 }
 function futon(parent,x,z,length,rot,front=false){
  const g=new T.Group();g.name='black-armless-futon';g.userData.reference='02:05 / 02:35';g.position.set(x,0,z);g.rotation.y=rot;parent.add(g);
  softBlock(g,'floor-length-black-slipcover',0,.22,0,length,.41,.77,black);
  softBlock(g,'continuous-unbuttoned-seat',0,.437,.055,length,.078,.67,black,false);
  const back=softBlock(g,'single-low-inclined-back',0,.7,-.325,length,.50,.10,black,false);back.rotation.x=-.14;
  pillow(g,front?-.40:length*.32,.70,-.21,front?'#c6a53d':'grey',front?.44:.36,front?.42:.37,front?.08:-.12);
  if(front)pillow(g,.40,.70,-.20,'grey',.46,.37,-.06);
  return g;
 }
 return {bench,futon};
}
