import { useCallback, useEffect, useRef, useState } from 'react'

// Generic responsive carousel: auto-scrolls, supports arrow buttons, dot nav,
// and touch/swipe gestures. Pauses auto-scroll on hover/touch/focus.
function Carousel({ children, autoScrollMs = 3500 }) {
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef(null)
  const count = Array.isArray(children) ? children.length : 0

  const scrollToIndex = useCallback((nextIndex) => {
    const track = trackRef.current
    if (!track || !track.children.length) return
    const clamped = ((nextIndex % count) + count) % count
    const target = track.children[clamped]
    if (target) track.scrollTo({ left: target.offsetLeft, behavior: 'smooth' })
    setIndex(clamped)
  }, [count])

  useEffect(() => {
    if (paused || count <= 1) return undefined
    const timer = setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % count
        const track = trackRef.current
        const target = track?.children[next]
        if (target) track.scrollTo({ left: target.offsetLeft, behavior: 'smooth' })
        return next
      })
    }, autoScrollMs)
    return () => clearInterval(timer)
  }, [paused, count, autoScrollMs])

  const handleTouchStart = (event) => {
    setPaused(true)
    touchStartX.current = event.touches[0].clientX
  }

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return
    const delta = event.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 40) {
      if (delta < 0) scrollToIndex(index + 1)
      else scrollToIndex(index - 1)
    }
    touchStartX.current = null
    setPaused(false)
  }

  if (count === 0) return null

  return (
    <div
      className="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <button className="carousel-nav prev" type="button" onClick={() => scrollToIndex(index - 1)} aria-label="Previous">‹</button>
      <div
        className="carousel-track"
        ref={trackRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
      <button className="carousel-nav next" type="button" onClick={() => scrollToIndex(index + 1)} aria-label="Next">›</button>
      {count > 1 && (
        <div className="carousel-dots">
          {Array.from({ length: count }).map((_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              className={dotIndex === index ? 'active' : ''}
              onClick={() => scrollToIndex(dotIndex)}
              aria-label={`Go to slide ${dotIndex + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Carousel
