import * as T from 'three';
import {assetUrl} from './asset-url.js';
export function createMaterials(){
 const loader=new T.TextureLoader();const cache=new Map();const materialCache=new Map();
 function photo(name,rx=1,ry=1){const key=`${name}:${rx}:${ry}`;if(cache.has(key))return cache.get(key);const t=loader.load(assetUrl(`/textures/${name}.${name.endsWith("-pillow")?"png":"jpg"}`));t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=8;cache.set(key,t);return t;}
 function standard(color,extra={}){const key=color+JSON.stringify(Object.entries(extra).map(([k,v])=>[k,v?.uuid||v]));if(!materialCache.has(key))materialCache.set(key,new T.MeshStandardMaterial({color,roughness:.8,...extra}));return materialCache.get(key);}
 function procedural(kind){const c=document.createElement('canvas');c.width=c.height=1024;const x=c.getContext('2d');let seed=987;const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 if(kind==='paving'||kind==='tile'||kind==='brick'){
 const brick=kind==='brick',tile=kind==='tile';const w=tile?256:brick?256:128,h=tile?256:brick?100:256;
 x.fillStyle=brick?'#b0a79c':tile?'#777871':'#656968';x.fillRect(0,0,1024,1024);
 for(let row=-1;row<1024/h+1;row++)for(let col=-1;col<1024/w+1;col++){const tone=Math.floor((tile?206:brick?82:144)+rand()*18);x.fillStyle=tile?`rgb(${tone+4},${tone+3},${tone-2})`:brick?`rgb(${tone+16},${tone},${tone-4})`:`rgb(${tone},${tone+1},${tone})`;x.fillRect(col*w+(brick&&row%2?w/2:0)+3,row*h+3,w-6,h-6);}
 }else {x.fillStyle=kind==='soil'?'#403c2f':'#e9e8df';x.fillRect(0,0,1024,1024);}
 for(let i=0;i<75000;i++){const a=rand()*.13;x.fillStyle=rand()>.5?`rgba(0,0,0,${a})`:`rgba(255,255,255,${a})`;x.fillRect(rand()*1024,rand()*1024,1+rand()*2,1+rand()*2);}
 if(kind==='ceiling'){for(let i=0;i<1800;i++){x.fillStyle='#aaa9a1';x.fillRect(rand()*1024,rand()*1024,1+rand()*2,1+rand()*4);}}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;return t;}
 const paving=procedural('paving');paving.repeat.set(28,9);const tiles=procedural('tile');tiles.repeat.set(2.1,5.5);const brick=procedural('brick');brick.repeat.set(2,.22);const soil=procedural('soil');soil.repeat.set(5,2);
 return {photo,standard,
 plaster:standard('#eee4dc',{map:photo('plaster',10,4),bumpMap:photo('plaster',10,4),bumpScale:.018}),
 ceiling:standard('#eeeeea',{map:procedural('ceiling'),roughness:1}),
 wall:standard('#f0e9d5',{bumpMap:photo('wall-photo',5,5),bumpScale:.0003}),white:standard('#e6e6df'),frame:standard('#d4d6cb',{roughness:.42,metalness:.25}),dark:standard('#33363a'),black:standard('#131619'),metal:standard('#b9babc',{metalness:.85,roughness:.24}),
 wood:standard('#ede2d1',{map:photo('counter-oak-photo',1,1),roughness:.57}),fabric:standard('#aaaeb1',{map:photo('fabric',3,2),bumpMap:photo('fabric',3,2),bumpScale:.02}),yellow:standard('#d0cc16'),
 glass:new T.MeshPhysicalMaterial({color:'#b9cccb',roughness:.08,metalness:.5,transparent:true,opacity:.43,side:T.DoubleSide,depthWrite:false}),
 paving:standard('#ddddda',{map:paving,bumpMap:paving,bumpScale:.018}),floor:standard('#ffffff',{map:tiles,bumpMap:tiles,bumpScale:.012,roughness:.55}),brick:standard('#ffffff',{map:brick,bumpMap:brick,bumpScale:.018}),soil:standard('#999386',{map:soil}),
 photoMaterial(name){return standard('#ffffff',{map:photo(name),roughness:.72});}
 };
}
