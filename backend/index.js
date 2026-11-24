import {server} from './server.js';
const port=process.env.PORT||3000;
if(!process.env.ACCESS_TOKEN_SECRET||!process.env.REFRESH_TOKEN_SECRET)throw new Error('Set both JWT secrets before starting');
server.listen(port,()=>console.log(`PencilCopy API listening on http://localhost:${port}`));
