export class Croissant{
 constructor(count,random=Math.random){this.random=random;this.scores=Array(count+1).fill(0);this.remaining=30;this.actor=0;this.done=false;this.age=0;this.target=Math.floor(random()*12);this.message='Ловите 🥐, не трогайте чашки и уточек!';}
 move(){this.target=(this.target+1+Math.floor(this.random()*11))%12;this.age=0;}
 act(a){if(this.done||!Number.isInteger(a.slot)||a.slot<0||a.slot>11)return false;if(a.slot===this.target){this.scores[0]++;this.message=['Хрусть! Пойман.','Круассан задержан!','Ещё один в вашу тарелку!'][Math.floor(this.random()*3)];this.move();}else{this.scores[0]=Math.max(0,this.scores[0]-1);this.message='Ой! Это не круассан. −1 очко';}return true;}
 tick(dt){if(this.done)return;this.remaining=Math.max(0,this.remaining-dt);this.age+=dt;for(let i=1;i<this.scores.length;i++)if(this.random()<dt*(.36+i*.055))this.scores[i]++;if(this.age>=1.05)this.move();if(this.remaining===0){this.done=true;const max=Math.max(...this.scores);this.winners=this.scores.map((s,i)=>s===max?i:-1).filter(i=>i>=0);this.winner=this.winners.length===1?this.winners[0]:null;this.message='Время! Считаем спасённые круассаны.';}}
}
