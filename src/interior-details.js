import * as T from 'three';
// Visible objects from 01:22 (counter/mobile) and 05:50 (floor lamp).
export function addInteriorDetails(parent,m,p){
 const {box,cyl,rod,sphere,plane}=p;
 const lamp=new T.Group();lamp.name='leopard-floor-lamp';lamp.position.set(1.63,0,2.05);parent.add(lamp);
 box(lamp,'square-lamp-foot',0,.025,0,.25,.04,.25,m.black,.01);rod(lamp,[0,.04,0],[0,1.48,0],.009,m.black);
 const shadeMat=m.standard('#e7dfcb',{map:m.photo('leopard-lamp',2,1),side:T.DoubleSide,roughness:1});
 const shade=new T.Mesh(new T.CylinderGeometry(.115,.115,.48,40,1,true),shadeMat);shade.position.y=1.54;shade.name='cylindrical-animal-print-shade';shade.castShadow=true;lamp.add(shade);
 for(const y of [1.3,1.78]){const edge=new T.Mesh(new T.TorusGeometry(.115,.003,5,40),m.standard('#c6beab'));edge.rotation.x=Math.PI/2;edge.position.y=y;lamp.add(edge);}
 // Small hanging ceramic mobile: crescent and folded white birds.
 const mobile=new T.Group();mobile.name='white-birds-and-crescent-mobile';mobile.position.set(-.65,3.01,4.15);parent.add(mobile);
 const ceramic=m.standard('#e8e7dd',{roughness:.73});
 const crescent=new T.Shape();crescent.moveTo(.058,.096);crescent.bezierCurveTo(-.13,.14,-.13,-.14,.058,-.096);crescent.bezierCurveTo(-.055,-.065,-.055,.065,.058,.096);
 const moon=new T.Mesh(new T.ExtrudeGeometry(crescent,{depth:.016,bevelEnabled:true,bevelSize:.004,bevelThickness:.003,bevelSegments:2,steps:1}),ceramic);moon.position.set(.15,-.29,0);moon.name='ceramic-crescent';mobile.add(moon);rod(mobile,[.15,0,0],[.15,-.19,0],.0018,ceramic);
 for(let i=0;i<4;i++){const x=-.22+(i%2)*.31,y=-.2-i*.18,z=(i%2)*.18;rod(mobile,[x,0,z],[x,y,z],.0018,ceramic);const bird=new T.Group();bird.name='folded-ceramic-bird';bird.position.set(x,y,z);bird.rotation.y=i*.8;mobile.add(bird);const body=sphere(bird,'bird-body',0,0,0,.028,ceramic);body.scale.set(.6,.6,1.7);
 for(const sign of [-1,1]){const shape=new T.Shape();shape.moveTo(0,0);shape.lineTo(sign*.11,.075);shape.lineTo(sign*.075,-.006);shape.lineTo(0,-.022);const wing=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.004,bevelEnabled:false}),ceramic);wing.rotation.x=-.4;bird.add(wing);}
 }

 // Counter arrangement in IMG_3986–3990: cloche, mat, terminal, orange cat and caddy.
 const top=1.153;
 box(parent,'central-ribbed-service-mat',.02,top,-1.33,.56,.009,.28,m.black);
 for(let i=0;i<28;i++)box(parent,'service-mat-rib',-.245+i*.02,top+.006,-1.33,.006,.004,.26,m.dark);
 const glass=new T.MeshPhysicalMaterial({color:'#f0f4f1',transparent:true,opacity:.065,roughness:.045,metalness:.08,depthWrite:false});
 cyl(parent,'glass-cake-stand-foot',-.10,top+.018,-1.64,.13,.15,.028,glass,40);
 cyl(parent,'glass-cake-stand-stem',-.10,top+.095,-1.64,.03,.05,.15,glass,24);
 cyl(parent,'glass-cake-stand-platter',-.10,top+.18,-1.64,.26,.26,.02,glass,48);
 for(let i=0;i<7;i++){const a=i*2.4,r=i===0?0:.16,x=-.10+Math.cos(a)*r,z=-1.64+Math.sin(a)*r;const holder=new T.Group();holder.name='interactive-muffin-'+i;holder.userData.counterAction='muffin';holder.userData.dynamic=true;parent.add(holder);const pastry=cyl(holder,'individual-muffin',x,top+.215,z,.057,.04,.06,m.standard(i%3?'#b37d47':'#91a064'),18);sphere(holder,'rounded-muffin-top',x,top+.247,z,.056,m.standard(i%3?'#c49961':'#a4ad79'));}
 const cloche=new T.Group();cloche.name='interactive-cloche';cloche.userData.dynamic=true;cloche.userData.counterAction='cloche';parent.add(cloche);const dome=new T.Mesh(new T.SphereGeometry(.27,40,20,0,Math.PI*2,0,Math.PI/2),glass);dome.name='glass-pastry-cloche';dome.position.set(-.10,top+.185,-1.64);dome.scale.y=.74;cloche.add(dome);cyl(cloche,'glass-cloche-knob',-.10,top+.415,-1.64,.025,.038,.054,glass);
 box(parent,'card-terminal',.61,top+.055,-1.73,.14,.06,.22,m.black,.014);const screen=box(parent,'blue-terminal-screen',.61,top+.09,-1.76,.115,.009,.115,m.standard('#668da7',{emissive:'#33547a',emissiveIntensity:.25}));screen.rotation.x=.16;
 for(let i=0;i<3;i++){const disc=cyl(parent,'round-counter-mosaic',-.08+i*.16,top+.005,-1.18,.073,.073,.008,m.metal,32);const face=new T.Mesh(new T.CircleGeometry(.07,32),m.photoMaterial(i===1?'gift-mosaic-town':'gift-mosaic-round'));face.rotation.x=-Math.PI/2;face.position.set(disc.position.x,top+.01,-1.18);parent.add(face);}
 const caddy=new T.Group();caddy.name='black-counter-organizer';caddy.position.set(.97,top,-1.48);parent.add(caddy);
 box(caddy,'organizer-base',0,.014,0,.56,.025,.44,m.black);
 for(const x of [-.28,.28,-.10,.13])box(caddy,'organizer-partition',x,.09,0,.013,.18,.44,m.black);
 for(const z of [-.22,.22,0])box(caddy,'organizer-wall',0,.08,z,.56,.16,.014,m.black);
 box(caddy,'napkin-stack',.025,.11,.10,.19,.06,.18,m.dark);
 for(let i=0;i<20;i++){const x=-.255+(i%4)*.034,z=.035+Math.floor(i/4)*.032;const sugar=box(caddy,'wrapped-sugar',x,.065+(i%3)*.012,z,.025,.065,.013,m.standard(i%2?'#e9d89e':'#eeeee7'));sugar.rotation.z=(i%3-1)*.3;}
 for(let i=0;i<40;i++)cyl(caddy,'black-drinking-straw',-.235+(i%8)*.022,.23+(i%3)*.005,-.17+Math.floor(i/8)*.025,.003,.003,.36,m.black,5);
 for(let i=0;i<8;i++)cyl(caddy,'clear-cup-stack',.07,.13+i*.012,-.10,.049,.036,.12,glass,24);
 for(let i=0;i<14;i++)box(caddy,'wooden-stirrer',.19+(i%4)*.013,.16,-.13+Math.floor(i/4)*.023,.008,.27,.003,m.white);
 const cat=new T.Group();cat.name='orange-tip-cat';cat.position.set(.52,top,-1.32);parent.add(cat);const orange=m.standard('#d98a22',{roughness:.28});
 const body=sphere(cat,'tip-cat-body',0,.115,0,.075,orange);body.scale.y=1.35;sphere(cat,'tip-cat-head',0,.255,0,.086,orange);
 for(const x of [-.062,.062]){cyl(cat,'cat-pointed-ear',x,.334,0,0,.025,.065,orange,10);sphere(cat,'tip-cat-paw',x,.03,.023,.03,orange);}
 const mouth=sphere(cat,'black-tip-opening',0,.247,.072,.055,m.black);mouth.scale.set(1,.63,.18);p.text(cat,'ЧАЕВЫЕ',0,.235,.084,.08,.025,{size:130});
 for(const [x,color] of [[.44,'#70c52f'],[.65,'#168cce']]){const bell=new T.Group();bell.name='interactive-bell-'+x;bell.userData.dynamic=true;bell.userData.counterAction='bell';bell.userData.voice=x===.44?0:1;parent.add(bell);cyl(bell,'service-bell-black-base',x,top+.023,-1.14,.061,.066,.032,m.black);const b=sphere(bell,'coloured-service-bell',x,top+.047,-1.14,.053,m.standard(color,{roughness:.28}));b.scale.y=.40;}
 // Leaning white panel and low black cabinet on the right, visible in IMG_3995.
 box(parent,'right-low-cabinet',1.69,.42,-2.10,.38,.80,.65,m.black);
 const panel=box(parent,'leaning-white-display-panel',1.64,1.13,-2.10,.035,.67,.62,m.white);panel.rotation.z=.1;
 // Boxed games on the bottom shelf of the table, IMG_3998.
 for(let i=0;i<3;i++)box(parent,'table-board-game',1.12,.30+i*.045,1.25,.29-i*.045,.044,.24-i*.02,m.standard(['#e3e1d6','#b8a382','#9b6044'][i]));
 // Wooden branch with knotted cream/charcoal cords beside the bar, IMG_3981.
 for(let i=0;i<8;i++)rod(parent,[-1.81,2.24+Math.sin(i*.6)*.02,-.62+i*.07],[-1.81,2.24+Math.sin((i+1)*.6)*.02,-.55+i*.07],.014,m.standard('#80684f'));
 for(let i=0;i<34;i++){const z=-.59+i*.015,y=1.80+Math.abs(i-17)*.015;rod(parent,[-1.79,2.23,z],[-1.79,y,z+.016],.003,m.standard(i%4?'#c7bda3':'#424645'));}
}
