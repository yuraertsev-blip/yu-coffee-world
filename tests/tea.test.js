import test from 'node:test';
import assert from 'node:assert/strict';
import {TEAS,findTeas,teaRecipe} from '../src/tea-catalog.js';
import {hitTeaDisplay} from '../src/tea-hit.js';
import {Raycaster,Vector3,Mesh,BoxGeometry,MeshBasicMaterial} from 'three';
test('tea search combines categories, Russian names and aromas; recipe scales without changing time',()=>{
 assert.equal(findTeas('  ПУЭР  ','green').length,0);assert.ok(findTeas('зеленый').length>=2);
 const tea=TEAS.find(t=>t.id==='purple-buds');assert.equal(teaRecipe(tea).temperature,'85–90 °C');assert.equal(teaRecipe(tea,500).grams,teaRecipe(tea).grams*2);assert.equal(teaRecipe(tea,500).seconds,teaRecipe(tea).seconds);
 assert.equal(new Set(TEAS.map(t=>t.id)).size,TEAS.length);for(const t of TEAS){const [x,y,w,h]=t.photo;assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=1824&&y+h<=1368);}
});
test('tea displays are clickable nearby but walls and distance prevent opening',()=>{
 const ray=new Raycaster(new Vector3(-1.3,1.55,0),new Vector3(0,0,-1));assert.equal(hitTeaDisplay(ray,[]),true);
 const wall=new Mesh(new BoxGeometry(3,3,.1),new MeshBasicMaterial());wall.position.set(-1.3,1.55,-.5);wall.updateMatrixWorld();assert.equal(hitTeaDisplay(ray,[wall]),false);
 ray.ray.origin.z=6;assert.equal(hitTeaDisplay(ray,[]),false);
 ray.ray.origin.set(0,1.04,-3.25);ray.ray.direction.set(1,0,0);assert.equal(hitTeaDisplay(ray,[]),true);
});
