'use client'
import { useState, useEffect, useRef } from 'react'

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

  return <span ref={ref} style={style} className={className}>{display}</span>
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
