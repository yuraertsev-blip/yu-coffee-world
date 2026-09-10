import * as T from 'three';
// Small shared procedural fabric maps keep all outfits crisp at close range.
export function makeFabricMaps(){
 if(typeof document==='undefined')return null;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d');
 ctx.fillStyle='#898989';ctx.fillRect(0,0,128,128);
 for(let y=0;y<128;y+=4)for(let x=0;x<128;x+=4){ctx.fillStyle=(x+y)%8?'#a0a0a0':'#717171';ctx.fillRect(x,y,3,1);ctx.fillStyle='#777777';ctx.fillRect(x+2,y+1,1,3);}
 const texture=new T.CanvasTexture(canvas);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(8,8);texture.anisotropy=8;return texture;
}
