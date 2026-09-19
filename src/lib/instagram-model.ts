export type Post = { id:string; permalink:string; image?:string; caption?:string; timestamp:string; date:string };
export type Feed = { status:'live'|'stale'|'unconfigured'; updatedAt:string; posts:Post[]; refreshAfterSeconds:number };
export const fallbackFeed:Feed = {
  status:'unconfigured', updatedAt:'2026-09-18T05:29:35Z', refreshAfterSeconds:900,
  posts:[
    {id:'DdYG0Klj8dd',timestamp:'2026-09-16T00:00:00Z',date:'16 SEP 2026',image:'/images/instagram-1.jpg',permalink:'https://www.instagram.com/m.by__sana/p/DdYG0Klj8dd/'},
    {id:'DdQLIJbDwp6',timestamp:'2026-09-13T01:00:00Z',date:'13 SEP 2026',image:'/images/instagram-2.jpg',permalink:'https://www.instagram.com/m.by__sana/p/DdQLIJbDwp6/'},
    {id:'DdOu2TRD7fJ',timestamp:'2026-09-13T00:00:00Z',date:'13 SEP 2026',image:'/images/instagram-3.jpg',permalink:'https://www.instagram.com/m.by__sana/p/DdOu2TRD7fJ/'},
  ],
};

function instagramUrl(value:unknown):string|undefined {
  if(typeof value!=='string')return;
  try{const url=new URL(value);if(url.protocol==='https:'&&['www.instagram.com','instagram.com'].includes(url.hostname)&&/^\/(?:[\w.]+\/)?(?:p|reel)\/[\w-]+\/?$/.test(url.pathname))return `${url.origin}${url.pathname.replace(/\/?$/,'/')}`;}catch{}
}
function mediaUrl(value:unknown):string|undefined {
  if(typeof value!=='string')return;
  try{const url=new URL(value);if(url.protocol==='https:'&&(url.hostname.endsWith('.cdninstagram.com')||url.hostname.endsWith('.fbcdn.net')))return value;}catch{}
}

export function normalizeMedia(input:unknown):Post[] {
  if(!Array.isArray(input))throw new Error('Missing media');
  const posts:Post[]=[];const seen=new Set<string>();
  for(const raw of input){
    if(!raw||typeof raw!=='object')continue;
    const link=instagramUrl(raw.permalink);const time=Date.parse(raw.timestamp);
    if(!link||!Number.isFinite(time)||typeof raw.id!=='string'||seen.has(raw.id))continue;
    seen.add(raw.id);
    posts.push({id:raw.id,permalink:link,timestamp:new Date(time).toISOString(),date:new Date(time).toLocaleDateString('es-CL',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}),image:mediaUrl(raw.media_type==='VIDEO'?raw.thumbnail_url:raw.media_url),caption:typeof raw.caption==='string'?raw.caption.slice(0,2000):undefined});
  }
  if(!posts.length)throw new Error('No valid media');
  return posts.sort((a,b)=>Date.parse(b.timestamp)-Date.parse(a.timestamp)).slice(0,3);
}

export function createFeedService({configured,loadMedia,now=Date.now,persist,restore}:{configured:()=>boolean;loadMedia:()=>Promise<unknown>;now?:()=>number;persist?:(feed:Feed)=>Promise<void>;restore?:()=>Promise<Feed|null>}) {
  let last:Feed|null=null;let nextCheck=0;let inFlight:Promise<Feed>|null=null;let restored=false;
  return async function getFeed():Promise<Feed>{
    if(!configured())return {...(last??fallbackFeed),status:'unconfigured'};
    if(last&&now()<nextCheck)return last;
    if(inFlight)return inFlight;
    inFlight=(async()=>{
      if(!restored){restored=true;try{last=await restore?.()??null}catch{}}
      try{
        const posts=normalizeMedia(await loadMedia());
        last={status:'live',updatedAt:new Date(now()).toISOString(),posts,refreshAfterSeconds:900};
        nextCheck=now()+900_000;
        try{await persist?.(last)}catch{/* A read-only deployment may use memory cache. */}
        return last;
      }catch{
        nextCheck=now()+300_000;
        last={...(last??fallbackFeed),status:'stale',refreshAfterSeconds:300};
        return last;
      }finally{inFlight=null}
    })();
    return inFlight;
  };
}
