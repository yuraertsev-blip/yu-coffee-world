import * as T from 'three';

export function createWallDarbuka(scene){
 const root=new T.Group();root.name='wall-darbuka';root.position.set(1.64,2.1,2.65);root.rotation.z=-.18;scene.add(root);
 const bronze=new T.MeshStandardMaterial({color:'#ae7546',metalness:.7,roughness:.32}),skin=new T.MeshStandardMaterial({color:'#ead7ae',roughness:.9}),dark=new T.MeshStandardMaterial({color:'#343b37',metalness:.45,roughness:.5});
 const body=new T.Mesh(new T.LatheGeometry([[.15,-.36],[.17,-.32],[.10,-.2],[.095,-.08],[.15,.06],[.22,.16],[.235,.23]].map(p=>new T.Vector2(...p)),48),bronze);root.add(body);
 const head=new T.Mesh(new T.CylinderGeometry(.225,.225,.018,48),skin);head.position.y=.23;root.add(head);
 for(const y of [-.34,.19,.24]){const ring=new T.Mesh(new T.TorusGeometry(y<0?.16:.236,.014,8,48),dark);ring.rotation.x=Math.PI/2;ring.position.y=y;root.add(ring);}
 for(let i=0;i<8;i++){const bolt=new T.Mesh(new T.SphereGeometry(.018,8,6),bronze);bolt.position.set(Math.cos(i*Math.PI/4)*.24,.19,Math.sin(i*Math.PI/4)*.24);root.add(bolt);}
 const strap=new T.Mesh(new T.TorusGeometry(.16,.013,8,32,Math.PI),dark);strap.rotation.y=Math.PI/2;strap.position.set(.15,.36,0);root.add(strap);root.traverse(o=>{if(o.isMesh)o.castShadow=true;});return root;
}

export function hitWallDarbuka(ray,drum,obstacles){
 const hit=ray.intersectObject(drum,true)[0];
 if(!hit||hit.distance>5)return false;
 return !ray.intersectObjects(obstacles,true).some(h=>h.distance<hit.distance-.02&&!h.object.material?.transparent);
}
