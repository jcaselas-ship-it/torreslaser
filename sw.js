/* Torres Láser: funciona sin internet.
   Sube VERSION cada vez que publiques cambios para que los dispositivos se actualicen. */
const VERSION='torreslaser-v1';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-maskable.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION&&k.startsWith('torreslaser-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  /* El servidor de conexiones de la partida online nunca se guarda */
  if(u.hostname.endsWith('peerjs.com'))return;
  /* Primero la copia guardada (rápido y sin internet); se actualiza por detrás */
  e.respondWith(caches.open(VERSION).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:u.origin===location.origin});
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>hit||(r.mode==='navigate'?c.match('./index.html'):undefined));
    return hit||net;
  }));
});
