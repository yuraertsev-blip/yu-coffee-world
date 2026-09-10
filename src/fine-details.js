import * as T from 'three';
// Last pass against IMG_3987, 3991, 3993, 3998: silhouettes, rims and small fittings.
// Applied before batching; all additions are editable geometry, not a flattened room photo.
export function addPhotoFineDetails(cafe,rear,m,p){
 const {box,cyl,sphere,rod,plane,text}=p,steel=m.metal;
 const satin=m.standard('#898e92',{metalness:.88,roughness:.3}),black=m.standard('#15191d',{roughness:.36});
 const clear=new T.MeshPhysicalMaterial({color:'#d9e4e4',transparent:true,opacity:.19,roughness:.08,depthWrite:false});
 function tube(g,name,points,r,mat=steel){const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const mesh=new T.Mesh(new T.TubeGeometry(path,32,r,6,false),mat);mesh.name=name;g.add(mesh);return mesh;}
 function ring(g,name,x,y,z,r,t,mat=steel,rotX=0){const mesh=new T.Mesh(new T.TorusGeometry(r,t,6,32),mat);mesh.name=name;mesh.position.set(x,y,z);mesh.rotation.x=rotX;g.add(mesh);return mesh;}
 function removeNamed(g,name){const found=[];g.traverse(o=>{if(o.name===name)found.push(o);});for(const o of found){o.removeFromParent();o.geometry?.dispose();}}
 const machine=rear.getObjectByName('espresso-machine');
 // Appia's side profile is high at the back and leans towards the drip tray.
 removeNamed(machine,'curved-black-machine-cheek');
 const profile=new T.Shape();profile.moveTo(-.235,.10);profile.lineTo(-.23,.48);profile.quadraticCurveTo(-.23,.57,-.15,.57);profile.lineTo(.14,.54);profile.quadraticCurveTo(.245,.52,.245,.45);profile.lineTo(.19,.20);profile.quadraticCurveTo(.18,.065,.06,.06);profile.lineTo(-.17,.06);profile.quadraticCurveTo(-.235,.06,-.235,.10);
 for(const x of [-.325,.275]){const geo=new T.ExtrudeGeometry(profile,{depth:.05,steps:1,bevelEnabled:true,bevelSegments:4,bevelSize:.012,bevelThickness:.012,curveSegments:16});const panel=new T.Mesh(geo,black);panel.name='sculpted-simonelli-side-shell';panel.rotation.y=-Math.PI/2;panel.position.x=x+.05;machine.add(panel);}
 for(const x of [-.24,.24]){tube(machine,'bent-steam-wand',[[x,.37,.17],[x*1.07,.28,.24],[x*1.16,.16,.31],[x*1.2,.14,.31]],.006,satin);cyl(machine,'wand-end-nozzle',x*1.2,.132,.31,.011,.007,.02,satin);}
 ring(machine,'pressure-gauge-bezel',-.08,.24,-.044,.041,.004,satin);
 for(let i=0;i<11;i++){const a=-Math.PI*.8+i*Math.PI*.16;rod(machine,[-.08+Math.sin(a)*.029,.24+Math.cos(a)*.029,-.042],[-.08+Math.sin(a)*.034,.24+Math.cos(a)*.034,-.042],.001,black);}
 for(const x of [-.19,.19])box(machine,'machine-front-screw',x,.433,.255,.005,.005,.003,satin);
 box(machine,'barista-towel',.25,.152,.16,.08,.012,.19,m.standard('#74946d',{bumpMap:m.photo('weave',2,3),bumpScale:.001}),.006);
 // Tamping pad, steel tamper and knock box adjacent to the sink.
 const tools=new T.Group();tools.name='barista-tamping-tools';tools.position.set(-1.23,1.032,-3.40);tools.rotation.y=Math.PI/2;rear.add(tools);
 box(tools,'silicone-tamping-mat',0,.006,0,.22,.012,.19,black,.022);
 cyl(tools,'steel-tamper-foot',.043,.02,.005,.031,.031,.02,satin);cyl(tools,'steel-tamper-handle',.043,.062,.005,.016,.019,.065,satin);sphere(tools,'tamper-handle-top',.043,.098,.005,.019,satin);
 cyl(tools,'coffee-distributor',-.049,.032,.015,.032,.032,.04,black);ring(tools,'distributor-rim',-.049,.054,.015,.029,.002,satin,Math.PI/2);
 const grinder=rear.getObjectByName('coffee-grinder');text(grinder,'SIMONELLI',0,.395,.10,.135,.027,{size:100,color:'#d6d5cb'});for(let i=0;i<8;i++)ring(grinder,'grinder-doser-ring',0,.222+i*.016,.12,.073,.0016,satin,Math.PI/2);
 const syrup=rear.getObjectByName('left-syrups');
 for(let i=0;i<6;i++){
  const x=-.40+i*.155;
  const shoulder=new T.Mesh(new T.LatheGeometry([new T.Vector2(.038,.22),new T.Vector2(.035,.25),new T.Vector2(.022,.273),new T.Vector2(.016,.29)],24),m.standard(['#aa8b5c','#675574','#b3a58e'][i%3],{roughness:.3,metalness:.12}));shoulder.name='rounded-syrup-bottle-shoulder';shoulder.position.x=x;syrup.add(shoulder);
  plane(syrup,'original-syrup-label',x,.145,.040,.063,.13,m.photoMaterial(i%2?'syrup-lavender-label':'syrup-vanilla-label'));
  for(let k=0;k<4;k++)ring(syrup,'bottle-neck-thread',x,.302+k*.006,0,.017,.001,black,Math.PI/2);
 }
 // Open cups/pitchers replace capped cylinders: rims remain visible from above.
 const rack=rear.getObjectByName('metal-dish-drainer');removeNamed(rack,'draining-milk-pitcher');
 for(const x of [-.24,.08,.25]){const points=[[.048,0],[.055,.015],[.064,.165],[.066,.18],[.060,.18],[.058,.025],[.048,.020]].map(([r,y])=>new T.Vector2(r,y));const pitcher=new T.Mesh(new T.LatheGeometry(points,32),satin);pitcher.name='hollow-milk-pitcher';pitcher.position.set(x,.015,.01);rack.add(pitcher);ring(rack,'pitcher-rolled-rim',x,.195,.01,.063,.002,satin,Math.PI/2);}
 // Ice maker: clear forward lid, inner ice basket and large circular side fan.
 const ice=rear.getObjectByName('countertop-ice-maker');removeNamed(ice,'ice-maker-black-lid');removeNamed(ice,'clear-ice-maker-lid');
 box(ice,'ice-maker-back-control-cover',0,.388,-.127,.32,.022,.10,black,.014);
 box(ice,'ice-basket-dark-cavity',0,.372,.038,.265,.009,.245,black,.018);
 for(let i=0;i<7;i++)box(ice,'white-ice-basket-slot',-.11+i*.036,.377,.038,.009,.015,.19,m.white);
 box(ice,'transparent-hinged-lid',0,.397,.044,.319,.022,.265,clear,.014);
 for(const x of [-.16,.16])box(ice,'clear-lid-edge',x,.395,.044,.009,.035,.27,m.white,.004);
 for(let i=0;i<7;i++){const icebit=box(ice,'visible-ice-cube',-.09+(i%3)*.072,.386,-.04+Math.floor(i/3)*.062,.039,.024,.043,clear,.008);icebit.rotation.y=i*.7;}
 box(ice,'ice-lid-lifting-grip',0,.393,.178,.10,.03,.018,m.white,.006);
 const fan=new T.Group();fan.name='ice-maker-circular-fan';fan.position.set(.161,.20,0);fan.rotation.y=Math.PI/2;ice.add(fan);
 const disk=new T.Mesh(new T.CircleGeometry(.085,40),black);fan.add(disk);for(const r of [.033,.045,.057,.07,.083])ring(fan,'fan-concentric-grille',0,0,.003,r,.0018,satin);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;rod(fan,[0,0,.004],[Math.cos(a)*.083,Math.sin(a)*.083,.004],.002,satin);}sphere(fan,'fan-hub',0,0,.004,.013,black);
 // Small gold magnets and hanging keychain on the aceline door, IMG_3984.
 const fridge=rear.getObjectByName('right-fridge-aceline'),gold=m.standard('#baa255',{metalness:.7,roughness:.28});
 ring(fridge,'fridge-keyring',-.22,.72,.371,.013,.002,gold);for(let i=0;i<5;i++)ring(fridge,'keychain-link',-.22,.704-i*.012,.373,.005,.001,gold);
 text(fridge,'$',-.22,.617,.376,.027,.038,{size:300,color:'#d6bd69'});
 for(const [x,y] of [[-.20,.42],[.22,.18]]){const ornament=sphere(fridge,'small-gold-fridge-magnet',x,y,.375,.019,gold);ornament.scale.set(1.4,.6,.16);}
 // Engraved ornament follows the varying radius of the darbuka body.
 const drum=rear.getObjectByName('silver-goblet-drum');
 function drumRadius(y){const pts=[[0,.11],[.04,.13],[.18,.085],[.27,.095],[.39,.16],[.43,.17]];for(let i=1;i<pts.length;i++)if(y<=pts[i][0]){const t=(y-pts[i-1][0])/(pts[i][0]-pts[i-1][0]);return pts[i-1][1]*(1-t)+pts[i][1]*t;}return .17;}
 for(let j=0;j<12;j++){const a=j*Math.PI/6;const points=[];for(let k=0;k<32;k++){const y=.035+k*.0105,angle=a+Math.sin(k/31*Math.PI*3)*.11,r=drumRadius(y)+.0015;points.push([Math.cos(angle)*r,y,Math.sin(angle)*r]);}tube(drum,'engraved-drum-scroll',points,.0013,satin);}
 for(const y of [.045,.075,.355,.382])ring(drum,'drum-ornamental-band',0,y,0,drumRadius(y)+.002,.0015,satin,Math.PI/2);
 // The orange tip cat has a broad head and opening, small body, crown, and face lines.
 const cat=cafe.getObjectByName('orange-tip-cat');
 removeNamed(cat,'tip-cat-head');removeNamed(cat,'cat-pointed-ear');removeNamed(cat,'black-tip-opening');removeNamed(cat,'lettering');
 const orange=m.standard('#d98a22',{roughness:.3});
 const head=sphere(cat,'broad-tip-cat-head',0,.213,0,.102,orange);head.scale.set(1.12,1,.81);
 const mouth=new T.Mesh(new T.CircleGeometry(.080,48),new T.MeshBasicMaterial({color:'#08090a'}));mouth.name='wide-oval-tip-opening';mouth.position.set(0,.17,.087);mouth.scale.set(1.15,.56,1);cat.add(mouth);const lip=ring(cat,'rounded-orange-mouth-lip',0,.17,.089,.081,.003,orange);lip.scale.set(1.15,.56,1);
 for(const side of [-1,1]){const ear=new T.Shape();ear.moveTo(side*.042,.282);ear.lineTo(side*.101,.328);ear.quadraticCurveTo(side*.117,.27,side*.092,.255);ear.closePath();const mesh=new T.Mesh(new T.ExtrudeGeometry(ear,{depth:.018,bevelEnabled:true,bevelSize:.005,bevelThickness:.005,bevelSegments:3}),orange);mesh.position.z=-.008;cat.add(mesh);tube(cat,'cat-closed-smiling-eye',[[side*.027,.242,.079],[side*.041,.248,.078],[side*.057,.241,.073]],.0016,black);for(let i=0;i<3;i++)tube(cat,'cat-whisker',[[side*.073,.217-i*.008,.065],[side*.092,.219-i*.01,.056],[side*.10,.224-i*.012,.043]],.0012,black);}
 const nose=sphere(cat,'gold-cat-nose',0,.221,.085,.008,gold);nose.scale.y=.5;
 ring(cat,'gold-cat-collar',0,.108,0,.055,.003,gold,Math.PI/2);sphere(cat,'collar-bell',0,.099,.058,.009,gold);
 ring(cat,'gold-crown-base',0,.318,0,.027,.005,gold,Math.PI/2);
 for(let i=0;i<5;i++){const a=i*Math.PI*.4,x=Math.cos(a)*.027,z=Math.sin(a)*.027;rod(cat,[x,.316,z],[x*1.18,.361+(i%2)*.007,z*1.18],.004,gold);sphere(cat,'crown-round-tip',x*1.18,.361+(i%2)*.007,z*1.18,.006,gold);}
 // Keep the private payment number in the photo out of the scene; only the opening is modelled.
 const caddy=cafe.getObjectByName('black-counter-organizer');
 plane(caddy,'organizer-original-logo',0,.145,.011,.105,.057,m.photoMaterial('organizer-coffee-logo'));
 for(let i=0;i<16;i++)box(caddy,'separate-paper-napkin',.025,.082+i*.0034,.10,.19,.0015,.18,m.standard(i%2?'#3a4049':'#474c53'));
 for(let i=0;i<40;i++)ring(caddy,'open-straw-rim',-.235+(i%8)*.022,.41+(i%3)*.005,-.17+Math.floor(i/8)*.025,.0035,.0007,m.dark,Math.PI/2);
 for(let i=0;i<8;i++)ring(caddy,'stacked-plastic-lid',.07,.19+i*.012,-.10,.050,.0018,m.white,Math.PI/2);
 const menu=new T.Group();menu.name='autumn-counter-menu';menu.position.set(.27,1.153,-1.51);menu.rotation.x=-.13;cafe.add(menu);
 box(menu,'menu-holder-foot',0,.006,0,.19,.012,.10,m.wood);box(menu,'menu-holder-frame',0,.155,0,.19,.30,.012,steel,.004);plane(menu,'original-autumn-menu',0,.155,.008,.18,.29,m.photoMaterial('autumn-menu'));
 // Small black character beside the tip cat, with cream mask and red coin dish.
 const figure=new T.Group();figure.name='black-mask-coin-figure';figure.position.set(.40,1.153,-1.65);cafe.add(figure);
 const body=sphere(figure,'rounded-black-figure',0,.17,0,.065,black);body.scale.set(.95,2.05,.72);
 const mask=sphere(figure,'cream-oval-mask',0,.25,.044,.04,m.white);mask.scale.set(.83,1.30,.16);
 for(const x of [-.015,.015]){const eye=sphere(figure,'mask-eye',x,.262,.051,.005,black);eye.scale.y=.6;box(figure,'violet-mask-mark',x,.249,.052,.004,.012,.002,m.standard('#656082'));}
 tube(figure,'figure-serving-arm',[[-.037,.16,0],[-.073,.16,.055],[-.065,.17,.1]],.008,black);
 cyl(figure,'red-coin-dish',-.067,.18,.11,.048,.043,.009,m.standard('#a7372b',{roughness:.36}),32);cyl(figure,'small-coin',-.073,.187,.11,.014,.014,.002,steel,20);
 // More irregular muffin tops and dark filling, rather than smooth pastry spheres.
 const tops=[];cafe.traverse(o=>{if(o.name==='rounded-muffin-top')tops.push(o);});
 tops.forEach((o,i)=>{const a=o.geometry.attributes.position;for(let j=0;j<a.count;j++){const x=a.getX(j),y=a.getY(j),z=a.getZ(j),r=1+.055*Math.sin(x*183+z*89)*Math.cos(y*210);a.setXYZ(j,x*r,y*r*.70,z*r);}o.geometry.computeVertexNormals();for(let k=0;k<5;k++){const angle=k*2.4+i,x=o.position.x+Math.cos(angle)*.024,z=o.position.z+Math.sin(angle)*.024;const filling=sphere(cafe,'muffin-dark-berry',x,o.position.y+.023,z,.008,m.standard(i%3?'#39271e':'#6a7750'));filling.scale.y=.5;}});
 plane(cafe,'cartagena-game-box-face',1.12,.355,1.374,.24,.046,m.photoMaterial('table-game-cartagena'));
 // The window mobile has two suspension rings, not floating individual strings.
 const mobile=cafe.getObjectByName('white-birds-and-crescent-mobile');
 for(const r of [.24,.18])ring(mobile,'hanging-mobile-ring',0,-.06,0,r,.0035,satin,Math.PI/2);
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3;rod(mobile,[0,.015,0],[Math.cos(a)*.24,-.06,Math.sin(a)*.24],.0018,satin);}
 // Cable and dry twig next to the tall souvenir unit.
 for(let i=0;i<8;i++){const z=1.99+Math.sin(i*.4)*.035,y=1.55+i*.15;rod(cafe,[1.82,y,z],[1.82,y+.15,1.99+Math.sin((i+1)*.4)*.035],.004,m.standard('#81755e'));if(i%2)rod(cafe,[1.82,y,z],[1.81,y+.18,z+.11],.0025,m.standard('#81755e'));}
}
