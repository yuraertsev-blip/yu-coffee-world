import * as T from 'three';
// Pointed, folded leaves and curved petals; stable seed keeps reference layout reproducible.
export function createVegetation(m,p){
 const {cyl,rod}=p;let seed=921;const rand=()=>((seed=seed*16807%2147483647)/2147483647);
 function blade(variegated=false,serrated=false,rows=22,cols=12){
  const vertices=[],colours=[],uv=[],indices=[];
  for(let j=0;j<=rows;j++)for(let k=0;k<=cols;k++){
   const t=j/rows,u=k/cols*2-1,span=Math.pow(Math.sin(Math.PI*t),.82)*.49*(serrated?1+.09*Math.sin(j*Math.PI*.8):1);
   const x=u*span*(1+.025*Math.sin(t*41)),z=.10*Math.sin(t*Math.PI)-.21*Math.abs(x)+.025*Math.sin(t*24+Math.abs(u)*5)*u*u-.21*t*t*t;
   vertices.push(x,t,z);uv.push(k/cols,t);
   const c=new T.Color(variegated&&Math.abs(u)<.60+.12*Math.sin(t*32+u*5)?'#d6dba2':'#ffffff');c.multiplyScalar(.89+.08*Math.cos(t*11+u*3));colours.push(c.r,c.g,c.b);
   if(j<rows&&k<cols){const a=j*(cols+1)+k,b=a+cols+1;indices.push(a,b,a+1,a+1,b,b+1);}
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colours,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
 }
 const leafGeometry=blade(),variegatedGeometry=blade(true),dahliaGeometry=blade(false,true,10,4);
 const green=m.standard('#496331',{side:T.DoubleSide,roughness:.65});
 const size=256,pixels=new Uint8Array(size*size*4),bumps=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/(size-1)*2-1,t=y/(size-1),mid=Math.exp(-Math.abs(u)*190),secondary=Math.pow(Math.max(0,Math.cos((t-Math.abs(u)*.23)*Math.PI*26)),24)*(1-Math.abs(u)),grain=(Math.sin(x*43+y*79)+Math.sin(x*13-y*29))*.018;
  const light=.88+mid*.25+secondary*.14+grain-.12*Math.abs(u),i=(y*size+x)*4;
  pixels[i]=Math.min(255,58*light);pixels[i+1]=Math.min(255,99*light);pixels[i+2]=Math.min(255,42*light);pixels[i+3]=255;
  const h=Math.round(90+mid*100+secondary*48+grain*90);bumps[i]=bumps[i+1]=bumps[i+2]=h;bumps[i+3]=255;
 }
 const map=new T.DataTexture(pixels,size,size);map.colorSpace=T.SRGBColorSpace;map.magFilter=map.minFilter=T.LinearFilter;map.needsUpdate=true;
 const bump=new T.DataTexture(bumps,size,size);bump.magFilter=bump.minFilter=T.LinearFilter;bump.needsUpdate=true;
 const leafMaterial=m.standard('#ffffff',{map,bumpMap:bump,bumpScale:.00055,vertexColors:true,side:T.DoubleSide,roughness:.43});
 const palePixels=pixels.slice();for(let y=0;y<size;y++)for(let x=0;x<size;x++){const u=x/(size-1)*2-1,t=y/(size-1),stripe=.48+.13*Math.sin(t*29)+.05*Math.sin(t*87);if(Math.abs(u)<stripe){const i=(y*size+x)*4;const shade=.85+.10*Math.cos(u*7)+.04*Math.sin(t*33);palePixels[i]=190*shade;palePixels[i+1]=201*shade;palePixels[i+2]=132*shade;}}
 const paleMap=new T.DataTexture(palePixels,size,size);paleMap.colorSpace=T.SRGBColorSpace;paleMap.magFilter=paleMap.minFilter=T.LinearFilter;paleMap.needsUpdate=true;
 const paleMaterial=leafMaterial.clone();paleMaterial.map=paleMap;paleMaterial.vertexColors=false;

 const twig=m.standard('#706147');
 function leaf(parent,x,y,z,length,width,a,tilt,material=green){const mesh=new T.Mesh(material==='variegated'?variegatedGeometry:leafGeometry,material==='variegated'?paleMaterial:leafMaterial);mesh.name='veined-curled-botanical-leaf';mesh.position.set(x,y,z);mesh.rotation.set(tilt,a,(rand()-.5)*1.1);mesh.scale.set(width,length,length);mesh.castShadow=true;parent.add(mesh);return mesh;}
 function potted(parent,x,y,z,height,kind){const g=new T.Group();g.name=kind+'-in-ribbed-pot';g.position.set(x,y,z);parent.add(g);const ph=height*.22,r=height*.135,white=m.standard(kind==='flowers'?'#292d2b':'#dedbd0',{roughness:.8});cyl(g,'tapered-ceramic-pot',0,ph/2,0,r,r*.75,ph,white,32);cyl(g,'pot-soil',0,ph-.014,0,r*.9,r*.9,.025,m.soil,24);
 const rim=new T.Mesh(new T.TorusGeometry(r*.99,.016,6,40),white);rim.rotation.x=Math.PI/2;rim.position.y=ph;g.add(rim);
 for(let i=0;i<28;i++){const a=i*Math.PI/14;rod(g,[Math.cos(a)*r*.78,.02,Math.sin(a)*r*.78],[Math.cos(a)*r*.98,ph-.025,Math.sin(a)*r*.98],.004,white);}
 if(kind==='flowers'){
 for(let i=0;i<7;i++){const a=i*2.4,xx=Math.cos(a)*height*.20,zz=Math.sin(a)*height*.20,top=height*(.63+rand()*.24);rod(g,[0,ph,0],[xx,top,zz],.003,green);leaf(g,xx*.6,top*.7,zz*.6,height*.18,height*.12,a,1.4);for(let j=0;j<10;j++){const angle=j*2.4,petal=new T.Mesh(new T.SphereGeometry(1,8,5),m.standard(i%3?'#e8e4cc':'#e4d9d3',{roughness:.85}));petal.position.set(xx+Math.cos(angle)*height*.035,top+Math.floor(j/5)*height*.025,zz+Math.sin(angle)*height*.035);petal.scale.set(height*.045,height*.018,height*.032);petal.rotation.set(j*.3,angle,j*.1);g.add(petal);}}
 }else if(kind==='ficus'){
 rod(g,[0,ph,0],[.025,height*.92,0],height*.012,twig);
 for(let j=0;j<19;j++){
  const a=j*2.4+(rand()-.5),yy=ph+height*(.12+j*.033),reach=height*(.24+rand()*.13)*(1-j*.021);
  const points=[new T.Vector3(.01,yy,0),new T.Vector3(Math.cos(a)*reach*.55,yy+height*.075,Math.sin(a)*reach*.55),new T.Vector3(Math.cos(a)*reach,yy-height*.065,Math.sin(a)*reach)];
  const curve=new T.CatmullRomCurve3(points);const branch=new T.Mesh(new T.TubeGeometry(curve,8,height*.0025,5,false),twig);branch.name='arching-ficus-twig';g.add(branch);
  for(let shoot=0;shoot<3;shoot++){
   const origin=curve.getPoint(.36+shoot*.26),side=a+(shoot%2?-.7:.7),tip=origin.clone().add(new T.Vector3(Math.cos(side)*height*.12,-height*.08,Math.sin(side)*height*.12));rod(g,origin.toArray(),tip.toArray(),height*.0015,twig);
   for(let k=0;k<5;k++){const pos=origin.clone().lerp(tip,.1+k*.2);leaf(g,pos.x,pos.y,pos.z,height*(.065+rand()*.032),height*.049,side+k*2.6,1.65+rand()*.65);}
  }
 }
 }else if(kind==='dracaena'){
 rod(g,[0,ph,0],[0,height*.65,0],.009,twig);for(let i=0;i<28;i++){const a=i*2.4;leaf(g,0,height*(.5+rand()*.16),0,height*.44,height*.032,a,1+rand(),green);}
 }else{
 for(let j=0;j<9;j++){const a=j*2.4,reach=height*.19,top=height*(.65+rand()*.3),xx=Math.cos(a)*reach,zz=Math.sin(a)*reach;rod(g,[0,ph,0],[xx,top,zz],.006,green);
 const n=kind==='zz'?6:2;for(let k=0;k<n;k++){const t=kind==='zz'?.38+k*.1:.75+k*.18;leaf(g,xx*t,ph+(top-ph)*t,zz*t,height*(kind==='zz'?.15:.32),height*(kind==='zz'?.11:.23),a+k*2.5,.7+rand()*.6,kind==='variegated'?'variegated':green);}}
 }return g;}
 function flowerbeds(parent,beds){const petalGeometry=blade(false,false,6,4);petalGeometry.deleteAttribute('color');const dummy=new T.Object3D();const leaves=new T.InstancedMesh(dahliaGeometry,leafMaterial,10000),petals=new T.InstancedMesh(petalGeometry,m.standard('#ffffff',{side:T.DoubleSide,roughness:.73}),22000);leaves.name='serrated-dahlia-foliage';petals.name='layered-curved-dahlia-petals';leaves.castShadow=petals.castShadow=true;let li=0,pi=0;
 const palette=['#d9a33c','#e8c58d','#b86732','#923e35','#d6aa61'];
 for(const bx of beds)for(let j=0;j<105;j++){const x=bx+(rand()-.5)*9.4,z=11+(rand()-.5)*1.3,h=.45+rand()*.68;rod(parent,[x,.2,z],[x,h,z],.006,green);
 for(let k=0;k<13;k++){const a=k*2.4;dummy.position.set(x+Math.cos(a)*.07,.23+rand()*(h-.26),z+Math.sin(a)*.07);dummy.scale.set(.12,.2,.2);dummy.rotation.set(.7+rand(),a,rand()-.5);dummy.updateMatrix();leaves.setMatrixAt(li++,dummy.matrix);}
 if(j%2===0){cyl(parent,'autumn-dried-seedhead',x,h,z,.032,.025,.055,twig,10);continue;}
 const colour=new T.Color(palette[j%5]);for(let ring=0;ring<3;ring++)for(let k=0;k<14;k++){const a=k*Math.PI/7+ring*.2,r=.022+ring*.018;dummy.position.set(x+Math.sin(a)*r,h+ring*.006,z+Math.cos(a)*r);dummy.rotation.set(.9+ring*.22,a,0);dummy.scale.set(.047-ring*.005,.11-ring*.018,.10);dummy.updateMatrix();petals.setMatrixAt(pi,dummy.matrix);petals.setColorAt(pi++,colour);}
 cyl(parent,'dahlia-golden-centre',x,h+.025,z,.024,.025,.022,m.standard('#b9912c'),10);
 }leaves.count=li;petals.count=pi;parent.add(leaves,petals);}
 return {potted,flowerbeds,leafGeometry:blade(false,false,18,8),leafBump:bump};
}
