import test from 'node:test';
import assert from 'node:assert/strict';
import {createMusicGestures} from '../src/music-gestures.js';
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function setup(sustained){const notes=[],voices=[],lit=new Set();const gestures=createMusicGestures({sustained,onHighlight:(i,on)=>on?lit.add(i):lit.delete(i),start(i){notes.push(i);const voice={notes:[i],stopped:0};const release=()=>voice.stopped++;release.glide=i=>voice.notes.push(i);voices.push(voice);return release;}});return {gestures,notes,voices,lit};}
test('two fingers sustain independent voices, slide across gaps, and release independently',async()=>{
 const {gestures:g,notes,voices,lit}=setup(true);g.begin(1,0);g.begin(2,3);await flush();g.enter(1,1);g.enter(1,null);g.enter(1,2);g.enter(2,4);assert.deepEqual(notes,[0,3]);assert.deepEqual(voices.map(v=>v.notes),[[0,1,2],[3,4]]);assert.deepEqual([...lit],[2,4]);g.end(1);assert.deepEqual(voices.map(v=>v.stopped),[1,0]);g.clear();assert.deepEqual(voices.map(v=>v.stopped),[1,1]);assert.equal(lit.size,0);
});
test('handpan sweeps retrigger on entry and reentry; moving/ending one finger leaves the other sounding',async()=>{
 const {gestures:g,notes,voices,lit}=setup(false);g.begin(1,0);g.begin(2,0);g.enter(1,1);g.enter(1,1);g.enter(1,2);g.enter(1,null);g.enter(1,2);await flush();assert.deepEqual(notes,[0,0,1,2,2]);g.end(1);assert.ok(lit.has(0));assert.ok(!lit.has(2));assert.ok(voices.every(v=>v.stopped===0));g.end(2);assert.equal(lit.size,0);
});
test('late audio readiness follows the latest note, and cancellation never leaves a stuck voice',async()=>{
 let resolve;const moved=[];let stopped=0;const g=createMusicGestures({sustained:true,start:()=>new Promise(r=>resolve=r)});const release=()=>stopped++;release.glide=i=>moved.push(i);
 g.begin(5,0);g.enter(5,1);g.enter(5,3);resolve(release);await flush();assert.deepEqual(moved,[3]);g.end(5);assert.equal(stopped,1);
 g.begin(5,0);g.clear();resolve(release);await flush();assert.equal(stopped,2);
});
