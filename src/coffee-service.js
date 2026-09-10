import * as T from 'three';
import {createLatteDeck,drawLatteArt} from './latte-art.js';
import {createWorkTimeline} from './barista-work.js';
export function createCoffeeService(scene,characters){
 const timeline=createWorkTimeline(),group=new T.Group();group.name='animated-coffee-service';scene.add(group);
 const porcelain=new T.MeshStandardMaterial({color:'#f4e9d3',roughness:.24}),metal=new T.MeshStandardMaterial({color:'#cbd4d6',metalness:.85,roughness:.24}),coffee=new T.MeshStandardMaterial({color:'#965326',roughness:.3}),foam=new T.MeshStandardMaterial({color:'#fff4d9',roughness:.65});
 function mesh(parent,geo,mat,x=0,y=0,z=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;}
 const cup=new T.Group();cup.name='fresh-cappuccino';group.add(cup);cup.visible=false;
 mesh(cup,new T.CylinderGeometry(.135,.115,.013,64),porcelain,0,.007);
 // Lathed open ceramic bowl with a rounded lip and a real handle.
 const points=[[.04,.02],[.055,.022],[.072,.05],[.085,.10],[.09,.14],[.087,.145],[.081,.14],[.077,.10],[.065,.055],[.045,.04]].map(p=>new T.Vector2(...p));
 mesh(cup,new T.LatheGeometry(points,64),porcelain);
 const handle=mesh(cup,new T.TorusGeometry(.036,.010,12,32),porcelain,.103,.089);handle.scale.x=.9;
 const surface=mesh(cup,new T.CircleGeometry(.080,64),coffee,0,.132);surface.rotation.x=-Math.PI/2;
 const art=new T.Group();art.rotation.x=-Math.PI/2;art.position.y=.133;cup.add(art);
 const deck=createLatteDeck();let design=null,artCanvas=null,artTexture=null;
 if(typeof document!=='undefined'){artCanvas=document.createElement('canvas');artCanvas.width=artCanvas.height=1024;artTexture=new T.CanvasTexture(artCanvas);artTexture.colorSpace=T.SRGBColorSpace;artTexture.anisotropy=8;}
 const artMaterial=new T.MeshStandardMaterial({color:'#fff3d9',map:artTexture,transparent:true,depthWrite:false,roughness:.8,polygonOffset:true,polygonOffsetFactor:-1});
 mesh(art,new T.CircleGeometry(.079,96),artMaterial,0,0,.001);
 const pitcher=new T.Group();pitcher.name='working-milk-pitcher';group.add(pitcher);
 mesh(pitcher,new T.CylinderGeometry(.045,.055,.13,32),metal,0,.065);
 const ph=mesh(pitcher,new T.TorusGeometry(.03,.006,8,20),metal,.065,.07);ph.scale.x=.8;
 mesh(pitcher,new T.ConeGeometry(.027,.055,3),metal,-.045,.127).rotation.z=.6;
 const stream=mesh(group,new T.CylinderGeometry(.003,.003,.18,8),foam);stream.visible=false;
 const espresso=mesh(group,new T.CylinderGeometry(.0025,.0025,.11,8),new T.MeshBasicMaterial({color:'#54250e'}),-1.16,1.34,-2.25);espresso.visible=false;
 const cloth=mesh(group,new T.BoxGeometry(.14,.009,.09),new T.MeshStandardMaterial({color:'#b9c5b1'}));
 const steam=[];for(let i=0;i<8;i++){const s=mesh(group,new T.SphereGeometry(.012,8,6),new T.MeshBasicMaterial({color:'#fff6e9',transparent:true,opacity:.18,depthWrite:false}));steam.push(s);}
 let time=0,completed=0;const served=new T.Vector3(.05,1.15,-1.29),machine=new T.Vector3(-1.16,1.175,-2.25),pourPosition=new T.Vector3(-.12,1.20,-1.90);
 function update(dt,camera){
  time+=dt;const s=timeline.update(dt),root=characters.root;
  const dx=s.target[0]-root.position.x,dz=s.target[1]-root.position.z,distance=Math.hypot(dx,dz),step=Math.min(distance,dt*.65);
  // Keep personal space if the visitor enters the work aisle.
  const nx=root.position.x+(dx/(distance||1))*step,nz=root.position.z+(dz/(distance||1))*step;
  if(Math.hypot(camera.position.x-nx,camera.position.z-nz)>.48){root.position.x=nx;root.position.z=nz;}
  root.position.y=.025+(distance>.05?Math.abs(Math.sin(time*8))*.012:Math.sin(time*2)*.003);
  characters.animate?.(time,distance>.05,s.id);
  const facing=distance>.05?Math.atan2(dx,dz):['espresso','steam','polish','rinse'].includes(s.id)?-Math.PI/2:s.id==='milk'?Math.PI/2:0;
  characters.face(facing,dt);
  const c=characters.collider;c.minX=root.position.x-.18;c.maxX=root.position.x+.18;c.minZ=root.position.z-.16;c.maxZ=root.position.z+.16;
  pitcher.visible=s.id==='steam'||s.id==='pour'||s.id==='rinse'||s.id==='milk'||s.id==='polish';
  cloth.visible=s.id==='wipe';cloth.position.set(root.position.x+Math.sin(time*6)*.12,1.159,-1.8);
  pitcher.position.set(root.position.x-.25,1.12+Math.sin(time*4)*.014,root.position.z+.19);pitcher.rotation.z=Math.sin(time*3)*.06;
  stream.visible=s.busy&&s.id==='pour';espresso.visible=s.busy&&s.id==='espresso';
  if(s.busy){cup.visible=s.id!=='approach';if(s.id==='espresso'||s.id==='steam')cup.position.copy(machine);
   if(s.id==='pour'){cup.position.copy(machine).lerp(pourPosition,Math.min(1,s.progress*4));pitcher.position.copy(cup.position).add(new T.Vector3(.12,.21,.015));pitcher.rotation.z=.8+Math.sin(time*5)*.05;stream.position.copy(cup.position).add(new T.Vector3(.025+Math.sin(time*8)*.013,.205,0));stream.scale.y=.65;}
   if(s.id==='serve')cup.position.copy(pourPosition).lerp(served,s.progress*s.progress*(3-2*s.progress));
   art.visible=s.id==='serve'||s.id==='pour';const growth=s.id==='pour'?Math.max(.01,s.progress):1;art.scale.setScalar(growth);
   surface.material.color.set(s.id==='espresso'?'#763d1c':'#965326');
  }
  if(s.completed!==completed){completed=s.completed;cup.visible=true;cup.position.copy(served);art.visible=true;art.scale.setScalar(1);}
  steam.forEach((p,i)=>{p.visible=s.id==='steam'||(!s.busy&&completed>0);const t=(time*.6+i/8)%1;const base=s.id==='steam'?pitcher.position:cup.position;p.position.copy(base).add(new T.Vector3(Math.sin(time+i)*.017,.15+t*.22,Math.cos(time*.7+i)*.017));p.scale.setScalar(.5+t*1.5);p.material.opacity=(1-t)*.15;});
  // Articulated shoulders and elbows track the actual tool positions.
  if(distance<.15){
   if(cloth.visible){cloth.position.copy(characters.reach(1,cloth.position.clone()));cloth.position.y=1.159;}
   if(pitcher.visible){const hand=characters.reach(1,pitcher.position.clone().add(new T.Vector3(.06,.06,0)));pitcher.position.copy(hand).add(new T.Vector3(-.06,-.06,0));}
   if(s.id==='pour'||s.id==='serve'){characters.reach(-1,cup.position.clone().add(new T.Vector3(-.08,.08,0)));}
   if(s.id==='espresso'||s.id==='polish')characters.reach(-1,new T.Vector3(-1.14,1.36,-2.25));
  }
  if(stream.visible){const start=pitcher.localToWorld(new T.Vector3(-.055,.13,0)),end=cup.position.clone().add(new T.Vector3(Math.sin(time*8)*.016,.133,0)),delta=end.clone().sub(start);stream.position.copy(start).add(end).multiplyScalar(.5);stream.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.clone().normalize());stream.scale.y=delta.length()/.18;}
  return s;
 }
 return {update,order(){if(!timeline.order())return false;design=deck.next();if(artCanvas){drawLatteArt(artCanvas.getContext('2d'),design.id);artTexture.needsUpdate=true;}return true;},get state(){return {...timeline.state,design};},cup};
}
