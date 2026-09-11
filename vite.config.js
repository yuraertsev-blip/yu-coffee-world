import {defineConfig} from 'vite';
export default defineConfig({server:{proxy:{'/api':'http://127.0.0.1:5187'}},base:process.env.GITHUB_ACTIONS?'/yu-coffee-world/':'/'});
