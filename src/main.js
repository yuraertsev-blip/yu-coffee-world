import {AUTUMN_LIGHT} from './autumn.js';
import {installOnline} from './online/ui.js';
import './style.css';
import {installMusic} from './music.js';
import {installGameTable} from './game-table.js';
import {installCounterInteraction} from './counter-interaction.js';
import {LATTE_DESIGNS,drawLatteArt} from './latte-art.js';
import {createBaristas} from './baristas.js';
import {createCoffeeService} from './coffee-service.js';
import {installBaristaInteraction,isTap} from './barista-interaction.js';
import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {makeWorld,SITE} from './scene.js';
import {BAR_LAYOUT} from './bar.js';
import {canOccupy} from './movement.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {SSAOPass} from 'three/addons/postprocessing/SSAOPass.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
const $=s=>document.querySelector(s),canvas=$('#world');
let renderer;
try{renderer=new T.WebGLRenderer({canvas,antialias:true});}catch(e){$('#failure').hidden=false;throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
const scene=new T.Scene();scene.background=new T.Color(AUTUMN_LIGHT.day.sky);scene.fog=new T.Fog(AUTUMN_LIGHT.day.sky,65,140);
const pmrem=new T.PMREMGenerator(renderer);const room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;scene.environmentIntensity=.28;room.dispose();pmrem.dispose();
const camera=new T.PerspectiveCamera(43,innerWidth/innerHeight,.1,150);
const orbit=new OrbitControls(camera,canvas);orbit.enableDamping=true;orbit.minDistance=6;orbit.maxDistance=65;orbit.maxPolarAngle=Math.PI*.47;orbit.target.set(0,1,0);
const ambient=new T.HemisphereLight('#ead6be','#766049',AUTUMN_LIGHT.day.ambient);scene.add(ambient);
const sun=new T.DirectionalLight('#ffdfaf',AUTUMN_LIGHT.day.sun);sun.position.set(-18,26,20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-35,right:35,top:30,bottom:-30,near:1,far:80});sun.shadow.normalBias=.035;scene.add(sun);
const world=makeWorld(scene);let walking=false,night=false,yaw=0,pitch=0,drag=null;const keys=new Set();
let savedBarista=0;try{savedBarista=Number(localStorage.getItem('yu-coffee-barista')||0);}catch{}
const loadNotice=document.createElement('div');loadNotice.className='avatar-loading';loadNotice.setAttribute('role','status');loadNotice.textContent='Загружаем бариста…';document.body.append(loadNotice);
const characters=createBaristas(scene,{initial:savedBarista,onReady:()=>{if(characters.ready)loadNotice.hidden=true;},onError:()=>{loadNotice.hidden=false;loadNotice.textContent='Не удалось загрузить бариста. Обновите страницу, чтобы попробовать снова.';}});world.colliders.push(characters.collider);
const service=createCoffeeService(scene,characters);
const interaction=installBaristaInteraction({canvas,camera,scene,characters,service,world,keys,isWalking:()=>walking,raycaster:new T.Raycaster(),vector:new T.Vector2(),onInspect:()=>{enter(.05,-.65,true);active('bar');pitch=-.72;}});
const counter=installCounterInteraction({canvas,camera,world:{...world,scene},characters,coffee:service,isWalking:()=>walking,isMenuOpen:()=>interaction.opened});
const gameRoom=installGameTable({scene,canvas,camera,world,keys,interaction,isWalking:()=>walking});
installOnline({scene,canvas,camera,world,keys,interaction,gameRoom});
const musicRoom=installMusic({scene,canvas,camera,world,keys,interaction});
const composer=new EffectComposer(renderer);const ao=new SSAOPass(scene,camera,innerWidth,innerHeight,12);ao.kernelRadius=.35;ao.minDistance=.001;ao.maxDistance=.045;composer.addPass(new RenderPass(scene,camera));composer.addPass(ao);composer.addPass(new OutputPass());
const hint=$('#hint');
function active(id){document.querySelector('#bar-views').hidden=id!=='bar';document.querySelectorAll('.views button').forEach(b=>b.classList.toggle('active',b.id===id));}
function overview(){interaction.hide();camera.fov=43;camera.updateProjectionMatrix();ao.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(camera.projectionMatrix);ao.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);walking=false;keys.clear();document.exitPointerLock?.();document.body.classList.remove('walking');$('.crosshair').hidden=true;$('.touch-controls').hidden=true;orbit.enabled=true;world.roofGroup.visible=true;orbit.target.set(0,4.1,4.8);camera.position.set(innerWidth<700?8:11,innerWidth<700?10:8.3,innerWidth<700?26:22);orbit.update();active('overview');$('#location').textContent='У «Ю кофе»';hint.textContent='Потяните сцену, чтобы осмотреться · Колесо — масштаб';}
function enter(x,z,inside=false){interaction.hide();document.exitPointerLock?.();camera.fov=65;camera.updateProjectionMatrix();ao.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(camera.projectionMatrix);ao.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);walking=true;keys.clear();orbit.enabled=false;document.body.classList.add('walking');$('.crosshair').hidden=false;$('.touch-controls').hidden=!matchMedia('(pointer:coarse)').matches;camera.position.set(x,1.68,z);yaw=0;pitch=0;camera.rotation.order='YXZ';camera.rotation.set(0,0,0);world.roofGroup.visible=true;active(inside?'inside':'entrance');$('#location').textContent=inside?'Внутри кофейни':'У входа';hint.textContent='WASD / стрелки — идти · Мышь — обзор · Esc — курсор';}
$('#walk').onclick=()=>enter(SITE.door.x,8.4);$('#entrance').onclick=()=>enter(SITE.door.x,7.7);$('#inside').onclick=()=>enter(SITE.inside.x,SITE.inside.z,true);function barView(side){enter(side==='right'?-.35:.45,side==='right'?-3.6:-3.05,true);active('bar');yaw=side==='right'?-Math.PI/2:Math.PI/2;pitch=side==='right'?-.37:-.10;}
$('#bar').onclick=()=>barView('left');$('#bar-left').onclick=()=>barView('left');$('#bar-right').onclick=()=>barView('right');$('#bar-counter').onclick=()=>{enter(0,-.45,true);active('bar');pitch=-.20;};$('#bar-hall').onclick=()=>{enter(0,-2.35,true);active('bar');yaw=Math.PI;pitch=-.08;};$('#overview').onclick=overview;$('#reset').onclick=overview;
$('#light').onclick=()=>{night=!night;$('#light').setAttribute('aria-pressed',String(night));$('#light').innerHTML=night?'☾ <span>Вечер</span>':'☀ <span>День</span>';const light=AUTUMN_LIGHT[night?'night':'day'];scene.background.set(light.sky);scene.fog.color.copy(scene.background);ambient.intensity=light.ambient;sun.intensity=light.sun;world.lamps.forEach(l=>l.intensity=light.lamp);};
$('#about').onclick=()=>{keys.clear();document.exitPointerLock?.();$('#info').showModal();};$('#close').onclick=$('#resume').onclick=()=>$('#info').close();
addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||interaction.opened)return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft'].includes(e.code)){keys.add(e.code);if(walking)e.preventDefault();}});addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>keys.clear());
let clickStart=null;canvas.addEventListener('pointerdown',e=>{clickStart={x:e.clientX,y:e.clientY};if(!walking||interaction.opened)return;drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!walking||interaction.opened)return;let dx=0,dy=0;if(document.pointerLockElement===canvas){dx=e.movementX;dy=e.movementY;}else if(drag){dx=e.clientX-drag.x;dy=e.clientY-drag.y;drag={x:e.clientX,y:e.clientY};}yaw-=dx*.003;pitch=T.MathUtils.clamp(pitch-dy*.003,-1.25,1.25);});canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);canvas.addEventListener('click',e=>{if(walking&&!interaction.opened&&isTap(clickStart,e)&&!matchMedia('(pointer:coarse)').matches)canvas.requestPointerLock?.()?.catch?.(()=>{});});
const touchMap={forward:'KeyW',back:'KeyS',left:'KeyA',right:'KeyD'};document.querySelectorAll('[data-move]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(touchMap[b.dataset.move]);};b.onpointerup=b.onpointercancel=()=>keys.delete(touchMap[b.dataset.move]);});
function canGo(x,z){return canOccupy(x,z,world.colliders,SITE.bounds);}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);}addEventListener('resize',resize);resize();overview();
const clock=new T.Clock();renderer.setAnimationLoop(()=>{const dt=Math.min(clock.getDelta(),.05);if(gameRoom.opened||musicRoom.opened)return;if(walking){camera.rotation.set(pitch,yaw,0,'YXZ');if(!document.querySelector('dialog[open]')&&!interaction.opened){const f=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown'));const r=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));const norm=Math.hypot(f,r)||1;const speed=dt*(keys.has('ShiftLeft')?4:2.4)/norm;const dx=(-Math.sin(yaw)*f+Math.cos(yaw)*r)*speed,dz=(-Math.cos(yaw)*f-Math.sin(yaw)*r)*speed;if(canGo(camera.position.x+dx,camera.position.z))camera.position.x+=dx;if(canGo(camera.position.x,camera.position.z+dz))camera.position.z+=dz;$('#location').textContent=Math.abs(camera.position.x)<SITE.cafe.width/2&&camera.position.z<5&&camera.position.z>-4.6?'Внутри кофейни':'У «Ю кофе»';}}else orbit.update();world.update(dt);counter.update(dt);service.update(dt,camera);characters.update(camera);camera.updateMatrixWorld();interaction.update();if(innerWidth>700)composer.render();else renderer.render(scene,camera);});

$('#references').onclick=()=>{keys.clear();document.exitPointerLock?.();$('#reference-dialog').showModal();};$('#close-reference').onclick=()=>$('#reference-dialog').close();
// Keep enlarged reference panels in the café viewer, including the in-app browser.
document.querySelectorAll('#reference-dialog figure a').forEach(link=>{
 link.setAttribute('aria-expanded','false');
 link.addEventListener('click',event=>{event.preventDefault();const figure=link.closest('figure');const expanded=figure.classList.toggle('expanded');link.setAttribute('aria-expanded',String(expanded));figure.scrollIntoView({block:'start',behavior:'smooth'});});
});

let latteGalleryReady=false;
$('#show-latte-art').onclick=()=>{keys.clear();document.exitPointerLock?.();interaction.hide();if(!latteGalleryReady){LATTE_DESIGNS.forEach((name,id)=>{const figure=document.createElement('figure'),preview=document.createElement('canvas'),caption=document.createElement('figcaption');preview.width=preview.height=256;preview.setAttribute('aria-label',name);drawLatteArt(preview.getContext('2d'),id,256);caption.textContent=`${id+1}. ${name}`;figure.append(preview,caption);$('#latte-grid').append(figure);});latteGalleryReady=true;}$('#latte-gallery').showModal();};
$('#close-latte-gallery').onclick=()=>$('#latte-gallery').close();
