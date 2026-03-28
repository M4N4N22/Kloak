"use client"
import { useEffect, useState, useCallback } from "react"
import Image from "next/image"

const images = [
    "/pay1.png",
    "/pay2.png",
]

const INTERVAL = 4000
const TRANSITION_MS = 700

export default function HeroImages() {
    const [current, setCurrent] = useState(0)
    const [prev, setPrev] = useState<number | null>(null)
    const [animating, setAnimating] = useState(false)
    const [progress, setProgress] = useState(0)

    const goTo = useCallback((next: number) => {
        if (animating || next === current) return
        setPrev(current)
        setAnimating(true)
        setCurrent(next)
        setTimeout(() => {
            setPrev(null)
            setAnimating(false)
        }, TRANSITION_MS)
    }, [animating, current])

    // Auto-advance
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => {
                const next = (prev + 1) % images.length
                setPrev(prev)
                setAnimating(true)
                setTimeout(() => {
                    setPrev(null)
                    setAnimating(false)
                }, TRANSITION_MS)
                return next
            })
        }, INTERVAL)
        return () => clearInterval(interval)
    }, [])

    // Progress bar
    useEffect(() => {
        setProgress(0)
        const start = performance.now()
        let raf: number
        const tick = (now: number) => {
            const elapsed = now - start
            setProgress(Math.min(elapsed / INTERVAL, 1))
            if (elapsed < INTERVAL) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [current])

    return (
        <div className="relative w-full select-none" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {/* Google Font */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

        .hero-wrap {
          position: relative;
          width: 100%;
          border-radius: 2rem 2rem 0 0;
          overflow: hidden;
          background: #0a0a0a;
          box-shadow:
            0 -2px 0 0 rgba(255,255,255,0.06) inset,
            0 40px 80px -20px rgba(0,0,0,0.6);
        }

        .hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          will-change: transform, opacity;
          transition: transform ${TRANSITION_MS}ms cubic-bezier(0.76,0,0.24,1),
                      opacity ${TRANSITION_MS}ms cubic-bezier(0.76,0,0.24,1);
        }

        .hero-img.entering {
          transform: scale(1.04) translateY(8px);
          opacity: 0;
        }
        .hero-img.visible {
          transform: scale(1) translateY(0);
          opacity: 1;
        }
        .hero-img.exiting {
          transform: scale(0.97) translateY(-6px);
          opacity: 0;
        }

        /* Vignette overlay */
        .vignette {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 40%),
            linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 30%);
          pointer-events: none;
          z-index: 2;
        }

        /* Edge shimmer */
        .shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg,
            transparent 20%,
            rgba(255,255,255,0.03) 50%,
            transparent 80%
          );
          pointer-events: none;
          z-index: 3;
        }

        /* Controls bar */
        .controls {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 28px;
        }

        .dot-btn {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dot-track {
          width: 36px;
          height: 3px;
          border-radius: 2px;
          background: rgba(255,255,255,0.2);
          overflow: hidden;
          transition: width 0.3s ease;
        }

        .dot-btn.active .dot-track {
          width: 54px;
          background: rgba(255,255,255,0.25);
        }

        .dot-fill {
          height: 100%;
          border-radius: 2px;
          background: #fff;
          width: 0%;
          transition: none;
        }

        /* Counter */
        .counter {
          margin-left: auto;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
        }

        /* Pause on hover */
        .hero-wrap:hover .dot-fill {
          animation-play-state: paused;
        }
      `}</style>
            <div className="hero-wrap" style={{ height: "90vh", minHeight: 600 }}>
                {/* Slides */}
                {images.map((src, i) => {
                    const isActive = i === current
                    const isPrev = i === prev
                    return (
                        <Image
                            key={src}
                            src={src}
                            alt={`Kloak demo ${i + 1}`}
                            fill
                            sizes="100vw"
                            priority={i === 0}
                            className={`hero-img ${isActive ? "visible" : isPrev ? "exiting" : "entering"
                                }`}
                            style={{
                                zIndex: isActive ? 1 : isPrev ? 0 : -1,
                            }}
                        />
                    )
                })}

                {/* Overlays */}
                <div className="vignette" />
                <div className="shimmer" />

                {/* Controls */}
                <div className="controls">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            className={`dot-btn ${i === current ? "active" : ""}`}
                            onClick={() => goTo(i)}
                            aria-label={`Go to slide ${i + 1}`}
                        >
                            <div className="dot-track">
                                {i === current && (
                                    <div
                                        className="dot-fill"
                                        style={{
                                            width: `${progress * 100}%`,
                                            transition: progress === 0 ? "none" : "width 50ms linear",
                                        }}
                                    />
                                )}
                            </div>
                        </button>
                    ))}

                    <span className="counter">
                        {String(current + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                    </span>
                </div>
            </div>
        </div>
    )
}