// Deterministic work timeline shared by rendering and UI. A new order interrupts
// any idle task; changing the portrait does not restart an accepted order.
export const ORDER_STEPS=[
 {id:'approach',label:'Иду к кофемашине',duration:2,target:[-.73,-2.45]},
 {id:'espresso',label:'Готовлю эспрессо',duration:3,target:[-.73,-2.45]},
 {id:'steam',label:'Взбиваю молоко',duration:3,target:[-.73,-2.45]},
 {id:'pour',label:'Рисую латте-арт',duration:4,target:[-.18,-2.2]},
 {id:'serve',label:'Подаю ваш капучино',duration:2,target:[-.18,-2.2]}
];
const IDLE_STEPS=[
 {id:'wipe',label:'Протираю рабочую поверхность',duration:5,target:[-.32,-2.2]},
 {id:'rinse',label:'Ополаскиваю питчер',duration:5,target:[-.68,-3.7]},
 {id:'milk',label:'Беру молоко из холодильника',duration:5,target:[.63,-3.25]},
 {id:'polish',label:'Готовлю кофемашину',duration:5,target:[-.73,-2.45]}
];
export function createWorkTimeline(){
 let busy=false,index=0,elapsed=0,completed=0,revision=0;
 const state=()=>{const step=(busy?ORDER_STEPS:IDLE_STEPS)[index];return {...step,busy,progress:elapsed/step.duration,completed,revision};};
 return {get state(){return state();},order(){if(busy)return false;busy=true;index=0;elapsed=0;revision++;return true;},update(dt){if(!Number.isFinite(dt)||dt<0)return state();elapsed+=dt;let steps=busy?ORDER_STEPS:IDLE_STEPS;while(elapsed>=steps[index].duration){elapsed-=steps[index].duration;index++;revision++;if(index===steps.length){index=0;if(busy){busy=false;completed++;steps=IDLE_STEPS;}}}return state();}};
}
