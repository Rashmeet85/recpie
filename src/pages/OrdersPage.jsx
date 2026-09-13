import { useState } from 'react'
import { useStore } from '../store/useStore'
import OrderCard from '../components/orders/OrderCard'
import AddOrderModal from '../components/orders/AddOrderModal'
import PhotoLightbox from '../components/orders/PhotoLightbox'
import OrderReminderBanner from '../components/orders/OrderReminderBanner'

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

const TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'today', label: '🔥 Today' },
  { id: 'upcoming', label: '📅 Upcoming' },
  { id: 'completed', label: '✅ Delivered' },
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
    <div style={{ padding: '0 0 24px' }}>
      {/* Header */}
      <div
        style={{
          padding: '56px 20px 0',
          background: 'linear-gradient(180deg, rgba(250,248,255,0.92) 70%, rgba(250,248,255,0) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div className="animate-fade-up" style={{ animationDelay: '0s', opacity: 0 }}>
            <p style={{ margin: '0 0 2px', fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--light-warm)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
              Kaur&apos;s Cakery
            </p>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 600, color: 'var(--charcoal)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Cake Orders
            </h1>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenAdd}
              style={{
                padding: '10px 16px',
                borderRadius: 16,
                border: 'none',
                background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
                color: 'white',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 8px 20px rgba(142, 106, 232, 0.3)',
                whiteSpace: 'nowrap',
              }}
            >
              <span>➕</span> New Order
            </button>
          )}
        </div>

        {/* Search */}
        <div className="animate-fade-up" style={{ animationDelay: '0.05s', opacity: 0, position: 'relative', marginBottom: 16 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--light-warm)', pointerEvents: 'none' }}>
            <SearchIcon />
          </span>
          <input
            className="input-field"
            style={{ paddingLeft: 42 }}
            placeholder="Search orders by customer, cake flavor, phone…"
            value={orderSearchQuery}
            onChange={(e) => setOrderSearch(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0, display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none' }}>
          {TABS.map((tab) => {
            const isActive = orderFilterTab === tab.id
            const isTodayTab = tab.id === 'today'
            return (
              <button
                key={tab.id}
                onClick={() => setOrderFilterTab(tab.id)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 20,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s',
                  background: isActive
                    ? 'linear-gradient(135deg, #ff8fdc, #9d7cff)'
                    : 'rgba(255,255,255,0.55)',
                  color: isActive ? 'white' : 'var(--warm-gray)',
                  border: isActive ? 'none' : '1px solid rgba(255,255,255,0.58)',
                  boxShadow: isActive ? '0 10px 24px rgba(142, 106, 232, 0.24)' : '0 6px 14px rgba(94, 61, 165, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{tab.label}</span>
                {isTodayTab && todayPendingCount > 0 && (
                  <span
                    style={{
                      background: isActive ? 'white' : '#ff5959',
                      color: isActive ? 'var(--rose)' : 'white',
                      borderRadius: '50%',
                      padding: '1px 6px',
                      fontSize: 11,
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

      {/* Orders List & Banners */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Reminder alert banner */}
        <OrderReminderBanner onFilterToday={() => setOrderFilterTab('today')} />

        {ordersLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--light-warm)' }}>
            <div style={{ width: 32, height: 32, border: '3px solid rgba(180,149,255,0.2)', borderTopColor: 'var(--rose)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14 }}>Loading cake orders…</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', background: 'rgba(255,255,255,0.6)', borderRadius: 24, border: '1px dashed rgba(180,149,255,0.3)' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🎂</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--charcoal)', margin: '0 0 6px' }}>
              {orderSearchQuery ? 'No matching cake orders found' : 'No orders in this list'}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--warm-gray)', maxWidth: 280, margin: '0 auto 16px' }}>
              {orderSearchQuery
                ? 'Try a different search term or check all orders'
                : 'Log your customer orders with photo references, delivery times, and balance tracking.'}
            </p>
            {isAdmin && !orderSearchQuery && (
              <button
                type="button"
                onClick={handleOpenAdd}
                style={{
                  padding: '10px 20px',
                  borderRadius: 14,
                  border: 'none',
                  background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
                  color: 'white',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(142, 106, 232, 0.25)',
                }}
              >
                ➕ Register First Cake Order
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

