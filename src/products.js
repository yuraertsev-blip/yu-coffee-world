import * as T from 'three';
// All printed faces are crops of the user's 4K video. No reconstructed lettering.
export function addCounterProducts(g,m,p){
 const {box,plane,cyl,sphere}=p,wood=m.standard('#d7c69b'),paper=m.standard('#dccb85');
 for(let row=0;row<5;row++){
  const y=1.16+row*.105,z=-1.22-row*.095;
  box(g,'stepped-tea-display',-1.31,y,z,.85,.045,.16,wood);
  for(let col=0;col<4;col++){
   const x=-1.64+col*.21,name=['tea-pouch-a','tea-pouch-b','tea-pouch-c','tea-pouch-d'][(col+row)%4];
   const bag=new T.Group();bag.name='tea-window-pouch';bag.position.set(x,y+.155,z);bag.rotation.y=(col-1.5)*.018;g.add(bag);
   const mesh=box(bag,'filled-paper-pouch',0,0,0,.19,.30,.045,paper,.012);mesh.scale.z=.85;
   plane(bag,'photographed-tea-label-and-window',0,0,.024,.185,.296,m.photoMaterial(name));
   box(bag,'sealed-top-fold',0,.147,0,.19,.009,.019,paper);
  }
 }
 const tray=new T.Group();tray.name='drip-display-carton';tray.position.set(-.53,1.16,-1.29);g.add(tray);
 box(tray,'carton-base',0,.013,0,.48,.025,.33,wood);
 for(const x of [-.25,.25])box(tray,'carton-side',x,.055,0,.012,.11,.35,wood);
 box(tray,'carton-front',0,.055,.175,.5,.11,.012,m.standard('#8f755b'));
 for(let col=0;col<2;col++)for(let row=0;row<7;row++){
  const x=-.12+col*.24,z=.115-row*.042,y=.13+row*.009;
  box(tray,'sealed-drip-envelope',x,y,z,.217,.22,.013,col?m.white:m.black,.004);
  plane(tray,'original-drip-print',x,y,z+.008,.21,.211,m.photoMaterial(col?'drip-white':'drip-black'));
 }
 plane(tray,'original-drip-price',0,.28,.007,.19,.13,m.photoMaterial('drip-price'));
 box(g,'red-tea-box',-.63,1.22,-1.65,.26,.13,.2,m.standard('#94342d'));
 const lid=plane(g,'red-box-printed-lid',-.63,1.29,-1.65,.26,.2,m.photoMaterial('tea-red-box'));lid.rotation.x=-Math.PI/2;
 const gold=m.standard('#dac544',{roughness:.45});
 const cat=new T.Group();cat.name='yellow-lucky-cat';cat.position.set(-.78,1.3,-1.68);g.add(cat);
 sphere(cat,'lucky-cat-body',0,.09,0,.068,gold);sphere(cat,'lucky-cat-head',0,.18,0,.061,gold);
 for(const x of [-.045,.045])cyl(cat,'cat-ear',x,.237,0,0,.023,.045,gold,8);
 for(const x of [-.024,.024]){const eye=box(cat,'closed-eye',x,.187,.055,.019,.004,.005,m.dark);eye.rotation.z=x*5;}
 sphere(cat,'raised-paw',.075,.21,0,.026,gold);sphere(cat,'small-cat-nose',0,.17,.06,.008,m.standard('#9e6150'));

}
export function addShelfProducts(shelf,m,p){
 const {box,plane,cyl,sphere}=p,kraft=m.standard('#c6b68e');
 function mushroom(x,y,z){cyl(shelf,'ribbed-silver-mini-lamp',x,y+.065,z,.025,.039,.13,m.metal,24);const dome=sphere(shelf,'mushroom-lamp-shade',x,y+.15,z,.069,m.metal);dome.scale.y=.46;for(let i=0;i<16;i++){const a=i*Math.PI/8;cyl(shelf,'lamp-flute',x+Math.cos(a)*.027,y+.065,z+Math.sin(a)*.027,.0015,.0015,.12,m.white,4);}}
 function kit(x,y,z,variant){
  const kit=new T.Group();kit.name='open-mosaic-gift-kit';kit.position.set(x,y,z);shelf.add(kit);
  box(kit,'gift-box-bottom',0,.012,0,.28,.022,.24,kraft);box(kit,'gift-box-front',0,.05,.12,.28,.08,.014,kraft);
  for(const side of [-1,1])box(kit,'gift-box-side',side*.14,.05,0,.014,.08,.24,kraft);
  const back=box(kit,'open-cardboard-lid',0,.18,-.105,.28,.30,.012,kraft,.01);back.rotation.x=-.08;
  plane(kit,'original-gift-certificate',0,.19,-.087,.25,.105,m.photoMaterial('gift-certificate'));
  for(let i=0;i<3;i++){
   const disc=new T.Mesh(new T.CylinderGeometry(.061,.061,.008,32),m.standard('#ded5b4'));disc.rotation.x=Math.PI/2;disc.position.set((i%2-.5)*.105,.11+(i===2?.065:0),.01+i*.022);kit.add(disc);
   const face=new T.Mesh(new T.CircleGeometry(.060,32),m.photoMaterial(variant?'gift-mosaic-town':'gift-mosaic-round'));face.position.copy(disc.position);face.position.z+=.005;kit.add(face);
  }
  for(let i=0;i<6;i++)sphere(kit,'small-paint-pot',-.10+i*.038,.047,.075,.016,m.standard(['#e8b24f','#c881a4','#8aa9b7','#ede5c5','#ae9bc5','#73945d'][i]));
 }
 for(const y of [.58,1.07])for(const x of [-.36,0,.36]){if(y<.7&&x===0)continue;kit(x,y,0,y<.7);}
 for(const [x,name] of [[-.29,'shelf-qr-a'],[.06,'shelf-qr-b']]){box(shelf,'wood-card-holder',x,1.60,0,.21,.025,.09,kraft);plane(shelf,'original-shelf-card',x,1.755,-.015,.20,.29,m.photoMaterial(name));}
 plane(shelf,'zodiac-chart-blue',.28,1.76,-.04,.17,.26,m.photoMaterial('zodiac-blue'));
 plane(shelf,'zodiac-chart-gold',.47,1.76,-.04,.17,.26,m.photoMaterial('zodiac-gold'));
 plane(shelf,'zodiac-mosaic',.33,1.66,.035,.12,.12,m.photoMaterial('zodiac-mosaic'));
 mushroom(-.49,1.57,.04);mushroom(.23,1.57,.035);mushroom(.47,1.57,.075);
 plane(shelf,'event-flyer',0,.77,.075,.21,.30,m.photoMaterial('gift-event-poster'));
 plane(shelf,'original-gift-price',.01,1.10,.16,.16,.10,m.photoMaterial('gift-price'));
 const lantern=new T.Group();lantern.name='silver-lantern';lantern.position.set(0,2.18,0);shelf.add(lantern);
 cyl(lantern,'lantern-base',0,.018,0,.076,.076,.032,m.metal,24);cyl(lantern,'lantern-roof',0,.24,0,.035,.085,.075,m.metal,24);
 for(const x of [-.05,.05])for(const z of [-.05,.05])cyl(lantern,'lantern-frame',x,.12,z,.005,.005,.2,m.metal,6);
 cyl(lantern,'white-candle',0,.075,0,.025,.025,.11,m.white,16);
}
