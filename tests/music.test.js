import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {INSTRUMENTS,createMusicAudio,getMusicPreset} from '../src/music-audio.js';
import {SAMPLE_BANKS} from '../src/music-samples.js';

class AudioMock {
 constructor(){this.state='suspended';this.currentTime=0;this.sampleRate=8000;this.destination={};this.sources=[];this.gains=[];}
 node(){const param=()=>({value:0,setValueAtTime(v){this.value=v;},setTargetAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;},cancelScheduledValues(){},cancelAndHoldAtTime(){}});return {gain:param(),frequency:param(),Q:param(),pan:param(),playbackRate:param(),delayTime:param(),threshold:param(),knee:param(),ratio:param(),attack:param(),release:param(),connect(){},disconnect(){this.disconnected=true;}};}
 createGain(){const n=this.node();this.gains.push(n);return n;}createBiquadFilter(){return this.node();}createDelay(){return this.node();}createDynamicsCompressor(){return this.node();}createConvolver(){return this.node();}createStereoPanner(){return this.node();}
 createBufferSource(){const n=this.node();n.start=()=>{n.started=true;};n.stop=time=>{assert.ok(n.started,'AudioBufferSource must start before stop is scheduled');n.stopTime=time;};this.sources.push(n);return n;}
 createBuffer(ch,length,sr){return {duration:length/sr,getChannelData:()=>new Float32Array(length)};}
 async decodeAudioData(data){const v=new DataView(data);return {duration:v.getUint32(40,true)/(v.getUint32(24,true)*v.getUint16(22,true)*2)};}
 async resume(){this.state='running';}
}
const settings=getMusicPreset('darbuka');
function setup(fetchOverride){const ctx=new AudioMock(),requests=[];const fetchAudio=async url=>{requests.push(url);if(fetchOverride)return fetchOverride(url);const data=readFileSync(new URL('../public'+url,import.meta.url));return {ok:true,arrayBuffer:async()=>data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength)};};return {ctx,requests,audio:createMusicAudio({contextFactory:()=>ctx,fetchAudio})};}

test('every playable pad has licensed, non-silent PCM recordings',()=>{
 const credits=JSON.parse(readFileSync(new URL('../public/audio/music/credits.json',import.meta.url)));assert.equal(INSTRUMENTS.length,7);
 for(const inst of INSTRUMENTS){const bank=SAMPLE_BANKS[inst.id];assert.equal(bank.pads.length,inst.notes.length);assert.equal(inst.labels.length,inst.notes.length);assert.equal(new Set(inst.presets).size,3);
  for(const pad of bank.pads){assert.ok(pad.length);for(const sample of pad){const credit=credits.files.find(c=>c.file===sample.file);assert.ok(credit);assert.ok(['CC0-1.0','CC-BY-4.0'].includes(credit.license));if(['pluck','bass','metal','drone'].includes(inst.type))assert.ok(sample.rootHz>20);}}
 }
 for(const credit of credits.files){const bytes=readFileSync(new URL('../public/audio/music/'+credit.file,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),credit.sha256);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.readUInt16LE(34),16);const pcm=new Int16Array(bytes.buffer,bytes.byteOffset+44,(bytes.length-44)/2);assert.ok(pcm.some(n=>Math.abs(n)>1000));assert.ok(credit.duration>.15);}
});
test('loads only the selected instrument, shares concurrent loads, and caches decoded audio',async()=>{const {audio,requests}=setup();assert.equal(requests.length,0);await Promise.all([audio.ready(INSTRUMENTS[0]),audio.ready(INSTRUMENTS[0])]);const count=new Set(SAMPLE_BANKS.ukulele.pads.flat().map(s=>s.file)).size;assert.equal(requests.length,count);await audio.ready(INSTRUMENTS[0]);assert.equal(requests.length,count);assert.equal(audio.isReady(INSTRUMENTS[0]),true);assert.equal(audio.isReady(INSTRUMENTS[1]),false);});
test('failed sample downloads can be retried',async()=>{let fail=true;const {audio}=setup(async()=>{if(fail)throw Error('network');return {ok:true,arrayBuffer:async()=>{const data=new ArrayBuffer(44),v=new DataView(data);v.setUint32(40,176400,true);v.setUint32(24,44100,true);v.setUint16(22,1,true);return data;}};});await assert.rejects(audio.ready(INSTRUMENTS[0]),/network/);fail=false;await audio.ready(INSTRUMENTS[0]);assert.equal(audio.isReady(INSTRUMENTS[0]),true);});
test('all seven instruments play recorded buffers without oscillators and stop on exit',async()=>{const {audio,ctx}=setup();for(const inst of INSTRUMENTS){await audio.ready(inst);for(let n=0;n<inst.notes.length;n++){const release=audio.play(inst,n,getMusicPreset(inst.id));assert.equal(typeof release,'function');release();}}assert.equal(ctx.sources.length,38);assert.ok(ctx.sources.every(s=>s.started&&s.buffer&&Number.isFinite(s.stopTime)));audio.stop();assert.equal(ctx.gains[0].gain.value,0);});
test('percussion alternates recorded takes and switches velocity layers',async()=>{const {audio,ctx}=setup();await audio.ready('darbuka');const inst=INSTRUMENTS[1];audio.play(inst,0,settings,.8);audio.play(inst,0,settings,.8);audio.play(inst,0,settings,.4);assert.notEqual(ctx.sources[0].buffer,ctx.sources[1].buffer);assert.notEqual(ctx.sources[0].buffer,ctx.sources[2].buffer);});
test('drones loop continuously, change pitch live and release; polyphony stays bounded',async()=>{const {audio,ctx}=setup();const inst=INSTRUMENTS[5],s=getMusicPreset(inst.id);await audio.ready(inst);const release=audio.play(inst,0,s);const first=ctx.sources[0],rate=first.playbackRate.value;assert.equal(first.loop,true);assert.equal(first.stopTime,undefined);ctx.currentTime=20;audio.update({...s,tune:12});assert.equal(first.playbackRate.value,rate*2);release();assert.ok(first.stopTime>20&&first.stopTime<21);for(let n=0;n<50;n++)audio.play(inst,0,s);assert.equal(ctx.sources.filter(s=>s.stopTime===undefined).length,32);audio.stop();assert.ok(ctx.sources.every(s=>Number.isFinite(s.stopTime)));});
test('presets preserve independent copies and distinct sound settings',()=>{const preset=getMusicPreset('ukulele');preset.volume=0;assert.ok(getMusicPreset('ukulele').volume>0);for(const inst of INSTRUMENTS)assert.equal(new Set(inst.presets.map((_,i)=>JSON.stringify(getMusicPreset(inst.id,i)))).size,3);});
