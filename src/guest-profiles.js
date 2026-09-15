export const GUEST_PROFILES=[
 {id:'woman-amber',category:'women',label:'Янтарь',hair:'#9c5730',top:'#b76e45',eyes:'#6d8b64',skin:'#efd1bd',style:'bob'},
 {id:'woman-sage',category:'women',label:'Шалфей',hair:'#493429',top:'#667e68',eyes:'#786947',skin:'#dcae8e',style:'bun'},
 {id:'woman-rose',category:'women',label:'Розовый чай',hair:'#292830',top:'#c18d91',eyes:'#665680',skin:'#efd1bd',style:'ribbon'},
 {id:'woman-cream',category:'women',label:'Ваниль',hair:'#bba071',top:'#e2c999',eyes:'#73919c',skin:'#efd1bd',style:'beret'},
 {id:'woman-plum',category:'women',label:'Слива',hair:'#493145',top:'#6a516a',eyes:'#87674d',skin:'#b77e61',style:'glasses'},
 {id:'man-oak',category:'men',label:'Дуб',hair:'#543827',top:'#876748',eyes:'#816e4c',skin:'#e3bca0',style:'crop'},
 {id:'man-pine',category:'men',label:'Хвоя',hair:'#262728',top:'#415b50',eyes:'#667d6b',skin:'#c38f6e',style:'sweep'},
 {id:'man-denim',category:'men',label:'Индиго',hair:'#8a6749',top:'#536c85',eyes:'#698898',skin:'#e6c4a8',style:'beanie'},
 {id:'man-cocoa',category:'men',label:'Какао',hair:'#38261f',top:'#a88c76',eyes:'#5e4633',skin:'#a97556',style:'curly'},
 {id:'man-silver',category:'men',label:'Серебро',hair:'#96948f',top:'#535967',eyes:'#637b86',skin:'#d8b59b',style:'glasses'},
 {id:'animal-fox',category:'animals',label:'Лиса',animal:'fox',hair:'#bb632f',top:'#62785e',eyes:'#7b954c',skin:'#bb632f'},
 {id:'animal-cat',category:'animals',label:'Кот',animal:'cat',hair:'#8e9299',top:'#b77e58',eyes:'#a4b665',skin:'#8e9299'},
 {id:'animal-rabbit',category:'animals',label:'Заяц',animal:'rabbit',hair:'#ddcbbc',top:'#9180a2',eyes:'#69547c',skin:'#ddcbbc'},
 {id:'animal-bear',category:'animals',label:'Медведь',animal:'bear',hair:'#79503b',top:'#c1a067',eyes:'#473d30',skin:'#79503b'},
 {id:'animal-raccoon',category:'animals',label:'Енот',animal:'raccoon',hair:'#8c877d',top:'#557881',eyes:'#6c976f',skin:'#8c877d'}
];
export const DEFAULT_GUEST_AVATAR='woman-amber';
export const cleanAvatar=id=>GUEST_PROFILES.some(p=>p.id===id)?id:DEFAULT_GUEST_AVATAR;
export const guestProfile=id=>GUEST_PROFILES.find(p=>p.id===cleanAvatar(id));
