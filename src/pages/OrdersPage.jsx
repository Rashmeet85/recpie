import { useState } from 'react'
import { useStore } from '../store/useStore'
import OrderCard from '../components/orders/OrderCard'
import AddOrderModal from '../components/orders/AddOrderModal'
import PhotoLightbox from '../components/orders/PhotoLightbox'
import OrderReminderBanner from '../components/orders/OrderReminderBanner'

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'today', label: '🔥 Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Delivered' },
]

export default function OrdersPage() {
  const {
    orderSearchQuery,
    setOrderSearch,
    orderFilterTab,
    setOrderFilterTab,
    getFilteredOrders,
    getTodayPendingOrdersCount,
    ordersLoading,
    isAdmin,
  } = useStore()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [orderToEdit, setOrderToEdit] = useState(null)
  const [lightboxState, setLightboxState] = useState({ isOpen: false, photoUrl: '', title: '', subtitle: '' })

  const filteredOrders = getFilteredOrders()
  const todayPendingCount = getTodayPendingOrdersCount()

  const handleOpenAdd = () => {
    setOrderToEdit(null)
    setIsAddModalOpen(true)
  }

  const handleEditOrder = (order) => {
    setOrderToEdit(order)
    setIsAddModalOpen(true)
  }

  const handleOpenPhoto = (photoUrl, title, subtitle) => {
    setLightboxState({ isOpen: true, photoUrl, title, subtitle })
  }

  const handleCloseLightbox = () => {
    setLightboxState({ isOpen: false, photoUrl: '', title: '', subtitle: '' })
  }

  return (
    <div style={{ padding: '0 0 28px' }}>
      {/* Header */}
      <div
        style={{
          padding: '48px 16px 0',
          background: 'linear-gradient(180deg, rgba(250,248,255,0.94) 70%, rgba(250,248,255,0) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="animate-fade-up" style={{ animationDelay: '0s', opacity: 0 }}>
            <p style={{ margin: 0, fontSize: 11.5, fontFamily: 'var(--font-body)', color: 'var(--light-warm)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
              Kaur&apos;s Cakery
            </p>
            <h1 style={{ margin: '1px 0 0', fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600, color: 'var(--charcoal)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Cake Orders
            </h1>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenAdd}
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
                whiteSpace: 'nowrap',
              }}
            >
              <span>➕</span> New Order
            </button>
          )}
        </div>

        {/* Search */}
        <div className="animate-fade-up" style={{ animationDelay: '0.04s', opacity: 0, position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--light-warm)', pointerEvents: 'none' }}>
            <SearchIcon />
          </span>
          <input
            className="input-field"
            style={{ paddingLeft: 38, paddingTop: 10, paddingBottom: 10, fontSize: 13 }}
            placeholder="Search by customer, flavor, phone…"
            value={orderSearchQuery}
            onChange={(e) => setOrderSearch(e.target.value)}
          />
        </div>

        {/* Filter Tabs */}
        <div className="animate-fade-up" style={{ animationDelay: '0.08s', opacity: 0, display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 12, scrollbarWidth: 'none' }}>
          {TABS.map((tab) => {
            const isActive = orderFilterTab === tab.id
            const isTodayTab = tab.id === 'today'
            return (
              <button
                key={tab.id}
                onClick={() => setOrderFilterTab(tab.id)}
                style={{
                  padding: '6px 13px',
                  borderRadius: 18,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-body)',
                  fontSize: 12.5,
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.18s ease',
                  background: isActive
                    ? 'linear-gradient(135deg, #ff8fdc, #9d7cff)'
                    : 'rgba(255,255,255,0.65)',
                  color: isActive ? 'white' : 'var(--warm-gray)',
                  border: isActive ? 'none' : '1px solid rgba(255,255,255,0.65)',
                  boxShadow: isActive ? '0 8px 18px rgba(142, 106, 232, 0.2)' : '0 2px 8px rgba(94, 61, 165, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <span>{tab.label}</span>
                {isTodayTab && todayPendingCount > 0 && (
                  <span
                    style={{
                      background: isActive ? 'white' : '#ff4d6d',
                      color: isActive ? 'var(--rose)' : 'white',
                      borderRadius: '50%',
                      padding: '0 5px',
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {todayPendingCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Orders List & Reminder Banner */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <OrderReminderBanner onFilterToday={() => setOrderFilterTab('today')} />

        {ordersLoading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--light-warm)' }}>
            <div style={{ width: 28, height: 28, border: '3px solid rgba(180,149,255,0.2)', borderTopColor: 'var(--rose)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13 }}>Loading orders…</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', background: 'rgba(255,255,255,0.6)', borderRadius: 20, border: '1px dashed rgba(180,149,255,0.35)' }}>
            <div style={{ fontSize: 38, marginBottom: 10 }}>🎂</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--charcoal)', margin: '0 0 4px' }}>
              {orderSearchQuery ? 'No matching orders found' : 'No cake orders yet'}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--warm-gray)', maxWidth: 260, margin: '0 auto 14px' }}>
              {orderSearchQuery
                ? 'Try a different search word'
                : 'Log your customer orders with photos, pickup times, and balance due.'}
            </p>
            {isAdmin && !orderSearchQuery && (
              <button
                type="button"
                onClick={handleOpenAdd}
                style={{
                  padding: '9px 18px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
                  color: 'white',
                  fontFamily: 'var(--font-body)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 6px 16px rgba(142, 106, 232, 0.24)',
                }}
              >
                ➕ Register First Order
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onEdit={handleEditOrder}
              onOpenPhoto={handleOpenPhoto}
            />
          ))
        )}
      </div>

      {/* Lightbox for inspecting reference photos fullscreen */}
      <PhotoLightbox
        isOpen={lightboxState.isOpen}
        photoUrl={lightboxState.photoUrl}
        title={lightboxState.title}
        subtitle={lightboxState.subtitle}
        onClose={handleCloseLightbox}
      />

      {/* Add / Edit Order Modal */}
      <AddOrderModal
        isOpen={isAddModalOpen}
        orderToEdit={orderToEdit}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  )
}
