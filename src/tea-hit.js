import {Box3,Vector3} from 'three';
// Volumes hug the two tea displays, independently of merged render geometry.
export const TEA_DISPLAYS=[
 new Box3(new Vector3(-1.755,1.17,-1.635),new Vector3(-.86,1.895,-1.185)),
 new Box3(new Vector3(1.39,.90,-3.515),new Vector3(1.64,1.16,-3.0))
];
export function hitTeaDisplay(raycaster,obstacles){
 const hits=TEA_DISPLAYS.map(b=>raycaster.ray.intersectBox(b,new Vector3())).filter(Boolean).map(p=>p.distanceTo(raycaster.ray.origin));
 if(!hits.length)return false;const distance=Math.min(...hits);if(distance>5)return false;
 return !raycaster.intersectObjects(obstacles,true).some(h=>h.distance<distance-.025&&!h.object.material?.transparent);
}
