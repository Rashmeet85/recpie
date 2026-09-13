// Kaur's Cakery - Luxury Rose-Gold Stainless Steel Rotary Oven & Bakery Timer
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  useTimerStore,
  BAKERY_PRESETS,
  playDialRatchetClick,
  playMicrowaveKeyBeep,
} from '../store/useTimerStore'
import { playNotificationAlarmSound } from '../store/useStore'

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

  // Staged Rotary Dial State (minutes, 1 to 60)
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

  // Find currently linked timer, or auto-link to the running/ringing timer
  const activeTimer = timers.find((t) => t.id === activeDialTimerId) || null
  const ringingTimers = timers.filter((t) => t.status === 'ringing')
  const isTimerRunning = Boolean(activeTimer && activeTimer.status === 'running')

  useEffect(() => {
    if (!activeDialTimerId && timers.length > 0) {
      const runningOrRinging = timers.find((t) => t.status === 'running' || t.status === 'ringing')
      if (runningOrRinging) {
        setActiveDialTimerId(runningOrRinging.id)
      }
    }
  }, [activeDialTimerId, timers])

  // Calculate current angle (0° = 12 o'clock / 0m, 360° = 60m)
  let currentAngle = 0
  let displayMinutes = '25'
  let displaySeconds = '00'
  let isRunning = false
  let isPaused = false
  let isRinging = false

  if (activeTimer) {
    const formatted = formatTime(activeTimer.remainingSeconds)
    const [m, s] = formatted.split(':')
    displayMinutes = m
    displaySeconds = s
    isRunning = activeTimer.status === 'running'
    isPaused = activeTimer.status === 'paused'
    isRinging = activeTimer.status === 'ringing'

    const remainingMins = activeTimer.remainingSeconds / 60
    currentAngle = (Math.min(60, remainingMins) / 60) * 360
  } else {
    currentAngle = (stagedMinutes / 60) * 360
    const m = Math.floor(stagedMinutes)
    const s = Math.round((stagedMinutes - m) * 60)
    displayMinutes = String(m).padStart(2, '0')
    displaySeconds = String(s).padStart(2, '0')
  }

  // Handle Touch / Mouse Rotary Drag (LOCKED while running)
  const updateAngleFromPointer = (clientX, clientY) => {
    if (isTimerRunning) return // Issue 2: Must NOT allow rotating the dial while running!
    if (!dialRef.current || clientX === undefined || clientY === undefined) return

    const rect = dialRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const dx = clientX - centerX
    const dy = clientY - centerY

    let theta = Math.atan2(dy, dx) * (180 / Math.PI)
    let clockAngle = (theta + 90 + 360) % 360

    // Sound effect on every 6 degrees (1 minute step)
    if (Math.abs(clockAngle - lastClickAngleRef.current) >= 6) {
      playDialRatchetClick()
      lastClickAngleRef.current = clockAngle
    }

    let calculatedMinutes = Math.round((clockAngle / 360) * 60)
    if (calculatedMinutes <= 0 && clockAngle > 300) {
      calculatedMinutes = 60
    } else if (calculatedMinutes <= 0) {
      calculatedMinutes = 1
    }

    if (activeTimer && activeTimer.status === 'paused') {
      const newSeconds = calculatedMinutes * 60
      addTimeToTimer(activeTimer.id, newSeconds - activeTimer.remainingSeconds)
    } else if (!activeTimer) {
      setStagedMinutes(calculatedMinutes)
    }
  }

  const handlePointerDown = (e) => {
    if (isTimerRunning) return // Block rotation while running
    setIsDragging(true)
    const clientX = e.clientX ?? e.touches?.[0]?.clientX
    const clientY = e.clientY ?? e.touches?.[0]?.clientY
    updateAngleFromPointer(clientX, clientY)
  }

  const handlePointerMove = (e) => {
    if (!isDragging || isTimerRunning) return
    const clientX = e.clientX ?? e.touches?.[0]?.clientX
    const clientY = e.clientY ?? e.touches?.[0]?.clientY
    updateAngleFromPointer(clientX, clientY)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  // Stepper Controls
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
      setStagedMinutes((prev) => Math.min(60, prev + 0.5))
    }
  }

  // 1-Tap Preset
  const handlePresetSelect = (preset) => {
    playDialRatchetClick()
    setStagedMinutes(preset.minutes)
    setStagedLabel(preset.label)
    setStagedEmoji(preset.emoji)
    setActiveDialTimerId(null)
  }

  // Start / Pause
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

    const totalSecs = Math.max(30, Math.round(stagedMinutes * 60))
    const t = addTimer({
      label: stagedLabel || 'Bakery Timer',
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
    setStagedMinutes(25)
    setStagedLabel('Cake Sponge')
    setStagedEmoji('🎂')
  }

  // SVG Gauge calculations (Viewbox 240x240)
  const radius = 86
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(360, currentAngle) / 360) * circumference

  return (
    <div
      style={{ padding: '0 0 54px', minHeight: '100dvh', userSelect: 'none', overflowX: 'hidden' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Top Header */}
      <div
        style={{
          padding: '44px 18px 10px',
          background: 'linear-gradient(180deg, rgba(250,248,255,0.95) 75%, rgba(250,248,255,0) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontFamily: 'var(--font-body)', color: 'var(--rose)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
              Kaur&apos;s Cakery
            </p>
            <h1 style={{ margin: '2px 0 0', fontFamily: 'var(--font-display)', fontSize: 29, fontWeight: 700, color: 'var(--charcoal)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Bakery Oven Timer
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Test Alarm Sound preview */}
            <button
              type="button"
              onClick={() => playNotificationAlarmSound()}
              style={{
                padding: '7px 11px',
                borderRadius: 14,
                border: '1px solid rgba(244, 114, 208, 0.35)',
                background: 'rgba(255, 255, 255, 0.75)',
                color: 'var(--rose)',
                fontFamily: 'var(--font-body)',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                boxShadow: '0 3px 10px rgba(142, 106, 232, 0.1)',
              }}
              title="Test loud alarm chime"
            >
              <span>🔊</span> Test Alarm
            </button>

            <button
              type="button"
              onClick={() => setShowCustomModal(true)}
              style={{
                padding: '7px 13px',
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
                color: 'white',
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                fontWeight: 700,
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
      </div>

      {/* Ringing Alarm Global Alert Banner */}
      {ringingTimers.length > 0 && (
        <div style={{ padding: '0 16px', marginBottom: 14 }}>
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 20,
              background: 'linear-gradient(135deg, #ff416c, #ff4b2b)',
              color: 'white',
              boxShadow: '0 10px 28px rgba(255, 75, 43, 0.45)',
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
                <p style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>
                  {ringingTimers.map((t) => t.label).join(', ')} Ready!
                </p>
                <p style={{ margin: '1px 0 0', fontSize: 11.5, opacity: 0.95 }}>
                  Bake finished — tap Stop Alarm below!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={stopAllAlarms}
              style={{
                padding: '9px 16px',
                borderRadius: 14,
                border: 'none',
                background: 'white',
                color: '#ff416c',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
              }}
            >
              Stop Alarm
            </button>
          </div>
        </div>
      )}

      {/* HERO BAKERY PEDESTAL CARD (Matches Kaur's Cakery Soft Glass Aesthetic) */}
      <div style={{ padding: '0 16px 18px' }}>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(28px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(28px) saturate(1.4)',
            borderRadius: 32,
            border: '1.5px solid rgba(255, 255, 255, 0.88)',
            boxShadow: '0 18px 45px rgba(122, 96, 209, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
            padding: '22px 16px 22px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* ROTARY KNOB ASSEMBLY */}
          <div
            style={{
              position: 'relative',
              width: 'min(270px, 78vw)',
              height: 'min(270px, 78vw)',
              aspectRatio: '1 / 1',
              borderRadius: '50%',
              /* Outer Rose-Gold Stainless Base Dish */
              background: 'linear-gradient(145deg, #f8f4fc, #e8ddf5)',
              boxShadow: `
                inset 0 4px 10px rgba(110, 80, 160, 0.18),
                inset 0 -3px 6px rgba(255, 255, 255, 0.95),
                0 14px 34px rgba(122, 96, 209, 0.18)
              `,
              border: '2px solid rgba(255, 255, 255, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              margin: '0 auto',
            }}
          >
            {/* 3D CYLINDER KNOB (Touches and rotates when not running) */}
            <div
              ref={dialRef}
              onPointerDown={handlePointerDown}
              style={{
                position: 'relative',
                width: '90%',
                height: '90%',
                borderRadius: '50%',
                /* Warm Champagne Platinum Steel Finish */
                background: `
                  radial-gradient(circle at 35% 28%, #ffffff 0%, #f6effb 30%, #dcd0ec 72%, #b5a4ce 100%)
                `,
                boxShadow: `
                  0 12px 28px rgba(50, 30, 85, 0.28),
                  0 4px 10px rgba(0, 0, 0, 0.12),
                  inset 0 2px 4px rgba(255, 255, 255, 0.95),
                  inset 0 -3px 6px rgba(110, 80, 160, 0.25)
                `,
                border: '2.5px solid #ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isTimerRunning ? 'default' : isDragging ? 'grabbing' : 'grab',
                touchAction: 'none',
                flexShrink: 0,
              }}
            >
              {/* Knurled Outer Bezel Grip Ring */}
              <div
                style={{
                  position: 'absolute',
                  inset: 5,
                  borderRadius: '50%',
                  border: '1.5px dashed rgba(160, 140, 195, 0.55)',
                  pointerEvents: 'none',
                }}
              />

              {/* SVG Graduation Dial Marks (0, 5, 10, 15... 60) & Progress Arc */}
              <svg
                viewBox="0 0 240 240"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
              >
                {/* 60 Minute Tick Marks */}
                {[...Array(60)].map((_, i) => {
                  const tickAngle = (i / 60) * 360
                  const isMajor = i % 5 === 0
                  const tickLength = isMajor ? 8 : 4
                  const tickWidth = isMajor ? 2.2 : 1
                  const tickColor = isMajor ? '#6c5b87' : '#b8a8d1'

                  return (
                    <line
                      key={i}
                      x1="120"
                      y1={12}
                      x2="120"
                      y2={12 + tickLength}
                      stroke={tickColor}
                      strokeWidth={tickWidth}
                      strokeLinecap="round"
                      transform={`rotate(${tickAngle} 120 120)`}
                    />
                  )
                })}

                {/* Number Labels: 0, 15, 30, 45 */}
                <text x="120" y="32" textAnchor="middle" fill="#5c4878" fontSize="10.5" fontWeight="800" fontFamily="var(--font-body)">
                  0
                </text>
                <text x="212" y="124" textAnchor="middle" fill="#5c4878" fontSize="10.5" fontWeight="800" fontFamily="var(--font-body)">
                  15
                </text>
                <text x="120" y="218" textAnchor="middle" fill="#5c4878" fontSize="10.5" fontWeight="800" fontFamily="var(--font-body)">
                  30
                </text>
                <text x="28" y="124" textAnchor="middle" fill="#5c4878" fontSize="10.5" fontWeight="800" fontFamily="var(--font-body)">
                  45
                </text>

                {/* Circular Glowing Rose/Lavender Progress Track */}
                <circle
                  cx="120"
                  cy="120"
                  r={radius}
                  fill="none"
                  stroke="rgba(157, 124, 255, 0.16)"
                  strokeWidth="5"
                />
                <circle
                  cx="120"
                  cy="120"
                  r={radius}
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 120 120)"
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(244, 114, 208, 0.75))',
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

              {/* ROTATING 3D METALLIC NEEDLE & ROSE-GOLD POINTER */}
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
                {/* 3D Rose-Gold Indicator Bead with Under-Shadow */}
                <div
                  style={{
                    position: 'absolute',
                    top: 6,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #ff8fdc 45%, #b652aa 100%)',
                    boxShadow: `
                      0 3px 6px rgba(0, 0, 0, 0.4),
                      0 0 10px rgba(244, 114, 208, 0.95)
                    `,
                    border: '2px solid #ffffff',
                  }}
                />
                {/* Embossed Metallic Pointer Stem */}
                <div
                  style={{
                    position: 'absolute',
                    top: 18,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 3.5,
                    height: 15,
                    background: 'linear-gradient(180deg, #ff8fdc 0%, rgba(255,255,255,0.9) 100%)',
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                />
              </div>

              {/* RECESSED LUXURY AMETHYST GLASS CORE DISPLAY */}
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  handleStartOrPause()
                }}
                style={{
                  position: 'relative',
                  width: '63%',
                  height: '63%',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 25%, #251b3a 0%, #150f24 100%)',
                  boxShadow: `
                    inset 0 6px 14px rgba(0, 0, 0, 0.85),
                    inset 0 -2px 6px rgba(255, 255, 255, 0.15),
                    0 4px 10px rgba(255, 255, 255, 0.6)
                  `,
                  border: '2px solid rgba(255, 255, 255, 0.18)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 2,
                  flexShrink: 0,
                }}
              >
                {/* Convex Glass Glare Reflection */}
                <div
                  style={{
                    position: 'absolute',
                    top: 6,
                    left: 18,
                    right: 18,
                    height: 30,
                    borderRadius: '50%',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Status Indicator Badge */}
                <span
                  style={{
                    fontFamily: '"SF Mono", monospace',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: isRinging ? '#ff4d6d' : isRunning ? '#ff8fdc' : isPaused ? '#ffb84d' : '#9ca8c2',
                    textTransform: 'uppercase',
                    marginBottom: 2,
                  }}
                >
                  {isRinging ? '🔔 READY!' : isRunning ? '♨️ BAKING' : isPaused ? '⏸ PAUSED' : '● ROTATE DIAL'}
                </span>

                {/* Crystal-Clear Digital Time Readout (NO WebkitBackgroundClip to prevent solid blocks) */}
                <div
                  style={{
                    fontFamily: '"SF Mono", Monaco, "Courier New", monospace',
                    fontSize: 'clamp(28px, 8vw, 36px)',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    lineHeight: 1,
                    color: isRinging ? '#ff4d6d' : '#ffffff',
                    textShadow: isRinging
                      ? '0 0 16px rgba(255, 77, 109, 0.95), 0 0 30px rgba(255, 77, 109, 0.4)'
                      : isRunning
                        ? '0 0 14px rgba(244, 114, 208, 0.8), 0 0 25px rgba(157, 124, 255, 0.4)'
                        : '0 0 8px rgba(255, 255, 255, 0.4)',
                    margin: '3px 0',
                    transition: 'color 0.2s',
                  }}
                >
                  {displayMinutes}:{displaySeconds}
                </div>

                {/* Food / Preset Label */}
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: '#dcd1ec',
                    maxWidth: 110,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textAlign: 'center',
                  }}
                >
                  {activeTimer ? `${activeTimer.emoji || '⏱️'} ${activeTimer.label}` : `${stagedEmoji} ${stagedLabel}`}
                </span>

                {/* Action Hint / Lock Note */}
                <span style={{ fontSize: 9, color: isTimerRunning ? '#ffb84d' : '#ff8fdc', fontWeight: 700, marginTop: 3 }}>
                  {isTimerRunning ? '🔒 RUNNING (TAP PAUSE)' : isPaused ? '▶ TAP RESUME' : '▶ TAP START'}
                </span>
              </div>
            </div>
          </div>

          {/* Locked Notice Banner (Only shown while timer is running) */}
          {isTimerRunning && (
            <div
              style={{
                marginTop: 10,
                padding: '4px 12px',
                borderRadius: 12,
                background: 'rgba(157, 124, 255, 0.12)',
                border: '1px solid rgba(157, 124, 255, 0.25)',
                color: 'var(--warm-gray)',
                fontSize: 11,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span>🔒</span> Dial locked while baking. Tap center or Pause to adjust.
            </div>
          )}

          {/* STEPPER CONTROLS BAR (Directly below dial) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
            <button
              type="button"
              onClick={() => handleNudge(-1)}
              style={{
                padding: '8px 14px',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.9)',
                background: 'linear-gradient(135deg, #ffffff, #f3ebfa)',
                boxShadow: '0 4px 12px rgba(100, 90, 130, 0.08), inset 0 1px 0 #ffffff',
                color: 'var(--charcoal)',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              – 1m
            </button>

            <button
              type="button"
              onClick={handleAdd30s}
              style={{
                padding: '8px 14px',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.9)',
                background: 'linear-gradient(135deg, #ffffff, #f3ebfa)',
                boxShadow: '0 4px 12px rgba(100, 90, 130, 0.08), inset 0 1px 0 #ffffff',
                color: 'var(--charcoal)',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              + 30s
            </button>

            <button
              type="button"
              onClick={() => handleNudge(1)}
              style={{
                padding: '8px 14px',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.9)',
                background: 'linear-gradient(135deg, #ffffff, #f3ebfa)',
                boxShadow: '0 4px 12px rgba(100, 90, 130, 0.08), inset 0 1px 0 #ffffff',
                color: 'var(--charcoal)',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              + 1m
            </button>

            <button
              type="button"
              onClick={() => handleNudge(5)}
              style={{
                padding: '8px 14px',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.9)',
                background: 'linear-gradient(135deg, #ffffff, #f3ebfa)',
                boxShadow: '0 4px 12px rgba(100, 90, 130, 0.08), inset 0 1px 0 #ffffff',
                color: 'var(--charcoal)',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              + 5m
            </button>
          </div>

          {/* MAIN DUAL ACTION BUTTONS (Start/Pause & Reset) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 10, width: '100%', maxWidth: 320, marginTop: 16 }}>
            {/* START / PAUSE */}
            <button
              type="button"
              onClick={handleStartOrPause}
              style={{
                padding: '14px 18px',
                borderRadius: 18,
                border: 'none',
                background: isRunning
                  ? 'linear-gradient(135deg, #7b52db, #5333ad)'
                  : 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
                color: 'white',
                fontFamily: 'var(--font-body)',
                fontSize: 14.5,
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
                padding: '14px 18px',
                borderRadius: 18,
                border: '1.5px solid rgba(255, 255, 255, 0.9)',
                background: 'linear-gradient(135deg, #ffffff, #f0e6fa)',
                color: 'var(--charcoal)',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
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
                    ? 'linear-gradient(135deg, rgba(255, 143, 220, 0.22), rgba(157, 124, 255, 0.28))'
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

      {/* CUSTOM TIMER CREATION FLOATING WINDOW MODAL */}
      {showCustomModal && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 14, 38, 0.58)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '18px',
          }}
          onClick={() => setShowCustomModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 390,
              maxHeight: 'min(90dvh, 600px)',
              background: 'linear-gradient(165deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 246, 255, 0.94) 100%)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderRadius: 24,
              padding: '24px 22px 22px',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 25px 60px -10px rgba(45, 25, 75, 0.35), 0 0 0 1px rgba(220, 205, 245, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              overflowY: 'auto',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, rgba(255, 143, 220, 0.25), rgba(157, 124, 255, 0.25))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                  }}
                >
                  ⏱️
                </div>
                <div>
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--charcoal)' }}>
                    Add Custom Timer
                  </h3>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--warm-gray)' }}>
                    Set custom bake or prep duration
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(151, 145, 190, 0.15)',
                  color: 'var(--warm-gray)',
                  fontSize: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* Inputs */}
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
                  style={{ width: '100%', fontSize: 14 }}
                  autoFocus
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--warm-gray)' }}>
                    Duration (Minutes)
                  </label>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#9d7cff' }}>
                    1 - 180 mins
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', fontSize: 16, fontWeight: 700 }}
                />

                {/* Quick Minute Preset Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {[5, 10, 15, 20, 25, 30, 45, 60].map((mins) => {
                    const isSelected = String(mins) === String(customMinutes)
                    return (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setCustomMinutes(String(mins))}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 10,
                          border: isSelected
                            ? '1px solid #9d7cff'
                            : '1px solid rgba(151, 145, 190, 0.22)',
                          background: isSelected
                            ? 'linear-gradient(135deg, rgba(255, 143, 220, 0.25), rgba(157, 124, 255, 0.25))'
                            : 'rgba(255, 255, 255, 0.7)',
                          color: isSelected ? '#6f3fc8' : 'var(--warm-gray)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {mins}m
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    const mins = parseInt(customMinutes, 10) || 1
                    // Infer friendly emoji
                    const name = customLabel.toLowerCase()
                    let emoji = '⏱️'
                    if (name.includes('cake')) emoji = '🎂'
                    else if (name.includes('cookie') || name.includes('biscuit')) emoji = '🍪'
                    else if (name.includes('cupcake') || name.includes('muffin')) emoji = '🧁'
                    else if (name.includes('bread') || name.includes('proof') || name.includes('dough')) emoji = '🍞'
                    else if (name.includes('pastry') || name.includes('croissant')) emoji = '🥐'
                    else if (name.includes('chill') || name.includes('freeze') || name.includes('fridge')) emoji = '❄️'
                    else if (name.includes('choc') || name.includes('ganache')) emoji = '🍫'

                    const t = addTimer({
                      label: customLabel.trim() || 'Custom Timer',
                      minutes: mins,
                      emoji,
                    })
                    setActiveDialTimerId(t.id)
                    setCustomLabel('')
                    setCustomMinutes('20')
                    setShowCustomModal(false)
                  }}
                  style={{
                    flex: 1,
                    padding: '13px',
                    borderRadius: 14,
                    border: 'none',
                    background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
                    color: 'white',
                    fontFamily: 'var(--font-body)',
                    fontSize: 14.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(142, 106, 232, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <span>✨</span> Start Timer
                </button>

                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  style={{
                    padding: '13px 18px',
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
        </div>,
        document.body
      )}
    </div>
  )
}
