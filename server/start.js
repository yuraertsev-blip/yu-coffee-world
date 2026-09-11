import {createCafeServer} from './http.js';
const port=Number(process.env.PORT||5187);
const origins=(process.env.ALLOWED_ORIGINS||'http://127.0.0.1:5186,http://localhost:5186,https://yuraertsev-blip.github.io').split(',');
createCafeServer({origins}).listen(port,'0.0.0.0',()=>console.log(`Café multiplayer listening on ${port}`));
