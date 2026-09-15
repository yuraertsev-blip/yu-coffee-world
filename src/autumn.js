import * as T from 'three';
export const AUTUMN_LIGHT={day:{sky:'#c8b9a5',ambient:.88,sun:1.65,lamp:5.4},night:{sky:'#343542',ambient:.32,sun:.10,lamp:6.2}};
export function createCandle(scene){
 const root=new T.Group();root.name='candle-in-round-glass-bowl';root.position.set(1.12,.709,1.25);scene.add(root);
 const glass=new T.MeshPhysicalMaterial({color:'#fff1d7',roughness:.07,metalness:0,transparent:true,opacity:.32,side:T.DoubleSide,depthWrite:false,clearcoat:1,ior:1.46});
 const profile=[[.052,0],[.076,.009],[.097,.036],[.103,.065],[.095,.098],[.082,.12],[.079,.12],[.091,.097],[.099,.065],[.092,.038],[.073,.014],[.052,.009]].map(p=>new T.Vector2(...p));
 const bowl=new T.Mesh(new T.LatheGeometry(profile,64),glass);bowl.name='round-glass-bowl';root.add(bowl);
 const rim=new T.Mesh(new T.TorusGeometry(.0805,.0022,10,64),glass);rim.rotation.x=Math.PI/2;rim.position.y=.12;root.add(rim);
 const wax=new T.Mesh(new T.CylinderGeometry(.051,.054,.043,40),new T.MeshStandardMaterial({color:'#eee0bd',roughness:.85}));wax.position.y=.034;wax.name='ivory-candle-wax';root.add(wax);
 const pool=new T.Mesh(new T.CircleGeometry(.033,40),new T.MeshStandardMaterial({color:'#dab976',roughness:.2}));pool.rotation.x=-Math.PI/2;pool.position.y=.056;root.add(pool);
 const wick=new T.Mesh(new T.CylinderGeometry(.0014,.0016,.016,8),new T.MeshStandardMaterial({color:'#332119'}));wick.position.y=.063;root.add(wick);
 const flame=new T.Mesh(new T.SphereGeometry(1,24,20),new T.MeshBasicMaterial({color:'#ffb341',transparent:true,opacity:.88,toneMapped:false,depthWrite:false}));flame.name='living-candle-flame';flame.scale.set(.006,.022,.006);flame.position.y=.085;root.add(flame);
 const core=new T.Mesh(new T.SphereGeometry(1,16,12),new T.MeshBasicMaterial({color:'#fff4c8',toneMapped:false}));core.scale.set(.003,.013,.003);core.position.set(0,.078,.003);root.add(core);
 const light=new T.PointLight('#ffb85c',.34,1.7,2);light.position.y=.10;root.add(light);let time=0;
 return {root,update(dt){time+=dt;const flutter=Math.sin(time*7.3)*.06+Math.sin(time*17.1)*.025;flame.scale.y=.022*(1+flutter);flame.position.x=Math.sin(time*4.3)*.002;flame.rotation.z=Math.sin(time*5.7)*.10;light.intensity=.34*(1+flutter);}};
}
export function addAutumnLeaves(parent,geometry,bumpMap){
 const geo=geometry.clone();geo.deleteAttribute('color');const mat=new T.MeshStandardMaterial({color:'#ffffff',roughness:.86,side:T.DoubleSide,bumpMap,bumpScale:.0005});
 const leaves=new T.InstancedMesh(geo,mat,1500);leaves.name='fallen-autumn-leaves';leaves.receiveShadow=true;let seed=93;const random=()=>((seed=seed*16807%2147483647)/2147483647),dummy=new T.Object3D();
 const palette=['#b95024','#d68b28','#d7ad43','#925633','#b32f24','#ac7e35'];
 for(let i=0;i<1500;i++){const z=i<420?5.8+random()*4.2:12+random()*12;dummy.position.set((random()-.5)*60,.002+random()*.012,z);dummy.rotation.set(-Math.PI/2+(random()-.5)*.17,0,random()*Math.PI*2);const size=.09+random()*.16;dummy.scale.set(size*.65,size,size);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);leaves.setColorAt(i,new T.Color(palette[i%palette.length]));}parent.add(leaves);
}
