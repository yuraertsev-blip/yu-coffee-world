import test from 'node:test';
import {existsSync} from 'node:fs';
import assert from 'node:assert/strict';
import * as T from 'three';
import {makeWorld,SITE} from '../src/scene.js';
import {canOccupy} from '../src/movement.js';
// Isolate image decoding from geometry/navigation checks.
const texturePaths=new Set();
T.TextureLoader.prototype.load=function(path){texturePaths.add(path);return new T.Texture();};
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){},fillText(){}})})};
const scene=new T.Scene();const world=makeWorld(scene);
const free=(x,z)=>canOccupy(x,z,world.colliders,SITE.bounds);
test('outside entrance connects to the central café aisle',()=>{
 for(let z=8.4;z>=4.15;z-=.04)assert.ok(free(1.2,z),`door blocked at ${z}`);
 for(let x=1.2;x>=0;x-=.04)assert.ok(free(x,4.15),`vestibule blocked at ${x}`);
 for(let z=4.15;z>=-.72;z-=.04)assert.ok(free(0,z),`aisle blocked at ${z}`);
});
test('walls, window, counter, sofas and flowerbeds stop walking',()=>{
 for(const [x,z] of [[-1.96,0],[1.96,0],[0,-4.65],[-.6,5],[0,-1.48],[-1.48,.95],[1.12,-.38],[1.12,2.9],[1,11],[30,20]])assert.equal(free(x,z),false,`${x},${z}`);
});
test('all camera destinations are free and models have valid geometry',()=>{
 assert.ok(free(SITE.inside.x,SITE.inside.z));assert.ok(free(SITE.door.x,7.7));
 scene.traverse(o=>{if(o.isMesh){const a=o.geometry.getAttribute('position').array;assert.ok(a.every(Number.isFinite),o.name);if(o.isInstancedMesh)assert.ok(o.count<=o.instanceMatrix.count);}});
});
test('scene retains named replacement groups and batches draw calls',()=>{
 assert.ok(world.groups['yu-coffee-interior']);assert.ok(world.groups['residential-building']);
 let count=0;scene.traverse(o=>{if(o.isMesh)count++;});assert.ok(count<450,`mesh count: ${count}`);console.log(`Batched mesh count: ${count}`);
});

test('every referenced photo texture exists in the local asset bundle',()=>{
 for(const path of texturePaths)assert.ok(existsSync(new URL('../public'+path,import.meta.url)),path);
});

test('photo layout keeps sink and espresso left, exactly two fridges right',()=>{
 const sink=scene.getObjectByName('left-sink'),machine=scene.getObjectByName('espresso-machine');
 assert.ok(sink&&machine);assert.ok(sink.getWorldPosition(new T.Vector3()).x<0);assert.ok(machine.getWorldPosition(new T.Vector3()).x<0);
 const fridges=[];scene.traverse(o=>{if(o.userData.kind==='refrigerator')fridges.push(o);});assert.equal(fridges.length,2);
 for(const f of fridges){const p=f.getWorldPosition(new T.Vector3());assert.ok(p.x>0);assert.equal(free(p.x,p.z),false);}
 assert.ok(free(.45,-3.05));assert.ok(free(-.35,-3.60));assert.ok(free(0,-2.35));assert.ok(free(0,-.45));
});

import {createCounterService} from '../src/counter-interaction.js';
test('counter objects survive batching; serving lifts lid, moves one muffin and releases barista',()=>{
 const root=new T.Group();root.position.set(-.14,.025,-2.2);scene.add(root);let override=null;
 const coffee={get state(){return {busy:false,...override};},setOverride(s){override=s;}};
 const characters={root,ready:true,collider:{},animate(){},face(){},reach(){}};
 const service=createCounterService(scene,characters,coffee),lid=service.cloche.position.clone(),m=service.muffins[0],start=m.position.clone();
 assert.equal(service.muffins.length,7);assert.equal(service.objects.filter(o=>o.userData.counterAction==='bell').length,2);
 assert.ok(m.getObjectByName('rounded-muffin-top'));assert.ok(m.getObjectByName('muffin-dark-berry'));
 service.request(m);assert.equal(service.busy,true);assert.equal(coffee.state.busy,true);
 for(let i=0;i<20;i++)service.update(.05);assert.ok(service.cloche.position.y>lid.y+.2);
 service.request(m);for(let i=0;i<100;i++)service.update(.05);
 assert.equal(service.servedCount,1);assert.equal(service.busy,false);assert.equal(coffee.state.busy,false);assert.ok(m.position.distanceTo(start)>.2);assert.ok(service.cloche.position.distanceTo(lid)<1e-8);
 override={busy:true};service.request(service.muffins[1]);assert.equal(service.busy,false);override=null;
});
