import test from 'node:test';
import assert from 'node:assert/strict';
import {INSTRUMENTS,createMusicAudio,getMusicPreset} from '../src/music-audio.js';

class AudioMock {
 static instances=[];
 constructor(){this.state='suspended';this.currentTime=0;this.sampleRate=8000;this.destination={};this.sources=[];AudioMock.instances.push(this);}
 node(){const param=()=>({value:0,setValueAtTime(value){this.value=value;},setTargetAtTime(value){this.value=value;},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){}});return {gain:param(),frequency:param(),delayTime:param(),connect(){},disconnect(){}};}
 source(){const n=this.node();n.start=()=>{n.started=true;};n.stop=time=>{n.stopTime=time;};this.sources.push(n);return n;}
 createGain(){return this.node();} createBiquadFilter(){return this.node();} createDelay(){return this.node();} createDynamicsCompressor(){return this.node();}
 createOscillator(){return this.source();} createBufferSource(){return this.source();} createBuffer(ch,length){assert.ok(length>0);return {getChannelData:()=>new Float32Array(length)};}
 async resume(){this.state='running';}
}
const settings={volume:.65,tone:.42,space:.18,decay:.48,tune:0};
test('seven instruments have playable mappings and three distinct preset names',()=>{assert.equal(INSTRUMENTS.length,7);for(const i of INSTRUMENTS){assert.equal(i.notes.length,i.labels.length);assert.ok(i.notes.length<=8);assert.ok(i.notes.every(n=>n>0));assert.equal(new Set(i.presets).size,3);}});
test('audio initializes on gesture and every instrument creates finite, stoppable voices',async()=>{globalThis.AudioContext=AudioMock;const audio=createMusicAudio();assert.equal(AudioMock.instances.length,0);await audio.ready();const ctx=AudioMock.instances.at(-1);for(const inst of INSTRUMENTS)for(let i=0;i<inst.notes.length;i++){const release=audio.play(inst,i,settings);assert.equal(typeof release,'function');release();}assert.ok(ctx.sources.length>40);assert.ok(ctx.sources.every(n=>n.started&&n.stopTime>=.12&&n.stopTime<=.72));audio.stop();delete globalThis.AudioContext;});
test('rapid playing caps polyphony and closing silences remaining sources',async()=>{globalThis.AudioContext=AudioMock;const audio=createMusicAudio();await audio.ready();const ctx=AudioMock.instances.at(-1);for(let i=0;i<40;i++)audio.play(INSTRUMENTS[5],0,settings);assert.equal(ctx.sources.filter(n=>n.stopTime===undefined).length,24*3);audio.stop();assert.ok(ctx.sources.every(n=>n.stopTime===.12));delete globalThis.AudioContext;});

test('held drones sustain until release and tuning changes affect an active oscillator',async()=>{globalThis.AudioContext=AudioMock;const audio=createMusicAudio();await audio.ready();const ctx=AudioMock.instances.at(-1);const release=audio.play(INSTRUMENTS[5],0,settings);assert.ok(ctx.sources.every(n=>n.stopTime===undefined));ctx.currentTime=20;audio.update({...settings,tune:12});assert.equal(ctx.sources[0].frequency.value,110);release();assert.ok(ctx.sources.every(n=>Math.abs(n.stopTime-(20.12+settings.decay*.6))<1e-8));delete globalThis.AudioContext;});
test('instrument presets are independent and callers cannot mutate the stored preset',()=>{const warm=getMusicPreset('ukulele');warm.volume=0;assert.notEqual(getMusicPreset('ukulele').volume,0);assert.notDeepEqual(getMusicPreset('ukulele'),getMusicPreset('frame'));for(const inst of INSTRUMENTS){const variants=inst.presets.map((_,i)=>getMusicPreset(inst.id,i));assert.equal(new Set(variants.map(v=>JSON.stringify(v))).size,3);for(const v of variants){assert.ok(v.volume>0&&v.volume<=1);assert.ok(v.decay>=0&&v.decay<=1);}}});
