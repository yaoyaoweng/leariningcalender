const CACHE='course-cal-v1';
const CORE=['./','index.html','manifest.webmanifest','jszip.min.js','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png','icons/favicon-64.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    // 先用網路拿最新版，沒網路時用快取
    e.respondWith(fetch(req).then(r=>{ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); return r; }).catch(()=>caches.match(req).then(r=>r||caches.match('index.html'))));
  } else if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.match(req).then(hit=>{ const net=fetch(req).then(r=>{ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); return r; }).catch(()=>hit); return hit||net; }));
  }
});
