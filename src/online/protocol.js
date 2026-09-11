import {Uno} from '../games/uno.js';
import {Durak} from '../games/durak.js';
import {Checkers} from '../games/checkers.js';
import {Poker} from '../games/poker.js';
import {Croissant} from '../games/croissant.js';

export const engines={uno:Uno,durak:Durak,checkers:Checkers,poker:Poker,croissant:Croissant};
export const cleanName=value=>String(value||'').normalize('NFC').replace(/[\p{C}<>]/gu,'').replace(/\s+/g,' ').trim().slice(0,24)||'Гость';
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Hydration restores read-only rule helpers; the server is the only writer in online games.
export function hydrateGame(id,state){return Object.assign(Object.create(engines[id].prototype),state);}
