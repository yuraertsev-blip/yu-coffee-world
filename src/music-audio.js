export const INSTRUMENTS = [
 {id:'ukulele',name:'Укулеле',icon:'♬',type:'pluck',notes:[261.63,329.63,392,440,523.25,659.25],labels:['До','Ми','Соль','Ля','До ↑','Ми ↑'],presets:['Тёплое дерево','Островной бриз','Яркий перебор']},
 {id:'darbuka',name:'Дарбука',icon:'◉',type:'drum',notes:[110,280,390,180],labels:['DUM · центр','TEK · край','KA · край','SLAP'],presets:['Глиняная','Алюминиевая','Глубокий бас']},
 {id:'kit',name:'Мини-ударная установка',icon:'🥁',type:'kit',notes:[65,180,7000,4500,140,220],labels:['Бочка','Малый','Хай-хэт','Тарелка','Том низкий','Том высокий'],presets:['Камерный джаз','Сухой фанк','Большая сцена']},
 {id:'handpan',name:'Ханг (хендпан)',icon:'☼',type:'metal',notes:[146.83,220,261.63,293.66,329.63,392,440,523.25],labels:['Ре','Ля','До','Ре ↑','Ми','Соль','Ля ↑','До ↑'],presets:['Медитация','Хрустальный','Тёмная сталь']},
 {id:'bass',name:'Бас-гитара',icon:'𝄢',type:'bass',notes:[41.2,55,73.42,98,110,146.83],labels:['Ми','Ля','Ре','Соль','Ля ↑','Ре ↑'],presets:['Мягкий бас','Слэп','Винтаж']},
 {id:'didgeridoo',name:'Диджириду',icon:'〰',type:'drone',notes:[55,65.41,73.42,82.41],labels:['Ля · дрон','До · дрон','Ре · дрон','Ми · дрон'],presets:['Эвкалипт','Пещера','Ритмичный']},
 {id:'frame',name:'Большой рамочный барабан',icon:'◎',type:'frame',notes:[70,150,240,95],labels:['Центр','Край','Пальцы','Глухой удар'],presets:['Шаманский','Бодран','Мягкая кожа']},
];
// Each instrument has its own voicing, rather than sharing three global curves.
const PRESET_VALUES={
 ukulele:[[.65,.42,.30,.12,0],[.62,.68,.42,.25,0],[.60,.90,.20,.08,0]],
 darbuka:[[.65,.38,.26,.10,0],[.60,.86,.20,.12,2],[.70,.25,.48,.22,-4]],
 kit:[[.58,.55,.24,.16,0],[.65,.80,.10,.04,0],[.62,.72,.50,.48,0]],
 handpan:[[.58,.45,.85,.40,0],[.55,.90,.68,.30,0],[.65,.25,.90,.35,-3]],
 bass:[[.70,.25,.35,.02,0],[.62,.92,.18,.04,0],[.68,.38,.48,.12,-2]],
 didgeridoo:[[.50,.32,.50,.18,0],[.48,.25,.80,.65,-3],[.48,.70,.20,.05,0]],
 frame:[[.68,.28,.70,.32,-3],[.65,.62,.22,.08,0],[.60,.18,.45,.12,0]],
};
export function getMusicPreset(id,index=0){
 const values=PRESET_VALUES[id]?.[index];
 if(!values)throw new RangeError('Unknown instrument preset');
 return Object.fromEntries(['volume','tone','decay','space','tune'].map((key,i)=>[key,values[i]]));
}
// Lazy audio graph: created only after a user gesture, with bounded polyphony.
export function createMusicAudio(){
 let ctx,master,filter,wet,delay,compressor;const voices=new Set();
 async function ready(){
  if(!ctx){const AC=globalThis.AudioContext||globalThis.webkitAudioContext;if(!AC)throw Error('Этот браузер не поддерживает Web Audio.');ctx=new AC();master=ctx.createGain();filter=ctx.createBiquadFilter();filter.type='lowpass';wet=ctx.createGain();delay=ctx.createDelay();delay.delayTime.value=.17;compressor=ctx.createDynamicsCompressor();filter.connect(master);master.connect(compressor);master.connect(delay);delay.connect(wet);wet.connect(compressor);compressor.connect(ctx.destination);}
  if(ctx.state!=='running')await ctx.resume();
 }
 function update(s){
  if(!ctx)return;
  const t=ctx.currentTime;
  master.gain.setTargetAtTime(s.volume*.55,t,.01);
  filter.frequency.setTargetAtTime(450+s.tone*14000,t,.01);
  wet.gain.setTargetAtTime(s.space*.5,t,.01);
  for(const voice of voices)voice.retune?.(s.tune);
 }
 function stop(){for(const voice of voices)voice(true);if(master)master.gain.setTargetAtTime(0,ctx.currentTime,.015);}
 function play(inst,index,s){
  if(!ctx||ctx.state!=='running')return ()=>{};
  if(voices.size>=24)voices.values().next().value(true);
  const t=ctx.currentTime,f=inst.notes[index]*2**(s.tune/12),duration=.12+s.decay*2.8;
  update(s);
  const envelope=ctx.createGain();envelope.connect(filter);envelope.gain.setValueAtTime(0,t);envelope.gain.linearRampToValueAtTime(.5,t+.008);
  const drone=inst.type==='drone';if(!drone)envelope.gain.exponentialRampToValueAtTime(.001,t+duration);
  const sources=[],oscillators=[];let ended=false;const release=(immediate=false)=>{if(ended)return;ended=true;const tail=drone&&!immediate?.12+s.decay*.6:.12;envelope.gain.cancelScheduledValues(ctx.currentTime);envelope.gain.setTargetAtTime(.0001,ctx.currentTime,tail/6);sources.forEach(source=>{try{source.stop(ctx.currentTime+tail);}catch{}});voices.delete(release);};voices.add(release);
  const tone=(freq,weight,wave='sine',bend=false)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=wave;o.frequency.setValueAtTime(freq,t);if(bend)o.frequency.exponentialRampToValueAtTime(Math.max(20,freq*.45),t+.16);g.gain.value=weight;o.connect(g);g.connect(envelope);o.start(t);if(!drone)o.stop(t+duration+.1);sources.push(o);oscillators.push([o,freq/2**(s.tune/12)]);};
  const noise=(weight,high)=>{const b=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;const n=ctx.createBufferSource(),hp=ctx.createBiquadFilter(),g=ctx.createGain();n.buffer=b;hp.type='highpass';hp.frequency.value=high;g.gain.value=weight;n.connect(hp);hp.connect(g);g.connect(envelope);n.start(t);sources.push(n);};
  if(inst.type==='pluck'){tone(f,1,'triangle');tone(f*2,.22);tone(f*3,.08);}
  else if(inst.type==='bass'){tone(f,1,'triangle');tone(f*2,.3);}
  else if(inst.type==='metal'){[1,2,3.01,4.98].forEach((r,i)=>tone(f*r,1/(1+i*3)));}
  else if(drone){tone(f,.65,'sawtooth');tone(f*1.006,.3,'triangle');tone(f*3,.15);}
  else if(inst.type==='kit'&&index>=1&&index<=3){noise(index===1?.7:.4,index===1?900:4000);if(index===1)tone(f,.4,'triangle',true);}
  else {tone(f,1,'sine',true);tone(f*1.59,.22);noise(index===0?.04:.25,inst.type==='frame'?500:1600);}
  if(drone)release.retune=tune=>oscillators.forEach(([o,base])=>o.frequency.setTargetAtTime(base*2**(tune/12),ctx.currentTime,.04));
  sources[0].onended=()=>{voices.delete(release);envelope.disconnect();};return release;
 }
 return {ready,play,stop,update};
}
