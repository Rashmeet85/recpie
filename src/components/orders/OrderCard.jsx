import { useState } from 'react'
import { useStore, getLocalDateString } from '../../store/useStore'

function formatOrderDate(dateStr, timeStr) {
  if (!dateStr) return ''
  const todayStr = getLocalDateString()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = getLocalDateString(tomorrow)

  const timeFormatted = timeStr ? ` at ${timeStr}` : ''

  if (dateStr === todayStr) {
    return `🔥 Today${timeFormatted}`
  }
  if (dateStr === tomorrowStr) {
    return `📅 Tomorrow${timeFormatted}`
  }

  try {
    const d = new Date(dateStr + 'T12:00:00')
    const month = d.toLocaleString('en-US', { month: 'short' })
    const day = d.getDate()
    return `${month} ${day}${timeFormatted}`
  } catch {
    return `${dateStr}${timeFormatted}`
  }
}

export default function OrderCard({ order, onEdit, onOpenPhoto }) {
  const { updateOrderStatus, deleteOrder, isAdmin } = useStore()
  const [copied, setCopied] = useState(false)
  const [showStatusPicker, setShowStatusPicker] = useState(false)

  const todayStr = getLocalDateString()
  const isDueToday = order.deliveryDate === todayStr && order.status !== 'delivered' && order.status !== 'cancelled'
  const isPast = order.deliveryDate < todayStr && order.status !== 'delivered' && order.status !== 'cancelled'

  const STATUS_CONFIG = {
    pending: { label: '⏳ In Prep', bg: 'rgba(255, 193, 7, 0.16)', color: '#a07800', border: 'rgba(255, 193, 7, 0.4)' },
    ready: { label: '✨ Ready', bg: 'rgba(157, 124, 255, 0.18)', color: '#6842c2', border: 'rgba(157, 124, 255, 0.4)' },
    delivered: { label: '🎉 Delivered', bg: 'rgba(52, 199, 89, 0.16)', color: '#248a3d', border: 'rgba(52, 199, 89, 0.4)' },
    cancelled: { label: '❌ Cancelled', bg: 'rgba(142, 142, 147, 0.16)', color: '#636366', border: 'rgba(142, 142, 147, 0.4)' },
  }

  const currentStatus = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending

  const generateWhatsAppMessage = () => {
    const time = order.deliveryTime ? ` at ${order.deliveryTime}` : ''
    const balanceText = order.balanceDue > 0
      ? `Total: ₹${order.totalPrice} (Advance: ₹${order.advancePaid} | Balance Due: ₹${order.balanceDue})`
      : `Total: ₹${order.totalPrice} (Paid in Full ✅)`

    const msg = `Hi ${order.customerName}! ✨ Thank you for ordering with Kaur's Cakery.\n\n🎂 *Order Confirmation*:\n• *Cake*: ${order.flavor} (${order.weight})\n${order.cakeMessage ? `• *Message on Cake*: "${order.cakeMessage}"\n` : ''}• *Delivery/Pickup*: ${order.deliveryDate}${time}\n• *Payment*: ${balanceText}\n${order.notes ? `• *Notes*: ${order.notes}\n` : ''}\nWe are crafting it fresh with lots of love! ❤️`
    return msg
  }

  const handleWhatsApp = (e) => {
    e.stopPropagation()
    const msg = generateWhatsAppMessage()
    const encoded = encodeURIComponent(msg)

    // Normalize phone number
    let phone = (order.customerPhone || '').replace(/\D/g, '')
    if (phone.length === 10) {
      phone = '91' + phone // Default India country code if 10 digits
    }

    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard?.writeText(msg)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleStatusChange = async (newStatus) => {
    setShowStatusPicker(false)
    await updateOrderStatus(order.id, newStatus)
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (window.confirm(`Are you sure you want to delete the order for ${order.customerName}?`)) {
      await deleteOrder(order.id)
    }
  }

  return (
    <div
      style={{
        background: isDueToday
          ? 'linear-gradient(135deg, rgba(255, 245, 235, 0.95), rgba(255, 238, 245, 0.92))'
          : 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: isDueToday
          ? '1.5px solid rgba(255, 143, 220, 0.6)'
          : '1px solid rgba(255, 255, 255, 0.8)',
        borderRadius: 20,
        padding: '16px 16px 14px',
        boxShadow: isDueToday
          ? '0 12px 30px rgba(255, 120, 180, 0.18)'
          : '0 8px 24px rgba(78, 51, 143, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'relative',
        transition: 'transform 0.15s ease',
      }}
    >
      {/* Top row: Due Date Tag & Status Pill */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'var(--font-body)',
              background: isDueToday
                ? 'linear-gradient(135deg, #ff7e5f, #feb47b)'
                : isPast
                  ? 'rgba(220, 53, 69, 0.14)'
                  : 'rgba(151, 145, 190, 0.18)',
              color: isDueToday ? 'white' : (isPast ? '#c22d38' : 'var(--charcoal)'),
              boxShadow: isDueToday ? '0 4px 12px rgba(254, 130, 100, 0.35)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {formatOrderDate(order.deliveryDate, order.deliveryTime)}
          </span>

          {isDueToday && (
            <span style={{ fontSize: 11, fontWeight: 700, color: '#e04f26', animation: 'pulse 1.8s infinite' }}>
              Due Today!
            </span>
          )}
        </div>

        {/* Status button */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            disabled={!isAdmin}
            onClick={() => setShowStatusPicker(!showStatusPicker)}
            style={{
              padding: '4px 10px',
              borderRadius: 12,
              fontSize: 11.5,
              fontWeight: 600,
              border: `1px solid ${currentStatus.border}`,
              background: currentStatus.bg,
              color: currentStatus.color,
              cursor: isAdmin ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {currentStatus.label}
            {isAdmin && <span style={{ fontSize: 9 }}>▼</span>}
          </button>

          {/* Quick status dropdown */}
          {showStatusPicker && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                zIndex: 30,
                background: 'white',
                borderRadius: 14,
                boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
                border: '1px solid rgba(151, 145, 190, 0.25)',
                padding: 6,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                minWidth: 130,
              }}
            >
              {Object.entries(STATUS_CONFIG).map(([statusKey, cfg]) => (
                <button
                  key={statusKey}
                  type="button"
                  onClick={() => handleStatusChange(statusKey)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: 'none',
                    background: order.status === statusKey ? cfg.bg : 'transparent',
                    color: cfg.color,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle row: Photo Thumbnail + Customer & Cake Info */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* Reference Photo Thumbnail */}
        {order.referencePhoto ? (
          <div
            onClick={() => onOpenPhoto && onOpenPhoto(order.referencePhoto, `${order.flavor} for ${order.customerName}`, `Due: ${order.deliveryDate} at ${order.deliveryTime}`)}
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              overflow: 'hidden',
              flexShrink: 0,
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 4px 14px rgba(68, 43, 128, 0.15)',
              border: '2px solid white',
            }}
          >
            <img
              src={order.referencePhoto}
              alt="Design reference"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 12,
              }}
            >
              🔍
            </div>
          </div>
        ) : (
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(255,224,245,0.7), rgba(220,227,255,0.7))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              flexShrink: 0,
              border: '1px solid rgba(255,255,255,0.8)',
            }}
          >
            🎂
          </div>
        )}

        {/* Customer & Cake details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--charcoal)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {order.customerName}
            </h3>

            {/* WhatsApp 1-tap button */}
            <button
              type="button"
              onClick={handleWhatsApp}
              title={order.customerPhone ? 'Open WhatsApp Chat' : 'Copy confirmation message'}
              style={{
                padding: '4px 10px',
                borderRadius: 12,
                border: 'none',
                background: '#25D366',
                color: 'white',
                fontSize: 11.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)',
                flexShrink: 0,
              }}
            >
              <span>💬</span> {copied ? 'Copied!' : 'WhatsApp'}
            </button>
          </div>

          {order.customerPhone && (
            <p style={{ margin: '2px 0 4px', fontSize: 12, color: 'var(--warm-gray)', fontFamily: 'var(--font-body)' }}>
              📞 {order.customerPhone}
            </p>
          )}

          <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 600, color: 'var(--charcoal)', fontFamily: 'var(--font-body)' }}>
            🍰 {order.flavor} <span style={{ color: 'var(--rose)', fontWeight: 700 }}>• {order.weight}</span>
          </p>
        </div>
      </div>

      {/* Cake Message block (if provided) */}
      {order.cakeMessage && (
        <div
          style={{
            padding: '6px 12px',
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.65)',
            borderLeft: '3px solid var(--rose)',
            fontSize: 12.5,
            fontStyle: 'italic',
            color: 'var(--charcoal)',
            fontFamily: 'var(--font-body)',
          }}
        >
          &ldquo;{order.cakeMessage}&rdquo;
        </div>
      )}

      {/* Notes / Special Requests (if provided) */}
      {order.notes && (
        <div style={{ fontSize: 12, color: 'var(--warm-gray)', fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>
          <strong>Note:</strong> {order.notes}
        </div>
      )}

      {/* Bottom Payment Strip & Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 8,
          borderTop: '1px solid rgba(151, 145, 190, 0.18)',
          fontSize: 12,
        }}
      >
        {/* Payment details */}
        <div>
          <span style={{ fontWeight: 600, color: 'var(--charcoal)' }}>
            ₹{order.totalPrice}
          </span>
          {order.advancePaid > 0 && order.balanceDue > 0 && (
            <span style={{ color: 'var(--warm-gray)', marginLeft: 6 }}>
              (Adv: ₹{order.advancePaid} • <span style={{ color: '#b83232', fontWeight: 600 }}>Due: ₹{order.balanceDue}</span>)
            </span>
          )}
          {order.balanceDue === 0 && order.totalPrice > 0 && (
            <span style={{ color: '#22823b', fontWeight: 600, marginLeft: 6 }}>
              • Paid ✅
            </span>
          )}
        </div>

        {/* Edit & Delete actions (admin) */}
        {isAdmin && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={() => onEdit(order)}
              style={{
                padding: '4px 8px',
                borderRadius: 8,
                border: '1px solid rgba(151, 145, 190, 0.3)',
                background: 'rgba(255, 255, 255, 0.6)',
                color: 'var(--warm-gray)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ✏️ Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              style={{
                padding: '4px 8px',
                borderRadius: 8,
                border: '1px solid rgba(220, 80, 80, 0.3)',
                background: 'rgba(255, 235, 235, 0.6)',
                color: '#b83232',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

