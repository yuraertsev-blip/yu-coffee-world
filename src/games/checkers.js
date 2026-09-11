export class Checkers{
 constructor(){this.board=Array(64).fill(null);for(let r=0;r<8;r++)for(let c=0;c<8;c++)if((r+c)%2&& (r<3||r>4))this.board[r*8+c]={player:r<3?1:0,king:false};this.actor=0;this.forced=null;this.done=false;this.quiet=0;this.positions=new Map();this.message='Ваши шашки снизу. Взятие обязательно.';this.record();}
 options(from,captureOnly=false){const piece=this.board[from];if(!piece||piece.player!==this.actor)return [];const result=[],r=Math.floor(from/8),c=from%8;
  for(const dr of [-1,1])for(const dc of [-1,1]){let enemy=null;for(let step=1;step<8;step++){const nr=r+dr*step,nc=c+dc*step;if(nr<0||nr>7||nc<0||nc>7)break;const to=nr*8+nc,p=this.board[to];if(p){if(enemy!==null||p.player===piece.player)break;enemy=to;if(!piece.king&&step!==1)break;}else{if(enemy!==null)result.push({from,to,capture:enemy});else if(!captureOnly&&(piece.king||dr===(piece.player===0?-1:1)))result.push({from,to,capture:null});if(!piece.king)break;}if(!piece.king&&step>=2)break;}}
  return result;
 }
 moves(){if(this.done)return [];let moves=[];for(let i=0;i<64;i++)if(this.forced===null||this.forced===i)moves.push(...this.options(i,this.forced!==null));const capture=moves.filter(m=>m.capture!==null);return capture.length?capture:moves;}
 record(){const key=this.actor+':'+this.board.map(p=>p?`${p.player}${p.king?'K':'m'}`:'.').join('');this.positions.set(key,(this.positions.get(key)||0)+1);if(this.positions.get(key)>=3||this.quiet>=80){this.done=true;this.winner=null;this.message='Ничья: повторение позиции или 40 ходов без взятий.';}}
 act(a){if(this.done)return false;const move=this.moves().find(m=>m.from===a.from&&m.to===a.to);if(!move)return false;const p=this.board[move.from];this.board[move.to]=p;this.board[move.from]=null;if(move.capture!==null){this.board[move.capture]=null;this.quiet=0;}else this.quiet++;const row=Math.floor(move.to/8);if(row===(p.player===0?0:7))p.king=true;
  if(move.capture!==null&&this.options(move.to,true).some(m=>m.capture!==null)){this.forced=move.to;this.message='Продолжите взятие этой же шашкой.';return true;}this.forced=null;this.actor=1-this.actor;if(!this.moves().length){this.done=true;this.winner=1-this.actor;this.message='У соперника больше нет ходов.';}else this.record();return true;
 }
 bot(){const moves=this.moves().toSorted((a,b)=>Number(b.capture!==null)-Number(a.capture!==null)+((this.actor===0?Math.floor(a.to/8)-Math.floor(b.to/8):Math.floor(b.to/8)-Math.floor(a.to/8))*.02));return moves.length?this.act(moves[0]):false;}
}
