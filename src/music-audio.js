import {assetUrl} from './asset-url.js';
import {UKULELE_CHORDS} from './music-instruments.js';
import {SAMPLE_BANKS} from './music-samples.js';
export {INSTRUMENTS,getMusicPreset} from './music-instruments.js';

// All instrument voices are recordings. Only the room impulse is generated.
export function createMusicAudio({fetchAudio=globalThis.fetch?.bind(globalThis),contextFactory}={}){
 let ctx,master,tone,wet,room,impulse,compressor;
 const buffers=new Map(),pending=new Map(),banks=new Map(),voices=new Set(),roundRobin=new Map();
 function init(){
  if(ctx)return;
  const AC=globalThis.AudioContext||globalThis.webkitAudioContext;
  if(!AC&&!contextFactory)throw Error('Этот браузер не поддерживает аудио.');
  ctx=contextFactory?contextFactory():new AC({latencyHint:'interactive'});
  const highpass=ctx.createBiquadFilter();highpass.type='highpass';highpass.frequency.value=27;highpass.Q.value=.5;
  tone=ctx.createBiquadFilter();tone.type='highshelf';tone.frequency.value=2800;tone.connect(highpass);
  master=ctx.createGain();master.gain.value=0;highpass.connect(master);
  const predelay=ctx.createDelay(.1);predelay.delayTime.value=.018;highpass.connect(predelay);
  room=ctx.createConvolver();impulse=ctx.createBuffer(2,Math.round(ctx.sampleRate*1.8),ctx.sampleRate);
  let seed=841;for(let c=0;c<2;c++){const data=impulse.getChannelData(c);for(let i=0;i<data.length;i++){seed=(seed*16807)%2147483647;data[i]=(seed/1073741823.5-1)*Math.exp(-i/ctx.sampleRate*4.5);}}
  room.buffer=impulse;predelay.connect(room);const damping=ctx.createBiquadFilter();damping.type='lowpass';damping.frequency.value=6200;room.connect(damping);
  wet=ctx.createGain();wet.gain.value=0;damping.connect(wet);wet.connect(master);
  compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-8;compressor.knee.value=8;compressor.ratio.value=12;compressor.attack.value=.003;compressor.release.value=.16;
  master.connect(compressor);compressor.connect(ctx.destination);
 }
 async function load(file){
  if(buffers.has(file))return buffers.get(file);
  if(pending.has(file))return pending.get(file);
  const promise=(async()=>{const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),25000);
   try{const response=await fetchAudio(assetUrl('audio/music/'+file),{signal:abort.signal});if(!response.ok)throw Error('Не удалось загрузить запись. Проверь соединение и повтори.');const buffer=await ctx.decodeAudioData(await response.arrayBuffer());buffers.set(file,buffer);return buffer;}
   catch(error){if(error.name==='AbortError')throw Error('Загрузка заняла слишком много времени. Попробуй ещё раз.');throw error;}
   finally{clearTimeout(timer);pending.delete(file);}
  })();pending.set(file,promise);return promise;
 }
 async function ready(inst){
  init();if(ctx.state!=='running')await ctx.resume();if(!inst)return;
  const id=typeof inst==='string'?inst:inst.id,bank=SAMPLE_BANKS[id];if(!bank)throw Error('Неизвестный инструмент.');
  if(!banks.has(id))banks.set(id,Promise.all([...new Set(bank.pads.flat().map(s=>s.file))].map(load)).catch(e=>{banks.delete(id);throw e;}));
  await banks.get(id);
 }
 function update(settings){
  if(!ctx)return;const t=ctx.currentTime;
  master.gain.setTargetAtTime(settings.volume*.8,t,.012);
  tone.gain.setTargetAtTime((settings.tone-.5)*18,t,.025);
  wet.gain.setTargetAtTime(settings.space*.55,t,.025);
  for(const voice of voices)voice.retune?.(settings.tune);
 }
 function stop(){
  if(!ctx)return;for(const voice of [...voices])voice.release(true);
  master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(0,ctx.currentTime,.006);
  // Clear the previous room tail before another instrument can open the master.
  room.buffer=null;room.buffer=impulse;
 }
 function play(inst,index,settings,velocity=.8){
  if(!ctx||ctx.state!=='running')return ()=>{};
  const start=ctx.currentTime+.006;
  if(inst.id==='ukulele'&&settings.mode==='chords'){
   const chord=UKULELE_CHORDS[index];if(!chord)throw Error('Неизвестный аккорд.');
   const releases=chord.notes.map((hz,i)=>{
    const pad=SAMPLE_BANKS.ukulele.pads.reduce((best,p,j,all)=>Math.abs(Math.log2(p[0].rootHz/hz))<Math.abs(Math.log2(all[best][0].rootHz/hz))?j:best,0);
    return playNote(inst,pad,settings,velocity*.52,start+i*.018,hz,(i-1.5)*.07);
   });return ()=>releases.forEach(release=>release());
  }
  if(inst.id==='darbuka'&&index>=4&&index<=5){
   const count=index===4?4:8;
   const releases=Array.from({length:count},(_,i)=>playNote(inst,1+i%2,settings,velocity*(i===count-1?.8:i===0?.64:.48),start+i*.038));
   return ()=>releases.forEach(release=>release());
  }
  return playNote(inst,index,settings,velocity,start);
 }
 function playNote(inst,index,settings,velocity=.8,at=ctx?.currentTime,targetHz=inst.notes[index],panPosition){
  if(!ctx||ctx.state!=='running')return ()=>{};
  const bank=SAMPLE_BANKS[inst.id],candidates=bank?.pads[index];if(!candidates)throw Error('Неизвестная нота.');
  let choices=candidates;
  if(inst.type==='drone')choices=candidates.filter(s=>s.variant===(settings.voice??0));
  else if(candidates.some(s=>s.layer))choices=candidates.filter(s=>s.layer===(velocity<.65?'soft':'hard'));
  if(!choices.length)choices=candidates;
  const key=inst.id+':'+index+':'+(choices[0].layer||settings.voice||0),turn=roundRobin.get(key)||0;roundRobin.set(key,turn+1);
  const sample=choices[turn%choices.length],buffer=buffers.get(sample.file);if(!buffer)throw Error('Записи ещё загружаются.');
  while(voices.size>=32)voices.values().next().value.release(true);
  update(settings);
  const t=at,source=ctx.createBufferSource(),envelope=ctx.createGain(),pan=ctx.createStereoPanner();source.buffer=buffer;
  const pitched=['pluck','bass','metal','drone'].includes(inst.type),baseRate=(pitched?targetHz/sample.rootHz:1)*(sample.rate||1),rate=baseRate*2**(settings.tune/12);
  source.playbackRate.setValueAtTime(rate,t);source.loop=inst.type==='drone';
  if(source.loop){source.loopStart=0;source.loopEnd=buffer.duration;}
  const human=[1,.975,1.012,.99][turn%4],level=Math.max(.08,Math.min(1,velocity))*.78*human*(sample.gain||1);
  envelope.gain.setValueAtTime(0,t);envelope.gain.linearRampToValueAtTime(level,t+(source.loop?.035:.002));
  pan.pan.value=panPosition??(inst.type==='kit'?[0,-.1,-.3,.28,.2,-.18][index]:inst.type==='drone'?0:(index-(inst.notes.length-1)/2)*.035);
  source.connect(envelope);envelope.connect(pan);pan.connect(tone);
  let released=false;
  const voice={release(immediate=false){
   if(released)return;released=true;voices.delete(voice);
   const now=ctx.currentTime,tail=immediate?.025:source.loop?.05+settings.decay*.55:.06;
   if(envelope.gain.cancelAndHoldAtTime)envelope.gain.cancelAndHoldAtTime(now);else{envelope.gain.cancelScheduledValues(now);envelope.gain.setValueAtTime(level,now);}
   envelope.gain.linearRampToValueAtTime(0,now+tail);source.stop(now+tail+.005);
  }};
  source.onended=()=>{voices.delete(voice);source.disconnect();envelope.disconnect();pan.disconnect();};voices.add(voice);source.start(t);
  if(source.loop)voice.retune=tune=>source.playbackRate.setTargetAtTime(baseRate*2**(tune/12),ctx.currentTime,.05);
  else {const duration=buffer.duration/rate*(.22+.78*settings.decay);envelope.gain.setValueAtTime(level,t+Math.max(.003,duration-.09));envelope.gain.linearRampToValueAtTime(0,t+duration);source.stop(t+duration+.01);}
  return ()=>voice.release();
 }
 return {ready,play,stop,update,isReady:inst=>!!SAMPLE_BANKS[inst.id]?.pads.flat().every(s=>buffers.has(s.file))};
}
