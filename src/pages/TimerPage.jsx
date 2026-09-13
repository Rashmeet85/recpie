import { useState } from 'react'
import { useTimerStore, BAKERY_PRESETS } from '../store/useTimerStore'

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

  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customLabel, setCustomLabel] = useState('')
  const [customMinutes, setCustomMinutes] = useState('20')

  const ringingTimers = timers.filter((t) => t.status === 'ringing')

  const handleStartCustom = (e) => {
    e.preventDefault()
    const mins = parseInt(customMinutes, 10) || 1
    addTimer({
      label: customLabel.trim() || 'Custom Timer',
      minutes: mins,
      emoji: '⏱️',
    })
    setCustomLabel('')
    setCustomMinutes('20')
    setShowCustomModal(false)
  }

  const handleLaunchPreset = (preset) => {
    addTimer({
      label: preset.label,
      minutes: preset.minutes,
      emoji: preset.emoji,
    })
  }

  return (
    <div style={{ padding: '0 0 32px' }}>
      {/* Top Bar / Header */}
      <div
        style={{
          padding: '48px 16px 14px',
          background: 'linear-gradient(180deg, rgba(250,248,255,0.95) 70%, rgba(250,248,255,0) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11.5, fontFamily: 'var(--font-body)', color: 'var(--light-warm)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
              Kaur&apos;s Cakery
            </p>
            <h1 style={{ margin: '1px 0 0', fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600, color: 'var(--charcoal)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Bakery Timers
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            style={{
              padding: '8px 14px',
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
              color: 'white',
              fontFamily: 'var(--font-body)',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: '0 6px 18px rgba(142, 106, 232, 0.28)',
            }}
          >
            <span>➕</span> Custom
          </button>
        </div>

        {/* Quick Presets Carousel */}
        <div>
          <p style={{ margin: '0 0 7px', fontSize: 11.5, fontWeight: 700, color: 'var(--warm-gray)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Quick Baking Presets (1-Tap Start)
          </p>
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
            {BAKERY_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleLaunchPreset(p)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 16,
                  border: '1px solid rgba(255, 255, 255, 0.75)',
                  background: 'rgba(255, 255, 255, 0.65)',
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
                  transition: 'transform 0.1s',
                }}
              >
                <span>{p.emoji}</span>
                <span style={{ fontWeight: 600 }}>{p.label}</span>
                <span style={{ color: 'var(--rose)', fontWeight: 700, marginLeft: 2 }}>{p.minutes}m</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Timers List Container */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Ringing Alarm Banner */}
        {ringingTimers.length > 0 && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 18,
              background: 'linear-gradient(135deg, #ff416c, #ff4b2b)',
              color: 'white',
              boxShadow: '0 8px 24px rgba(255, 75, 43, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              animation: 'scaleIn 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <span style={{ fontSize: 26, animation: 'spin 1.5s infinite linear' }}>⏰</span>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>
                  {ringingTimers.map((t) => t.label).join(', ')} Finished!
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 11.5, opacity: 0.9 }}>
                  Time to check the oven or counter!
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
                color: '#ff416c',
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
        )}

        {/* Timers */}
        {timers.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 16px',
              background: 'rgba(255, 255, 255, 0.65)',
              borderRadius: 24,
              border: '1px dashed rgba(180, 149, 255, 0.35)',
              marginTop: 10,
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 10 }}>⏱️</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 600, color: 'var(--charcoal)', margin: '0 0 6px' }}>
              No Active Timers
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--warm-gray)', maxWidth: 280, margin: '0 auto 16px' }}>
              Tap any baking preset above (like Cake Sponge or Bread Proof) or tap &ldquo;+ Custom&rdquo; to start your first kitchen timer.
            </p>
          </div>
        ) : (
          timers.map((timer) => {
            const isRinging = timer.status === 'ringing'
            const isPaused = timer.status === 'paused'
            const progressPercent = Math.min(
              100,
              Math.max(0, ((timer.totalDurationSeconds - timer.remainingSeconds) / timer.totalDurationSeconds) * 100)
            )

            return (
              <div
                key={timer.id}
                style={{
                  background: isRinging
                    ? 'linear-gradient(135deg, rgba(255, 240, 240, 0.98), rgba(255, 230, 230, 0.95))'
                    : 'rgba(255, 255, 255, 0.82)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: isRinging
                    ? '2px solid #ff4b2b'
                    : '1px solid rgba(230, 226, 242, 0.85)',
                  borderRadius: 22,
                  padding: '16px 18px',
                  boxShadow: isRinging
                    ? '0 10px 28px rgba(255, 75, 43, 0.22)'
                    : '0 4px 18px rgba(78, 51, 143, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Progress bar background strip */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: 4,
                    width: `${progressPercent}%`,
                    background: isRinging
                      ? '#ff4b2b'
                      : isPaused
                        ? 'var(--warm-gray)'
                        : 'linear-gradient(90deg, #ff8fdc, #9d7cff)',
                    transition: 'width 0.4s linear',
                  }}
                />

                {/* Top row: Emoji, Label & Delete Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 22 }}>{timer.emoji || '⏱️'}</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--charcoal)' }}>
                        {timer.label}
                      </h3>
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--warm-gray)', fontFamily: 'var(--font-body)' }}>
                        Total: {Math.round(timer.totalDurationSeconds / 60)} mins
                      </p>
                    </div>
                  </div>

                  {/* Right Status Badge & Delete */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        background: isRinging
                          ? '#ff4b2b'
                          : isPaused
                            ? 'rgba(151, 145, 190, 0.18)'
                            : 'rgba(52, 199, 89, 0.15)',
                        color: isRinging ? 'white' : (isPaused ? 'var(--warm-gray)' : '#248a3d'),
                      }}
                    >
                      {isRinging ? 'DONE! 🔔' : isPaused ? 'PAUSED' : 'RUNNING'}
                    </span>

                    <button
                      type="button"
                      onClick={() => deleteTimer(timer.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--light-warm)',
                        fontSize: 14,
                        cursor: 'pointer',
                        padding: '4px 6px',
                      }}
                      aria-label="Delete timer"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Big Digital Countdown Display */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 0',
                  }}
                >
                  <span
                    style={{
                      fontSize: 48,
                      fontWeight: 800,
                      fontFamily: 'var(--font-display)',
                      color: isRinging ? '#ff4b2b' : 'var(--charcoal)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1,
                    }}
                  >
                    {formatTime(timer.remainingSeconds)}
                  </span>
                </div>

                {/* Actions Bar: Controls + Quick Add Time */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 4 }}>
                  {/* Left: Quick Add (+1m, +5m) */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => addTimeToTimer(timer.id, 60)}
                      style={{
                        padding: '5px 9px',
                        borderRadius: 10,
                        border: '1px solid rgba(151, 145, 190, 0.25)',
                        background: 'rgba(255, 255, 255, 0.7)',
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: 'var(--charcoal)',
                        cursor: 'pointer',
                      }}
                    >
                      +1 min
                    </button>
                    <button
                      type="button"
                      onClick={() => addTimeToTimer(timer.id, 300)}
                      style={{
                        padding: '5px 9px',
                        borderRadius: 10,
                        border: '1px solid rgba(151, 145, 190, 0.25)',
                        background: 'rgba(255, 255, 255, 0.7)',
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: 'var(--charcoal)',
                        cursor: 'pointer',
                      }}
                    >
                      +5 mins
                    </button>
                  </div>

                  {/* Right: Primary Play / Pause / Stop Alarm */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {isRinging ? (
                      <button
                        type="button"
                        onClick={() => stopAlarm(timer.id)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: 12,
                          border: 'none',
                          background: '#ff4b2b',
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(255, 75, 43, 0.35)',
                        }}
                      >
                        Stop Alarm
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => resetTimer(timer.id)}
                          style={{
                            padding: '6px 11px',
                            borderRadius: 10,
                            border: '1px solid rgba(151, 145, 190, 0.25)',
                            background: 'rgba(255, 255, 255, 0.7)',
                            fontSize: 12,
                            fontWeight: 600,
                            color: 'var(--warm-gray)',
                            cursor: 'pointer',
                          }}
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          onClick={() => (isPaused ? resumeTimer(timer.id) : pauseTimer(timer.id))}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 10,
                            border: 'none',
                            background: isPaused
                              ? 'linear-gradient(135deg, #ff8fdc, #9d7cff)'
                              : 'rgba(151, 145, 190, 0.18)',
                            color: isPaused ? 'white' : 'var(--charcoal)',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: isPaused ? '0 4px 12px rgba(142, 106, 232, 0.3)' : 'none',
                          }}
                        >
                          {isPaused ? '▶ Resume' : '⏸ Pause'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Custom Timer Modal */}
      {showCustomModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(28, 26, 46, 0.45)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setShowCustomModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-scale-in"
            style={{
              width: '100%',
              maxWidth: 420,
              background: 'white',
              borderRadius: 24,
              padding: 20,
              boxShadow: '0 20px 60px rgba(68, 43, 128, 0.25)',
            }}
          >
            <h3 style={{ margin: '0 0 14px', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 }}>
              ⏱️ Set Custom Timer
            </h3>

            <form onSubmit={handleStartCustom} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--warm-gray)', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                  Timer Name / Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sourdough Loaf in Oven 1"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  className="input-field"
                  style={{ fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: 'var(--warm-gray)', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="360"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="input-field"
                  style={{ fontSize: 16, fontWeight: 700 }}
                />
              </div>

              {/* Quick Preset Buttons for Custom */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[5, 10, 15, 20, 30, 45, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setCustomMinutes(String(m))}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 10,
                      border: '1px solid rgba(151, 145, 190, 0.25)',
                      background: customMinutes === String(m) ? 'linear-gradient(135deg, #ff8fdc, #9d7cff)' : 'rgba(151, 145, 190, 0.08)',
                      color: customMinutes === String(m) ? 'white' : 'var(--charcoal)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {m}m
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 12,
                    border: '1px solid rgba(151, 145, 190, 0.25)',
                    background: 'none',
                    color: 'var(--warm-gray)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
                    color: 'white',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(142, 106, 232, 0.3)',
                  }}
                >
                  Start Timer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

