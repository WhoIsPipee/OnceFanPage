import { NextResponse } from 'next/server';
import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { createFeedService, type Feed } from '@/lib/instagram-model';

export const runtime='nodejs';
export const dynamic='force-dynamic';
const cacheDir=path.join(process.cwd(),'.cache');
const cacheFile=path.join(cacheDir,'instagram.json');
const getFeed=createFeedService({
  configured:()=>Boolean(process.env.INSTAGRAM_ACCESS_TOKEN&&process.env.INSTAGRAM_IG_USER_ID),
  loadMedia:async()=>{
    const version=process.env.INSTAGRAM_GRAPH_VERSION||'v25.0';
    const id=process.env.INSTAGRAM_IG_USER_ID!;
    if(!/^v\d+\.\d+$/.test(version)||!/^\d+$/.test(id))throw Error('Invalid configuration');
    const url=new URL(`https://graph.facebook.com/${version}/${id}`);
    url.searchParams.set('fields','business_discovery.username(m.by__sana){media.limit(25){id,caption,media_type,media_url,thumbnail_url,permalink,timestamp}}');
    const response=await fetch(url,{headers:{Authorization:`Bearer ${process.env.INSTAGRAM_ACCESS_TOKEN}`},cache:'no-store',signal:AbortSignal.timeout(10_000)});
    if(!response.ok)throw Error('Instagram unavailable');
    const data=await response.json();
    return data.business_discovery?.media?.data;
  },
  persist:async(feed)=>{await mkdir(cacheDir,{recursive:true});await writeFile(`${cacheFile}.tmp`,JSON.stringify(feed),'utf8');await rename(`${cacheFile}.tmp`,cacheFile)},
  restore:async()=>{
    const data:Feed=JSON.parse(await readFile(cacheFile,'utf8'));
    if(!Array.isArray(data.posts)||!data.posts.length||!Number.isFinite(Date.parse(data.updatedAt)))return null;
    return {...data,status:'stale'};
  },
});

export async function GET(){
  const feed=await getFeed();
  return NextResponse.json(feed,{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
