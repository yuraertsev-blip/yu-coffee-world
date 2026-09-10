export const LATTE_DESIGNS=[
 'Сердце','Двойное сердце','Три сердца','Венок из сердец','Крылатое сердце','Сердце с розеттой',
 'Классическая розетта','Широкая розетта','Двойная розетта','Три пера','Спиральная розетта','Перо',
 'Тюльпан','Пять лепестков','Высокий тюльпан','Два тюльпана','Букет','Тюльпан с короной',
 'Шестилистник','Восьмилистник','Ромашка','Роза','Подсолнух','Лотос',
 'Котик','Лисичка','Медвежонок','Сова','Лебедь','Зайчик',
 'Солнце','Звезда','Месяц','Снежинка','Кофейное зерно','Бесконечность'
];
// A shuffled bag guarantees 36 unique orders, including no repeat at a refill.
export function createLatteDeck(random=Math.random){let bag=[],last=-1;return {next(){if(!bag.length){bag=LATTE_DESIGNS.map((_,i)=>i);for(let i=bag.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}if(bag[bag.length-1]===last)[bag[0],bag[bag.length-1]]=[bag[bag.length-1],bag[0]];}last=bag.pop();return {id:last,name:LATTE_DESIGNS[last]};}};}
// Hand-drawn vector milk paths, rendered into a texture on the 3D coffee surface.
export function drawLatteArt(ctx,id,size=1024){
 ctx.clearRect(0,0,size,size);ctx.save();ctx.translate(size/2,size/2);ctx.scale(size/2,size/2);ctx.fillStyle='#fff3d9';ctx.strokeStyle='#fff3d9';ctx.lineCap='round';ctx.lineJoin='round';
 const filled=draw=>{ctx.beginPath();draw();ctx.fill();},stroke=(draw,w=.016)=>{ctx.lineWidth=w;ctx.beginPath();draw();ctx.stroke();};
 const circle=(x,y,r)=>filled(()=>ctx.arc(x,y,r,0,Math.PI*2));
 const ellipse=(x,y,rx,ry,a=0)=>filled(()=>ctx.ellipse(x,y,rx,ry,a,0,Math.PI*2));
 function heart(x,y,s,a=0){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.scale(s,s);filled(()=>{ctx.moveTo(0,.7);ctx.bezierCurveTo(-1,.0,-.8,-.8,-.3,-.7);ctx.bezierCurveTo(-.1,-.7,0,-.5,0,-.4);ctx.bezierCurveTo(.3,-1,1,-.7,.8,-.2);ctx.bezierCurveTo(.65,.1,.3,.4,0,.7);});ctx.restore();}
 function rosetta(x,y,s=1,n=10,wide=1,a=0){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.scale(s,s);for(let i=0;i<n;i++){const t=i/(n-1),yy=.48-t*.91,w=(.08+Math.sin(t*Math.PI)*.35)*wide;for(const side of [-1,1]){filled(()=>{ctx.moveTo(0,yy+.06);ctx.bezierCurveTo(side*w*.8,yy+.05,side*w*1.3,yy-.10,side*w,yy-.075);ctx.bezierCurveTo(side*w*.65,yy-.04,side*.08,yy-.03,0,yy+.06);});}}stroke(()=>{ctx.moveTo(0,.64);ctx.quadraticCurveTo(.045,0,0,-.56);},.019);ctx.restore();}
 function tulip(x,y,s,n=4){ctx.save();ctx.translate(x,y);ctx.scale(s,s);for(let i=0;i<n;i++){const yy=.36-i*.18,w=.46-i*.065;filled(()=>{ctx.moveTo(0,yy+.09);ctx.bezierCurveTo(-w*1.6,yy-.04,-w,yy-.23,0,yy-.035);ctx.bezierCurveTo(w,yy-.23,w*1.6,yy-.04,0,yy+.09);});}stroke(()=>{ctx.moveTo(0,.58);ctx.lineTo(0,-.55);},.018);ctx.restore();}
 function petalFlower(n,r=.40){for(let i=0;i<n;i++){const a=i/n*Math.PI*2;ellipse(Math.cos(a)*r*.60,Math.sin(a)*r*.60,r*.58,.105,a);}circle(0,0,.11);}
 const v=id%6;
 if(id<6){if(v===0){heart(0,0,.67);ctx.globalCompositeOperation='destination-out';heart(0,-.015,.49);ctx.globalCompositeOperation='source-over';heart(0,-.025,.37);}
  if(v===1){heart(-.24,-.14,.40,-.25);heart(.26,.2,.39,.25);}
  if(v===2){heart(-.33,-.24,.29,-.2);heart(.34,-.24,.29,.2);heart(0,.25,.42);}
  if(v===3){for(let i=0;i<7;i++){const a=i/7*Math.PI*2;heart(Math.sin(a)*.44,Math.cos(a)*.44,.20,-a+Math.PI);}heart(0,0,.22);}
  if(v===4){rosetta(-.30,0,.7,8,.6,-.5);rosetta(.30,0,.7,8,.6,.5);heart(0,.08,.35);}
  if(v===5){rosetta(0,.15,.8,9);heart(0,-.35,.30);}
 }else if(id<12){if(v===0)rosetta(0,0,1,12,.83);if(v===1)rosetta(0,0,1,9,1.3);if(v===2){rosetta(-.27,0,.8,10,.7,-.2);rosetta(.27,0,.8,10,.7,.2);}if(v===3){for(let i=-1;i<=1;i++)rosetta(i*.29,.06,.7,8,.6,i*.4);}if(v===4){for(let i=0;i<3;i++)rosetta(Math.sin(i*2.1)*.25,Math.cos(i*2.1)*.25,.7,8,.8,i*2.1);}if(v===5)rosetta(0,0,1,15,.58,-.35);
 }else if(id<18){if(v<3)tulip(0,v===2?.13:0,v===2?.8:1,v===0?3:v===1?5:7);if(v===3){tulip(-.26,.1,.63,4);tulip(.26,-.08,.63,4);}if(v===4){tulip(-.32,.08,.43,3);tulip(.32,.08,.43,3);tulip(0,-.20,.50,4);stroke(()=>{ctx.moveTo(-.32,.32);ctx.lineTo(0,.60);ctx.lineTo(.32,.32);ctx.moveTo(0,.1);ctx.lineTo(0,.60);},.014);}if(v===5){tulip(0,.14,.8,4);heart(0,-.43,.26);}
 }else if(id<24){if(v<3)petalFlower([6,8,12][v],v===2?.53:.47);if(v===3){for(let i=0;i<5;i++)stroke(()=>{ctx.arc(0,0,.12+i*.09,i*.9,i*.9+Math.PI*1.65);},.055);}if(v===4){petalFlower(16,.54);ctx.globalCompositeOperation='destination-out';circle(0,0,.23);ctx.globalCompositeOperation='source-over';for(let i=0;i<12;i++){const a=i*2.4,r=.04+.011*i;circle(Math.sin(a)*r,Math.cos(a)*r,.015);}}if(v===5){for(let i=-2;i<=2;i++)ellipse(i*.13,.05+Math.abs(i)*.08,.11,.35,i*.33);stroke(()=>{ctx.moveTo(-.52,.4);ctx.quadraticCurveTo(0,.62,.52,.4);},.028);}
 }else if(id<30){
  if(v===4){ellipse(-.08,.21,.4,.19,-.2);rosetta(-.13,.11,.64,9,.8,-1.1);stroke(()=>{ctx.moveTo(.12,.25);ctx.bezierCurveTo(.53,-.08,.06,-.34,.26,-.44);ctx.quadraticCurveTo(.45,-.5,.43,-.3);},.06);circle(.30,-.41,.077);stroke(()=>{ctx.moveTo(.34,-.43);ctx.lineTo(.51,-.38);},.025);}
  else {ellipse(0,.07,.39,.34);if(v===2){circle(-.30,-.25,.14);circle(.30,-.25,.14);}else if(v===5){ellipse(-.18,-.40,.10,.28,-.12);ellipse(.18,-.40,.10,.28,.12);}else for(const side of [-1,1])filled(()=>{ctx.moveTo(side*.12,-.13);ctx.lineTo(side*.34,-.48);ctx.lineTo(side*.38,.03);});
   ctx.globalCompositeOperation='destination-out';for(const side of [-1,1]){if(v===3)circle(side*.17,.015,.11);else ellipse(side*.15,.02,.035,.055);}ellipse(0,.14,.05,.035);stroke(()=>{ctx.moveTo(-.10,.22);ctx.quadraticCurveTo(0,.29,.10,.22);},.015);
   if(v===1){for(const side of [-1,1])filled(()=>{ctx.moveTo(side*.04,.13);ctx.lineTo(side*.34,-.14);ctx.lineTo(side*.30,.17);});}ctx.globalCompositeOperation='source-over';if(v===3){circle(-.17,.015,.035);circle(.17,.015,.035);}if(v===0)for(const side of [-1,1])for(let j=0;j<3;j++)stroke(()=>{ctx.moveTo(side*.24,.14+j*.04);ctx.lineTo(side*.54,.10+j*.07);},.012);
  }
 }else {if(v===0){circle(0,0,.28);for(let i=0;i<12;i++){const a=i*Math.PI/6;stroke(()=>{ctx.moveTo(Math.sin(a)*.38,Math.cos(a)*.38);ctx.lineTo(Math.sin(a)*.60,Math.cos(a)*.60);},.035);}}
  if(v===1){filled(()=>{for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=i%2?.25:.59;i?ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r):ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();});ctx.globalCompositeOperation='destination-out';circle(0,0,.12);ctx.globalCompositeOperation='source-over';}
  if(v===2){circle(-.05,0,.49);ctx.globalCompositeOperation='destination-out';circle(.16,-.13,.43);ctx.globalCompositeOperation='source-over';for(const [x,y] of [[.37,.28],[.45,-.29],[.12,-.58]])circle(x,y,.034);}
  if(v===3){for(let i=0;i<6;i++){ctx.save();ctx.rotate(i*Math.PI/3);stroke(()=>{ctx.moveTo(0,0);ctx.lineTo(0,-.6);for(let j=1;j<4;j++){ctx.moveTo(0,-j*.14);ctx.lineTo(-.09,-j*.14-.08);ctx.moveTo(0,-j*.14);ctx.lineTo(.09,-j*.14-.08);}},.023);ctx.restore();}}
  if(v===4){ellipse(0,0,.32,.52,.38);ctx.globalCompositeOperation='destination-out';stroke(()=>{ctx.moveTo(.16,-.48);ctx.bezierCurveTo(-.4,-.05,.35,.09,-.16,.48);},.05);ctx.globalCompositeOperation='source-over';}
  if(v===5)stroke(()=>{ctx.moveTo(0,0);ctx.bezierCurveTo(-.8,-.65,-.8,.65,0,0);ctx.bezierCurveTo(.8,-.65,.8,.65,0,0);},.065);
 }
 ctx.restore();
}
