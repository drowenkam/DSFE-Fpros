/* F Pros clean rebuild 2026-11-14; no retired question bank */
const VERSION='fpros-complete-reset-20261114-v3';
const PRECACHE=['./','./index.html','./notes.html','./practice.html','./historical.html','./glossary.html','./manifest.webmanifest','./assets/icon.svg','./assets/site.css','./assets/site.js','./assets/practice-engine.js','./assets/questions-data.js','./assets/notes-reader.js','./assets/notebook-index.js'];
self.addEventListener('install',event=>{event.waitUntil((async()=>{const cache=await caches.open(VERSION);const successes=await Promise.allSettled(PRECACHE.map(p=>cache.add(p)));if(successes.some(x=>x.status==='rejected'))console.warn('Some F Pros files could not be precached',successes);await self.skipWaiting()})())});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{let keys=await caches.keys();await Promise.all(keys.filter(k=>(k.startsWith('fpros-')||k.startsWith('fpros_'))&&k!==VERSION).map(k=>caches.delete(k)));await self.clients.claim()})())});
self.addEventListener('fetch',event=>{let req=event.request;if(req.method!=='GET')return;const u=new URL(req.url);if(u.origin!==self.location.origin)return;
 event.respondWith((async()=>{const cache=await caches.open(VERSION);let dynamic=req.mode==='navigate'||/\.(?:js|css|webmanifest)$/.test(u.pathname);
 if(dynamic){try{const r=await fetch(req);if(r.ok)cache.put(req,r.clone()).catch(()=>{});return r}catch{const c=await cache.match(req,{ignoreSearch:true});return c||Response.error()}}
 const saved=await cache.match(req,{ignoreSearch:true});if(saved)return saved;try{const r=await fetch(req);if(r.ok)cache.put(req,r.clone()).catch(()=>{});return r}catch{return Response.error()}
 })())});
