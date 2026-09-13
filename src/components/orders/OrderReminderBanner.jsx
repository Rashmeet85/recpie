import { useState } from 'react'
import { useStore, getLocalDateString } from '../../store/useStore'

export default function OrderReminderBanner({ onFilterToday }) {
  const { orders, notificationPermission, requestNotificationPermission, testNotificationAlarm } = useStore()
  const [dismissNotificationPrompt, setDismissNotificationPrompt] = useState(false)
  const [asking, setAsking] = useState(false)
  const [testingAlarm, setTestingAlarm] = useState(false)

  const todayStr = getLocalDateString()
  const todayOrders = orders.filter(
    (o) => o.deliveryDate === todayStr && o.status !== 'delivered' && o.status !== 'cancelled'
  )

  const handleEnableNotifications = async (e) => {
    e.stopPropagation()
    setAsking(true)
    await requestNotificationPermission()
    setAsking(false)
  }

  const handleTestAlarm = async (e) => {
    e.stopPropagation()
    setTestingAlarm(true)
    if (notificationPermission === 'default') {
      await requestNotificationPermission()
    }
    await testNotificationAlarm()
    setTimeout(() => setTestingAlarm(false), 1200)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
      {/* Sleek Alert for Today's Orders */}
      {todayOrders.length > 0 && (
        <div
          onClick={onFilterToday}
          style={{
            padding: '9px 14px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #ff7e5f, #feb47b)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 14px rgba(254, 130, 100, 0.28)',
            cursor: 'pointer',
            fontSize: 12.5,
            fontFamily: 'var(--font-body)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 16 }}>🚨</span>
            <span style={{ fontWeight: 600 }}>
              {todayOrders.length} {todayOrders.length === 1 ? 'Cake Order' : 'Cake Orders'} Due Today
            </span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 12, opacity: 0.95 }}>View ➔</span>
        </div>
      )}

      {/* Notification Banner / Test Alarm Strip */}
      {notificationPermission === 'default' && !dismissNotificationPrompt ? (
        <div
          style={{
            padding: '7px 12px',
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.75)',
            border: '1px solid rgba(180, 149, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            fontSize: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: 14 }}>🔔</span>
            <span style={{ color: 'var(--charcoal)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Turn on delivery alerts
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <button
              type="button"
              onClick={handleEnableNotifications}
              disabled={asking}
              style={{
                padding: '4px 9px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
                color: 'white',
                border: 'none',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {asking ? '…' : 'Turn On'}
            </button>
            <button
              type="button"
              onClick={handleTestAlarm}
              disabled={testingAlarm}
              style={{
                padding: '4px 8px',
                borderRadius: 8,
                background: 'rgba(151, 145, 190, 0.15)',
                color: 'var(--charcoal)',
                border: 'none',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {testingAlarm ? 'Chiming…' : '🔊 Test'}
            </button>
            <button
              type="button"
              onClick={() => setDismissNotificationPrompt(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--warm-gray)',
                fontSize: 13,
                cursor: 'pointer',
                padding: '0 2px',
              }}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      ) : notificationPermission === 'granted' ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 6,
            padding: '2px 4px',
          }}
        >
          <button
            type="button"
            onClick={handleTestAlarm}
            disabled={testingAlarm}
            style={{
              padding: '3px 8px',
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.65)',
              border: '1px solid rgba(151, 145, 190, 0.2)',
              color: 'var(--warm-gray)',
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>{testingAlarm ? '🔔' : '🔊'}</span> {testingAlarm ? 'Playing Chime…' : 'Test Alarm Sound'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
