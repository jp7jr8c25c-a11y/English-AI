const CACHE='english-ai-v3.0.0';
const ASSETS=['./','./index.html','./style.css','./teacher.css','./premium.css','./director.js','./coach.js','./coach.css','./speaking_ai.js','./speaking_ai.css','./course_flow.js','./course_flow.css','./voice_first.css','./stability.css','./placement.css','./placement.js','./professional_v3.css','./master_curriculum.js','./lesson_engine.js','./lesson_engine.css','./learning_path.css','./learning_path.js','./learning_lab.js','./memo_pro.css','./memo_pro.js','./curriculum.js','./foundations.js','./teacher-avatar.webp','./tutor.js','./app.js','./live.js','./data.js','./guides.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 e.respondWith(fetch(e.request).then(response=>{if(response.ok&&new URL(e.request.url).pathname.match(/\.(?:html|js|css)$/)){const cached=response.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(e.request,cached)).catch(()=>{}));}return response}).catch(()=>caches.match(e.request)));
});
