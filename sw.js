const CACHE_NAME='jusbrowse-v1';
const ASSETS=[
'/',
'/index.html',
'/home.html',
'/assets/style.css',
'/assets/include.js',
'/assets/nav.html',
'/releases/index.html',
'/docs/index.html',
'/researches/index.html',
'/compat/index.html',
'/changelog/index.html'
];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(v=>v!==CACHE_NAME).map(v=>caches.delete(v)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
if(res.ok&&e.request.method==='GET'){
var cln=res.clone();
caches.open(CACHE_NAME).then(c=>c.put(e.request,cln));
}
return res;
}).catch(()=>caches.match('/index.html')));
});
});
