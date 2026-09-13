import { create } from 'zustand'
import { playNotificationAlarmSound } from './useStore'

const STORAGE_KEY = 'kaurs_bakery_timers'

export const BAKERY_PRESETS = [
  { id: 'cake', label: 'Cake Sponge (180°C)', minutes: 25, emoji: '🎂' },
  { id: 'cupcake', label: 'Cupcakes / Muffins', minutes: 18, emoji: '🧁' },
  { id: 'cookie', label: 'Cookies / Biscuits', minutes: 12, emoji: '🍪' },
  { id: 'bread-proof-1', label: 'Bread 1st Proof', minutes: 45, emoji: '🥖' },
  { id: 'bread-proof-2', label: 'Bread 2nd Proof', minutes: 30, emoji: '🍞' },
  { id: 'bread-bake', label: 'Bread Loaf Bake', minutes: 35, emoji: '🍞' },
  { id: 'focaccia-rest', label: 'Focaccia Rest', minutes: 15, emoji: '🫓' },
  { id: 'pastry', label: 'Croissants / Pastry', minutes: 20, emoji: '🥐' },
  { id: 'chill', label: 'Buttercream Chill', minutes: 15, emoji: '❄️' },
  { id: 'ganache', label: 'Ganache Setting', minutes: 30, emoji: '🍫' },
]

function loadStoredTimers() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    const now = Date.now()

    return parsed.map((timer) => {
      if (timer.status === 'running' && timer.targetTimestamp) {
        const remaining = Math.max(0, Math.round((timer.targetTimestamp - now) / 1000))
        if (remaining === 0) {
          return { ...timer, remainingSeconds: 0, status: 'ringing' }
        }
        return { ...timer, remainingSeconds: remaining }
      }
      return timer
    })
  } catch {
    return []
  }
}

function saveTimersToStorage(timers) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timers))
  } catch {
    // ignore
  }
}

async function triggerTimerSystemNotification(timer) {
  if (typeof window === 'undefined') return

  // Play audio chime
  playNotificationAlarmSound()

  // Vibrate
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([400, 200, 400, 200, 400])
    }
  } catch {
    // ignore
  }

  // System notification
  const title = `⏰ Timer Done: ${timer.label}`
  const options = {
    body: `Your ${timer.label} is ready! Time to check the oven/counter.`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `timer-alert-${timer.id}`,
  }

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready.catch(() => null)
      if (reg && reg.showNotification) {
        await reg.showNotification(title, options)
        return
      }
    }
  } catch (err) {
    console.warn('SW notification error:', err)
  }

  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, options)
    }
  } catch (err) {
    console.warn('Notification error:', err)
  }
}

let alarmLoopInterval = null

function ensureAlarmSoundLoop(hasRinging) {
  if (hasRinging) {
    if (!alarmLoopInterval) {
      playNotificationAlarmSound()
      alarmLoopInterval = setInterval(() => {
        playNotificationAlarmSound()
      }, 3000)
    }
  } else {
    if (alarmLoopInterval) {
      clearInterval(alarmLoopInterval)
      alarmLoopInterval = null
    }
  }
}

export const useTimerStore = create((set, get) => ({
  timers: loadStoredTimers(),

  addTimer: ({ label, minutes = 0, seconds = 0, emoji = '⏱️' }) => {
    const totalSecs = Math.max(1, minutes * 60 + seconds)
    const now = Date.now()
    const newTimer = {
      id: `timer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: label.trim() || 'Bakery Timer',
      emoji,
      totalDurationSeconds: totalSecs,
      remainingSeconds: totalSecs,
      targetTimestamp: now + totalSecs * 1000,
      status: 'running', // 'running' | 'paused' | 'ringing'
      createdAt: now,
    }

    const nextTimers = [newTimer, ...get().timers]
    set({ timers: nextTimers })
    saveTimersToStorage(nextTimers)
    return newTimer
  },

  pauseTimer: (id) => {
    const nextTimers = get().timers.map((t) => {
      if (t.id !== id || t.status !== 'running') return t
      const remaining = Math.max(0, Math.round((t.targetTimestamp - Date.now()) / 1000))
      return {
        ...t,
        remainingSeconds: remaining,
        targetTimestamp: null,
        status: 'paused',
      }
    })
    set({ timers: nextTimers })
    saveTimersToStorage(nextTimers)
  },

  resumeTimer: (id) => {
    const now = Date.now()
    const nextTimers = get().timers.map((t) => {
      if (t.id !== id || t.status !== 'paused') return t
      return {
        ...t,
        targetTimestamp: now + t.remainingSeconds * 1000,
        status: 'running',
      }
    })
    set({ timers: nextTimers })
    saveTimersToStorage(nextTimers)
  },

  resetTimer: (id) => {
    const nextTimers = get().timers.map((t) => {
      if (t.id !== id) return t
      return {
        ...t,
        remainingSeconds: t.totalDurationSeconds,
        targetTimestamp: null,
        status: 'paused',
      }
    })
    set({ timers: nextTimers })
    saveTimersToStorage(nextTimers)
    get().checkAlarmLoop()
  },

  deleteTimer: (id) => {
    const nextTimers = get().timers.filter((t) => t.id !== id)
    set({ timers: nextTimers })
    saveTimersToStorage(nextTimers)
    get().checkAlarmLoop()
  },

  addTimeToTimer: (id, extraSeconds) => {
    const nextTimers = get().timers.map((t) => {
      if (t.id !== id) return t
      const newRemaining = t.remainingSeconds + extraSeconds
      const newTotal = Math.max(t.totalDurationSeconds, newRemaining)
      const isRunning = t.status === 'running'
      const targetTimestamp = isRunning ? Date.now() + newRemaining * 1000 : null

      return {
        ...t,
        remainingSeconds: newRemaining,
        totalDurationSeconds: newTotal,
        targetTimestamp,
        status: isRunning ? 'running' : 'paused',
      }
    })
    set({ timers: nextTimers })
    saveTimersToStorage(nextTimers)
    get().checkAlarmLoop()
  },

  stopAlarm: (id) => {
    const nextTimers = get().timers.map((t) => {
      if (t.id !== id) return t
      return {
        ...t,
        status: 'paused',
        remainingSeconds: t.totalDurationSeconds,
        targetTimestamp: null,
      }
    })
    set({ timers: nextTimers })
    saveTimersToStorage(nextTimers)
    get().checkAlarmLoop()
  },

  stopAllAlarms: () => {
    const nextTimers = get().timers.map((t) => {
      if (t.status !== 'ringing') return t
      return {
        ...t,
        status: 'paused',
        remainingSeconds: t.totalDurationSeconds,
        targetTimestamp: null,
      }
    })
    set({ timers: nextTimers })
    saveTimersToStorage(nextTimers)
    ensureAlarmSoundLoop(false)
  },

  checkAlarmLoop: () => {
    const hasRinging = get().timers.some((t) => t.status === 'ringing')
    ensureAlarmSoundLoop(hasRinging)
  },

  tick: () => {
    const { timers } = get()
    const now = Date.now()
    let changed = false

    const nextTimers = timers.map((t) => {
      if (t.status !== 'running') return t

      const remaining = Math.max(0, Math.round((t.targetTimestamp - now) / 1000))
      if (remaining <= 0) {
        changed = true
        triggerTimerSystemNotification(t)
        return {
          ...t,
          remainingSeconds: 0,
          targetTimestamp: null,
          status: 'ringing',
        }
      }

      if (remaining !== t.remainingSeconds) {
        changed = true
        return {
          ...t,
          remainingSeconds: remaining,
        }
      }

      return t
    })

    if (changed) {
      set({ timers: nextTimers })
      saveTimersToStorage(nextTimers)
      get().checkAlarmLoop()
    }
  },

  getActiveRunningCount: () => {
    return get().timers.filter((t) => t.status === 'running' || t.status === 'ringing').length
  },
}))

