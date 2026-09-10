import * as T from 'three';
// Targets and elbow poles are expressed relative to the torso, never world axes.
export function constrainHandTarget(root,shoulder,target,side){
 root.updateWorldMatrix(true,false);
 const p=root.worldToLocal(target.clone()),s=root.worldToLocal(shoulder.clone());
 p.z=Math.max(p.z,s.z+.09); // Do not reach through the chest toward a station behind us.
 p.x=side>0?Math.max(p.x,.045):Math.min(p.x,-.045);
 p.y=T.MathUtils.clamp(p.y,s.y-.43,s.y+.35);
 return root.localToWorld(p);
}
export function solveArm(root,a,b,c,target,side){
 root.updateMatrixWorld(true);
 const ap=a.getWorldPosition(new T.Vector3()),bp=b.getWorldPosition(new T.Vector3()),cp=c.getWorldPosition(new T.Vector3());
 const l1=ap.distanceTo(bp),l2=bp.distanceTo(cp);
 const safe=constrainHandTarget(root,ap,target,side),v=safe.sub(ap),d=T.MathUtils.clamp(v.length(),Math.abs(l1-l2)+.035,l1+l2-.025),direction=v.normalize();
 const bend=new T.Vector3(side*.8,-.55,.35).applyQuaternion(root.getWorldQuaternion(new T.Quaternion()));
 bend.addScaledVector(direction,-bend.dot(direction));
 if(bend.lengthSq()<1e-8)bend.set(0,-1,0).cross(direction);
 bend.normalize();
 const along=(l1*l1-l2*l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-along*along)),elbow=ap.clone().addScaledVector(direction,along).addScaledVector(bend,height);
 function aim(bone,child,end){const local=end.clone().sub(bone.getWorldPosition(new T.Vector3())).normalize().applyQuaternion(bone.parent.getWorldQuaternion(new T.Quaternion()).invert());bone.quaternion.setFromUnitVectors(child.position.clone().normalize(),local);bone.updateWorldMatrix(false,true);}
 aim(a,b,elbow);aim(b,c,ap.clone().addScaledVector(direction,d));
 return c.getWorldPosition(new T.Vector3());
}
// Preserve the reference orientation when attaching to a bone whose bind rotation
// is not identity (the sample VRM head has rotated local axes).
export function attachInModelSpace(model,bone,object,position){
 model.updateWorldMatrix(true,true);
 object.position.copy(bone.worldToLocal(model.localToWorld(new T.Vector3(...position))));
 object.quaternion.copy(bone.getWorldQuaternion(new T.Quaternion()).invert()).multiply(model.getWorldQuaternion(new T.Quaternion()));
 bone.add(object);
 return object;
}
