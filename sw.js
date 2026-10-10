const CACHE='english-ai-v2.8.0';
const ASSETS=['./','./index.html','./style.css','./teacher.css','./premium.css','./director.js','./coach.js','./coach.css','./speaking_ai.js','./speaking_ai.css','./teacher-avatar.webp','./teacher-home.webp','./tutor.js','./app.js','./live.js','./data.js','./guides.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 e.respondWith(fetch(e.request).then(response=>{if(response.ok&&new URL(e.request.url).pathname.match(/\.(?:html|js|css)$/)){const cached=response.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(e.request,cached)).catch(()=>{}));}return response}).catch(()=>caches.match(e.request)));
});
