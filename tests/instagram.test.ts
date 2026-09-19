import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeMedia,createFeedService} from '../src/lib/instagram-model.ts';
const media=(id:string,date:string)=>({id,timestamp:date,permalink:`https://www.instagram.com/p/${id}/`,media_type:'IMAGE',media_url:'https://scontent.cdninstagram.com/image.jpg'});
test('Orders by publication timestamp instead of pinned order, deduplicates, keeps latest three',()=>{
 const result=normalizeMedia([media('old','2020-01-01'),media('b','2026-09-17'),media('a','2026-09-18'),media('a','2026-09-18'),media('c','2026-09-16')]);
 assert.deepEqual(result.map(p=>p.id),['a','b','c']);
});
test('Rejects unsafe permalinks and media hosts; preserves posts without image URLs',()=>{
 const result=normalizeMedia([{...media('ok','2026-09-18'),media_url:'https://evil.example/img.jpg'},{...media('bad','2026-09-18'),permalink:'javascript:alert(1)'},media('invalid','not-a-date')]);
 assert.equal(result.length,1);assert.equal(result[0].image,undefined);
 assert.throws(()=>normalizeMedia({}));assert.throws(()=>normalizeMedia([]));
});
test('Missing credentials does not pretend fallback posts are live',async()=>{
 const get=createFeedService({configured:()=>false,loadMedia:async()=>{throw Error('must not call')}});
 const feed=await get();assert.equal(feed.status,'unconfigured');assert.equal(feed.posts.length,3);
});
test('Concurrent requests share one request, cache lasts 15 minutes, new posts replace old',async()=>{
 let time=Date.parse('2026-09-18');let calls=0;
 const get=createFeedService({configured:()=>true,now:()=>time,loadMedia:async()=>{calls++;await Promise.resolve();return[media(`post${calls}`,'2026-09-18')]}});
 const [a,b]=await Promise.all([get(),get()]);assert.equal(calls,1);assert.deepEqual(a,b);
 await get();assert.equal(calls,1);time+=900_001;const next=await get();assert.equal(calls,2);assert.equal(next.posts[0].id,'post2');
});
test('API failure keeps last success with stale status and backs off without leaking errors',async()=>{
 let time=Date.parse('2026-09-18');let calls=0;
 const get=createFeedService({configured:()=>true,now:()=>time,loadMedia:async()=>{if(++calls>1)throw Error('SECRET_TOKEN');return[media('saved','2026-09-18')]}});
 const initial=await get();time+=900_001;const failed=await get();assert.equal(failed.status,'stale');assert.equal(failed.updatedAt,initial.updatedAt);assert.equal(failed.posts[0].id,'saved');
 await get();assert.equal(calls,2);assert.ok(!JSON.stringify(failed).includes('SECRET_TOKEN'));
});
test('Reuses persisted feed on startup failure',async()=>{
 const get=createFeedService({configured:()=>true,loadMedia:async()=>{throw Error()},restore:async()=>({status:'live',updatedAt:'2026-09-18T00:00:00Z',refreshAfterSeconds:900,posts:normalizeMedia([media('persisted','2026-09-18')])})});
 const feed=await get();assert.equal(feed.status,'stale');assert.equal(feed.posts[0].id,'persisted');
});
