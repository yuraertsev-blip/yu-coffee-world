import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
// Batch static geometry per named asset group; keep source mesh names as metadata.
export function batchStatic(root){
 root.updateMatrixWorld(true);const inverse=new T.Matrix4().copy(root.matrixWorld).invert();const batches=new Map();
 root.traverse(o=>{let dynamic=false;for(let p=o;p;p=p.parent)if(p.userData.dynamic)dynamic=true;if(dynamic||!o.isMesh||o.isInstancedMesh||Array.isArray(o.material)||o.material.transparent)return;const key=o.material.uuid+':'+o.castShadow+':'+o.receiveShadow;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(o);});
 for(const list of batches.values()){
  if(list.length<4)continue;
  const geos=list.map(o=>{const a=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();a.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));return a;});
  const combined=mergeGeometries(geos,false);if(!combined){geos.forEach(g=>g.dispose());continue;}
  const mesh=new T.Mesh(combined,list[0].material);mesh.name='batch-'+root.name;mesh.userData.sourceMeshes=list.map(o=>o.name);mesh.castShadow=list[0].castShadow;mesh.receiveShadow=list[0].receiveShadow;list.forEach(o=>{o.removeFromParent();o.geometry.dispose();});geos.forEach(g=>g.dispose());root.add(mesh);
 }
}
