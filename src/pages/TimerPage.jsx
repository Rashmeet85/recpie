// Kaur's Cakery - Brushed Stainless Steel Circular Rotary Oven & Microwave Timer
import { useState, useEffect, useRef } from 'react'
import { useTimerStore, BAKERY_PRESETS, playDialRatchetClick, playMicrowaveKeyBeep } from '../store/useTimerStore'

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  const padMins = String(mins).padStart(2, '0')
  const padSecs = String(secs).padStart(2, '0')
  return `${padMins}:${padSecs}`
}

export default function TimerPage() {
  const {
    timers,
    addTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    deleteTimer,
    addTimeToTimer,
    stopAlarm,
    stopAllAlarms,
  } = useTimerStore()

  // Staged Rotary Dial State (in minutes, 0 to 60)
  const [stagedMinutes, setStagedMinutes] = useState(25)
  const [stagedLabel, setStagedLabel] = useState('Cake Sponge')
  const [stagedEmoji, setStagedEmoji] = useState('🎂')
  const [activeDialTimerId, setActiveDialTimerId] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customLabel, setCustomLabel] = useState('')
  const [customMinutes, setCustomMinutes] = useState('20')

  const dialRef = useRef(null)
  const lastClickAngleRef = useRef(0)

  // Find currently linked dial timer, or default to the most active/ringing timer
  const activeTimer = timers.find((t) => t.id === activeDialTimerId) || null
  const ringingTimers = timers.filter((t) => t.status === 'ringing')

  // Synchronize: if no timer is selected, but one is running/ringing, auto-link to it
  useEffect(() => {
    if (!activeDialTimerId && timers.length > 0) {
      const runningOrRinging = timers.find((t) => t.status === 'running' || t.status === 'ringing')
      if (runningOrRinging) {
        setActiveDialTimerId(runningOrRinging.id)
      }
    }
  }, [activeDialTimerId, timers])

  // Calculate current angle (0° = top/0m, 360° = 60m)
  let currentAngle = 0
  let displayMinutes = '25'
  let displaySeconds = '00'
  let isRunning = false
  let isPaused = false
  let isRinging = false
  let progressFraction = 0 // 0 to 1

  if (activeTimer) {
    const formatted = formatTime(activeTimer.remainingSeconds)
    const [m, s] = formatted.split(':')
    displayMinutes = m
    displaySeconds = s
    isRunning = activeTimer.status === 'running'
    isPaused = activeTimer.status === 'paused'
    isRinging = activeTimer.status === 'ringing'

    // Total fraction remaining (up to 60 minutes)
    const remainingMins = activeTimer.remainingSeconds / 60
    currentAngle = (Math.min(60, remainingMins) / 60) * 360
    progressFraction = Math.min(1, Math.max(0, activeTimer.remainingSeconds / activeTimer.totalDurationSeconds))
  } else {
    currentAngle = (stagedMinutes / 60) * 360
    const m = Math.floor(stagedMinutes)
    const s = Math.round((stagedMinutes - m) * 60)
    displayMinutes = String(m).padStart(2, '0')
    displaySeconds = String(s).padStart(2, '0')
    progressFraction = stagedMinutes / 60
  }

  // Handle Touch / Mouse Rotary Drag
  const updateAngleFromPointer = (clientX, clientY) => {
    if (!dialRef.current) return
    const rect = dialRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const dx = clientX - centerX
    const dy = clientY - centerY

    // Standard theta (0 at 3 o'clock)
    let theta = Math.atan2(dy, dx) * (180 / Math.PI)
    // Shift so 0° is 12 o'clock (top)
    let clockAngle = (theta + 90 + 360) % 360

    // Sound effect every 6 degrees (1 minute)
    if (Math.abs(clockAngle - lastClickAngleRef.current) >= 6) {
      playDialRatchetClick()
      lastClickAngleRef.current = clockAngle
    }

    // Convert clock angle to minutes (0 to 60)
    // Snap to nearest 1 minute
    let calculatedMinutes = Math.round((clockAngle / 360) * 60)
    if (calculatedMinutes <= 0 && clockAngle > 300) {
      calculatedMinutes = 60
    } else if (calculatedMinutes <= 0) {
      calculatedMinutes = 1
    }

    if (activeTimer) {
      // If a timer is already running or paused, dragging updates its remaining time
      const newSeconds = calculatedMinutes * 60
      addTimeToTimer(activeTimer.id, newSeconds - activeTimer.remainingSeconds)
    } else {
      setStagedMinutes(calculatedMinutes)
    }
  }

  const handlePointerDown = (e) => {
    setIsDragging(true)
    updateAngleFromPointer(e.clientX || e.touches?.[0]?.clientX, e.clientY || e.touches?.[0]?.clientY)
  }

  const handlePointerMove = (e) => {
    if (!isDragging) return
    updateAngleFromPointer(e.clientX || e.touches?.[0]?.clientX, e.clientY || e.touches?.[0]?.clientY)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  // Quick Adjustment Steppers
  const handleNudge = (deltaMinutes) => {
    playDialRatchetClick()
    if (activeTimer) {
      addTimeToTimer(activeTimer.id, deltaMinutes * 60)
    } else {
      setStagedMinutes((prev) => Math.max(1, Math.min(60, prev + deltaMinutes)))
    }
  }

  const handleAdd30s = () => {
    playDialRatchetClick()
    if (activeTimer) {
      addTimeToTimer(activeTimer.id, 30)
    } else {
      // Add 0.5 minutes
      setStagedMinutes((prev) => Math.min(60, prev + 0.5))
    }
  }

  // 1-Tap Preset Launch
  const handlePresetSelect = (preset) => {
    playDialRatchetClick()
    setStagedMinutes(preset.minutes)
    setStagedLabel(preset.label)
    setStagedEmoji(preset.emoji)
    setActiveDialTimerId(null)
  }

  // Primary Start / Pause Control
  const handleStartOrPause = () => {
    playMicrowaveKeyBeep()
    if (activeTimer) {
      if (activeTimer.status === 'paused') {
        resumeTimer(activeTimer.id)
      } else if (activeTimer.status === 'running') {
        pauseTimer(activeTimer.id)
      } else if (activeTimer.status === 'ringing') {
        stopAlarm(activeTimer.id)
        setActiveDialTimerId(null)
      }
      return
    }

    // Start new timer from staged minutes
    const totalSecs = Math.max(30, Math.round(stagedMinutes * 60))
    const t = addTimer({
      label: stagedLabel || 'Oven Timer',
      minutes: Math.floor(totalSecs / 60),
      seconds: totalSecs % 60,
      emoji: stagedEmoji || '⏱️',
    })
    setActiveDialTimerId(t.id)
  }

  const handleReset = () => {
    playMicrowaveKeyBeep()
    if (activeTimer) {
      if (activeTimer.status === 'ringing') {
        stopAlarm(activeTimer.id)
      } else {
        resetTimer(activeTimer.id)
      }
      setActiveDialTimerId(null)
    }
    setStagedMinutes(20)
    setStagedLabel('Custom Bake')
    setStagedEmoji('⏱️')
  }

  // SVG Gauge calculations
  const radius = 98
  const circumference = 2 * Math.PI * radius
  // Dash offset representing time remaining along the circle
  const strokeDashoffset = circumference - (Math.min(360, currentAngle) / 360) * circumference

  return (
    <div
      style={{ padding: '0 0 54px', minHeight: '100dvh', userSelect: 'none' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Top Header */}
      <div
        style={{
          padding: '46px 18px 10px',
          background: 'linear-gradient(180deg, rgba(250,248,255,0.95) 75%, rgba(250,248,255,0) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontFamily: 'var(--font-body)', color: 'var(--light-warm)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
              Kaur&apos;s Cakery Kitchen
            </p>
            <h1 style={{ margin: '2px 0 0', fontFamily: 'var(--font-display)', fontSize: 29, fontWeight: 700, color: 'var(--charcoal)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Oven & Bakery Timer
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            style={{
              padding: '7px 12px',
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
              color: 'white',
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              boxShadow: '0 4px 14px rgba(142, 106, 232, 0.28)',
            }}
          >
            <span>➕</span> Custom
          </button>
        </div>
      </div>

      {/* Ringing Alarm Global Alert Banner */}
      {ringingTimers.length > 0 && (
        <div style={{ padding: '0 16px', marginBottom: 14 }}>
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 18,
              background: 'linear-gradient(135deg, #ff3b69, #ff5252)',
              color: 'white',
              boxShadow: '0 10px 28px rgba(255, 59, 105, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              animation: 'scaleIn 0.25s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 26, animation: 'spin 1.4s infinite linear' }}>⏰</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13.5 }}>
                  {ringingTimers.map((t) => t.label).join(', ')} Ready!
                </p>
                <p style={{ margin: '1px 0 0', fontSize: 11, opacity: 0.9 }}>
                  Time to check your oven or counter!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={stopAllAlarms}
              style={{
                padding: '8px 14px',
                borderRadius: 12,
                border: 'none',
                background: 'white',
                color: '#ff3b69',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              Stop Alarm
            </button>
          </div>
        </div>
      )}

      {/* HERO ROTARY OVEN DIAL SECTION */}
      <div style={{ padding: '4px 16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Dial Container with Side Stepper Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', maxWidth: 380 }}>
          {/* Left Step (-1m) */}
          <button
            type="button"
            onClick={() => handleNudge(-1)}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '1.5px solid rgba(255,255,255,0.9)',
              background: 'linear-gradient(135deg, #ffffff, #e6e8ee)',
              boxShadow: '0 6px 16px rgba(100, 90, 130, 0.12), inset 0 1px 0 #ffffff',
              color: 'var(--charcoal)',
              fontSize: 18,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-label="Minus 1 minute"
          >
            –
          </button>

          {/* MAIN CIRCULAR STEEL KNOB */}
          <div
            ref={dialRef}
            onPointerDown={handlePointerDown}
            style={{
              position: 'relative',
              width: 270,
              height: 270,
              borderRadius: '50%',
              background: `
                radial-gradient(circle at 35% 30%, #ffffff 0%, transparent 45%),
                conic-gradient(from 45deg, #f2f4f8 0deg, #d3d9e2 45deg, #ffffff 90deg, #b8c1ce 135deg, #f6f8fb 180deg, #d3d9e2 225deg, #ffffff 270deg, #b0bac8 315deg, #f2f4f8 360deg)
              `,
              boxShadow: `
                0 22px 50px rgba(78, 62, 125, 0.22),
                0 8px 18px rgba(0, 0, 0, 0.12),
                inset 0 3px 6px rgba(255, 255, 255, 0.95),
                inset 0 -4px 8px rgba(0, 0, 0, 0.22)
              `,
              border: '3.5px solid #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isDragging ? 'grabbing' : 'grab',
              touchAction: 'none',
            }}
          >
            {/* Knurled Outer Metallic Grip Ring */}
            <div
              style={{
                position: 'absolute',
                inset: 6,
                borderRadius: '50%',
                border: '1px dashed rgba(160, 170, 185, 0.6)',
                pointerEvents: 'none',
              }}
            />

            {/* SVG Graduation Dial Marks (0, 5, 10, 15... 60) */}
            <svg
              width="270"
              height="270"
              viewBox="0 0 270 270"
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            >
              {/* 60 Minute Tick Marks */}
              {[...Array(60)].map((_, i) => {
                const tickAngle = (i / 60) * 360
                const isMajor = i % 5 === 0
                const tickLength = isMajor ? 9 : 4.5
                const tickWidth = isMajor ? 2.5 : 1
                const tickColor = isMajor ? '#687282' : '#a8b2c0'

                return (
                  <line
                    key={i}
                    x1="135"
                    y1={13}
                    x2="135"
                    y2={13 + tickLength}
                    stroke={tickColor}
                    strokeWidth={tickWidth}
                    strokeLinecap="round"
                    transform={`rotate(${tickAngle} 135 135)`}
                  />
                )
              })}

              {/* Number Labels: 0, 15, 30, 45 */}
              <text x="135" y="36" textAnchor="middle" fill="#586374" fontSize="11" fontWeight="800" fontFamily="var(--font-body)">
                0
              </text>
              <text x="238" y="139" textAnchor="middle" fill="#586374" fontSize="11" fontWeight="800" fontFamily="var(--font-body)">
                15
              </text>
              <text x="135" y="244" textAnchor="middle" fill="#586374" fontSize="11" fontWeight="800" fontFamily="var(--font-body)">
                30
              </text>
              <text x="32" y="139" textAnchor="middle" fill="#586374" fontSize="11" fontWeight="800" fontFamily="var(--font-body)">
                45
              </text>

              {/* Circular Glowing Rose/Lavender Progress Track */}
              <circle
                cx="135"
                cy="135"
                r={radius}
                fill="none"
                stroke="rgba(157, 124, 255, 0.12)"
                strokeWidth="6"
              />
              <circle
                cx="135"
                cy="135"
                r={radius}
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 135 135)"
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(244, 114, 208, 0.6))',
                  transition: isDragging ? 'none' : 'stroke-dashoffset 0.3s ease',
                }}
              />

              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff8fdc" />
                  <stop offset="100%" stopColor="#9d7cff" />
                </linearGradient>
              </defs>
            </svg>

            {/* ROTATING METALLIC NEEDLE & ROSE-GOLD POINTER */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                transform: `rotate(${currentAngle}deg)`,
                pointerEvents: 'none',
                transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.2,0,0,1)',
              }}
            >
              {/* Pointer Tip Arrow with Rose-Gold Accent */}
              <div
                style={{
                  position: 'absolute',
                  top: 7,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
                  boxShadow: '0 0 10px rgba(244, 114, 208, 0.85), 0 2px 4px rgba(0,0,0,0.3)',
                  border: '2px solid #ffffff',
                }}
              />
              {/* Needle Stem */}
              <div
                style={{
                  position: 'absolute',
                  top: 20,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 3,
                  height: 18,
                  background: 'linear-gradient(180deg, #ff8fdc, rgba(255,255,255,0.8))',
                  borderRadius: 2,
                }}
              />
            </div>

            {/* CENTER DIGITAL GLASS DISPLAY CORE */}
            <div
              onClick={(e) => {
                e.stopPropagation()
                handleStartOrPause()
              }}
              style={{
                position: 'relative',
                width: 164,
                height: 164,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 30%, #1e192e 0%, #110d1f 100%)',
                boxShadow: `
                  inset 0 4px 14px rgba(0, 0, 0, 0.75),
                  0 4px 12px rgba(255, 255, 255, 0.6),
                  0 -2px 6px rgba(0,0,0,0.15)
                `,
                border: '2px solid rgba(255, 255, 255, 0.18)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 2,
              }}
            >
              {/* Subtle Glare Reflex */}
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 24,
                  right: 24,
                  height: 34,
                  borderRadius: '50%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 100%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Status Badge */}
              <span
                style={{
                  fontFamily: '"SF Mono", monospace',
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: isRinging ? '#ff4b4b' : isRunning ? '#ff8fdc' : isPaused ? '#ffb84d' : '#9ca8c2',
                  textTransform: 'uppercase',
                  marginBottom: 2,
                }}
              >
                {isRinging ? '🔔 TIME IS UP!' : isRunning ? '♨️ BAKING' : isPaused ? '⏸ PAUSED' : '● ROTATE DIAL'}
              </span>

              {/* Large Glowing Digital Readout */}
              <div
                style={{
                  fontFamily: '"SF Mono", Monaco, "Courier New", monospace',
                  fontSize: 38,
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  lineHeight: 1,
                  background: isRinging
                    ? 'linear-gradient(135deg, #ff4b4b, #ff7575)'
                    : 'linear-gradient(135deg, #ffffff 40%, #ff8fdc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: isRinging
                    ? 'drop-shadow(0 0 10px rgba(255,75,75,0.8))'
                    : isRunning
                      ? 'drop-shadow(0 0 10px rgba(244,114,208,0.7))'
                      : 'drop-shadow(0 0 6px rgba(255,255,255,0.3))',
                  margin: '4px 0',
                }}
              >
                {displayMinutes}:{displaySeconds}
              </div>

              {/* Item Label & Tap Prompt */}
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#b6c2db',
                  maxWidth: 130,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: 'center',
                }}
              >
                {activeTimer ? `${activeTimer.emoji || '⏱️'} ${activeTimer.label}` : `${stagedEmoji} ${stagedLabel}`}
              </span>

              <span style={{ fontSize: 9.5, color: '#ff8fdc', fontWeight: 700, marginTop: 4 }}>
                {isRunning ? 'TAP TO PAUSE' : 'TAP TO START'}
              </span>
            </div>
          </div>

          {/* Right Step (+1m) */}
          <button
            type="button"
            onClick={() => handleNudge(1)}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '1.5px solid rgba(255,255,255,0.9)',
              background: 'linear-gradient(135deg, #ffffff, #e6e8ee)',
              boxShadow: '0 6px 16px rgba(100, 90, 130, 0.12), inset 0 1px 0 #ffffff',
              color: 'var(--charcoal)',
              fontSize: 18,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-label="Plus 1 minute"
          >
            +
          </button>
        </div>

        {/* Quick Interval Nudge Pills */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button
            type="button"
            onClick={handleAdd30s}
            style={{
              padding: '6px 12px',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.85)',
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(10px)',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--charcoal)',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(94, 61, 165, 0.05)',
            }}
          >
            +30s
          </button>

          <button
            type="button"
            onClick={() => handleNudge(5)}
            style={{
              padding: '6px 12px',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.85)',
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(10px)',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--charcoal)',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(94, 61, 165, 0.05)',
            }}
          >
            +5m
          </button>

          <button
            type="button"
            onClick={() => handleNudge(10)}
            style={{
              padding: '6px 12px',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.85)',
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(10px)',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--charcoal)',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(94, 61, 165, 0.05)',
            }}
          >
            +10m
          </button>
        </div>

        {/* MAIN DUAL ACTION BUTTONS (Start/Pause & Reset) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12, width: '100%', maxWidth: 360, marginTop: 18 }}>
          {/* START / PAUSE */}
          <button
            type="button"
            onClick={handleStartOrPause}
            style={{
              padding: '15px 20px',
              borderRadius: 18,
              border: 'none',
              background: isRunning
                ? 'linear-gradient(135deg, #7b52db, #5333ad)'
                : 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
              color: 'white',
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.03em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 8px 24px rgba(142, 106, 232, 0.38)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span>{isRunning ? '⏸ PAUSE' : isPaused ? '▶ RESUME' : '▶ START'}</span>
          </button>

          {/* RESET / STOP */}
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '15px 20px',
              borderRadius: 18,
              border: '1.5px solid rgba(255, 255, 255, 0.9)',
              background: 'linear-gradient(135deg, #ffffff, #e5e8f0)',
              color: 'var(--charcoal)',
              fontFamily: 'var(--font-body)',
              fontSize: 14.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: '0 6px 18px rgba(100, 90, 130, 0.1), inset 0 1px 0 #ffffff',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span>⏹</span>
            <span>{isRinging ? 'STOP' : 'RESET'}</span>
          </button>
        </div>
      </div>

      {/* QUICK BAKING PRESETS CAROUSEL */}
      <div style={{ padding: '0 16px 18px' }}>
        <p
          style={{
            margin: '0 0 8px 2px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--warm-gray)',
          }}
        >
          Quick Baking Presets (Dial auto-rotates)
        </p>

        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
          {BAKERY_PRESETS.map((p) => {
            const isMatch = stagedMinutes === p.minutes && stagedLabel === p.label

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetSelect(p)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 16,
                  border: isMatch
                    ? '1.5px solid #9d7cff'
                    : '1px solid rgba(255, 255, 255, 0.85)',
                  background: isMatch
                    ? 'linear-gradient(135deg, rgba(255, 143, 220, 0.2), rgba(157, 124, 255, 0.25))'
                    : 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontSize: 12,
                  fontFamily: 'var(--font-body)',
                  color: 'var(--charcoal)',
                  boxShadow: '0 3px 10px rgba(94, 61, 165, 0.05)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span>{p.emoji}</span>
                <span style={{ fontWeight: 600 }}>{p.label}</span>
                <span style={{ color: 'var(--rose)', fontWeight: 700, marginLeft: 2 }}>{p.minutes}m</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* MULTI-TIMER LIST / CONCURRENT BAKING DECK */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              color: 'var(--charcoal)',
              letterSpacing: '-0.01em',
            }}
          >
            All Kitchen Timers ({timers.length})
          </h2>

          {activeTimer && (
            <button
              type="button"
              onClick={() => {
                setActiveDialTimerId(null)
                setStagedMinutes(20)
                setStagedLabel('New Tray')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--rose)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Stage Another Timer
            </button>
          )}
        </div>

        {timers.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 16px',
              background: 'rgba(255, 255, 255, 0.6)',
              borderRadius: 20,
              border: '1px dashed rgba(180, 149, 255, 0.35)',
            }}
          >
            <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: 'var(--charcoal)' }}>
              No active timers
            </p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--warm-gray)' }}>
              Spin the steel dial above or tap any baking preset to start.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {timers.map((timer) => {
              const isSelectedOnDial = activeTimer?.id === timer.id
              const isItemRinging = timer.status === 'ringing'
              const isItemPaused = timer.status === 'paused'
              const itemProgress = Math.min(
                100,
                Math.max(0, ((timer.totalDurationSeconds - timer.remainingSeconds) / timer.totalDurationSeconds) * 100)
              )

              return (
                <div
                  key={timer.id}
                  onClick={() => setActiveDialTimerId(timer.id)}
                  style={{
                    background: isItemRinging
                      ? 'linear-gradient(135deg, rgba(255, 235, 235, 0.98), rgba(255, 220, 220, 0.95))'
                      : isSelectedOnDial
                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 240, 255, 0.95))'
                        : 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(16px)',
                    border: isItemRinging
                      ? '2px solid #ff4b4b'
                      : isSelectedOnDial
                        ? '2px solid #9d7cff'
                        : '1px solid rgba(225, 220, 240, 0.8)',
                    borderRadius: 18,
                    padding: '12px 14px',
                    boxShadow: isSelectedOnDial
                      ? '0 6px 20px rgba(157, 124, 255, 0.18)'
                      : '0 2px 10px rgba(78, 51, 143, 0.04)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Bottom progress line */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      height: 3,
                      width: `${itemProgress}%`,
                      background: isItemRinging
                        ? '#ff4b4b'
                        : isItemPaused
                          ? 'var(--warm-gray)'
                          : 'linear-gradient(90deg, #ff8fdc, #9d7cff)',
                      transition: 'width 0.4s linear',
                    }}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{timer.emoji || '⏱️'}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: 'var(--charcoal)' }}>
                            {timer.label}
                          </h3>
                          {isSelectedOnDial && (
                            <span
                              style={{
                                fontSize: 9.5,
                                fontWeight: 700,
                                background: '#9d7cff',
                                color: 'white',
                                padding: '1px 5px',
                                borderRadius: 6,
                              }}
                            >
                              ON DIAL
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '1px 0 0', fontSize: 11, color: 'var(--warm-gray)' }}>
                          Total: {Math.round(timer.totalDurationSeconds / 60)} mins
                        </p>
                      </div>
                    </div>

                    {/* Right countdown & controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontFamily: '"SF Mono", monospace',
                          fontSize: 18,
                          fontWeight: 800,
                          color: isItemRinging ? '#ff3b69' : 'var(--charcoal)',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {formatTime(timer.remainingSeconds)}
                      </span>

                      {/* Quick +1m */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          playDialRatchetClick()
                          addTimeToTimer(timer.id, 60)
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 8,
                          border: '1px solid rgba(157, 124, 255, 0.3)',
                          background: 'rgba(157, 124, 255, 0.1)',
                          color: '#7b52db',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        +1m
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteTimer(timer.id)
                          if (activeDialTimerId === timer.id) {
                            setActiveDialTimerId(null)
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--light-warm)',
                          fontSize: 14,
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* CUSTOM TIMER CREATION MODAL */}
      {showCustomModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(25, 20, 48, 0.45)',
            backdropFilter: 'blur(6px)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'flex-end',
            padding: '0 0 env(safe-area-inset-bottom)',
          }}
          onClick={() => setShowCustomModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(25px)',
              borderRadius: '24px 24px 0 0',
              padding: '22px 20px 28px',
              boxShadow: '0 -10px 40px rgba(78, 51, 143, 0.2)',
              animation: 'slideUp 0.25s ease',
            }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(176, 158, 150, 0.4)', margin: '0 auto 16px' }} />

            <h3 style={{ margin: '0 0 16px', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>
              Add Custom Kitchen Timer
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--warm-gray)', marginBottom: 6 }}>
                  Timer Name / Item
                </label>
                <input
                  type="text"
                  placeholder="e.g. Choc Cheesecake, Sourdough..."
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--warm-gray)', marginBottom: 6 }}>
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    const mins = parseInt(customMinutes, 10) || 1
                    const t = addTimer({
                      label: customLabel.trim() || 'Custom Timer',
                      minutes: mins,
                      emoji: '⏱️',
                    })
                    setActiveDialTimerId(t.id)
                    setCustomLabel('')
                    setCustomMinutes('20')
                    setShowCustomModal(false)
                  }}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: 14,
                    border: 'none',
                    background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
                    color: 'white',
                    fontFamily: 'var(--font-body)',
                    fontSize: 14.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(142, 106, 232, 0.3)',
                  }}
                >
                  Start Timer
                </button>

                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  style={{
                    padding: '14px 20px',
                    borderRadius: 14,
                    border: 'none',
                    background: 'rgba(151, 145, 190, 0.15)',
                    color: 'var(--warm-gray)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
