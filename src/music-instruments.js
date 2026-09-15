export const midiHz = midi => 440 * 2 ** ((midi - 69) / 12);
const noteNames=['До','До♯','Ре','Ре♯','Ми','Фа','Фа♯','Соль','Соль♯','Ля','Си♭','Си'];
const scale = midis => ({notes:midis.map(midiHz),labels:midis.map(n=>noteNames[n%12]+' '+(Math.floor(n/12)-1))});
// Frets in physical high-G ukulele string order: G4, C4, E4, A4.
export const UKULELE_CHORDS = [
 ['C',[0,0,0,3]],['Am',[2,0,0,0]],['F',[2,0,1,0]],['G',[0,2,3,2]],
 ['Dm',[2,2,1,0]],['Em',[0,4,3,2]],['D',[2,2,2,0]],['A',[2,1,0,0]],
 ['E',[4,4,4,2]],['B♭',[3,2,1,1]],['C7',[0,0,0,1]],['G7',[0,2,1,2]],
].map(([label,frets])=>({label,notes:frets.map((f,i)=>midiHz([67,60,64,69][i]+f))}));
export const INSTRUMENTS = [
 {id:'ukulele',name:'Укулеле',icon:'♬',type:'pluck',...scale([60,62,64,65,67,69,71,72,74,76,77,79,81,83,84]),presets:['Тёплое дерево','Островной бриз','Яркий перебор']},
 {id:'darbuka',name:'Дарбука',icon:'◉',type:'drum',notes:[110,280,390,180,280,390],labels:['DUM · центр','TEK · край','KA · край','SLAP','Ролл ×4 · край','Ролл ×8 · край'],presets:['Натуральная','Яркий край','Глубокий бас']},
 {id:'kit',name:'Мини-ударная установка',icon:'🥁',type:'kit',notes:[65,180,7000,4500,140,220],labels:['Бочка','Малый','Хай-хэт','Тарелка','Том низкий','Том высокий'],presets:['Камерный джаз','Сухой фанк','Большая сцена']},
 {id:'handpan',name:'Ханг (хендпан)',icon:'☼',type:'metal',...scale([47,49,50,52,54,55,57,59,61,62,64,66,67,69,71]),presets:['Медитация','Хрустальный','Тёмная сталь']},
 {id:'bass',name:'Бас-гитара',icon:'𝄢',type:'bass',...scale([28,29,31,33,35,36,38,40,41,43,45,47,48,50,52]),presets:['Чистый Jazz Bass','Атака','Винтаж']},
 {id:'didgeridoo',name:'Диджириду',icon:'〰',type:'drone',...scale([31,33,35,36,38,40,41,43]),presets:['Натуральный дрон','Пещера','Гортанный']},
 {id:'frame',name:'Большой рамочный барабан',icon:'◎',type:'frame',notes:[70,150,240,95],labels:['Центр','Край','Пальцы','Глухой удар'],presets:['Шаманский','Бодран','Мягкая кожа']},
];
// Each instrument has its own voicing, rather than sharing three global curves.
const PRESET_VALUES={
 ukulele:[[.72,.52,.90,.12,0],[.70,.60,.95,.30,0],[.68,.78,.60,.06,0]],
 darbuka:[[.72,.50,.90,.10,0],[.68,.76,.65,.08,0],[.74,.28,1,.22,-3]],
 kit:[[.70,.52,.80,.16,0],[.72,.65,.38,.04,0],[.68,.62,1,.40,0]],
 handpan:[[.65,.45,1,.18,0],[.62,.61,1,.34,0],[.65,.25,.85,.12,0]],
 bass:[[.78,.48,.86,.02,0],[.72,.78,.55,.03,0],[.76,.25,.75,.10,0]],
 didgeridoo:[[.50,.32,.50,.18,0],[.48,.25,.80,.65,-3],[.48,.70,.20,.05,0]],
 frame:[[.72,.45,1,.25,-2],[.70,.62,.42,.08,0],[.68,.28,.85,.12,0]],
};
export function getMusicPreset(id,index=0){
 const values=PRESET_VALUES[id]?.[index];
 if(!values)throw new RangeError('Unknown instrument preset');
 return {...Object.fromEntries(['volume','tone','decay','space','tune'].map((key,i)=>[key,values[i]])),voice:index};
}
