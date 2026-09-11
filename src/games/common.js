export function shuffle(a,random=Math.random){for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export const SUITS=['♠','♥','♦','♣'];
export const cardText=c=>`${({11:'В',12:'Д',13:'К',14:'Т'})[c.rank]||c.rank}${c.suit}`;
export const deck=(low=2)=>SUITS.flatMap(suit=>Array.from({length:15-low},(_,i)=>({suit,rank:i+low,id:suit+(i+low)})));
const first=['Алексей','Михаил','Дмитрий','Иван','Сергей','Андрей','Никита','Роман','Максим','Артём','Кирилл','Илья','Егор','Тимофей','Павел','Антон','Виктор','Олег','Денис','Фёдор','Анна','Мария','Дарья','Алина','Елена','Ольга','София','Полина','Вера','Надежда','Ксения','Юлия','Ирина','Татьяна','Наталья','Валерия'];
const last=['Север','Лис','Сокол','Мир','Кедр','Лес','Ветер','Снег','Река','Луг','Луч','Волна','Май','Рассвет','Кофе','Янтарь','Звезда','Лист'];
let used=new Set();try{used=new Set(JSON.parse(localStorage.getItem('yu-game-names')||'[]'));}catch{}
export function newNames(count){const names=['Вы'];let pool=shuffle(first.flatMap(a=>last.map(b=>`${a} «${b}»`)).filter(n=>!used.has(n)));if(pool.length<count){used.clear();pool=shuffle(first.flatMap(a=>last.map(b=>`${a} «${b}»`)));}for(let i=0;i<count;i++){const n=pool.pop();names.push(n);used.add(n);}try{localStorage.setItem('yu-game-names',JSON.stringify([...used]));}catch{}return names;}
export function compare(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){const d=(a[i]||0)-(b[i]||0);if(d)return d;}return 0;}
