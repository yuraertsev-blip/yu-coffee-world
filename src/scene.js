import * as T from 'three';
import {createMaterials} from './materials.js';
import {propFactory} from './props.js';
import {addCounterProducts,addShelfProducts} from './products.js';
import {addBarEquipment} from './bar.js';
import {addPhotoFineDetails,addPastryDetails} from './fine-details.js';
import {addInteriorDetails} from './interior-details.js';
import {createSeating} from './seating.js';
import {createVegetation} from './vegetation.js';
import {batchStatic} from './optimize.js';
// Video-informed manual reconstruction. Metres, Y up; storefront faces +Z.
// Dimensions estimated from door / floor-tile proportions, not surveyed.
export const SITE={cafe:{width:3.8,depth:9.6,height:3.05},bounds:{x:30,z:25},door:{x:1.2,z:5},inside:{x:0,z:2.7}};
export function makeWorld(scene){
 const m=createMaterials(),p=propFactory(m),{box,cyl,sphere,rod,plane,text,sofa,table,cup,bottle,plant}=p;
 const {bench,futon}=createSeating(m,p),v=createVegetation(m,p);
 const colliders=[],lamps=[];const groups={};
 function group(name){const g=new T.Group();g.name=name;g.userData={source:'IMG_3972 2.MOV',method:'manual-video-reference',units:'metres'};scene.add(g);groups[name]=g;return g;}
 function solid(x,z,w,d){colliders.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});}
 const terrain=group('pavement-and-flowerbeds');
 box(terrain,'paved-promenade',0,-.07,10,80,.12,32,m.paving);
 box(terrain,'lawn',0,-.13,22,90,.12,16,m.standard('#63764b'));
 // Video shows a pedestrian forecourt, not a road at the café door.
 for(const x of [-23,-11,1,13,25]){box(terrain,'raised-flowerbed',x,.06,11,10,.21,1.7,m.standard('#797c73'));box(terrain,'earth',x,.18,11,9.8,.035,1.48,m.soil);solid(x,11,10,1.7);}
 const building=group('residential-building');
 const plaster=m.plaster;
 box(building,'upper-storeys',0,9.1,-.9,66,11.4,12,plaster); // four residential floors
 box(building,'white-band',0,3.7,5.17,66,.7,.12,m.white);
 box(building,'rear-base',0,1.65,-5.5,66,3.3,2,m.standard('#cfc9bb'));
 // Non-café ground-floor interiors remain opaque and are not walkable.
 for(const [x,w] of [[-17.6,31.2],[17.6,31.2]]){box(building,'other-shop-volume',x,1.6,-.4,w,3.2,10.8,m.standard('#66685e'));solid(x,-.4,w,10.8);}
 const roofGroup=new T.Group();roofGroup.name='residential-roof';building.add(roofGroup);
 box(roofGroup,'metal-roof',0,14.97,-.9,66.7,.2,12.7,m.standard('#626565',{metalness:.45,roughness:.62}));
 for(let x=-32;x<=32;x+=2)rod(roofGroup,[x,15.03,5.4],[x,15.46,5.4],.022,m.metal);rod(roofGroup,[-33,15.46,5.4],[33,15.46,5.4],.022,m.metal);
 const windowMats=[m.photoMaterial('apartment-a'),m.photoMaterial('apartment-b')];
 for(let j=0;j<4;j++)for(let i=-9;i<=9;i++){const x=i*3.4-.45,y=5.1+j*2.72;
 box(building,'window-recess',x,y,5.13,1.46,1.7,.09,m.standard('#a9aaa1'));
 plane(building,'video-window',x,y,5.184,1.3,1.55,windowMats[(i+j+20)%2]);
 for(const side of [-1,1])box(building,'window-jamb',x+side*.68,y,5.23,.065,1.65,.11,m.frame);
 box(building,'window-top',x,y+.79,5.23,1.4,.06,.11,m.frame);box(building,'window-sill',x,y-.84,5.27,1.55,.06,.3,m.white);box(building,'window-mullion',x-.15,y,5.25,.05,1.6,.07,m.frame);
 if((i+20)%4===1&&j>0){box(building,'balcony-slab',x,y-.96,5.75,2,.16,1.35,m.white);box(building,'balcony-front',x,y-.43,6.36,1.94,.87,.055,m.white);for(const side of [-1,1]){rod(building,[x+side*.95,y-.89,5.15],[x+side*.95,y+.06,5.15],.025,m.metal);rod(building,[x+side*.95,y+.06,5.15],[x+side*.95,y+.06,6.4],.023,m.metal);for(let z=5.3;z<6.4;z+=.21)rod(building,[x+side*.95,y-.89,z],[x+side*.95,y+.06,z],.013,m.metal);}rod(building,[x-.99,y+.06,6.4],[x+.99,y+.06,6.4],.025,m.metal);}
 }
 for(const x of [-28,-15,4.8,19,31]){cyl(building,'drainpipe',x,8.4,5.46,.065,.065,13.1,m.white);for(let y=1.6;y<15;y+=2)box(building,'pipe-bracket',x,y,5.44,.19,.04,.16,m.metal);}
 box(building,'continuous-canopy',0,3.35,5.53,66,.16,1.16,m.standard('#97998d'));
 for(let x=-31;x<33;x+=8){plane(building,'Novgorod-photo-frieze',x,3.74,6.13,8,.72,m.photoMaterial(x< -7?'frieze-arcade':'fascia'));box(building,'frieze-bottom',x,3.36,6.13,8,.035,.055,m.frame);}
 const ends=group('adjacent-buildings-approximate');
 // Neighbouring cream / ochre volume visible in the street view at 00:30.
 box(ends,'ochre-neighbour',39,5.7,-.8,12,11.4,12,m.standard('#d4bea5'));
 for(let y=1.8;y<10.8;y+=2.6)for(let x=35;x<45;x+=2.5){box(ends,'neighbour-window-trim',x,y,5.25,1.55,1.85,.2,m.white);box(ends,'neighbour-glass',x,y,5.37,1.21,1.5,.03,m.standard('#8e9c9c',{metalness:.3,roughness:.25}));}
 for(const y of [3.5,10.5,11.35])box(ends,'neighbour-cornice',39,y,5.4,12.3,.18,.38,m.white);
 box(ends,'end-house',-39,6,-7,11,12,13,m.standard('#d5d0bd'));
 for(let y=1.8;y<12;y+=2.7)for(let x=-43;x<-34;x+=2.5){box(ends,'end-house-window',x,y,-.42,1.45,1.8,.09,m.frame);plane(ends,'end-house-glass',x,y,-.37,1.2,1.55,windowMats[1]);}
 const shops=group('shopfronts');
 for(let x=-31.5;x<33;x+=2.2){if(x>-2.7&&x<2.6)continue;box(shops,'brick-plinth',x,.27,5.3,2.2,.54,.24,m.brick);box(shops,'shop-pane',x,1.68,5.3,2.12,2.25,.035,m.standard(x>2?'#375e30':'#47534e',{metalness:.15,roughness:.3}));if(x<0)plane(shops,'neighbour-display',x,1.6,5.325,2.02,2.13,m.photoMaterial(x< -7?'shop-offers':'shop-window'));for(const side of [-1,1])box(shops,'shop-frame',x+side*1.08,1.73,5.37,.065,3.2,.12,m.frame);box(shops,'transom',x,2.69,5.37,2.2,.065,.12,m.frame);box(shops,'top-sign',x,3.02,5.32,2.1,.5,.05,m.standard('#354345'));}
 // Green supermarket entrance immediately to the right, as shown at 00:00.
 box(shops,'green-cladding',3.05,1.65,5.45,2.05,3.3,.15,m.standard('#427725'));
 box(shops,'supermarket-glass',3.1,1.55,5.55,1.25,2.37,.055,m.standard('#1b3823',{metalness:.25,roughness:.28}));
 for(const x of [2.44,3.1,3.76])box(shops,'green-door-frame',x,1.55,5.6,.055,2.48,.07,m.standard('#4c8e31'));
 text(shops,'8–22',3.43,2.23,5.61,.48,.24,{size:200});text(shops,'5',3.44,2.6,5.61,.22,.22,{color:'#fff',background:'#b13633',size:450});
 const cafe=group('yu-coffee-interior');
 box(cafe,'tiled-floor',0,.012,.2,3.8,.065,9.6,m.floor);
 for(const x of [-1.96,1.96]){box(cafe,'cream-wall',x,1.56,.2,.15,3.1,9.6,m.wall);solid(x,.2,.15,9.6);box(cafe,'skirting',x+(x<0?.085:-.085),.085,.2,.02,.12,9.6,m.standard('#aaa99f'));}
 box(cafe,'rear-wall',0,1.55,-4.65,3.9,3.1,.15,m.wall);solid(0,-4.65,3.9,.15);
 const ceiling=group('suspended-ceiling');
 box(ceiling,'ceiling',0,3.08,.2,3.8,.08,9.6,m.ceiling);
 const seam=m.standard('#adb0aa');for(let x=-1.9;x<2;x+=.6)box(ceiling,'ceiling-grid',x,3.028,.2,.018,.018,9.6,seam);for(let z=-4.6;z<5;z+=.6)box(ceiling,'ceiling-grid',0,3.027,z,3.8,.018,.018,seam);
 const led=m.standard('#ffffff',{emissive:'#ffffff',emissiveIntensity:1.4});
 for(const z of [-3.1,-.1,2.9]){box(ceiling,'LED-panel',.2,3.018,z,.575,.018,.575,led);const light=new T.PointLight('#fff4de',9,5,2);light.position.set(0,2.7,z);scene.add(light);lamps.push(light);}
 // Actual window left, single narrow entry right. All aperture geometry is open.
 box(cafe,'brick-under-window',-.97,.26,5,1.9,.52,.19,m.brick);solid(-.97,5,1.9,.19);
 plane(cafe,'front-window',-.97,1.65,5.015,1.82,2.23,m.glass);solid(-.97,5,1.9,.08);
 plane(cafe,'fixed-door-sidelight',.30,1.36,5.015,.58,2.56,m.glass);solid(.30,5,.64,.08);
 plane(cafe,'six-door-stickers',.30,1.5,5.039,.29,1.83,m.photoMaterial('door-stickers'));
 for(const x of [-1.92,-.02,.64,1.88]){box(cafe,'rubber-glazing-seal',x,1.7,5.026,.096,3.3,.05,m.dark);box(cafe,'white-front-frame',x,1.7,5.05,.075,3.3,.13,m.frame);solid(x,5,.075,.13);}
 box(cafe,'front-window-top',-.97,2.84,5.05,1.94,.07,.13,m.frame);box(cafe,'door-header',.94,2.67,5.05,1.93,.075,.13,m.frame);
 box(cafe,'stone-threshold',1.25,.036,5.05,1.16,.04,.27,m.standard('#a29e91'));
 box(cafe,'entrance-sign-backing',1.25,3.01,5.055,1.22,.54,.07,m.dark);plane(cafe,'coffee-and-mosaic-sign',1.25,3.01,5.098,1.15,.49,m.photoMaterial('coffee-sign'));
 for(const r of [.31,.245]){const ring=new T.Mesh(new T.RingGeometry(r-.03,r,64),m.white);ring.position.set(-.83,2.05,5.048);cafe.add(ring);}
 for(const x of [-1.30,-1.23])box(cafe,'logo-stroke',x,2.05,5.048,.028,.61,.003,m.white);box(cafe,'logo-link',-1.10,2.05,5.048,.26,.025,.003,m.white);text(cafe,'КОФЕ',-.95,1.54,5.048,.99,.3,{size:220,color:'#f4f4e9'});text(cafe,'SPECIALTY  КОФЕЙНЯ',-.97,2.55,5.048,1.7,.17,{size:76});
 // Door held open against the right side, including glazing and handle.
 const door=new T.Group();door.name='open-glazed-door';door.position.set(1.86,0,5);door.rotation.y=Math.PI*.46;cafe.add(door);
 for(const x of [-1.05,0])box(door,'door-stile',x,1.27,0,.065,2.53,.065,m.white);
 for(const y of [.04,.61,2.52])box(door,'door-rail',-.52,y,0,1.1,.07,.065,m.white);
 box(door,'door-kickplate',-.52,.32,0,.98,.53,.04,m.white);plane(door,'door-glass',-.52,1.55,.004,.98,1.83,m.glass);
 rod(door,[-.91,.92,.09],[-.91,1.31,.09],.022,m.white);solid(1.86,5.51,.15,1.08);
 box(shops,'supermarket-door-mat',3.1,.063,5.73,1.12,.025,.7,m.standard('#414546'));
 // Hypnotic pavement board photographed at 00:00; no people baked into textures.
 box(cafe,'A-board',-.45,.63,5.61,.57,1.24,.08,m.black,.09);plane(cafe,'video-A-board',-.45,.64,5.655,.54,1.22,m.photoMaterial('pavement-board'));solid(-.45,5.61,.6,.35);
 // Seating arrangement measured visually from 01:22 and 05:10.
 bench(cafe,-1.48,1.6,4.45,Math.PI/2);solid(-1.48,1.6,.69,4.45);
 futon(cafe,1.12,-.38,1.55,0);solid(1.12,-.38,1.55,.8);
 futon(cafe,1.12,2.9,1.55,Math.PI,true);solid(1.12,2.9,1.55,.8);
 for(const [x,z] of [[-.72,.85],[1.12,1.25]]){table(cafe,x,z);solid(x,z,.63,.63);}
 v.potted(cafe,-1.32,.05,4.48,2.25,'ficus');
 v.potted(cafe,-.53,.07,4.55,1.28,'variegated');
 v.potted(cafe,-1.52,.55,3.56,.87,'zz');
 v.potted(cafe,1.45,.05,3.72,1.5,'ficus');
 for(const y of [.3,1.24,2.28])cyl(door,'door-hinge',0,y,0,.025,.025,.14,m.metal);
 box(door,'door-closer',-.26,2.44,.06,.31,.065,.085,m.metal);
 rod(door,[-.26,2.48,.08],[-.6,2.48,.2],.011,m.metal);
 // Wall artwork sampled directly from the video, geometry remains editable.
 for(const [z,name,w,h] of [[-3.96,'art-dog-photo',.55,.78],[-3.12,'art-yellow',.57,.80],[-2.24,'art-dark',.57,.80],[-1.36,'art-sheep',.57,.80],[-.45,'art-cats',.57,.80]]){plane(cafe,'canvas-'+name,1.864,2.16,z,w,h,m.photoMaterial(name),-Math.PI/2);}
 box(cafe,'recess-upper-lip',-1.83,2.76,1.12,.1,.09,1.64,m.wall);for(const z of [.30,1.94])box(cafe,'recess-side-lip',-1.83,1.67,z,.1,2.1,.08,m.wall);
 plane(cafe,'large-botanical-canvas',-1.874,2.14,1.12,1.08,1.08,m.photoMaterial('botanical-art'),Math.PI/2);
 text(cafe,'ВРЕМЯ ЧУДЕС',-1.77,2.88,1.2,1.6,.15,{color:'#282d2e',size:85,rot:Math.PI/2});
 for(const [z,arts] of [[2.15,['small-cat','small-duck','small-kitten']],[.08,['small-pinkcat','small-blackcat','small-shiba']]])for(let i=0;i<3;i++){const y=1.70+i*.45;box(cafe,'small-white-art-frame',-1.84,y,z,.045,.23,.22,m.white);plane(cafe,'small-art',-1.814,y,z,.18,.18,m.photoMaterial(arts[i]),Math.PI/2);}
 for(let i=0;i<5;i++)rod(cafe,[-1.83,2.35+Math.sin(i)*.035,3.05+i*.19],[-1.83,2.35+Math.sin(i+1)*.035,3.24+i*.19],.023,m.standard('#847e6a'));
 for(let i=0;i<28;i++){let z=3.27+i*.018;rod(cafe,[-1.80,2.33,z],[-1.79,1.66+Math.abs(i-14)*.012,z+.045],.003,m.standard('#b9b09a'));}
 // Right-side tall souvenir bookcase, with real shelf proportions and small wares.
 const shelf=new T.Group();shelf.name='souvenir-bookcase';shelf.position.set(1.73,0,1.25);shelf.rotation.y=-Math.PI/2;cafe.add(shelf);
 box(shelf,'bookcase-back',0,1.08,-.13,1.05,2.16,.045,m.dark);
 for(const x of [-.54,.54])box(shelf,'bookcase-side',x,1.08,0,.055,2.16,.36,m.dark);
 for(const y of [.12,.55,1.04,1.55,2.15])box(shelf,'bookcase-shelf',0,y,0,1.12,.035,.38,m.dark);
 box(shelf,'closed-bookcase-bottom-front',0,.34,.185,1.04,.38,.035,m.dark);
 addShelfProducts(shelf,m,p);v.potted(shelf,-.36,2.17,0,.46,'flowers');v.potted(shelf,.39,2.17,0,.35,'flowers');solid(1.73,1.25,.38,1.15);
 // Charcoal counter, oak worktop, register, pastries and packaged coffee.
 box(cafe,'main-counter',-.27,.55,-1.48,3.19,1.08,.67,m.dark);box(cafe,'oak-countertop',-.27,1.115,-1.48,3.26,.065,.76,m.wood,.025);solid(-.27,-1.48,3.26,.76);
 for(const x of [-1.38,-.61,.16,.93])box(cafe,'cabinet-seam',x,.52,-1.133,.008,.95,.007,m.black);
 const rear=group('bar-equipment');
 addBarEquipment(rear,m,p,solid,v);
 // Rear curtain, menu board and air conditioner.
 box(rear,'curtain-back',0,1.2,-4.52,2.2,2.4,.06,m.dark);
 const curtainGeometry=new T.PlaneGeometry(2.2,2.40,132,36),curtainPos=curtainGeometry.attributes.position;
 for(let i=0;i<curtainPos.count;i++){const x=curtainPos.getX(i),y=curtainPos.getY(i),wave=Math.sin(x*23)+.24*Math.sin(x*46+.4);curtainPos.setZ(i,.068*wave*(1-.1*y));curtainPos.setY(i,y+.022*Math.sin(x*23+1)*(1-y/1.2)*.5);}
 curtainGeometry.computeVertexNormals();const curtain=new T.Mesh(curtainGeometry,m.standard('#64636d',{roughness:.94,side:T.DoubleSide}));curtain.name='continuous-folded-cloth-curtain';curtain.position.set(0,1.24,-4.40);curtain.castShadow=curtain.receiveShadow=true;rear.add(curtain);
 for(const [x,name] of [[-.805,'menu-coffee'],[0,'menu-cold'],[.805,'menu-special']]){box(rear,'separate-menu-board',x,2.32,-4.35,.80,1.10,.06,m.dark);plane(rear,'native-4k-menu-panel',x,2.32,-4.313,.775,1.075,new T.MeshBasicMaterial({map:m.photo(name),toneMapped:false} ));}
 box(rear,'air-conditioner',0,2.91,-4.32,2.03,.26,.25,m.white,.045);box(rear,'AC-slot',0,2.81,-4.17,1.86,.04,.02,m.standard('#858983'));
 addCounterProducts(cafe,m,p);
 // Outdoor vegetation uses instanced leaves/petals instead of faceted placeholder balls.
 let seed=57;function rand(){seed=(seed*16807)%2147483647;return seed/2147483647;}
 const dummy=new T.Object3D();
 const leafGeo=v.leafGeometry;v.flowerbeds(terrain,[-23,-11,1,13,25]);
 const treeLeaves=new T.InstancedMesh(leafGeo,m.standard('#4c663d'),5000);treeLeaves.name='tree-foliage';treeLeaves.castShadow=true;let ti=0;
 for(const [x,z] of [[-24,20],[-13,20],[0,21],[13,20],[25,21]]){cyl(terrain,'tree-trunk',x,2.3,z,.16,.28,4.6,m.standard('#696456'),12);solid(x,z,.55,.55);for(let branch=0;branch<7;branch++){const a=branch*2.4;rod(terrain,[x,2.3,z],[x+Math.cos(a)*1.7,4+branch*.23,z+Math.sin(a)*1.7],.06,m.standard('#6b6859'));}
 for(let i=0;i<900;i++){const a=rand()*Math.PI*2,r=Math.sqrt(rand())*2.75,v=(rand()-.5)*3.5;dummy.position.set(x+Math.cos(a)*r,5+v,z+Math.sin(a)*r);dummy.scale.set(.12+rand()*.18,.055,.24);dummy.rotation.set(rand()*3,rand()*6,rand()*3);dummy.updateMatrix();treeLeaves.setMatrixAt(ti,dummy.matrix);treeLeaves.setColorAt(ti++,new T.Color().setHSL(.23+rand()*.07,.22+rand()*.2,.2+rand()*.18));}}
 treeLeaves.count=ti;terrain.add(treeLeaves);
 const fence=group('street-fence');for(let x=-35;x<36;x+=2){rod(fence,[x,0,24],[x,.9,24],.035,m.white);rod(fence,[x,.84,24],[x+2,.84,24],.025,m.white);rod(fence,[x,.12,24],[x+2,.84,24],.019,m.white);rod(fence,[x,.84,24],[x+2,.12,24],.019,m.white);}

 addInteriorDetails(cafe,m,p);
 addPhotoFineDetails(cafe,rear,m,p);
 addPastryDetails(scene);
 Object.values(groups).forEach(batchStatic);
 return {colliders,roofGroup,lamps,groups,ceiling,materials:m};
}
