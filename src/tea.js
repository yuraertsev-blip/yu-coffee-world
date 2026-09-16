import {Raycaster,Vector2} from 'three';
import {isTap} from './barista-interaction.js';
import {assetUrl} from './asset-url.js';
import {TEAS,TEA_GROUPS,findTeas,teaRecipe} from './tea-catalog.js';
import {hitTeaDisplay} from './tea-hit.js';
import './tea.css';
export function installTea({canvas,camera,world,keys,interaction}){
 const launcher=document.createElement('button');launcher.id='open-tea';launcher.className='quiet';launcher.textContent='Чаи';launcher.setAttribute('aria-haspopup','dialog');document.querySelector('.header-actions').prepend(launcher);
 const dialog=document.createElement('dialog');dialog.id='tea-menu';dialog.setAttribute('aria-labelledby','tea-title');document.body.append(dialog);
 let selected=null,query='',group='all',volume=250,previous=null,scroll=0;
 const photo=tea=>{const [x,y,w,h]=tea.photo;return `<div class="tea-photo" style="aspect-ratio:${w}/${h}"><img src="${assetUrl('tea/vitrine.jpg')}" alt="${tea.name} — упаковка на витрине Ю кофе" loading="lazy" style="width:${1824/w*100}%;left:${-x/w*100}%;top:0;transform:translateY(${-y/1368*100}%)"></div>`;};
 function list(){
  const items=findTeas(query,group),grid=dialog.querySelector('.tea-grid');
  grid.innerHTML=items.map(tea=>`<button class="tea-card" data-tea="${tea.id}">${photo(tea)}<span class="tea-card-body"><small>${TEA_GROUPS[tea.group]}</small><strong>${tea.name}</strong><span>${tea.taste}</span><em>Подробнее и заваривание ↗</em></span></button>`).join('');
  dialog.querySelector('.tea-count').textContent=`Найдено: ${items.length}`;
  dialog.querySelector('.tea-empty').hidden=items.length>0;
  dialog.querySelectorAll('[data-group]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.group===group)));
 }
 function recipe(){const r=teaRecipe(selected,volume);dialog.querySelector('.tea-recipe').innerHTML=`<div><dt>Вода</dt><dd>${r.temperature}</dd></div><div><dt>Чай / вода</dt><dd>${r.grams.toLocaleString('ru')} г / ${r.volume} мл</dd></div><div><dt>Время</dt><dd>${(r.seconds/60).toLocaleString('ru')} мин</dd></div><div><dt>Завариваний</dt><dd>${r.infusions}</dd></div>`;dialog.querySelector('.tea-tip').textContent=r.tip;}
 function render(){
  dialog.innerHTML=`<div class="tea-top"><span>Ю КОФЕ · ЧАЙНАЯ КОЛЛЕКЦИЯ</span><button data-close aria-label="Закрыть чайную карту">×</button></div>`;
  if(selected){
   dialog.insertAdjacentHTML('beforeend',`<button class="tea-back" data-back>← Вся чайная карта</button><div class="tea-detail"><figure>${photo(selected)}<figcaption>На нашей витрине · фото кофейни</figcaption></figure><div><span class="tea-eyebrow">${TEA_GROUPS[selected.group]}</span><h2 id="tea-title" tabindex="-1">${selected.name}</h2><p class="tea-taste">${selected.taste}</p><p>${selected.description}</p><section class="tea-brewing"><h3>Заварить без спешки</h3><label class="tea-volume">Объём посуды <select aria-label="Объём посуды"><option value="250">Чашка · 250 мл</option><option value="500">Чайник · 500 мл</option><option value="750">Большой чайник · 750 мл</option></select></label><dl class="tea-recipe"></dl><p class="tea-tip"></p>${selected.portion?'<p class="tea-small">Это рецепт по весу листа. Целая порция может весить больше — проверьте упаковку.</p>':''}<p class="tea-small">Базовый способ настаивания, не короткие проливы. Регулируйте крепость по вкусу; лист после заваривания отделите от настоя.</p></section></div></div>`);
   dialog.querySelector('select').value=String(volume);recipe();
   dialog.querySelector('select').onchange=e=>{volume=Number(e.target.value);recipe();};
   dialog.querySelector('[data-back]').onclick=()=>{const id=selected.id;selected=null;render();dialog.scrollTop=scroll;dialog.querySelector(`[data-tea="${id}"]`)?.focus({preventScroll:true});};
  }else{
   dialog.insertAdjacentHTML('beforeend',`<div class="tea-heading"><div><span class="tea-eyebrow">ЛИСТЬЯ, АРОМАТЫ, МАЛЕНЬКИЕ РИТУАЛЫ</span><h2 id="tea-title">Время для чая</h2><p>От лёгкой свежести до глубокого, согревающего вкуса.<br> Найдите свой чай и узнайте, как его заварить.</p></div><span class="tea-seal">Ю<br><small>ЧАЙНАЯ<br>КАРТА</small></span></div><p class="tea-draft">Первая редакция по фотографии витрины. Ассортимент уточняется.</p><div class="tea-filters"><label>Найти чай<input type="search" placeholder="Название или аромат" aria-label="Найти чай"></label><div class="tea-categories" role="group" aria-label="Тип чая"><button data-group="all">Все чаи</button>${Object.entries(TEA_GROUPS).map(([id,label])=>`<button data-group="${id}">${label}</button>`).join('')}</div></div><p class="tea-count" role="status" aria-live="polite"></p><div class="tea-grid"></div><div class="tea-empty" hidden><h3>Такой чай пока не нашёлся</h3><p>Попробуйте другое название или откройте всю коллекцию.</p><button data-reset>Показать все чаи</button></div><details class="tea-sources"><summary>О фотографиях и рекомендациях</summary><p>Фотографии — ваша витрина Ю кофе. На некоторых снимках видны соседние упаковки. Описания передают общие особенности чайных групп; вкус конкретной партии может отличаться. Рецепты — отправная точка, а не инструкция производителя.</p><p>Справочная основа: <a href="https://www.teavivre.com/info/?p=17774" target="_blank" rel="noopener">TeaVivre: заваривание чая</a>, <a href="https://www.teavivre.com/info/common-gongfu-tea-brewing-mistakes-to-avoid.html" target="_blank" rel="noopener">температуры и работа с настоем</a>.</p></details>`);
   const input=dialog.querySelector('input');input.value=query;input.oninput=()=>{query=input.value;list();};
   dialog.querySelector('.tea-categories').onclick=e=>{const b=e.target.closest('[data-group]');if(b){group=b.dataset.group;list();}};
   dialog.querySelector('[data-reset]').onclick=()=>{query='';group='all';input.value='';list();};list();
   dialog.querySelector('.tea-grid').onclick=e=>{const b=e.target.closest('[data-tea]');if(!b)return;scroll=dialog.scrollTop;selected=TEAS.find(t=>t.id===b.dataset.tea);render();dialog.scrollTop=0;dialog.querySelector('#tea-title').focus({preventScroll:true});};
  }
  dialog.querySelector('[data-close]').onclick=()=>dialog.close();
 }
 function open(){if(dialog.open)return;previous=document.activeElement;keys.clear();interaction.hide();document.exitPointerLock?.();selected=null;render();dialog.showModal();dialog.scrollTop=0;}
 launcher.onclick=open;dialog.addEventListener('close',()=>{keys.clear();(previous?.isConnected&&previous!==document.body?previous:launcher).focus({preventScroll:true});});
 const ray=new Raycaster(),pointer=new Vector2();let down=null;
 canvas.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});
 canvas.addEventListener('click',e=>{if(document.querySelector('dialog[open]')||!isTap(down,e))return;const r=canvas.getBoundingClientRect(),locked=document.pointerLockElement===canvas;pointer.set(locked?0:(e.clientX-r.left)/r.width*2-1,locked?0:1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(pointer,camera);if(!hitTeaDisplay(ray,Object.values(world.groups)))return;e.preventDefault();e.stopImmediatePropagation();open();},true);
 return {open,get opened(){return dialog.open;}};
}
