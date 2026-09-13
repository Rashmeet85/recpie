import { useState, useRef, useEffect } from 'react'
import { useStore, getLocalDateString } from '../../store/useStore'

function formatOrderDate(dateStr, timeStr) {
  if (!dateStr) return ''
  const todayStr = getLocalDateString()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = getLocalDateString(tomorrow)

  const timeFormatted = timeStr ? `, ${timeStr}` : ''

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
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const menuRef = useRef(null)

  const todayStr = getLocalDateString()
  const isDueToday = order.deliveryDate === todayStr && order.status !== 'delivered' && order.status !== 'cancelled'
  const isPast = order.deliveryDate < todayStr && order.status !== 'delivered' && order.status !== 'cancelled'

  const STATUS_CONFIG = {
    pending: { label: '⏳ In Prep', bg: '#fff8e6', color: '#b27b00', border: '#ffe49e' },
    ready: { label: '✨ Ready', bg: '#f2edff', color: '#6842c2', border: '#dcd0ff' },
    delivered: { label: '🎉 Delivered', bg: '#eafaf0', color: '#248a3d', border: '#b8eec8' },
    cancelled: { label: '❌ Cancelled', bg: '#f2f2f5', color: '#636366', border: '#dedee3' },
  }

  const currentStatus = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowActionsMenu(false)
        setShowStatusPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const generateWhatsAppMessage = () => {
    const time = order.deliveryTime ? ` at ${order.deliveryTime}` : ''
    const balanceText = order.balanceDue > 0
      ? `Total: ₹${order.totalPrice} (Advance: ₹${order.advancePaid} | Balance Due: ₹${order.balanceDue})`
      : `Total: ₹${order.totalPrice} (Paid in Full ✅)`

    return `Hi ${order.customerName}! ✨ Thank you for ordering with Kaur's Cakery.\n\n🎂 *Order Confirmation*:\n• *Cake*: ${order.flavor} (${order.weight})\n${order.cakeMessage ? `• *Message on Cake*: "${order.cakeMessage}"\n` : ''}• *Delivery/Pickup*: ${order.deliveryDate}${time}\n• *Payment*: ${balanceText}\n${order.notes ? `• *Notes*: ${order.notes}\n` : ''}\nWe're making it with love! ❤️`
  }

  const handleWhatsApp = (e) => {
    e.stopPropagation()
    const msg = generateWhatsAppMessage()
    const encoded = encodeURIComponent(msg)

    let phone = (order.customerPhone || '').replace(/\D/g, '')
    if (phone.length === 10) {
      phone = '91' + phone
    }

    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
    } else {
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
    setShowActionsMenu(false)
    if (window.confirm(`Delete order for ${order.customerName}?`)) {
      await deleteOrder(order.id)
    }
  }

  return (
    <div
      style={{
        background: isDueToday
          ? 'linear-gradient(135deg, rgba(255, 250, 245, 0.98), rgba(255, 244, 250, 0.95))'
          : 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: isDueToday
          ? '1.5px solid rgba(255, 140, 180, 0.55)'
          : '1px solid rgba(230, 226, 242, 0.8)',
        borderRadius: 20,
        padding: '14px 15px',
        boxShadow: isDueToday
          ? '0 10px 26px rgba(255, 120, 160, 0.14)'
          : '0 4px 18px rgba(78, 51, 143, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 11,
        position: 'relative',
      }}
    >
      {/* 1. Clean Top Header: Delivery Pill + Status Pill + Kebab Menu */}
      <div ref={menuRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        {/* Date / Time Tag */}
        <span
          style={{
            padding: '3px 9px',
            borderRadius: 10,
            fontSize: 11.5,
            fontWeight: 700,
            fontFamily: 'var(--font-body)',
            background: isDueToday
              ? 'linear-gradient(135deg, #ff7e5f, #feb47b)'
              : isPast
                ? 'rgba(220, 53, 69, 0.12)'
                : 'rgba(151, 145, 190, 0.15)',
            color: isDueToday ? 'white' : (isPast ? '#c22d38' : 'var(--charcoal)'),
            whiteSpace: 'nowrap',
          }}
        >
          {formatOrderDate(order.deliveryDate, order.deliveryTime)}
        </span>

        {/* Right side: Status Button & Actions Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, position: 'relative' }}>
          <button
            type="button"
            disabled={!isAdmin}
            onClick={() => {
              setShowStatusPicker(!showStatusPicker)
              setShowActionsMenu(false)
            }}
            style={{
              padding: '3px 8px',
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 600,
              border: `1px solid ${currentStatus.border}`,
              background: currentStatus.bg,
              color: currentStatus.color,
              cursor: isAdmin ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            {currentStatus.label}
            {isAdmin && <span style={{ fontSize: 8, opacity: 0.7 }}>▼</span>}
          </button>

          {/* Quick status dropdown */}
          {showStatusPicker && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                zIndex: 40,
                background: 'white',
                borderRadius: 14,
                boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
                border: '1px solid rgba(151, 145, 190, 0.25)',
                padding: 5,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                minWidth: 125,
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
                    fontSize: 11.5,
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

          {/* Admin Kebab Menu (•••) */}
          {isAdmin && (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => {
                  setShowActionsMenu(!showActionsMenu)
                  setShowStatusPicker(false)
                }}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  border: 'none',
                  background: 'rgba(151, 145, 190, 0.12)',
                  color: 'var(--warm-gray)',
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Order actions"
              >
                •••
              </button>

              {showActionsMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '115%',
                    right: 0,
                    zIndex: 40,
                    background: 'white',
                    borderRadius: 14,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
                    border: '1px solid rgba(151, 145, 190, 0.25)',
                    padding: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    minWidth: 110,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowActionsMenu(false)
                      onEdit(order)
                    }}
                    style={{
                      padding: '7px 10px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--charcoal)',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>✏️</span> Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    style={{
                      padding: '7px 10px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'transparent',
                      color: '#d63031',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>🗑️</span> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Body: Photo Thumbnail + Customer & Flavor Details */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {/* Photo Thumbnail */}
        {order.referencePhoto ? (
          <div
            onClick={() => onOpenPhoto && onOpenPhoto(order.referencePhoto, `${order.flavor} for ${order.customerName}`, `Due: ${order.deliveryDate}${order.deliveryTime ? ` at ${order.deliveryTime}` : ''}`)}
            style={{
              width: 62,
              height: 62,
              borderRadius: 14,
              overflow: 'hidden',
              flexShrink: 0,
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 3px 10px rgba(68, 43, 128, 0.12)',
              border: '1.5px solid white',
            }}
          >
            <img
              src={order.referencePhoto}
              alt="Design reference"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: 2,
                right: 3,
                fontSize: 10,
                background: 'rgba(0,0,0,0.4)',
                borderRadius: 4,
                padding: '1px 3px',
                color: 'white',
              }}
            >
              🔍
            </span>
          </div>
        ) : (
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(255,224,245,0.75), rgba(220,227,255,0.75))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              flexShrink: 0,
              border: '1px solid rgba(255,255,255,0.9)',
            }}
          >
            🎂
          </div>
        )}

        {/* Customer & Flavor */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: '0 0 2px', fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--charcoal)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {order.customerName}
          </h3>

          <p style={{ margin: 0, fontSize: 13, color: 'var(--charcoal)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            {order.flavor} <span style={{ color: 'var(--rose)', fontWeight: 700 }}>• {order.weight}</span>
          </p>

          {order.customerPhone && (
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--warm-gray)', fontFamily: 'var(--font-body)' }}>
              📞 {order.customerPhone}
            </p>
          )}
        </div>
      </div>

      {/* 3. Cake Message Bubble (if present) */}
      {order.cakeMessage && (
        <div
          style={{
            padding: '5px 10px',
            borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.7)',
            borderLeft: '3px solid var(--rose)',
            fontSize: 12,
            fontStyle: 'italic',
            color: 'var(--charcoal)',
            fontFamily: 'var(--font-body)',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <span>✍️</span> &ldquo;{order.cakeMessage}&rdquo;
        </div>
      )}

      {/* 4. Notes (if present) */}
      {order.notes && (
        <p style={{ margin: 0, fontSize: 11.5, color: 'var(--warm-gray)', fontFamily: 'var(--font-body)', lineHeight: 1.35 }}>
          <strong>Note:</strong> {order.notes}
        </p>
      )}

      {/* 5. Bottom Row: Price & Balance on left, WhatsApp button on right */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 8,
          borderTop: '1px solid rgba(151, 145, 190, 0.15)',
        }}
      >
        {/* Money Summary */}
        <div style={{ fontSize: 12.5, fontFamily: 'var(--font-body)' }}>
          <span style={{ fontWeight: 700, color: 'var(--charcoal)' }}>
            ₹{order.totalPrice || 0}
          </span>
          {order.balanceDue > 0 ? (
            <span style={{ color: '#d63031', fontWeight: 600, marginLeft: 6, fontSize: 11.5 }}>
              (₹{order.balanceDue} due)
            </span>
          ) : order.totalPrice > 0 ? (
            <span style={{ color: '#27ae60', fontWeight: 600, marginLeft: 6, fontSize: 11.5 }}>
              • Paid ✅
            </span>
          ) : null}
        </div>

        {/* WhatsApp Slip Button */}
        <button
          type="button"
          onClick={handleWhatsApp}
          style={{
            padding: '5px 11px',
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
            boxShadow: '0 3px 8px rgba(37, 211, 102, 0.28)',
          }}
        >
          <span>💬</span> {copied ? 'Copied!' : 'WhatsApp'}
        </button>
      </div>
    </div>
  )
}
