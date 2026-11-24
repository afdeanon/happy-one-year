import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './styles.css'
import './palette.css'
import { siteContent } from './content'
import { saveReaction, subscribeToReactions } from './firebase'

gsap.registerPlugin(ScrollTrigger)
function Envelope({ onContinue }) {
  const [open, setOpen] = useState(false)
  return <main className="letter-screen">
    <div className="sparkle sparkle-a">✦</div><div className="sparkle sparkle-b">✧</div>
    <h1>To {siteContent.hisName} <span aria-hidden="true">♡</span></h1>
    <div className={`envelope-wrap ${open ? 'is-open' : ''}`}>
      <button className="envelope" onClick={() => setOpen((current) => !current)} aria-label={open ? 'Close love letter' : 'Open love letter'}>
        <span className="envelope-back" /><span className="envelope-paper"><span className="paper-preview">Better late than never 🤭</span><span className="paper-letter">{siteContent.letter}</span></span><span className="envelope-flap" /><span className="envelope-front" />
      </button>
      {!open && <p className="tap-prompt">Tap to open <span>👆</span></p>}
    </div>
    <div className="continue-slot"><AnimatePresence>{open && <motion.button className="button button-dark letter-continue" initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ type: 'spring', stiffness: 130, damping: 16 }} onClick={onContinue}>Continue <span>→</span></motion.button>}</AnimatePresence></div>
  </main>
}

function PlaneTransition() {
  const ref = useRef(null)
  useEffect(() => { const ctx = gsap.context(() => { const plane = ref.current.querySelector('.plane'); const trail = ref.current.querySelector('.flight-line'); const scrollTrigger = { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: 1, invalidateOnRefresh: true }; const timeline = gsap.timeline({ scrollTrigger }); timeline.fromTo(plane, { x: -80, rotate: 0 }, { x: () => ref.current.offsetWidth + 80, rotate: 0, ease: 'none' }, 0).fromTo(trail, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none' }, 0) }, ref); return () => ctx.revert() }, [])
  return <div className="plane-scene" ref={ref} aria-hidden="true"><div className="cloud cloud-one">☁</div><div className="cloud cloud-two">☁</div><div className="cloud cloud-three">☁</div><div className="flight-line" /><div className="plane">✈</div></div>
}

function LiveTimezones() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer) }, [])
  const formatTime = (timeZone) => new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit', second: '2-digit', timeZoneName: 'short' }).format(now)
  return <div className="timezone-row" aria-label="Live local times"><span><strong>Bay Area, CA</strong><time>{formatTime('America/Los_Angeles')}</time></span><span><strong>Montreal, QC</strong><time>{formatTime('America/Toronto')}</time></span></div>
}

function Memories() {  return <section className="section memories-section" id="memories"><div className="memory-collage"><div className="section-heading"><h2>Time spent <em>together</em></h2><p>Here are my favorite moments with you, whether we're together in-person or online. ♡ 🥰 ♡</p><LiveTimezones /></div><div className="memory-cards">{siteContent.memories.map((m, i) => <figure className={`polaroid memory-card memory-card-${i + 1}`} key={m.id}><img src={m.src} alt={m.alt} loading="lazy" /><figcaption>{m.caption}</figcaption><time>{m.date}</time></figure>)}</div>

  </div>
  </section>
}

function ReactionBar({ mediaId }) {
  const [reaction, setReaction] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => subscribeToReactions(mediaId, (data) => setReaction(data.emoji || '')), [mediaId])
  const react = async (emoji) => {
    if (saving) return
    setSaving(true)
    setError('')
    try {
      await saveReaction(mediaId, emoji)
      setReaction(emoji)
    } catch (error) {
      console.error('Failed to save reaction', error)
      setError('Could not save your reaction. Please try again.')
    } finally {
      setSaving(false)
    }
  }
  return <div className="reaction-bar"><div className="reactions" aria-label="React to this memory">{['❤️', '😂', '🥹', '🔥', '😍'].map((e) => <button key={e} className={reaction === e ? 'selected' : ''} onClick={() => react(e)} aria-label={`React ${e}`} aria-pressed={reaction === e} disabled={saving}>{e}</button>)}</div>{error && <p className="reaction-error" role="alert">{error}</p>}</div>
}

function TripModal({ trip, onClose }) {
  const [index, setIndex] = useState(0); const media = trip.media[index]; const isNight = new Date().getHours() >= 18 || new Date().getHours() < 7; const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.location)}`
  return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`${trip.title} gallery`} onClick={onClose}><div className={`gallery-modal ${isNight ? 'is-night' : 'is-day'}`} onClick={(e) => e.stopPropagation()}><button className="close-button" onClick={onClose} aria-label="Close gallery">×</button><h3>{trip.title}</h3><div className="gallery-meta"><a href={mapsUrl} target="_blank" rel="noreferrer">{trip.location} ↗</a><span>{trip.dates}</span></div>{media ? <><div className="gallery-stage">{media.type === 'video' ? <video controls playsInline preload="metadata" poster={media.poster} src={media.src} aria-label={media.alt} /> : <img src={media.src} alt={media.alt} loading="lazy" />}</div><ReactionBar key={media.id} mediaId={media.id} /><div className="gallery-nav"><button onClick={() => setIndex((index - 1 + trip.media.length) % trip.media.length)} aria-label="Previous media">←</button><span>{index + 1} / {trip.media.length}</span><button onClick={() => setIndex((index + 1) % trip.media.length)} aria-label="Next media">→</button></div></> : <p className="gallery-empty">{trip.emptyMessage}</p>}</div></div>
}

function Trips() { const [active, setActive] = useState(null); return <section className="section trips-section" id="trips"><div className="section-heading"><p className="eyebrow">Travel Memories</p><h2>Our <em>Trips</em></h2></div><div className="timeline">{siteContent.trips.map((trip) => <button className="trip-card" key={trip.id} onClick={() => setActive(trip)}><div className="trip-image">{trip.cover ? <img src={trip.cover} alt={`${trip.title} cover`} loading="lazy" /> : <div className="trip-cover-placeholder" role="img" aria-label={`${trip.title} placeholder cover`}>🌙 😘</div>}<span>open gallery ↗</span></div><div className="trip-info"><div><p className="eyebrow">{trip.dates}</p><h3>{trip.title}</h3><p>{trip.location}</p></div></div></button>)}</div><p className="trip-note">Hoping we can travel together soon! ♡</p>{active && <TripModal trip={active} onClose={() => setActive(null)} />}</section> }

function Music() {
  const sectionRef = useRef(null); const playerRef = useRef(null); const [activeSong, setActiveSong] = useState(null); const [isPlaying, setIsPlaying] = useState(false);
  const sendPlayerCommand = (func) => playerRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*')
  const toggleSong = (song) => { if (activeSong?.id !== song.id) { sendPlayerCommand('pauseVideo'); setActiveSong(song); setIsPlaying(true); return } sendPlayerCommand(isPlaying ? 'pauseVideo' : 'playVideo'); setIsPlaying((playing) => !playing) }
  useEffect(() => { const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) { sendPlayerCommand('pauseVideo'); setIsPlaying(false) } }, { threshold: .45 }); if (sectionRef.current) observer.observe(sectionRef.current); return () => observer.disconnect() }, [])
  return <section className="section songs-section" id="songs" ref={sectionRef}><div className="music-sheet" aria-hidden="true"><div className="staff" />{['♪', '♫', '♩', '♬', '♪'].map((n, i) => <span key={i} style={{ '--i': i }}>{n}</span>)}</div><div className="section-heading"><p className="eyebrow">The ultimate soundtrack</p><h2>Our Favorite <em>Songs</em></h2><p>Music we sing together.</p></div><div className="music-layout"><div className="song-list">{siteContent.songs.map((song, i) => <div className={`song-row ${activeSong?.id === song.id ? 'is-active' : ''}`} key={song.id}><span className="song-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><img src={song.art} alt={`${song.title} album art`} loading="lazy" /><button className="play-button" onClick={() => toggleSong(song)} aria-label={`${activeSong?.id === song.id && isPlaying ? 'Pause' : 'Play'} ${song.title}`}>{activeSong?.id === song.id && isPlaying ? 'Ⅱ' : '▶'}</button><div className="song-copy"><strong>{song.title}</strong><span>{song.artist}</span></div></div>)}</div><aside className="now-playing" aria-label="Current song"><p className="eyebrow">Now playing</p>{activeSong ? <><div className="youtube-song-player"><iframe ref={playerRef} src={`https://www.youtube.com/embed/${activeSong.youtubeId}?autoplay=1&rel=0&enablejsapi=1&origin=${window.location.origin}`} title={`${activeSong.title} by ${activeSong.artist}`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div><h3>{activeSong.title}</h3><p>{activeSong.artist}</p><a className="now-playing-link" href={`https://www.youtube.com/watch?v=${activeSong.youtubeId}`} target="_blank" rel="noreferrer">Watch on YouTube ↗</a></> : <p>Select a song to begin.</p>}</aside></div></section>
}

function MainPage({ onOpenLetter }) { const finale = useRef(null); const [show, setShow] = useState(false); useEffect(() => { const obs = new IntersectionObserver(([e]) => setShow(e.isIntersecting), { threshold: .4 }); if (finale.current) obs.observe(finale.current); return () => obs.disconnect() }, []); return <main><header className="topbar"><nav className="topnav" aria-label="Anniversary sections"><button data-label="To Denz" onClick={onOpenLetter} aria-label="Reopen love letter" title="Love letter">💌</button><a data-label="Memories" className="nav-icon" href="#memories" aria-label="Jump to memories" title="Memories">📸</a><a data-label="Trips" className="nav-icon" href="#trips" aria-label="Jump to trips" title="Trips">✈️</a><a data-label="Favorite music" className="nav-icon" href="#songs" aria-label="Jump to favorite music" title="Favorite music">🎵</a></nav></header><section className="hero"><p className="eyebrow">{siteContent.shortDate} · Happy Anniversary, my love ❤️</p><h1> You Survived,<br /><em>one whole year.</em></h1><img className="hero-meme" src="/media/megumi.gif" width="900" height="908" alt="Megumi casting an explosion spell" loading="lazy" /><p className="hero-note">scroll if you dare 😈</p></section><Memories /><PlaneTransition /><Trips /><Music /><section className={`finale ${show ? 'is-visible' : ''}`} ref={finale}><div className="finale-star">✦</div><p className="eyebrow">Hope this brightened up your day!</p><h2>Happy Anniversary,<br /><em>Denzy</em></h2></section><footer>Made with a little bit too much love.</footer></main> }

function App() { const [opened, setOpened] = useState(() => localStorage.getItem('letterOpened') === 'true'); const [reopen, setReopen] = useState(false); const continueToSite = () => { localStorage.setItem('letterOpened', 'true'); setOpened(true); setReopen(false) }; if (!opened || reopen) return <Envelope onContinue={continueToSite} />; return <MainPage onOpenLetter={() => setReopen(true)} /> }

createRoot(document.getElementById('root')).render(<App />)
