'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDown, ArrowRight, ArrowLeft, Play, X, Menu, Instagram, Disc3, Sparkles, Plus, Volume2, ExternalLink } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Link from 'next/link';
import { sana } from '@/data/sana';
import { fallbackFeed, type Feed } from '@/lib/instagram-model';

const chapters = [
  {image:'sana-hero-bazaar.jpg', eyebrow:'01 / THE MUSE', title:'Una presencia.\nMil miradas.', text:'La elegancia no necesita hacer ruido.', credit:'Harper’s Bazaar · Prada'},
  {image:'sana-stage-seattle-01.jpg', eyebrow:'02 / THE PERFORMER', title:'Hecha para\nsentirlo todo.', text:'El escenario, las luces y esa conexión con ONCE.', credit:'THIS IS FOR · Seattle, 2026'},
  {image:'sana-fansign-2017.jpg', eyebrow:'03 / JUST SANA', title:'La misma luz.\nDesde siempre.', text:'Detrás de cada era, la calidez que permanece.', credit:'Encuentro con fans · 2017'},
];
const eraImages = ['sana-2016.jpg','sana-2016.jpg','sana-2016.jpg','sana-2016.jpg','sana-fansign-2017.jpg','sana-fansign-2017.jpg','sana-fansign-2017.jpg','sana-prada-gold.jpg','sana-prada-gold.jpg','sana-prada-gold.jpg','sana-vogue.jpg','sana-hero-bazaar.jpg','sana-airport-2025.jpg','sana-stage-seattle-01.jpg'];
type Modal = {kind:'photo'; index:number} | {kind:'video'; id:string; title:string} | null;
const nav = [['Universo','universo'],['Trayectoria','trayectoria'],['Galería','galeria'],['On air','on-air'],['Música','musica']];
function Tag({children}:{children:React.ReactNode}) {return <span className="eyebrow">{children}</span>}
function SectionHead({n,kicker,title,children}:{n:string;kicker:string;title:React.ReactNode;children?:React.ReactNode}) {return <div className="section-head reveal"><div><Tag>{n} / {kicker}</Tag><h2>{title}</h2></div>{children}</div>}
function VideoCard({video,onOpen}:{video:{id:string;name:string;sub:string;description:string};onOpen:()=>void}) {return <article className="video-card"><button className="video-cover" onClick={onOpen} aria-label={`Reproducir ${video.name}`}><img src={`/images/video-${video.id}.jpg`} alt={`${video.name} con Sana`} loading="lazy" width="480" height="270"/><span className="play-icon"><Play size={22} fill="currentColor"/></span><span className="video-corner">WATCH ↗</span></button><Tag>{video.sub}</Tag><h3>{video.name}</h3><p>{video.description}</p></article>}

export default function Experience() {
  const [menuOpen,setMenuOpen] = useState(false);
  const [era,setEra] = useState(13);
  const [filter,setFilter] = useState('Todas');
  const [modal,setModal] = useState<Modal>(null);
  const [feed,setFeed] = useState<Feed>(fallbackFeed);
  const [feedBusy,setFeedBusy] = useState(false);
  const [feedError,setFeedError] = useState(false);
  const [chapter,setChapter] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const progress = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)',()=>{
      const lenis = new Lenis({duration:1.05, smoothWheel:true, anchors:{offset:-85}});
      lenis.on('scroll',ScrollTrigger.update);
      const tick = (time:number)=>lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.fromTo('.hero-photo',{scale:1.04},{scale:1.17,yPercent:9,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
      gsap.to('.hero-title',{yPercent:28,opacity:.2,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
      gsap.utils.toArray<HTMLElement>('.reveal').forEach(el=>gsap.fromTo(el,{y:32,opacity:.4},{y:0,opacity:1,duration:.8,scrollTrigger:{trigger:el,start:'top 93%',once:true}}));
      const frames = gsap.utils.toArray<HTMLElement>('.story-frame');
      const tl = gsap.timeline({scrollTrigger:{trigger:'.scroll-story',start:'top top',end:'bottom bottom',scrub:1,onUpdate:self=>setChapter(Math.min(2,Math.floor(self.progress*3)))}});
      tl.to(frames[0],{scale:1.12,duration:1}).to(frames[0],{opacity:0,scale:1.2,duration:.5})
        .fromTo(frames[1],{opacity:0,scale:.85,rotate:5},{opacity:1,scale:1,rotate:0,duration:.5},'<')
        .to(frames[1],{scale:1.1,duration:1}).to(frames[1],{opacity:0,scale:1.18,duration:.5})
        .fromTo(frames[2],{opacity:0,scale:.85,rotate:-5},{opacity:1,scale:1,rotate:0,duration:.5},'<')
        .to(frames[2],{scale:1.08,duration:1});
      return ()=>{gsap.ticker.remove(tick);lenis.destroy()};
    });
    const update=()=>{if(progress.current)progress.current.style.transform=`scaleX(${window.scrollY / Math.max(1,document.documentElement.scrollHeight-window.innerHeight)})`};
    window.addEventListener('scroll',update,{passive:true});
    return ()=>{mm.revert();window.removeEventListener('scroll',update)};
  },[]);

  useEffect(()=>{ScrollTrigger.refresh()},[filter,era]);

  useEffect(()=>{
    let active=true; const controller=new AbortController();
    const refresh=async()=>{if(document.hidden)return;setFeedBusy(true);try{const res=await fetch('/api/instagram',{signal:controller.signal,cache:'no-store'});if(!res.ok)throw Error();const data:Feed=await res.json();if(active){setFeed(data);setFeedError(false)}}catch{if(active)setFeedError(true)}finally{if(active)setFeedBusy(false)}};
    void refresh(); const interval=setInterval(refresh,60_000);document.addEventListener('visibilitychange',refresh);
    return()=>{active=false;controller.abort();clearInterval(interval);document.removeEventListener('visibilitychange',refresh)};
  },[]);

  useEffect(()=>{
    if(modal){returnFocus.current=document.activeElement as HTMLElement;dialog.current?.showModal();document.documentElement.style.overflow='hidden'}
    else {dialog.current?.close();document.documentElement.style.overflow='';returnFocus.current?.focus()}
    return()=>{document.documentElement.style.overflow=''};
  },[!!modal]);
  const openVideo=(id:string,title:string)=>setModal({kind:'video',id,title});
  const photoStep=(dir:number)=>setModal(m=>m?.kind==='photo'?{kind:'photo',index:(m.index+dir+sana.gallery.length)%sana.gallery.length}:m);
  const eraInfo=sana.timeline[era];

  return <>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <div className="reading-progress" ref={progress}/>
    <header className="site-nav glass"><a href="#inicio" className="brand" aria-label="Sana MK2 inicio">S<span className="brand-star">✳</span>NA<span className="version">MK.02</span></a>
      <nav aria-label="Navegación principal" className={menuOpen?'nav-links open':'nav-links'}>{nav.map(([label,id])=><a key={id} href={`#${id}`} onClick={()=>setMenuOpen(false)}>{label}</a>)}</nav>
      <a className="nav-ig" href="#instagram">En su mundo <ArrowUpRight size={16}/></a>
      <button className="menu-toggle" aria-label={menuOpen?'Cerrar menú':'Abrir menú'} aria-expanded={menuOpen} onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?<X/>:<Menu/>}</button>
    </header>
    <main id="contenido">
      <section className="hero" id="inicio">
        <div className="hero-grid"/>
        <div className="hero-image-wrap"><img className="hero-photo" src="/images/sana-magenta.jpg" alt="Sana con vestido negro ante un fondo magenta" width="1080" height="1350" fetchPriority="high"/><div className="hero-shade"/></div>
        <div className="hero-topline"><Tag><span className="live-dot"/> THE SANA UNIVERSE</Tag><span className="coord">OSAKA → SEOUL → EVERYWHERE</span></div>
        <div className="hero-copy"><span className="japanese">湊﨑 紗夏</span><h1 className="hero-title">SANA<span>サナ</span></h1><div className="hero-bottom-copy"><h2>A universe<br/>of her <em>own.</em></h2><p>Artista. Musa. Una luz imposible de ignorar.<br/>Entra al universo de Minatozaki Sana.</p><a href="#universo" className="button primary">Explorar su universo <ArrowDown size={17}/></a></div></div>
        <div className="hero-orbit glass"><Sparkles size={18}/><span>Soft energy.<br/><strong>Infinite impact.</strong></span><span className="orbit-cross">+</span></div>
        <a href="#musica" className="hero-record glass"><Disc3 className="record-spin" size={34}/><div><Tag>IN THE SPOTLIGHT</Tag><strong>Ma Cherry</strong><span>SANA · MISAMO / PLAY, 2026</span></div><ArrowUpRight size={20}/></a>
        <div className="hero-footer"><span>UN ARCHIVO VISUAL HECHO POR FANS</span><a href="#universo">SCROLL TO DISCOVER <ArrowDown size={14}/></a><span>01 — 07</span></div>
      </section>

      <div className="ticker" aria-hidden="true"><div>{Array.from({length:4},(_,i)=><span key={i}>MINATOZAKI SANA <i>✳</i> TWICE <i>✳</i> MISAMO <i>✳</i> NO SANA, NO LIFE <i>✳</i></span>)}</div></div>

      <section className="section profile" id="universo">
        <div className="profile-photo reveal"><img src="/images/sana-prada-gold.jpg" alt="Retrato de Sana para Prada Eternal Gold" width="1280" height="1600" loading="lazy"/><span className="image-note">SANA / PRADA ETERNAL GOLD</span><div className="photo-seal">S<span>1996<br/>OSAKA, JP</span></div></div>
        <div className="profile-copy reveal"><Tag>01 / MEET SANA</Tag><h2>Encanto natural.<br/><em>Alcance global.</em></h2><p className="lead">De Osaka al mundo. Una voz que conecta, una presencia que se transforma y una sonrisa que se queda.</p><p>Minatozaki Sana es cantante, bailarina, compositora y presentadora japonesa. Desde su debut con TWICE en 2015, ha construido una trayectoria que cruza idiomas, escenarios y disciplinas. Con MISAMO explora otra faceta de su identidad junto a Mina y Momo.</p>
        <dl className="bio-grid"><div><dt>NOMBRE</dt><dd>湊﨑 紗夏 · Minatozaki Sana</dd></div><div><dt>NACIMIENTO</dt><dd>29 diciembre 1996</dd></div><div><dt>ORIGEN</dt><dd>Osaka, Japón</dd></div><div><dt>UNIVERSO MUSICAL</dt><dd>TWICE · MISAMO · JYP</dd></div></dl><a className="text-link" href="#trayectoria">Conoce cada capítulo <ArrowUpRight size={19}/></a></div>
      </section>

      <section className="scroll-story" aria-label="Tres facetas de Sana en fotografías">
        <div className="story-sticky"><div className="story-noise"/><div className="story-kicker"><Tag>ONE SANA. MANY DIMENSIONS.</Tag><span>SCROLL EXPERIENCE / 0{chapter+1}</span></div><div className="story-big-word" aria-hidden="true">SANA</div>
        <div className="story-frames">{chapters.map((c,i)=><figure key={c.image} className={`story-frame story-frame-${i}`}><img src={`/images/${c.image}`} alt={c.credit} width="1080" height="1350" loading="lazy"/><figcaption>{c.credit}</figcaption></figure>)}</div>
        <div className="story-copy" key={chapter}><Tag>{chapters[chapter].eyebrow}</Tag><h2>{chapters[chapter].title}</h2><p>{chapters[chapter].text}</p></div><div className="story-indicator">{chapters.map((c,i)=><span key={c.image} className={i===chapter?'active':''}/>)}<span>SCROLL ↓</span></div></div>
      </section>

      <section className="section career" id="trayectoria"><SectionHead n="02" kicker="THE EVOLUTION" title={<>Cada era.<br/><em>La misma esencia.</em></>}><p>De los primeros pasos en Osaka a los escenarios del mundo. Recorre su historia, año a año.</p></SectionHead>
        <div className="era-selector" role="group" aria-label="Selecciona un año de la trayectoria">{sana.timeline.map(([year],i)=><button aria-pressed={era===i} className={era===i?'selected':''} key={year} onClick={()=>setEra(i)}>{year}</button>)}</div>
        <div className="era-card glass" key={era}><div className="era-content"><span className="era-year">{eraInfo[0]}</span><Tag>{eraInfo[3]}</Tag><h3>{eraInfo[1]}</h3><p>{eraInfo[2]}</p><div className="era-controls"><button aria-label="Era anterior" disabled={era===0} onClick={()=>setEra(era-1)}><ArrowLeft size={19}/></button><span>{String(era+1).padStart(2,'0')} / {sana.timeline.length}</span><button aria-label="Era siguiente" disabled={era===sana.timeline.length-1} onClick={()=>setEra(era+1)}><ArrowRight size={19}/></button></div></div><div className="era-photo"><img src={`/images/${eraImages[era]}`} alt={`Sana — imagen de archivo para el capítulo ${eraInfo[0]}`} loading="lazy" width="1280" height="1600"/><span>ARCHIVO VISUAL · IMAGEN ILUSTRATIVA</span></div></div>
        <details className="full-timeline" onToggle={()=>ScrollTrigger.refresh()}><summary>Leer la trayectoria completa <Plus size={18}/></summary><div>{sana.timeline.map(([year,title,text])=><article key={year}><Tag>{year}</Tag><h3>{title}</h3><p>{text}</p></article>)}</div></details>
      </section>

      <section className="section gallery-section" id="galeria"><SectionHead n="03" kicker="VISUAL DIARY" title={<>Un instante.<br/><em>Todo un universo.</em></>}><div><p>Editoriales, escenarios y recuerdos.<br/>Doce miradas a Sana.</p><div className="filters" role="group" aria-label="Filtrar fotografías">{['Todas','Editorial','Escenario','Archivo'].map(f=><button key={f} aria-pressed={f===filter} onClick={()=>setFilter(f)}>{f}</button>)}</div></div></SectionHead><div className="photo-grid">{sana.gallery.map(([image,title,credit,category],index)=> filter!=='Todas'&&filter!==category?null:<button className="gallery-photo" key={image} onClick={()=>setModal({kind:'photo',index})} aria-label={`Ampliar ${title}`}><img src={`/images/${image}`} alt={`Sana — ${credit}`} width="1080" height="1350" loading="lazy"/><span className="gallery-expand"><Plus size={21}/></span><span className="gallery-caption"><small>{category} / {String(index+1).padStart(2,'0')}</small><strong>{title}</strong><span>{credit}</span></span></button>)}</div><div className="gallery-foot"><span>UNA COLECCIÓN PARA MIRAR DESPACIO.</span><Link href="/creditos">Fuentes y créditos de las imágenes <ArrowUpRight size={14}/></Link></div></section>

      <section className="section interviews" id="on-air"><SectionHead n="04" kicker="SANA’S FRIDGE INTERVIEW" title={<>La curiosidad<br/>tiene <em>su voz.</em></>}><p>Ahora, ella hace las preguntas. Conversaciones, risas y encuentros con algunas de las estrellas de Corea.</p></SectionHead>
        <div className="featured-video"><button onClick={()=>openVideo(sana.videos[1].id,'Sana × G-DRAGON')} aria-label="Reproducir entrevista con G-DRAGON"><img src="/images/video-58gb5Mc6zIQ.jpg" alt="Sana y DEX entrevistan a G-DRAGON" width="480" height="270" loading="lazy"/><span className="feature-video-tag glass"><span className="live-dot"/> FEATURED CONVERSATION</span><span className="big-play"><Play size={30} fill="currentColor"/></span></button><div className="featured-copy"><Tag>117 CHANNEL / EPISODE 13</Tag><h3>SANA ×<br/>G-DRAGON</h3><p>Dos universos en una misma mesa. Sana y DEX reciben a G-DRAGON en un episodio para volver a ver.</p><button className="text-link" onClick={()=>openVideo('58gb5Mc6zIQ','Sana × G-DRAGON')}>Ver entrevista <ArrowUpRight size={18}/></button></div></div>
        <div className="video-grid">{sana.videos.filter((_,i)=>i!==1).map(v=><VideoCard key={v.id} video={v} onOpen={()=>openVideo(v.id,`Sana × ${v.name}`)}/>)}</div>
        <div className="comments-banner glass"><div className="comment-symbol">“</div><div><Tag>EXTRA / CON LA COMUNIDAD</Tag><h3>Sana también lee los comentarios.</h3><p>El episodio dedicado a las reacciones de su programa. Entra al video original para participar en la conversación.</p></div><button className="round-button" aria-label="Ver Sana leyendo comentarios" onClick={()=>openVideo('JLmjwDd7Zxw','Sana lee los comentarios · EP. 18')}><ArrowUpRight/></button></div>
      </section>

      <section className="section music" id="musica"><SectionHead n="05" kicker="PRESS PLAY" title={<>Su voz.<br/><em>En otra frecuencia.</em></>}><p>Covers para escuchar de cerca.<br/>Canciones que llevan su propia firma.</p></SectionHead><div className="music-grid">{sana.music.map((v,i)=><article className="music-card" key={v.id}><button onClick={()=>openVideo(v.id,v.name)} aria-label={`Escuchar ${v.name}`}><img src={`/images/video-${v.id}.jpg`} alt={`Portada del cover ${v.name}`} loading="lazy" width="480" height="270"/><span className="music-number">0{i+1}</span><span className="play-icon"><Play size={20} fill="currentColor"/></span></button><Tag>{v.sub}</Tag><h3>{v.name}</h3><p>{v.description}</p></article>)}</div>
        <div className="solo-list"><div><Tag>HER OWN SOUND</Tag><h3>El siguiente track<br/>lleva su nombre.</h3></div><div>{[['Mirage','HAUTE COUTURE · 2024','https://www.twicejapan.com/discography/kind/5/'],['DECAFFEINATED','TEN: The Story Goes On · 2025','https://twice.jype.com/Default/DiscographyList'],['Ma Cherry','PLAY · 2026','https://www.twicejapan.com/discography/kind/5/']].map(([title,sub,url],i)=><a href={url} target="_blank" rel="noreferrer" key={title}><span className="solo-index">0{i+1}</span><span><strong>{title}</strong><small>{sub} · Ver álbum</small></span><Volume2 size={20}/><ArrowUpRight size={18}/></a>)}</div></div><p className="writing-note"><Sparkles size={16}/> También detrás de las letras: Shot Thru the Heart, Turn It Up, Do What We Like, Conversation y Rewind you, entre otras.</p>
      </section>

      <section className="section instagram-section" id="instagram"><SectionHead n="06" kicker="A LITTLE CLOSER" title={<>Desde su<br/><em>propio mundo.</em></>}><a className="button glass" href="https://www.instagram.com/m.by__sana/" target="_blank" rel="noreferrer"><Instagram size={19}/>@m.by__sana <ArrowUpRight size={17}/></a></SectionHead>
        <div className="feed-status" role="status"><span className={feed.status==='live'&&!feedError?'status-dot connected':'status-dot'}/><span>{feedError?'No se pudo comprobar Instagram. Mostrando la última selección disponible.':feed.status==='live'?'Conectado · publicaciones sincronizadas':feed.status==='stale'?'Sin conexión · mostrando publicaciones guardadas':'Selección guardada · actualización automática pendiente de conexión'}</span><span className="feed-date">{feedBusy?'Comprobando…':`Comprobación: ${new Date(feed.updatedAt).toLocaleDateString('es-CL',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'})}`}</span></div>
        <div className="instagram-grid">{feed.posts.map((post,i)=><article className="insta-card" key={post.id}><a className="insta-image" href={post.permalink} target="_blank" rel="noreferrer">{post.image?<img src={post.image} alt={post.caption||`Publicación de Sana del ${post.date}`} loading="lazy" width="640" height="800" onError={e=>{e.currentTarget.style.display='none'}}/>:null}<span className="insta-placeholder"><Instagram size={30}/><span>Ver publicación en Instagram</span></span><span className="insta-label glass"><Instagram size={17}/> {String(i+1).padStart(2,'0')}</span><span className="insta-arrow"><ArrowUpRight/></span></a><div className="insta-meta"><span>{post.date}</span><a href={`${post.permalink}#comments`} target="_blank" rel="noreferrer">Publicación y comentarios <ArrowUpRight size={14}/></a></div>{post.caption&&<p className="insta-caption">{post.caption}</p>}</article>)}</div><p className="feed-note">{feed.status==='unconfigured'?'Estas tres publicaciones se comprobaron el 18 de septiembre de 2026. No se presentan como un feed en directo.':'Se comprueba si hay nuevas publicaciones cada 15 minutos mientras la web está en uso.'} Los comentarios se abren en Instagram, que puede pedir iniciar sesión.</p>
      </section>

      <section className="outro"><div className="outro-glow"/><Tag>07 / ALWAYS EVOLVING</Tag><h2>No Sana.<br/><em>No life.</em><span>♡</span></h2><p>Una historia que sigue escribiéndose.<br/>Un universo al que siempre volver.</p><a href="#inicio" className="button glass">Volver al inicio <ArrowUpRight size={18}/></a><span className="outro-jp" aria-hidden="true">サナ</span></section>
    </main>
    <footer className="site-footer"><a className="brand" href="#inicio">S<span className="brand-star">✳</span>NA<span className="version">MK.02</span></a><p>Hecho con cariño para ONCE.<br/>Proyecto de fans, sin afiliación a Sana, TWICE o JYP.</p><div><Link href="/creditos">Fuentes y créditos <ArrowUpRight size={13}/></Link><a href="https://twice.jype.com/" target="_blank" rel="noreferrer">TWICE oficial <ArrowUpRight size={13}/></a></div><span className="footer-stamp">OSAKA → THE WORLD<br/>© 2026 / FAN ARCHIVE</span></footer>

    <dialog ref={dialog} className={`media-modal ${modal?.kind==='video'?'video-modal':''}`} aria-label={modal?.kind==='video'?modal.title:'Fotografía de Sana'} onCancel={()=>setModal(null)} onClick={e=>{if(e.target===dialog.current)setModal(null)}} onKeyDown={e=>{if(modal?.kind==='photo'){if(e.key==='ArrowRight')photoStep(1);if(e.key==='ArrowLeft')photoStep(-1)}}}>
      <button className="modal-close glass" aria-label="Cerrar" onClick={()=>setModal(null)}><X/></button>
      {modal?.kind==='photo'&&<div className="photo-modal-content"><img src={`/images/${sana.gallery[modal.index][0]}`} alt={`Sana — ${sana.gallery[modal.index][2]}`}/><div className="modal-photo-caption"><button className="round-button" aria-label="Foto anterior" onClick={()=>photoStep(-1)}><ArrowLeft/></button><div><strong>{sana.gallery[modal.index][1]}</strong><span>{sana.gallery[modal.index][2]} · {modal.index+1}/{sana.gallery.length}</span></div><button className="round-button" aria-label="Foto siguiente" onClick={()=>photoStep(1)}><ArrowRight/></button></div></div>}
      {modal?.kind==='video'&&<div className="video-modal-content"><iframe src={`https://www.youtube-nocookie.com/embed/${modal.id}?autoplay=1&rel=0`} title={modal.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/><div><h3>{modal.title}</h3><a href={`https://www.youtube.com/watch?v=${modal.id}`} target="_blank" rel="noreferrer">Abrir en YouTube <ExternalLink size={16}/></a></div><p>Si el reproductor no está disponible en tu región, abre el video en el canal original.</p></div>}
    </dialog>
  </>;
}
