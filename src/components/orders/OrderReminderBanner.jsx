import { useState } from 'react'
import { useStore, getLocalDateString } from '../../store/useStore'

export default function OrderReminderBanner({ onFilterToday }) {
  const { orders, notificationPermission, requestNotificationPermission } = useStore()
  const [asking, setAsking] = useState(false)

  const todayStr = getLocalDateString()
  const todayOrders = orders.filter(
    (o) => o.deliveryDate === todayStr && o.status !== 'delivered' && o.status !== 'cancelled'
  )

  const handleEnableNotifications = async () => {
    setAsking(true)
    await requestNotificationPermission()
    setAsking(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
      {/* Alert when orders are due today */}
      {todayOrders.length > 0 && (
        <div
          onClick={onFilterToday}
          style={{
            padding: '12px 16px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #ff7e5f, #feb47b)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(254, 130, 100, 0.35)',
            cursor: 'pointer',
            animation: 'scaleIn 0.25s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🚨</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-display)' }}>
                {todayOrders.length} {todayOrders.length === 1 ? 'Cake Order' : 'Cake Orders'} Due Today!
              </p>
              <p style={{ margin: 0, fontSize: 11.5, opacity: 0.9, fontFamily: 'var(--font-body)' }}>
                Tap to see what needs to be decorated & packed
              </p>
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700 }}>View ➔</span>
        </div>
      )}

      {/* Prompt to enable browser notifications if not granted yet */}
      {notificationPermission === 'default' && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 14,
            background: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(180, 149, 255, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            fontSize: 12.5,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🔔</span>
            <span style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-body)' }}>
              Enable reminders to get alerted before cake pickups
            </span>
          </div>
          <button
            type="button"
            onClick={handleEnableNotifications}
            disabled={asking}
            style={{
              padding: '6px 12px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
              color: 'white',
              border: 'none',
              fontSize: 11.5,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(142, 106, 232, 0.25)',
            }}
          >
            {asking ? 'Allowing…' : 'Turn On'}
          </button>
        </div>
      )}
    </div>
  )
}

