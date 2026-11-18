import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, A11y } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import './styles.css'
import { siteContent } from './content'
import { saveReaction, subscribeToReactions } from './firebase'

gsap.registerPlugin(ScrollTrigger)

function Envelope({ onContinue }) {
  const [open, setOpen] = useState(false)
  return <main className="letter-screen">
    <div className="sparkle sparkle-a">✦</div><div className="sparkle sparkle-b">✧</div>
    <p className="eyebrow">a tiny love letter for</p><h1>{siteContent.hisName}</h1>
    <div className={`envelope-wrap ${open ? 'is-open' : ''}`}>
      <button className="envelope" onClick={() => setOpen(true)} aria-label={open ? 'Letter opened' : 'Open love letter'}>
        <span className="envelope-back" /><span className="envelope-paper"><span>for you, always ♡</span></span><span className="envelope-flap" /><span className="envelope-front" />
      </button>
      {!open && <p className="tap-prompt">Tap to open <span>↓</span></p>}
      <AnimatePresence>{open && <motion.article className="letter-card" initial={{ y: 100, opacity: 0, scale: .94 }} animate={{ y: -70, opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 100, damping: 16 }}>
        <div className="letter-copy"><p className="eyebrow">Dear {siteContent.hisName},</p>{siteContent.letter.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}</div>
        <img src={siteContent.letterPhoto} alt="A placeholder photo of a couple" loading="lazy" />
        <button className="button button-dark" onClick={onContinue}>Continue <span>→</span></button>
      </motion.article>}</AnimatePresence>
    </div>
  </main>
}

function PlaneTransition() {
  const ref = useRef(null)
  useEffect(() => { const ctx = gsap.context(() => { gsap.to('.plane', { x: 'calc(100vw - 5rem)', rotate: 2, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: 1 } }) }, ref); return () => ctx.revert() }, [])
  return <div className="plane-scene" ref={ref} aria-hidden="true"><div className="cloud cloud-one">☁</div><div className="cloud cloud-two">☁</div><div className="cloud cloud-three">☁</div><div className="flight-line" /><div className="plane">✈</div></div>
}

function Memories() {
  const [swiper, setSwiper] = useState(null)
  const shuffle = () => swiper?.slideTo(Math.floor(Math.random() * siteContent.memories.length))
  return <section className="section memories-section" id="memories"><div className="section-heading"><p className="eyebrow">tiny snapshots</p><h2>Our Favorite <em>Memories</em></h2><p>The ordinary moments that somehow became our favorites.</p></div>
    <Swiper modules={[Navigation, A11y]} navigation onSwiper={setSwiper} slidesPerView={1.15} spaceBetween={18} centeredSlides breakpoints={{ 700: { slidesPerView: 2.1 }, 1100: { slidesPerView: 3.1 } }} className="memory-swiper">{siteContent.memories.map((m) => <SwiperSlide key={m.id}><figure className="polaroid"><img src={m.src} alt={m.alt} loading="lazy" /><figcaption>{m.caption}</figcaption><time>{m.date}</time></figure></SwiperSlide>)}</Swiper>
    <button className="button button-cream" onClick={shuffle}>✦ Shuffle a memory</button>
  </section>
}

function ReactionBar({ mediaId }) {
  const [reaction, setReaction] = useState({ emoji: '', comment: '' }); const [comment, setComment] = useState('');
  useEffect(() => subscribeToReactions(mediaId, (data) => setReaction((r) => ({ ...r, ...data }))), [mediaId])
  const react = async (emoji) => { setReaction((r) => ({ ...r, emoji })); await saveReaction(mediaId, emoji, reaction.comment || comment) }
  const saveComment = async () => { const value = comment.slice(0, 180); setReaction((r) => ({ ...r, comment: value })); await saveReaction(mediaId, reaction.emoji || '❤️', value) }
  return <div className="reaction-bar"><div className="reactions" aria-label="React to this memory">{['❤️','😂','🥹','🔥','😍'].map((e) => <button key={e} className={reaction.emoji === e ? 'selected' : ''} onClick={() => react(e)} aria-label={`React ${e}`}>{e}</button>)}</div><div className="comment-row"><input value={comment} maxLength="180" onChange={(e) => setComment(e.target.value)} placeholder={reaction.comment || 'leave a tiny note…'} aria-label="Optional comment" /><button onClick={saveComment}>save</button></div></div>
}

function TripModal({ trip, onClose }) {
  const [index, setIndex] = useState(0); const media = trip.media[index]
  return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`${trip.title} gallery`} onClick={onClose}><div className="gallery-modal" onClick={(e) => e.stopPropagation()}><button className="close-button" onClick={onClose} aria-label="Close gallery">×</button><p className="eyebrow">{trip.location} · {trip.dates}</p><h3>{trip.title}</h3><div className="gallery-stage">{media.type === 'video' ? <video controls playsInline preload="metadata" poster={media.poster} src={media.src} aria-label={media.alt} /> : <img src={media.src} alt={media.alt} loading="lazy" />}</div><ReactionBar mediaId={media.id} /><div className="gallery-nav"><button onClick={() => setIndex((index - 1 + trip.media.length) % trip.media.length)} aria-label="Previous media">←</button><span>{index + 1} / {trip.media.length}</span><button onClick={() => setIndex((index + 1) % trip.media.length)} aria-label="Next media">→</button></div></div></div>
}

function Trips() { const [active, setActive] = useState(null); return <section className="section trips-section" id="trips"><div className="section-heading"><p className="eyebrow">our little map</p><h2>Our <em>Trips</em></h2><p>Proof that we are very good at turning “quick weekend” into “should we move here?”</p></div><div className="timeline">{siteContent.trips.map((trip, i) => <button className="trip-card" key={trip.id} onClick={() => setActive(trip)}><div className="trip-image"><img src={trip.cover} alt={`${trip.title} placeholder cover`} loading="lazy" /><span>open gallery ↗</span></div><div className="trip-info"><span className="trip-number">0{i + 1}</span><div><p className="eyebrow">{trip.dates}</p><h3>{trip.title}</h3><p>{trip.location}</p></div></div></button>)}</div>{active && <TripModal trip={active} onClose={() => setActive(null)} />}</section> }

function Music() {
  const [playing, setPlaying] = useState(null); const [progress, setProgress] = useState({}); const audio = useRef(new Audio());
  const toggle = (song) => { if (playing === song.id) { audio.current.pause(); setPlaying(null); return } audio.current.src = song.src; audio.current.play().then(() => setPlaying(song.id)).catch(() => {}); }
  useEffect(() => { const a = audio.current; const update = () => setProgress((p) => ({ ...p, [playing]: a.duration ? a.currentTime / a.duration * 100 : 0 })); a.addEventListener('timeupdate', update); a.addEventListener('ended', () => setPlaying(null)); return () => { a.pause(); a.removeEventListener('timeupdate', update) } }, [playing])
  return <section className="section songs-section" id="songs"><div className="music-sheet" aria-hidden="true"><div className="staff" />{['♪','♫','♩','♬','♪'].map((n, i) => <span key={i} style={{ '--i': i }}>{n}</span>)}</div><div className="section-heading"><p className="eyebrow">the soundtrack</p><h2>Our <em>Songs</em></h2><p>Press play. Pretend we are dancing in the kitchen.</p></div><div className="song-list">{siteContent.songs.map((song) => <div className="song-row" key={song.id}><img src={song.art} alt="" loading="lazy" /><button className="play-button" onClick={() => toggle(song)} aria-label={`${playing === song.id ? 'Pause' : 'Play'} ${song.title}`}>{playing === song.id ? 'Ⅱ' : '▶'}</button><div className="song-copy"><strong>{song.title}</strong><span>{song.artist}</span><div className="progress"><i style={{ width: `${progress[song.id] || 0}%` }} /></div></div></div>)}</div></section>
}

function MainPage({ onOpenLetter }) { const finale = useRef(null); const [show, setShow] = useState(false); useEffect(() => { const obs = new IntersectionObserver(([e]) => setShow(e.isIntersecting), { threshold: .4 }); if (finale.current) obs.observe(finale.current); return () => obs.disconnect() }, []); return <main><header className="topbar"><span>one year of us <span className="heart">♡</span></span><button onClick={onOpenLetter} aria-label="Reopen love letter">✉</button></header><section className="hero"><p className="eyebrow">{siteContent.shortDate} · a very good day</p><h1>One whole year<br />of <em>us.</em></h1><p className="hero-note">scroll for the good stuff ↓</p></section><Memories /><PlaneTransition /><Trips /><Music /><section className={`finale ${show ? 'is-visible' : ''}`} ref={finale}><div className="finale-star">✦</div><p className="eyebrow">still my favorite person</p><h2>Happy<br /><em>Anniversary</em>,</h2><p className="finale-name">{siteContent.hisName} ♡</p><p className="finale-date">{siteContent.anniversaryDate}</p></section><footer>made with too much love & a little bit of glitter ✦</footer></main> }

function App() { const [opened, setOpened] = useState(() => localStorage.getItem('letterOpened') === 'true'); const [reopen, setReopen] = useState(false); const continueToSite = () => { localStorage.setItem('letterOpened', 'true'); setOpened(true); setReopen(false) }; if (!opened || reopen) return <Envelope onContinue={continueToSite} />; return <MainPage onOpenLetter={() => setReopen(true)} /> }

createRoot(document.getElementById('root')).render(<App />)
