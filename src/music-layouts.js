// Coordinates in percent: instrument layouts remain proportionate on touch screens.
export function handpanPosition(index){
 if(index===0)return [50,50];
 const pair=Math.floor((index-1)/2),side=index%2?-1:1;
 const angle=(90+side*(pair+.5)*360/14)*Math.PI/180;
 return [50+40*Math.cos(angle),50+40*Math.sin(angle)];
}
export const KIT_POSITIONS=[[50,78],[30,60],[11,40],[23,16],[62,39],[39,35],[83,62],[10,70],[86,18],[62,15],[87,40]];
export const MUSIC_KEYS=['A','S','D','F','G','H','J','K','L','Q','W','E','R','T','Y','U','I','O','P','Z','X','C','V','B','N','M',',','.'];
export const MUSIC_CODES=MUSIC_KEYS.map(k=>k===','?'Comma':k==='.'?'Period':'Key'+k);
export const isSustained = inst => inst.type==='drone'||inst.type==='wind';
