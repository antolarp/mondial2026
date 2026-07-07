'use client'
import { useState, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

// ── COUNT-UP ──────────────────────────────────────────────────────────────────
export function CountUp({ value, duration = 900, style, className }) {
  const [display, setDisplay] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); obs.disconnect() }
    }, { threshold: 0.3 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    const start = performance.now()
    let raf
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(eased * value))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [started, value, duration])

  // Bounce on live refresh
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const bounce = () => {
      el.style.animation = 'none'
      void el.offsetWidth
      el.style.animation = 'ptsBounce 0.45s ease both'
    }
    window.addEventListener('mondial-refresh', bounce)
    return () => window.removeEventListener('mondial-refresh', bounce)
  }, [])

  return <span ref={ref} style={style} className={className}>{display}</span>
}

// ── TILT CARD (hover 3D) ─────────────────────────────────────────────────────
export function TiltCard({ children, cardStyle, glowAnim }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const ref = useRef(null)

  const onMove = (e) => {
    if (!ref.current) return
    const r  = ref.current.getBoundingClientRect()
    const cx = (e.clientX - r.left)  / r.width  - 0.5
    const cy = (e.clientY - r.top)   / r.height - 0.5
    setTilt({ x: cy * 10, y: -cx * 10 })
  }
  const onLeave = () => setTilt({ x: 0, y: 0 })

  return (
    <div
      ref={ref}
      style={{
        ...cardStyle,
        animation: glowAnim,
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.12s ease',
        willChange: 'transform',
        overflow: 'hidden',
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  )
}

// ── SLOT COUNTER (machine à sous) ────────────────────────────────────────────
export function SlotCounter({ value, delay = 0, style, className }) {
  const [display, setDisplay] = useState('·')
  const [spinning, setSpinning] = useState(false)
  const ref = useRef(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); obs.disconnect() }
    }, { threshold: 0.3 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    const timer = setTimeout(() => {
      setSpinning(true)
      const start = performance.now()
      const duration = 1100
      let raf
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1)
        if (p < 0.72) {
          setDisplay(Math.floor(Math.random() * Math.max(value * 1.5, 15)))
        } else {
          const ep = (p - 0.72) / 0.28
          const eased = 1 - Math.pow(1 - ep, 3)
          setDisplay(Math.round(eased * value))
        }
        if (p < 1) raf = requestAnimationFrame(tick)
        else { setDisplay(value); setSpinning(false) }
      }
      raf = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(raf)
    }, delay)
    return () => clearTimeout(timer)
  }, [started, value, delay])

  return (
    <span
      ref={ref}
      style={{ ...style, display: 'inline-block', filter: spinning ? 'blur(1.5px)' : 'none', transition: spinning ? 'none' : 'filter 0.15s ease', fontVariantNumeric: 'tabular-nums' }}
      className={className}
    >
      {display}
    </span>
  )
}

// ── GOAL OVERLAY ──────────────────────────────────────────────────────────────
export function GoalOverlay({ exacts }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!exacts || exacts <= 0) return
    const el = ref.current
    if (!el) return
    el.style.display = 'flex'
    el.style.animation = 'goalIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both'
    const t1 = setTimeout(() => { el.style.animation = 'goalOut 0.6s ease both' }, 1300)
    const t2 = setTimeout(() => { el.style.display = 'none' }, 1950)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div ref={ref} style={{ display: 'none', position: 'fixed', inset: 0, zIndex: 998, alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 36, marginBottom: 4, lineHeight: 1 }}>⚽</p>
        <p style={{ fontSize: 96, fontWeight: 900, color: '#16a34a', lineHeight: 1, textShadow: '0 0 60px #16a34a77, 0 4px 24px rgba(0,0,0,0.3)', letterSpacing: '-3px' }}>GOAL !</p>
      </div>
    </div>
  )
}

// ── STADIUM SHAKE ─────────────────────────────────────────────────────────────
export function StadiumShake({ active }) {
  useEffect(() => {
    if (!active) return
    const el = document.documentElement
    el.style.animation = 'stadiumShake 0.7s ease both'
    const t = setTimeout(() => { el.style.animation = '' }, 750)
    return () => { clearTimeout(t); el.style.animation = '' }
  }, [active])
  return null
}

// ── KONAMI EASTER EGG ─────────────────────────────────────────────────────────
const KONAMI_SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']

export function KonamiEgg() {
  const [idx, setIdx] = useState(0)
  const [active, setActive] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const handle = (e) => {
      setIdx(prev => {
        const next = e.key === KONAMI_SEQ[prev] ? prev + 1 : (e.key === KONAMI_SEQ[0] ? 1 : 0)
        if (next === KONAMI_SEQ.length) {
          setActive(true)
          setFadeOut(false)
          return 0
        }
        return next
      })
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [])

  useEffect(() => {
    if (!active) return
    const fire = (opts) => confetti({ particleCount: 160, spread: 110, colors: ['#f0b429','#16a34a','#3b82f6','#ef4444','#ffffff','#a855f7'], ...opts })
    fire({ origin: { x: 0.5, y: 0.55 } })
    setTimeout(() => fire({ origin: { x: 0.15, y: 0.5 }, particleCount: 120 }), 200)
    setTimeout(() => fire({ origin: { x: 0.85, y: 0.5 }, particleCount: 120 }), 350)
    setTimeout(() => fire({ origin: { x: 0.5, y: 0.3 }, particleCount: 140 }), 550)
    setTimeout(() => fire({ origin: { x: 0.3, y: 0.7 }, particleCount: 80 }), 750)
    setTimeout(() => fire({ origin: { x: 0.7, y: 0.7 }, particleCount: 80 }), 900)
    const t1 = setTimeout(() => setFadeOut(true), 2600)
    const t2 = setTimeout(() => setActive(false), 3300)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [active])

  if (!active) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(5px)', pointerEvents: 'none', animation: fadeOut ? 'championFade 0.7s ease both' : 'none' }}>
      <div style={{ textAlign: 'center', animation: 'championPop 0.65s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <p style={{ fontSize: 80, lineHeight: 1, marginBottom: 12 }}>🏆</p>
        <p style={{ fontSize: 80, fontWeight: 900, color: '#f0b429', textShadow: '0 0 80px #f0b42999, 0 4px 24px rgba(0,0,0,0.4)', letterSpacing: '-2px', lineHeight: 1 }}>CHAMPION !</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 18, letterSpacing: '0.25em', textTransform: 'uppercase' }}>↑↑↓↓←→←→BA</p>
      </div>
    </div>
  )
}

// ── CONFETTI JOUEUR (si 1er au classement) ───────────────────────────────────
export function ConfettiJoueur({ rang }) {
  useEffect(() => {
    if (rang !== 1) return
    const fire = (opts) => confetti({
      particleCount: 70, spread: 55,
      colors: ['#f0b429', '#16a34a', '#3b82f6', '#ef4444', '#ffffff'],
      ...opts,
    })
    const t1 = setTimeout(() => fire({ origin: { y: 0.5, x: 0.5 } }), 350)
    const t2 = setTimeout(() => fire({ origin: { y: 0.45, x: 0.25 }, particleCount: 45 }), 600)
    const t3 = setTimeout(() => fire({ origin: { y: 0.45, x: 0.75 }, particleCount: 45 }), 800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [rang])
  return null
}

// ── TYPEWRITER ────────────────────────────────────────────────────────────────
export function Typewriter({ text, speed = 65, delay = 200, style, className }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    let interval
    const timer = setTimeout(() => {
      interval = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) { clearInterval(interval); setDone(true) }
      }, speed)
    }, delay)
    return () => { clearTimeout(timer); clearInterval(interval) }
  }, [text, speed, delay])

  return (
    <span style={style} className={className}>
      {displayed}
      {!done && <span className="tw-cursor">|</span>}
    </span>
  )
}

// ── SPLIT FLAP ────────────────────────────────────────────────────────────────
const DIGITS = ['0','1','2','3','4','5','6','7','8','9']

function FlapDigit({ target, startDelay = 0, cycles = 10, speed = 50 }) {
  const [char, setChar] = useState('·')

  useEffect(() => {
    let count = 0
    let iv
    const t = setTimeout(() => {
      iv = setInterval(() => {
        count++
        if (count >= cycles) {
          setChar(String(target))
          clearInterval(iv)
        } else {
          setChar(DIGITS[Math.floor(Math.random() * DIGITS.length)])
        }
      }, speed)
    }, startDelay)
    return () => { clearTimeout(t); clearInterval(iv) }
  }, [target, startDelay, cycles, speed])

  return (
    <span style={{ display: 'inline-block', minWidth: '0.6em', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
      {char}
    </span>
  )
}

export function SplitFlap({ value, baseDelay = 0, style }) {
  const str = String(value)
  let digitCount = 0
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', ...style }}>
      {str.split('').map((ch, i) => {
        if (!/\d/.test(ch)) return <span key={i} style={{ marginInline: 1 }}>{ch}</span>
        const idx = digitCount++
        return (
          <FlapDigit
            key={i}
            target={ch}
            startDelay={baseDelay + idx * 180}
            cycles={8 + idx * 3}
            speed={50}
          />
        )
      })}
    </span>
  )
}
