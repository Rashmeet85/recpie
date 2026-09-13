import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useStore, getLocalDateString } from '../../store/useStore'
import { optimizeOrderPhoto } from '../../utils/imageOptimizer'

const WEIGHT_PRESETS = ['0.5 kg', '1 kg', '1.5 kg', '2 kg', '3 kg', 'Custom']
const COMMON_FLAVORS = [
  'Belgian Chocolate',
  'Red Velvet',
  'Pineapple',
  'Butterscotch',
  'Fresh Fruit',
  'Black Forest',
  'Vanilla Bean',
  'Truffle',
]

export default function AddOrderModal({ isOpen, onClose, orderToEdit = null }) {
  const { addOrder, updateOrder } = useStore()

  // Form State
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryTime, setDeliveryTime] = useState('17:00')
  const [flavor, setFlavor] = useState('')
  const [weight, setWeight] = useState('1 kg')
  const [customWeight, setCustomWeight] = useState('')
  const [cakeMessage, setCakeMessage] = useState('')
  const [notes, setNotes] = useState('')
  const [totalPrice, setTotalPrice] = useState('')
  const [advancePaid, setAdvancePaid] = useState('')
  const [referencePhoto, setReferencePhoto] = useState(null)
  const [optimizing, setOptimizing] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  useEffect(() => {
    if (orderToEdit) {
      setCustomerName(orderToEdit.customerName || '')
      setCustomerPhone(orderToEdit.customerPhone || '')
      setDeliveryDate(orderToEdit.deliveryDate || getLocalDateString())
      setDeliveryTime(orderToEdit.deliveryTime || '17:00')
      setFlavor(orderToEdit.flavor || '')
      if (WEIGHT_PRESETS.includes(orderToEdit.weight)) {
        setWeight(orderToEdit.weight)
        setCustomWeight('')
      } else {
        setWeight('Custom')
        setCustomWeight(orderToEdit.weight || '')
      }
      setCakeMessage(orderToEdit.cakeMessage || '')
      setNotes(orderToEdit.notes || '')
      setTotalPrice(orderToEdit.totalPrice !== undefined ? String(orderToEdit.totalPrice) : '')
      setAdvancePaid(orderToEdit.advancePaid !== undefined ? String(orderToEdit.advancePaid) : '')
      setReferencePhoto(orderToEdit.referencePhoto || null)
    } else {
      // Default new order to tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setCustomerName('')
      setCustomerPhone('')
      setDeliveryDate(getLocalDateString(tomorrow))
      setDeliveryTime('17:00')
      setFlavor('')
      setWeight('1 kg')
      setCustomWeight('')
      setCakeMessage('')
      setNotes('')
      setTotalPrice('')
      setAdvancePaid('')
      setReferencePhoto(null)
    }
    setError('')
    setSaving(false)
  }, [orderToEdit, isOpen])

  if (!isOpen || typeof document === 'undefined') return null

  // Balance calculation
  const totalNum = parseFloat(totalPrice) || 0
  const advanceNum = parseFloat(advancePaid) || 0
  const balanceDue = Math.max(0, totalNum - advanceNum)

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setOptimizing(true)
    try {
      const optimized = await optimizeOrderPhoto(file, 1000)
      setReferencePhoto(optimized.dataUrl)
    } catch (err) {
      console.error('Photo optimization error:', err)
      setError('Could not process photo. Please try a different image.')
    } finally {
      setOptimizing(false)
      e.target.value = ''
    }
  }

  const handleRemovePhoto = (e) => {
    e.stopPropagation()
    setReferencePhoto(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!customerName.trim()) {
      setError('Please enter the customer name.')
      return
    }
    if (!deliveryDate) {
      setError('Please select a delivery date.')
      return
    }

    const finalWeight = weight === 'Custom' ? (customWeight.trim() || 'Custom') : weight

    setSaving(true)
    setError('')

    const orderData = {
      ...(orderToEdit || {}),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim().replace(/\D/g, ''),
      deliveryDate,
      deliveryTime: deliveryTime || '12:00',
      flavor: flavor.trim() || 'Custom Cake',
      weight: finalWeight,
      cakeMessage: cakeMessage.trim(),
      notes: notes.trim(),
      totalPrice: totalNum,
      advancePaid: advanceNum,
      balanceDue,
      paymentStatus: totalNum > 0 && advanceNum >= totalNum ? 'paid' : (advanceNum > 0 ? 'partial' : 'unpaid'),
      status: orderToEdit?.status || 'pending',
      referencePhoto,
    }

    try {
      if (orderToEdit) {
        await updateOrder(orderData)
      } else {
        await addOrder(orderData)
      }
      onClose()
    } catch (err) {
      console.error('Error saving order:', err)
      setError('Could not save order. Please check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(28, 26, 46, 0.45)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-scale-in"
        style={{
          width: '100%',
          maxWidth: 540,
          maxHeight: 'min(92dvh, 800px)',
          background: 'rgba(252, 250, 255, 0.96)',
          backdropFilter: 'blur(28px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.4)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          borderRadius: 24,
          boxShadow: '0 28px 70px rgba(68, 43, 128, 0.28)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Hidden inputs for camera & gallery */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoSelect}
          style={{ display: 'none' }}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoSelect}
          style={{ display: 'none' }}
        />

        {/* Modal Header */}
        <div
          style={{
            padding: '18px 20px 14px',
            borderBottom: '1px solid rgba(151, 145, 190, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--light-warm)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              Kaur&apos;s Cakery • Order Register
            </p>
            <h2 style={{ margin: 0, fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--charcoal)' }}>
              {orderToEdit ? '✏️ Edit Cake Order' : '🎂 New Cake Order'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: '1px solid rgba(151, 145, 190, 0.3)',
              background: 'rgba(255, 255, 255, 0.6)',
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1, padding: '16px 20px', gap: 18 }}>
          {/* Section 1: Customer Details */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--light-warm)', marginBottom: 6 }}>
              👤 Customer Info
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Customer Name (e.g. Priya Sharma)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input-field"
                  style={{ fontSize: 14 }}
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="WhatsApp Number (e.g. 9876543210)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="input-field"
                  style={{ fontSize: 14 }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Date & Time */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--light-warm)', marginBottom: 6 }}>
              📅 Pickup / Delivery Date & Time
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
              <input
                type="date"
                required
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="input-field"
                style={{ fontSize: 14 }}
              />
              <input
                type="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="input-field"
                style={{ fontSize: 14 }}
              />
            </div>
          </div>

          {/* Section 3: Cake Details */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--light-warm)', marginBottom: 6 }}>
              🍰 Cake Details
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Flavor input + quick chips */}
              <div>
                <input
                  type="text"
                  placeholder="Flavor (e.g. Belgian Chocolate Truffle)"
                  value={flavor}
                  onChange={(e) => setFlavor(e.target.value)}
                  className="input-field"
                  style={{ fontSize: 14, marginBottom: 8 }}
                />
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                  {COMMON_FLAVORS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFlavor(f)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: 11,
                        whiteSpace: 'nowrap',
                        border: flavor === f ? 'none' : '1px solid rgba(151, 145, 190, 0.3)',
                        background: flavor === f ? 'linear-gradient(135deg, #ff8fdc, #9d7cff)' : 'rgba(255,255,255,0.7)',
                        color: flavor === f ? 'white' : 'var(--warm-gray)',
                        cursor: 'pointer',
                        fontWeight: flavor === f ? 600 : 400,
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight Selector */}
              <div>
                <span style={{ fontSize: 12, color: 'var(--warm-gray)', fontWeight: 500, display: 'block', marginBottom: 4 }}>
                  Weight / Size:
                </span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                  {WEIGHT_PRESETS.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWeight(w)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 12,
                        fontSize: 12,
                        border: weight === w ? 'none' : '1px solid rgba(151, 145, 190, 0.3)',
                        background: weight === w ? 'linear-gradient(135deg, #ff8fdc, #9d7cff)' : 'rgba(255,255,255,0.7)',
                        color: weight === w ? 'white' : 'var(--warm-gray)',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {w}
                    </button>
                  ))}
                </div>
                {weight === 'Custom' && (
                  <input
                    type="text"
                    placeholder="Enter custom size (e.g. 2.5 kg, 2-tier 3 kg)"
                    value={customWeight}
                    onChange={(e) => setCustomWeight(e.target.value)}
                    className="input-field"
                    style={{ fontSize: 13 }}
                  />
                )}
              </div>

              {/* Cake Message */}
              <div>
                <input
                  type="text"
                  placeholder="Message on Cake (e.g. Happy 5th Birthday Kabir!)"
                  value={cakeMessage}
                  onChange={(e) => setCakeMessage(e.target.value)}
                  className="input-field"
                  style={{ fontSize: 14 }}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Reference Photo */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--light-warm)', marginBottom: 6 }}>
              📸 Reference Photo (Design / WhatsApp screenshot)
            </label>

            {referencePhoto ? (
              <div
                style={{
                  position: 'relative',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid rgba(151, 145, 190, 0.3)',
                  background: '#1a1829',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  maxHeight: 200,
                }}
              >
                <img
                  src={referencePhoto}
                  alt="Reference cake design"
                  style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }}
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'rgba(230, 60, 60, 0.85)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 12,
                    padding: '6px 12px',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  ✕ Remove
                </button>
              </div>
            ) : (
              <div
                style={{
                  padding: '16px',
                  borderRadius: 16,
                  border: '2px dashed rgba(180, 149, 255, 0.45)',
                  background: 'rgba(255, 255, 255, 0.45)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  textAlign: 'center',
                }}
              >
                {optimizing ? (
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--rose)', fontWeight: 600 }}>
                    Processing & optimizing photo…
                  </p>
                ) : (
                  <>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--warm-gray)' }}>
                      Attach customer&apos;s cake design photo from gallery or camera
                    </p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 12,
                          background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
                          color: 'white',
                          border: 'none',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <span>📸</span> Camera
                      </button>
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 12,
                          background: 'rgba(255, 255, 255, 0.85)',
                          border: '1px solid rgba(151, 145, 190, 0.35)',
                          color: 'var(--charcoal)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <span>🖼️</span> Gallery
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Section 5: Money & Payment */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--light-warm)', marginBottom: 6 }}>
              💰 Payment (Auto-Calculates Balance)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--warm-gray)', display: 'block', marginBottom: 2 }}>Total Price (₹)</span>
                <input
                  type="number"
                  placeholder="e.g. 1200"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
                  className="input-field"
                  style={{ fontSize: 15, fontWeight: 600 }}
                />
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--warm-gray)', display: 'block', marginBottom: 2 }}>Advance Paid (₹)</span>
                <input
                  type="number"
                  placeholder="e.g. 400"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(e.target.value)}
                  className="input-field"
                  style={{ fontSize: 15, fontWeight: 600 }}
                />
              </div>
            </div>

            {/* Live Balance Strip */}
            <div
              style={{
                marginTop: 8,
                padding: '8px 12px',
                borderRadius: 12,
                background: balanceDue > 0 ? 'rgba(255, 175, 175, 0.22)' : 'rgba(120, 210, 140, 0.22)',
                border: balanceDue > 0 ? '1px solid rgba(220, 80, 80, 0.25)' : '1px solid rgba(80, 180, 100, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <span style={{ color: 'var(--charcoal)' }}>Remaining Balance Due:</span>
              <span style={{ color: balanceDue > 0 ? '#b83232' : '#22823b', fontSize: 15 }}>
                {balanceDue > 0 ? `₹${balanceDue.toLocaleString()}` : '✅ Fully Paid'}
              </span>
            </div>
          </div>

          {/* Section 6: Special Notes */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--light-warm)', marginBottom: 6 }}>
              📝 Special Requests & Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 100% Eggless, less sweet, customer will bring their own topper, pack knife & candle"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              style={{ fontSize: 13 }}
            />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255, 237, 237, 0.8)', border: '1px solid rgba(224, 90, 58, 0.3)', color: '#c24a2d', fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* Modal Footer */}
          <div style={{ display: 'flex', gap: 10, marginTop: 6, paddingTop: 12, borderTop: '1px solid rgba(151, 145, 190, 0.2)' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '13px 16px',
                borderRadius: 14,
                border: '1px solid rgba(151, 145, 190, 0.3)',
                background: 'rgba(255, 255, 255, 0.7)',
                color: 'var(--warm-gray)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || optimizing}
              style={{
                flex: 2,
                padding: '13px 16px',
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(142, 106, 232, 0.3)',
                opacity: saving || optimizing ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving…' : (orderToEdit ? 'Save Changes' : '🎂 Register Order')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

