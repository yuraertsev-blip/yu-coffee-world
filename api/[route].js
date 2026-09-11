import postgres from 'postgres';
import {createHash} from 'node:crypto';
import {saveRoom,loadRoom} from '../server/persistence.js';

let sql,ready;
export default async function handler(req,res){
 const origins=(process.env.ALLOWED_ORIGINS||'https://yuraertsev-blip.github.io').split(',');const origin=req.headers.origin;
 // Same-origin Vercel frontend is allowed as well as the existing GitHub Pages site.
 if(origin&&!origins.includes(origin)&&origin!==`https://${req.headers.host}`){return res.status(403).json({error:'Origin not allowed'});}
 if(origin)res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');res.setHeader('Cache-Control','no-store');if(req.method==='OPTIONS')return res.status(204).end();
 const route=req.query.route;if(!['join','state','command'].includes(route))return res.status(404).json({error:'Not found'});if(req.method!==(route==='state'?'GET':'POST'))return res.status(405).end();
 if(route!=='state'&&(!req.headers['content-type']?.startsWith('application/json')||JSON.stringify(req.body||{}).length>2048))return res.status(400).json({error:'Invalid request'});
 if(!process.env.DATABASE_URL&&!process.env.POSTGRES_URL)return res.status(503).json({error:'Онлайн-зал ещё подключается. Попробуйте позже.'});
 try{
  sql||=postgres(process.env.DATABASE_URL||process.env.POSTGRES_URL,{max:1,ssl:'require',idle_timeout:20,connect_timeout:10,prepare:false});
  ready||=sql`CREATE TABLE IF NOT EXISTS yu_cafe_online (id integer PRIMARY KEY, state jsonb NOT NULL)` .then(()=>sql`INSERT INTO yu_cafe_online (id,state) VALUES (1,'{}') ON CONFLICT DO NOTHING`).catch(e=>{ready=null;throw e;});await ready;
  const result=await sql.begin(async tx=>{const [row]=await tx`SELECT state FROM yu_cafe_online WHERE id=1 FOR UPDATE`;const room=loadRoom(row.state.sessions?row.state:null);room.sweep();const now=Date.now(),ip=createHash('sha256').update(String(req.headers['x-forwarded-for']||'unknown')).digest('hex');room.limits=(room.limits||[]).filter(r=>now-r.start<10000);let rate=room.limits.find(r=>r.ip===ip);if(!rate){rate={ip,start:now,n:0};room.limits.push(rate);}let body,status=200;
   try{if(++rate.n>400){status=429;throw new Error('Слишком много запросов. Подождите немного.');}const token=req.headers.authorization?.replace(/^Bearer /,'');if(route==='join')body=room.join(req.body?.name);else{if(route==='command')room.command(token,req.body);body=room.poll(token);}}catch(e){status=e.message==='SESSION_EXPIRED'?401:status===429?429:400;body={error:e.message};}
   await tx`UPDATE yu_cafe_online SET state=${tx.json(saveRoom(room))} WHERE id=1`;return {status,body};
  });return res.status(result.status).json(result.body);
 }catch{return res.status(503).json({error:'Не удалось связаться с залом. Повторяем подключение.'});}
}
