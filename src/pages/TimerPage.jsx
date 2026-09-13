// Kaur's Cakery - Microwave & Digital Dual Bakery Timer Console
import { useState, useEffect } from 'react'
import { useTimerStore, BAKERY_PRESETS, playMicrowaveKeyBeep } from '../store/useTimerStore'

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

  // Microwave Keypad / Staged Time State
  const [digits, setDigits] = useState('')
  const [presetLabel, setPresetLabel] = useState('')
  const [presetEmoji, setPresetEmoji] = useState('⏱️')
  const [activeMicrowaveTimerId, setActiveMicrowaveTimerId] = useState(null)
  const [colonVisible, setColonVisible] = useState(true)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customLabel, setCustomLabel] = useState('')
  const [customMinutes, setCustomMinutes] = useState('20')

  // Find currently linked microwave timer, or default to the most active/ringing timer
  const activeTimer = timers.find((t) => t.id === activeMicrowaveTimerId) || null
  const ringingTimers = timers.filter((t) => t.status === 'ringing')

  // Synchronize: if no active timer is selected, but one is running, auto-link to it
  useEffect(() => {
    if (!activeMicrowaveTimerId && timers.length > 0) {
      const runningOrRinging = timers.find((t) => t.status === 'running' || t.status === 'ringing')
      if (runningOrRinging) {
        setActiveMicrowaveTimerId(runningOrRinging.id)
      }
    }
  }, [activeMicrowaveTimerId, timers])

  // Blinking colon animation for the digital display when timer is running
  useEffect(() => {
    if (activeTimer && activeTimer.status === 'running') {
      const interval = setInterval(() => {
        setColonVisible((v) => !v)
      }, 500)
      return () => clearInterval(interval)
    }
    setColonVisible(true)
  }, [activeTimer])

  // Keypad Handlers
  const handleDigitPress = (digit) => {
    playMicrowaveKeyBeep()
    if (activeTimer && (activeTimer.status === 'running' || activeTimer.status === 'ringing')) {
      // If a timer is already actively running, ignore numpad or detach to stage a new one
      return
    }
    if (digits.length < 4) {
      // Don't start with multiple zeroes
      if (digits === '' && digit === '0') return
      setDigits((prev) => prev + digit)
    }
  }

  const handleClearPress = () => {
    playMicrowaveKeyBeep()
    if (activeTimer) {
      if (activeTimer.status === 'ringing') {
        stopAlarm(activeTimer.id)
      } else {
        pauseTimer(activeTimer.id)
      }
      setActiveMicrowaveTimerId(null)
    }
    setDigits('')
    setPresetLabel('')
    setPresetEmoji('⏱️')
  }

  const handleAdd30s = () => {
    playMicrowaveKeyBeep()
    if (activeTimer) {
      addTimeToTimer(activeTimer.id, 30)
      return
    }

    // If idle with no timer active:
    if (digits === '') {
      // Instant start 30 seconds (standard microwave action!)
      const t = addTimer({
        label: presetLabel || 'Quick Microwave',
        minutes: 0,
        seconds: 30,
        emoji: presetEmoji || '⚡',
      })
      setActiveMicrowaveTimerId(t.id)
    } else {
      // Add 30 seconds to the staged digits
      let rawSec = 0
      if (digits.length <= 2) {
        rawSec = parseInt(digits, 10) || 0
      } else {
        const mins = parseInt(digits.slice(0, -2), 10) || 0
        const secs = parseInt(digits.slice(-2), 10) || 0
        rawSec = mins * 60 + secs
      }
      rawSec += 30
      const newM = Math.floor(rawSec / 60)
      const newS = rawSec % 60
      setDigits(String(newM).padStart(2, '0') + String(newS).padStart(2, '0'))
    }
  }

  const handleStartPress = () => {
    playMicrowaveKeyBeep()

    // 1. If currently linked to an active timer
    if (activeTimer) {
      if (activeTimer.status === 'paused') {
        resumeTimer(activeTimer.id)
      } else if (activeTimer.status === 'running') {
        // Hitting start while running adds +30s (microwave standard)
        addTimeToTimer(activeTimer.id, 30)
      } else if (activeTimer.status === 'ringing') {
        stopAlarm(activeTimer.id)
        setActiveMicrowaveTimerId(null)
      }
      return
    }

    // 2. If idle: start new timer from digits
    let totalSecs = 0
    if (digits === '') {
      // No digits typed: default to 30s quick microwave
      totalSecs = 30
    } else if (digits.length <= 2) {
      totalSecs = parseInt(digits, 10) || 30
    } else {
      const mins = parseInt(digits.slice(0, -2), 10) || 0
      const secs = parseInt(digits.slice(-2), 10) || 0
      totalSecs = mins * 60 + secs
    }

    if (totalSecs <= 0) totalSecs = 30

    const t = addTimer({
      label: presetLabel || 'Microwave Timer',
      minutes: Math.floor(totalSecs / 60),
      seconds: totalSecs % 60,
      emoji: presetEmoji || '⏱️',
    })

    setActiveMicrowaveTimerId(t.id)
    setDigits('')
    setPresetLabel('')
    setPresetEmoji('⏱️')
  }

  const handlePauseOrStop = () => {
    playMicrowaveKeyBeep()
    if (activeTimer) {
      if (activeTimer.status === 'ringing') {
        stopAlarm(activeTimer.id)
        setActiveMicrowaveTimerId(null)
      } else if (activeTimer.status === 'running') {
        pauseTimer(activeTimer.id)
      } else if (activeTimer.status === 'paused') {
        resetTimer(activeTimer.id)
        setActiveMicrowaveTimerId(null)
      }
    } else {
      setDigits('')
      setPresetLabel('')
    }
  }

  const handlePresetSelect = (preset) => {
    playMicrowaveKeyBeep()
    setPresetLabel(preset.label)
    setPresetEmoji(preset.emoji)
    // Convert preset minutes to 4-digit microwave string, e.g. 25m -> "2500"
    const mStr = String(preset.minutes).padStart(2, '0')
    setDigits(`${mStr}00`)
    setActiveMicrowaveTimerId(null)
  }

  // Calculate formatted digital display output
  let displayMinutes = '00'
  let displaySeconds = '00'
  let progressPercent = 0
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
    progressPercent = Math.min(
      100,
      Math.max(0, ((activeTimer.totalDurationSeconds - activeTimer.remainingSeconds) / activeTimer.totalDurationSeconds) * 100)
    )
  } else if (digits) {
    if (digits.length <= 2) {
      displayMinutes = '00'
      displaySeconds = digits.padStart(2, '0')
    } else if (digits.length === 3) {
      displayMinutes = `0${digits[0]}`
      displaySeconds = digits.slice(1)
    } else {
      displayMinutes = digits.slice(0, 2)
      displaySeconds = digits.slice(2, 4)
    }
  }

  return (
    <div style={{ padding: '0 0 48px', minHeight: '100dvh' }}>
      {/* Top Header */}
      <div
        style={{
          padding: '46px 18px 12px',
          background: 'linear-gradient(180deg, rgba(250,248,255,0.95) 75%, rgba(250,248,255,0) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontFamily: 'var(--font-body)', color: 'var(--light-warm)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
              Kaur&apos;s Cakery Kitchen
            </p>
            <h1 style={{ margin: '2px 0 0', fontFamily: 'var(--font-display)', fontSize: 29, fontWeight: 700, color: 'var(--charcoal)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Microwave & Oven Timer
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

      {/* MAIN MICROWAVE APPLIANCE UNIT */}
      <div style={{ padding: '0 16px', marginBottom: 24 }}>
        <div
          style={{
            background: 'linear-gradient(165deg, #1b172a 0%, #110e1e 100%)',
            borderRadius: 28,
            padding: '18px 16px 20px',
            border: '2px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 20px 48px rgba(17, 14, 30, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Metallic Highlight Rim */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            }}
          />

          {/* 1. DIGITAL VFD / OLED DISPLAY SCREEN */}
          <div
            style={{
              background: 'radial-gradient(ellipse at 50% 30%, #0d121c 0%, #060910 100%)',
              borderRadius: 20,
              padding: '14px 16px 12px',
              border: '1.5px solid #232a3d',
              boxShadow: 'inset 0 4px 16px rgba(0, 0, 0, 0.85), 0 2px 8px rgba(0,0,0,0.3)',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: 14,
            }}
          >
            {/* Screen Header Row: Indicators */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: isRunning ? '#00ffd5' : isRinging ? '#ff4b4b' : isPaused ? '#ffb84d' : '#5b657e',
                    boxShadow: isRunning ? '0 0 8px #00ffd5' : isRinging ? '0 0 8px #ff4b4b' : 'none',
                  }}
                />
                <span
                  style={{
                    fontFamily: '"SF Mono", "Cascadia Code", monospace',
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    color: '#7687a8',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  MICROWAVE STATION
                </span>
              </div>

              {/* Status Badge */}
              <div
                style={{
                  fontFamily: '"SF Mono", monospace',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: isRinging
                    ? 'rgba(255, 75, 75, 0.25)'
                    : isRunning
                      ? 'rgba(0, 255, 213, 0.15)'
                      : isPaused
                        ? 'rgba(255, 184, 77, 0.18)'
                        : 'rgba(255, 255, 255, 0.05)',
                  color: isRinging ? '#ff6666' : isRunning ? '#00ffd5' : isPaused ? '#ffb84d' : '#8898b8',
                  border: `1px solid ${isRinging ? '#ff4b4b' : isRunning ? '#00ffd5' : isPaused ? '#ffb84d' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {isRinging ? '🔔 BEEP DONE' : isRunning ? '♨️ HEATING' : isPaused ? '⏸ PAUSED' : '● READY'}
              </div>
            </div>

            {/* Glowing Big Digital Numbers Container */}
            <div style={{ position: 'relative', textAlign: 'center', margin: '6px 0 8px' }}>
              {/* Ghosted Background Segments (authentic microwave LCD effect) */}
              <div
                aria-hidden="true"
                style={{
                  fontFamily: '"SF Mono", Monaco, "Courier New", monospace',
                  fontSize: 54,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: 'rgba(0, 255, 213, 0.06)',
                  userSelect: 'none',
                  lineHeight: 1,
                }}
              >
                88:88
              </div>

              {/* Active Glowing Digital Numerals */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: '"SF Mono", Monaco, "Courier New", monospace',
                  fontSize: 54,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: isRinging ? '#ff5252' : isRunning ? '#00ffd5' : isPaused ? '#ffc107' : '#e0f7fa',
                  textShadow: isRinging
                    ? '0 0 16px rgba(255, 82, 82, 0.8), 0 0 32px rgba(255, 82, 82, 0.4)'
                    : isRunning
                      ? '0 0 16px rgba(0, 255, 213, 0.75), 0 0 32px rgba(0, 255, 213, 0.35)'
                      : '0 0 12px rgba(224, 247, 250, 0.4)',
                  lineHeight: 1,
                  userSelect: 'none',
                }}
              >
                <span>{displayMinutes}</span>
                <span
                  style={{
                    opacity: isRunning && !colonVisible ? 0.2 : 1,
                    transition: 'opacity 0.15s ease',
                    margin: '0 2px',
                  }}
                >
                  :
                </span>
                <span>{displaySeconds}</span>
              </div>
            </div>

            {/* Active Label & Heat Wave Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#9cb1d4',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 180,
                }}
              >
                {activeTimer
                  ? `${activeTimer.emoji || '⏱️'} ${activeTimer.label}`
                  : presetLabel
                    ? `${presetEmoji} ${presetLabel}`
                    : 'Enter time on keypad'}
              </span>

              {isRunning && (
                <span style={{ fontSize: 13, letterSpacing: '2px', animation: 'pulse 1s infinite' }}>
                  ♨️♨️♨️
                </span>
              )}
            </div>

            {/* Digital Progress Bar */}
            <div
              style={{
                marginTop: 8,
                height: 3.5,
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: activeTimer ? `${progressPercent}%` : '0%',
                  background: isRinging
                    ? '#ff4b4b'
                    : isPaused
                      ? '#ffb84d'
                      : 'linear-gradient(90deg, #00c6ff, #00ffd5)',
                  boxShadow: isRunning ? '0 0 8px #00ffd5' : 'none',
                  transition: 'width 0.35s linear',
                }}
              />
            </div>
          </div>

          {/* 2. AUTO-COOK BAKERY SHORTCUTS (Microwave Function Keys) */}
          <div style={{ marginBottom: 14 }}>
            <p
              style={{
                margin: '0 0 6px 2px',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#9aa0be',
                fontFamily: '"SF Mono", monospace',
              }}
            >
              AUTO-BAKE SHORTCUTS
            </p>

            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
              {BAKERY_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetSelect(p)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 12,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'linear-gradient(145deg, rgba(46, 41, 69, 0.8), rgba(28, 25, 45, 0.9))',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    color: '#e4e2f5',
                    fontSize: 11,
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span>{p.emoji}</span>
                  <span>{p.label.split(' ')[0]}</span>
                  <span style={{ color: '#ff8fdc', fontWeight: 700 }}>{p.minutes}m</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. MICROWAVE KEYPAD (3x4 Matrix with +30s and Clear) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
              marginBottom: 14,
            }}
          >
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleDigitPress(num)}
                style={{
                  height: 48,
                  borderRadius: 14,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'linear-gradient(160deg, #2b2742 0%, #1c182e 100%)',
                  color: '#ffffff',
                  fontSize: 20,
                  fontWeight: 700,
                  fontFamily: '"SF Mono", monospace',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
                  transition: 'transform 0.05s, background 0.15s',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {num}
              </button>
            ))}

            {/* Clear Button */}
            <button
              type="button"
              onClick={handleClearPress}
              style={{
                height: 48,
                borderRadius: 14,
                border: '1px solid rgba(255, 90, 90, 0.25)',
                background: 'linear-gradient(160deg, rgba(82, 32, 45, 0.7), rgba(46, 18, 26, 0.85))',
                color: '#ff8e99',
                fontSize: 13,
                fontWeight: 700,
                fontFamily: '"SF Mono", monospace',
                letterSpacing: '0.06em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              CLEAR
            </button>

            {/* 0 Key */}
            <button
              type="button"
              onClick={() => handleDigitPress('0')}
              style={{
                height: 48,
                borderRadius: 14,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'linear-gradient(160deg, #2b2742 0%, #1c182e 100%)',
                color: '#ffffff',
                fontSize: 20,
                fontWeight: 700,
                fontFamily: '"SF Mono", monospace',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              0
            </button>

            {/* Signature Microwave +30 SEC Button */}
            <button
              type="button"
              onClick={handleAdd30s}
              style={{
                height: 48,
                borderRadius: 14,
                border: '1px solid rgba(0, 255, 213, 0.35)',
                background: 'linear-gradient(160deg, rgba(14, 66, 60, 0.8), rgba(8, 38, 35, 0.95))',
                color: '#00ffd5',
                fontSize: 13,
                fontWeight: 800,
                fontFamily: '"SF Mono", monospace',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 255, 213, 0.2)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              +30s
            </button>
          </div>

          {/* 4. MAIN MICROWAVE START / STOP DUAL CONTROLS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 10 }}>
            {/* STOP / RESET BUTTON */}
            <button
              type="button"
              onClick={handlePauseOrStop}
              style={{
                padding: '13px 16px',
                borderRadius: 16,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'linear-gradient(160deg, #38314a, #201c2e)',
                color: '#e4dfef',
                fontFamily: 'var(--font-body)',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span>⏹</span>
              <span>{isRinging ? 'STOP ALARM' : isRunning ? 'PAUSE' : 'RESET'}</span>
            </button>

            {/* START / +30s BUTTON (Microwave signature glowing pill) */}
            <button
              type="button"
              onClick={handleStartPress}
              style={{
                padding: '13px 16px',
                borderRadius: 16,
                border: 'none',
                background: isRunning
                  ? 'linear-gradient(135deg, #00c6ff, #0072ff)'
                  : 'linear-gradient(135deg, #ff75c3, #9d7cff)',
                color: 'white',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.03em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: isRunning
                  ? '0 6px 20px rgba(0, 114, 255, 0.4)'
                  : '0 6px 22px rgba(157, 124, 255, 0.4)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span>{isRunning ? '➕ +30s' : isPaused ? '▶ RESUME' : '▶ START'}</span>
            </button>
          </div>
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
                setActiveMicrowaveTimerId(null)
                setDigits('')
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
              + New Microwave Timer
            </button>
          )}
        </div>

        {timers.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 16px',
              background: 'rgba(255, 255, 255, 0.55)',
              borderRadius: 20,
              border: '1px dashed rgba(180, 149, 255, 0.35)',
            }}
          >
            <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: 'var(--charcoal)' }}>
              Ready to bake!
            </p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--warm-gray)' }}>
              Type time on the microwave keypad above, pick a shortcut, or tap START (+30s).
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {timers.map((timer) => {
              const isSelectedOnMicrowave = activeTimer?.id === timer.id
              const isItemRinging = timer.status === 'ringing'
              const isItemPaused = timer.status === 'paused'
              const itemProgress = Math.min(
                100,
                Math.max(0, ((timer.totalDurationSeconds - timer.remainingSeconds) / timer.totalDurationSeconds) * 100)
              )

              return (
                <div
                  key={timer.id}
                  onClick={() => setActiveMicrowaveTimerId(timer.id)}
                  style={{
                    background: isItemRinging
                      ? 'linear-gradient(135deg, rgba(255, 235, 235, 0.98), rgba(255, 220, 220, 0.95))'
                      : isSelectedOnMicrowave
                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 240, 255, 0.95))'
                        : 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(16px)',
                    border: isItemRinging
                      ? '2px solid #ff4b4b'
                      : isSelectedOnMicrowave
                        ? '2px solid #9d7cff'
                        : '1px solid rgba(225, 220, 240, 0.8)',
                    borderRadius: 18,
                    padding: '12px 14px',
                    boxShadow: isSelectedOnMicrowave
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
                          {isSelectedOnMicrowave && (
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
                              ON CONSOLE
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
                          playMicrowaveKeyBeep()
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
                          if (activeMicrowaveTimerId === timer.id) {
                            setActiveMicrowaveTimerId(null)
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
                  max="360"
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
                    setActiveMicrowaveTimerId(t.id)
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
