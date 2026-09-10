import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {solveArm,attachInModelSpace} from '../src/character-rig.js';
test('hand targets stay in front of torso through full turns, without stretching bones',()=>{
 for(const side of [-1,1])for(let angle=-Math.PI;angle<=Math.PI;angle+=Math.PI/8){
  const root=new T.Group(),a=new T.Bone(),b=new T.Bone(),c=new T.Bone();root.position.set(-.4,.025,-2.2);root.rotation.y=angle;root.add(a);a.position.set(side*.15,1.4,0);a.add(b);b.position.x=side*.23;b.add(c);c.position.x=side*.22;
  for(const target of [new T.Vector3(-1.2,1.2,-2.5),new T.Vector3(.1,1.9,-1.4),root.position.clone()]){
   const hand=solveArm(root,a,b,c,target,side),local=root.worldToLocal(hand.clone());assert.ok(local.z>0,'hand behind torso');assert.ok(side*local.x>0,'hand crossing body');
   assert.ok(Math.abs(a.getWorldPosition(new T.Vector3()).distanceTo(b.getWorldPosition(new T.Vector3()))-.23)<1e-6);
   assert.ok(Math.abs(b.getWorldPosition(new T.Vector3()).distanceTo(hand)-.22)<1e-6);
   assert.ok(a.quaternion.toArray().every(Number.isFinite));
  }
 }
});
test('antlers keep upright model orientation despite rotated head bind axes and follow head motion',()=>{
 const model=new T.Group(),head=new T.Bone(),crown=new T.Group();model.position.set(-.55,.025,-2.28);model.rotation.y=1.2;model.scale.setScalar(1.08);model.add(head);head.position.y=1.43;head.quaternion.set(.467958748,.5301081,.467958868,.530108).normalize();
 attachInModelSpace(model,head,crown,[0,1.6,.005]);model.updateMatrixWorld(true);
 const expected=model.localToWorld(new T.Vector3(0,1.6,.005));assert.ok(crown.getWorldPosition(new T.Vector3()).distanceTo(expected)<1e-6);
 assert.ok(crown.getWorldQuaternion(new T.Quaternion()).angleTo(model.getWorldQuaternion(new T.Quaternion()))<1e-6);
 const local=crown.position.clone();head.rotateY(.3);model.updateMatrixWorld(true);assert.ok(crown.position.distanceTo(local)<1e-9);assert.ok(crown.getWorldPosition(new T.Vector3()).distanceTo(expected)>.01);
});
