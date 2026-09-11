import {engines,cleanName} from '../src/online/protocol.js';

const TTL=35000,INVITE_TTL=30000;
export class CafeRoom{
 constructor({now=()=>Date.now(),uuid=()=>crypto.randomUUID()}={}){this.now=now;this.uuid=uuid;this.sessions=new Map();this.invites=new Map();this.matches=new Map();}
 join(name){this.sweep();if(this.sessions.size>=100)throw new Error('Зал заполнен. Попробуйте чуть позже.');const token=this.uuid()+this.uuid(),p={id:this.uuid(),name:cleanName(name),joined:this.now(),seen:this.now(),notice:'',match:null};this.sessions.set(token,p);return {token,id:p.id};}
 player(token){const p=this.sessions.get(token);if(!p)throw new Error('SESSION_EXPIRED');return p;}
 byId(id){return [...this.sessions.values()].find(p=>p.id===id);}
 cancelMatch(id,message){const m=this.matches.get(id);if(!m)return;for(const id of m.players){const p=this.byId(id);if(p){p.match=null;p.notice=message;}}this.matches.delete(m.id);}
 sweep(){const now=this.now();for(const [token,p] of this.sessions)if(now-p.seen>TTL){if(p.match)this.cancelMatch(p.match,`${p.name} отключился. Партия завершена.`);this.sessions.delete(token);}for(const [id,i] of this.invites)if(i.expires<=now||!this.byId(i.from)||!this.byId(i.to)){this.invites.delete(id);const p=this.byId(i.from);if(p)p.notice='Приглашение истекло или гость вышел.';}for(const m of this.matches.values())if(m.gameId==='croissant'&&!m.game.done)this.tickArcade(m,now);}
 tickArcade(m,now){const dt=Math.min(30,(now-m.ticked)/1000);m.ticked=now;for(const g of m.arcade)g.tick(dt);m.game=m.arcade[0];m.revision++;}
 snapshot(m,seat){const g=m.gameId==='croissant'?m.arcade[seat]:m.game;const state=JSON.parse(JSON.stringify(g,(key,value)=>['random','positions'].includes(key)?undefined:value));
  if(g.draw)state.draw=Array(g.draw.length).fill(null);
  if(g.hands)state.hands=g.hands.map((h,p)=>p===seat||(m.gameId==='poker'&&g.done&&g.live.length>1&&!g.folded.includes(p))?h:Array(h.length).fill(null));
  if(m.gameId==='croissant'){state.scores=m.arcade.map(g=>g.scores[0]);state.actor=seat;if(g.done){const max=Math.max(...state.scores),w=state.scores.flatMap((s,i)=>s===max?[i]:[]);state.winner=w.length===1?w[0]:null;}}
  return {id:m.id,gameId:m.gameId,seat,names:m.names,revision:m.revision,state};
 }
 poll(token){this.sweep();const p=this.player(token);p.seen=this.now();return {id:p.id,guests:[...this.sessions.values()].map(x=>({id:x.id,name:x.name,joined:x.joined,busy:!!x.match})),incoming:[...this.invites.values()].find(i=>i.to===p.id)||null,outgoing:[...this.invites.values()].find(i=>i.from===p.id)||null,match:p.match?this.snapshot(this.matches.get(p.match),this.matches.get(p.match).players.indexOf(p.id)):null,notice:p.notice};}
 command(token,a){this.sweep();const p=this.player(token);p.seen=this.now();if(!a||typeof a!=='object')throw new Error('Некорректная команда.');
  if(a.type==='name'){p.name=cleanName(a.name);return;}
  if(a.type==='ack'){p.notice='';return;}
  if(a.type==='leave'){if(p.match)this.cancelMatch(p.match,`${p.name} вышел из партии.`);return;}
  if(a.type==='cancel'){for(const [id,i] of this.invites)if(i.from===p.id)this.invites.delete(id);return;}
  if(a.type==='invite'){const other=this.byId(a.to);if(!other||other===p)throw new Error('Гость уже вышел.');if(!Object.hasOwn(engines,a.gameId))throw new Error('Неизвестная игра.');if(p.match||other.match)throw new Error('Один из игроков уже играет.');if([...this.invites.values()].some(i=>[i.from,i.to].some(id=>id===p.id||id===other.id)))throw new Error('Дождитесь ответа на текущее приглашение.');const id=this.uuid();this.invites.set(id,{id,from:p.id,to:other.id,name:p.name,gameId:a.gameId,expires:this.now()+INVITE_TTL});return;}
  if(a.type==='respond'){const i=this.invites.get(a.id);if(!i||i.to!==p.id)throw new Error('Приглашение уже недоступно.');this.invites.delete(i.id);const other=this.byId(i.from);if(a.accept!==true){if(other)other.notice=`${p.name} пока не готов играть.`;return;}if(!other||p.match||other.match)throw new Error('Гость уже недоступен.');const id=this.uuid(),m={id,gameId:i.gameId,players:[other.id,p.id],names:[other.name,p.name],game:new engines[i.gameId](1),revision:0,ticked:this.now()};if(i.gameId==='croissant'){m.arcade=[new engines.croissant(0),new engines.croissant(0)];m.game=m.arcade[0];}this.matches.set(id,m);p.match=other.match=id;p.notice=other.notice='';return;}
  if(a.type==='action'){const m=this.matches.get(p.match);if(!m||m.id!==a.match)throw new Error('Партия уже завершена.');const seat=m.players.indexOf(p.id);if(m.game.done)throw new Error('Партия завершена.');if(m.gameId!=='croissant'&&(m.revision!==a.revision||m.game.actor!==seat))throw new Error('Позиция обновилась. Дождитесь своего хода.');const move=a.action;if(!move||typeof move!=='object'||JSON.stringify(move).length>300)throw new Error('Некорректный ход.');let ok;if(m.gameId==='croissant'){if(a.target!==m.arcade[seat].target)throw new Error('Круассан уже убежал!');ok=m.arcade[seat].act(move);}else ok=m.game.act(move);if(!ok)throw new Error('Такой ход сейчас невозможен.');m.revision++;return;}
  throw new Error('Неизвестная команда.');
 }
}
