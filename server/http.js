import {createServer} from 'node:http';
import {CafeRoom} from './room.js';
export function createCafeServer({room=new CafeRoom(),origins=['http://127.0.0.1:5186','http://localhost:5186','https://yuraertsev-blip.github.io']}={}){
 const rates=new Map();const server=createServer(async(req,res)=>{
  const origin=req.headers.origin;if(origin&&!origins.includes(origin)){res.writeHead(403);res.end();return;}
  if(origin)res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');
  if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
  const reply=(status,body)=>{res.writeHead(status);res.end(JSON.stringify(body));};
  try{const now=Date.now(),ip=req.socket.remoteAddress;let rate=rates.get(ip);if(!rate||now-rate.start>10000){rate={start:now,n:0};rates.set(ip,rate);}if(++rate.n>400)return reply(429,{error:'Слишком много запросов. Подождите немного.'});
   if(req.url==='/health')return reply(200,{ok:true});const token=req.headers.authorization?.replace(/^Bearer /,'');
   if(req.method==='GET'&&req.url==='/api/state')return reply(200,room.poll(token));
   if(req.method!=='POST'||!['/api/join','/api/command'].includes(req.url))return reply(404,{error:'Not found'});
   if(!req.headers['content-type']?.startsWith('application/json'))return reply(415,{error:'JSON required'});
   let data='';for await(const chunk of req){data+=chunk;if(data.length>2048)return reply(413,{error:'Request too large'});}const a=JSON.parse(data||'{}');
   if(req.url==='/api/join')return reply(200,room.join(a.name));room.command(token,a);return reply(200,room.poll(token));
  }catch(e){reply(e.message==='SESSION_EXPIRED'?401:400,{error:e instanceof SyntaxError?'Некорректный JSON.':e.message});}
 });
 const timer=setInterval(()=>{room.sweep();const now=Date.now();for(const [id,r] of rates)if(now-r.start>10000)rates.delete(id);},1000);timer.unref();server.on('close',()=>clearInterval(timer));return server;
}
