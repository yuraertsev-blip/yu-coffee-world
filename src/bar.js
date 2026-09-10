import * as T from 'three';
// Looking from the entrance: the working surface is left, the two fridges right.
// IMG_3982 / 3991 establish the left sequence; IMG_3992 / 3993 the right pair.
export const BAR_LAYOUT={machine:{x:-1.48,z:-2.25},sink:{x:-1.52,z:-3.79},fridges:[{x:1.55,z:-3.96,height:.91},{x:1.55,z:-3.25,height:.85}],view:{x:.45,z:-3.05}};
export function addBarEquipment(g,m,p,solid,v){
 const {box,cyl,sphere,rod,plane,text,bottle,cup}=p;
 const steel=m.standard('#b9bdc0',{metalness:.92,roughness:.24}),black=m.standard('#15181b',{roughness:.32,metalness:.18});
 const clear=new T.MeshPhysicalMaterial({color:'#e0e8e6',transparent:true,opacity:.2,roughness:.12,depthWrite:false});
 function group(name,x,y,z,angle=0){const a=new T.Group();a.name=name;a.position.set(x,y,z);a.rotation.y=angle;a.userData.reference='IMG_3991 / IMG_3993';g.add(a);return a;}
 // One continuous LEFT cabinet. The sink cutout is an actual opening in the top.
 box(g,'left-base-cabinet',-1.53,.48,-3.15,.66,.96,2.57,m.dark);solid(-1.53,-3.15,.72,2.6);
 for(const [z,d] of [[-2.69,1.68],[-4.30,.28]])box(g,'left-oak-worktop',-1.53,1,z,.72,.055,d,m.wood,.008);
 for(const x of [-1.855,-1.205])box(g,'sink-worktop-side',x,1,-3.835,.07,.055,.63,m.wood);
 for(const z of [-2.05,-2.6,-3.15,-3.7,-4.22]){box(g,'left-cabinet-door',-1.188,.47,z,.024,.88,.49,m.dark,.006);rod(g,[-1.168,.8,z-.14],[-1.168,.8,z+.14],.012,black);}
 // Nuova Simonelli: rounded black cheeks, stainless control fascia, open brew bay.
 const a=BAR_LAYOUT.machine,machine=group('espresso-machine',a.x,1.03,a.z,Math.PI/2);
 box(machine,'espresso-lower-body',0,.075,0,.68,.15,.52,black,.06);
 box(machine,'espresso-rear',0,.32,-.18,.65,.47,.12,black,.05);
 for(const x of [-.295,.295]){box(machine,'curved-black-machine-cheek',x,.32,-.01,.10,.50,.51,black,.045);rod(machine,[x,.42,-.23],[x,.37,.24],.007,steel);}
 box(machine,'stainless-brew-bay',0,.25,-.073,.52,.29,.04,steel,.012);
 box(machine,'control-housing',0,.47,.05,.61,.16,.40,steel,.025);
 plane(machine,'photographed-simonelli-controls',0,.47,.253,.53,.105,m.photoMaterial('espresso-control'));
 box(machine,'cup-warming-top',0,.558,-.015,.61,.015,.37,steel,.012);
 for(let i=0;i<16;i++)box(machine,'cup-warmer-grid',-.27+i*.035,.568,-.01,.008,.007,.30,black);
 box(machine,'extended-drip-tray',0,.115,.21,.61,.04,.43,steel,.018);
 for(let i=0;i<28;i++)box(machine,'drip-tray-grating',-.28+i*.021,.138,.21,.007,.005,.35,black);
 cyl(machine,'single-brew-group',0,.345,.20,.079,.065,.12,steel,32);
 rod(machine,[0,.29,.23],[-.09,.275,.47],.023,black);
 const gauge=new T.Mesh(new T.CircleGeometry(.038,24),m.white);gauge.position.set(-.08,.24,-.048);machine.add(gauge);rod(machine,[-.08,.24,-.046],[-.06,.256,-.046],.002,black);
 for(const x of [-.245,.245]){rod(machine,[x,.40,.19],[x*1.15,.17,.33],.009,steel);rod(machine,[x,.39,.19],[x,.45,.24],.022,black);}
 for(const x of [-.2,0,.2]){cup(machine,x,.58,-.05,.034);}
 for(const x of [-.26,.26])for(const z of [-.17,.17])cyl(machine,'machine-rubber-foot',x,-.014,z,.036,.04,.05,black);
 // Grinder and compact blender stand between the espresso machine and sink.
 const grinder=group('coffee-grinder',-1.47,1.03,-2.92,Math.PI/2);
 cyl(grinder,'grinder-motor',0,.18,0,.10,.11,.35,black);box(grinder,'grinder-foot',0,.025,.05,.24,.05,.29,black,.028);
 cyl(grinder,'bean-hopper',0,.52,0,.125,.075,.32,m.standard('#b7a48e',{map:m.photo('hopper-beans',2,1),roughness:.58}),32);cyl(grinder,'hopper-transparent-shell',0,.52,0,.13,.078,.325,clear,32);cyl(grinder,'hopper-black-lid',0,.69,0,.137,.137,.018,black);
 cyl(grinder,'doser',0,.30,.12,.073,.073,.18,steel);box(grinder,'doser-window',0,.32,.19,.10,.1,.015,black);rod(grinder,[-.06,.10,.12],[.06,.10,.12],.009,steel);
 cyl(g,'small-blender-base',-1.47,1.09,-3.26,.075,.09,.13,black);cyl(g,'small-blender-jug',-1.47,1.29,-3.26,.07,.06,.27,steel);cyl(g,'blender-lid',-1.47,1.435,-3.26,.074,.074,.018,black);
 // Recessed black sink with draining basket and high curved mixer, LEFT only.
 const s=BAR_LAYOUT.sink,sink=group('left-sink',s.x,1.025,s.z,Math.PI/2);
 box(sink,'sink-bottom',0,-.15,0,.59,.022,.46,black,.02);
 for(const x of [-.3,.3])box(sink,'sink-sidewall',x,-.07,0,.018,.18,.48,black);
 for(const z of [-.23,.23])box(sink,'sink-endwall',0,-.07,z,.60,.18,.018,black);
 for(const x of [-.32,.32])box(sink,'sink-lip',x,.015,0,.045,.02,.55,black,.008);
 for(const z of [-.26,.26])box(sink,'sink-lip',0,.015,z,.65,.02,.035,black);
 for(let i=0;i<9;i++)rod(sink,[-.27+i*.027,-.035,-.19],[-.27+i*.027,-.035,.19],.004,black);
 cyl(sink,'sink-drain',.12,-.136,0,.035,.035,.008,steel);
 const tapCurve=new T.CatmullRomCurve3([new T.Vector3(.11,0,-.23),new T.Vector3(.11,.27,-.23),new T.Vector3(.11,.38,-.14),new T.Vector3(.11,.28,.04)]);
 const tap=new T.Mesh(new T.TubeGeometry(tapCurve,32,.019,10,false),black);tap.name='black-gooseneck-sink-tap';sink.add(tap);rod(sink,[.17,.055,-.23],[.22,.14,-.23],.009,black);
 // Syrups behind the sink, labelled bottles facing into the bar.
 const syrup=group('left-syrups',-1.77,1.03,-3.48,Math.PI/2);
 for(let i=0;i<6;i++){bottle(syrup,-.40+i*.155,0,0,['#aa8b5c','#675574','#b3a58e'][i%3]);rod(syrup,[-.40+i*.155,.355,0],[-.35+i*.155,.355,.04],.006,black);}
 // Open dark shelving, two stock bays followed by the dish rack bay.
 const shelves=group('left-wall-open-storage',-1.66,0,-2.94,Math.PI/2);
 for(const y of [1.73,2.22,2.76])box(shelves,'left-wall-shelf',0,y,0,2.37,.045,.42,m.dark);
 for(const x of [-1.185,-.405,.375,1.185])box(shelves,'left-wall-divider',x,2.245,0,.04,1.07,.42,m.dark);
 for(let col=0;col<2;col++)for(let i=0;i<5;i++){const x=-1.08+col*.79+i*.13,h=.15+i%3*.045;cyl(shelves,'ingredient-storage-jar',x,1.77+h/2,.02,.055,.055,h,m.standard('#b5af90',{map:m.photo(i%2?'jar-citrus':'jar-tea'),roughness:.4}),24);cyl(shelves,'ingredient-jar-lid',x,1.78+h,.02,.059,.059,.018,black);box(shelves,'jar-small-black-label',x,1.83+h*.3,.077,.065,.028,.004,black);}
 for(let i=0;i<6;i++){const x=-1.02+i*.23;box(shelves,'coffee-stock-bag',x,2.43,.01,.19,.37,.09,i%2?m.white:black,.008);box(shelves,'bag-seal',x,2.62,.01,.19,.018,.034,m.dark);plane(shelves,'photo-coffee-stock-print',x,2.43,.058,.184,.36,m.photoMaterial(i%2?'stock-bag-white':'stock-bag-red'));}
 // Last bay is an open stainless drainer, with the cream wall visible through it.
 const rack=group('metal-dish-drainer',-1.65,1.78,-3.72,Math.PI/2);
 for(const y of [0,.54]){for(let i=0;i<19;i++){let x=-.35+i*.04;rod(rack,[x,y,-.17],[x,y,.19],.0025,steel);}for(const z of [-.17,.19])rod(rack,[-.36,y,z],[.37,y,z],.004,steel);rod(rack,[-.36,y+.07,.19],[.37,y+.07,.19],.004,steel);for(let i=0;i<10;i++)rod(rack,[-.34+i*.075,y,.19],[-.34+i*.075,y+.07,.19],.0025,steel);}
 for(let i=0;i<5;i++){let x=-.29+i*.135;cyl(rack,'upturned-drinking-glass',x,.64,.005,.044,.052,.17,clear,24);for(let j=0;j<10;j++){let a=j*Math.PI/5;rod(rack,[x+Math.cos(a)*.048,.57,Math.sin(a)*.048],[x+Math.cos(a)*.04,.71,Math.sin(a)*.04],.0016,steel);}}
 for(const x of [-.24,.08,.25]){cyl(rack,'draining-milk-pitcher',x,.105,.01,.065,.052,.18,steel,24);const h=new T.Mesh(new T.TorusGeometry(.055,.006,6,16),steel);h.position.set(x+.06,.10,.01);rack.add(h);}
 v.potted(g,-1.62,2.79,-2.12,.43,'flowers');v.potted(g,-1.65,2.79,-3.62,.55,'dracaena');
 // Two independent undercounter refrigerators, along the RIGHT wall.
 BAR_LAYOUT.fridges.forEach((f,i)=>{
  const fridge=group(i?'right-fridge-aceline':'right-fridge-larger',f.x,0,f.z,-Math.PI/2);fridge.userData.kind='refrigerator';
  box(fridge,'refrigerator-body',0,f.height/2,0,.64,f.height,.62,black,.015);
  box(fridge,'door-rubber-gasket',0,f.height/2,.321,.618,f.height-.045,.019,m.black,.006);
  box(fridge,'separate-fridge-door',0,f.height/2,.341,.607,f.height-.062,.035,m.standard(i?'#25292d':'#171b20',{metalness:.42,roughness:.25}),.012);
  box(fridge,'integrated-fridge-handle',0,f.height-.05,.367,.48,.023,.03,black,.011);
  box(fridge,'fridge-top',0,f.height+.008,0,.655,.02,.65,black,.01);
  text(fridge,i?'aceline':'',.20,f.height-.16,.362,.15,.025,{size:120,color:'#a3a7aa'});
  for(const x of [-.25,.25])for(const z of [-.23,.23])cyl(fridge,'fridge-adjustable-foot',x,.018,z,.022,.024,.035,black);
  solid(f.x,f.z,.67,.67);
  if(i===0){
   const ice=new T.Group();ice.name='countertop-ice-maker';ice.position.set(-.06,f.height+.035,0);fridge.add(ice);
   box(ice,'ice-maker-stainless-body',0,.19,0,.31,.38,.36,steel,.036);box(ice,'ice-maker-black-lid',0,.39,-.015,.32,.025,.36,black,.015);
   box(ice,'clear-ice-maker-lid',0,.365,.045,.315,.05,.25,clear,.012);
   for(let j=0;j<9;j++)box(ice,'ice-vent',.157,.13+j*.014,0,.005,.005,.17,black);
   box(ice,'ice-maker-control-panel',0,.399,-.08,.24,.004,.05,m.dark);sphere(ice,'ice-power-led',.075,.403,-.08,.006,m.standard('#8ba9ad',{emissive:'#72a8b0',emissiveIntensity:.5}));
   rod(fridge,[.23,f.height,.02],[.23,f.height+.36,.02],.009,black);const spot=cyl(fridge,'small-coloured-lamp',.23,f.height+.37,.02,.043,.043,.04,black);spot.rotation.x=Math.PI/2;const glow=new T.Mesh(new T.CircleGeometry(.034,24),m.standard('#819cc2',{emissive:'#7393bd',emissiveIntensity:.65}));glow.position.set(.23,f.height+.37,.044);fridge.add(glow);
  }else{
   box(fridge,'tea-tray',0,f.height+.035,0,.57,.04,.43,black,.018);
   for(let row=0;row<3;row++)for(let col=0;col<4;col++){const x=-.20+col*.13,z=.13-row*.1;box(fridge,'fridge-tea-pouch',x,f.height+.17,z,.12,.24,.03,m.standard('#d6c296'),.004);plane(fridge,'fridge-tea-window',x,f.height+.17,z+.017,.117,.235,m.photoMaterial(['tea-pouch-a','tea-pouch-b','tea-pouch-c','tea-pouch-d'][col]));}
   box(fridge,'side-tool-caddy',.39,f.height-.06,0,.12,.08,.34,black);for(let j=0;j<3;j++)cyl(fridge,'caddy-tea-strainer',.40,f.height+.005,-.1+j*.1,.027,.027,.07,steel);
  }
 });
 const drum=group('silver-goblet-drum',1.56,0,-2.70);
 const profile=[[.11,0],[.13,.04],[.085,.18],[.095,.27],[.16,.39],[.17,.43]];
 const geom=new T.LatheGeometry(profile.map(([r,y])=>new T.Vector2(r,y)),40);drum.add(new T.Mesh(geom,m.standard('#303236',{metalness:.6,roughness:.3})));
 cyl(drum,'drum-skin',0,.435,0,.157,.157,.012,m.white,40);for(let j=0;j<4;j++){const ring=new T.Mesh(new T.TorusGeometry(.166,.003,6,40),steel);ring.rotation.x=Math.PI/2;ring.position.y=.414+j*.006;drum.add(ring);}
 const cam=sphere(g,'left-wall-camera',-1.39,2.65,-4.08,.065,m.white);sphere(g,'camera-lens',-1.325,2.65,-4.08,.025,m.black);
 // Menu clip and sockets visible at the curtain edge.
 rod(g,[1.22,2.76,-4.33],[1.36,2.76,-4.13],.02,black);const spot=cyl(g,'menu-clamp-spotlight',1.36,2.77,-4.08,.045,.035,.12,black);spot.rotation.x=Math.PI/2;
 box(g,'rear-power-strip',1.21,1.73,-4.49,.075,.34,.038,m.white,.01);for(let i=0;i<3;i++)sphere(g,'power-plug',1.21,1.62+i*.10,-4.46,.026,black);
}
