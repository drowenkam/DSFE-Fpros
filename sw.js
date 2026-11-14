/* DSFE-Fpros cache reset — 2026-11-14.
   Legacy multi-file assets are retired. Navigation always requests the current HTML.
   LocalStorage SBA scores are not touched. */
self.addEventListener('install',event=>{self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(k=>k==='fpros-complete-reset-20261114-v3'||k==='fpros-clean-20261114-v1').map(k=>caches.delete(k)));
 await self.clients.claim();
})())});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.mode!=='navigate'||request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin||!url.pathname.toLowerCase().startsWith('/dsfe-fpros/'))return;
 event.respondWith(fetch(request,{cache:'no-store'}));
});