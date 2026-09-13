import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useStore, getLocalDateString } from '../../store/useStore'
import { optimizeOrderPhoto } from '../../utils/imageOptimizer'

const WEIGHT_PRESETS = ['0.5 kg', '1 kg', '1.5 kg', '2 kg', 'Custom']
const QUICK_FLAVORS = ['Belgian Truffle', 'Red Velvet', 'Pineapple', 'Butterscotch', 'Fresh Fruit']

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
      console.error('Photo error:', err)
      setError('Could not process photo.')
    } finally {
      setOptimizing(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!customerName.trim()) {
      setError('Please enter customer name.')
      return
    }
    if (!deliveryDate) {
      setError('Please choose a delivery date.')
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
      setError('Failed to save order. Please retry.')
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
        background: 'rgba(28, 26, 46, 0.5)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-end', // Bottom-sheet on mobile
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-up"
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: 'min(92dvh, 780px)',
          background: 'rgba(254, 252, 255, 0.98)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          border: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 -10px 40px rgba(68, 43, 128, 0.22)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Hidden photo inputs */}
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} style={{ display: 'none' }} />
        <input ref={galleryInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: 'none' }} />

        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px 12px',
            borderBottom: '1px solid rgba(151, 145, 190, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--charcoal)' }}>
              {orderToEdit ? 'Edit Cake Order' : '🎂 New Cake Order'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(151, 145, 190, 0.15)',
              color: 'var(--warm-gray)',
              fontSize: 15,
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1, padding: '14px 18px', gap: 14 }}>
          {/* Group 1: Customer & Timing */}
          <div style={{ background: 'rgba(255, 255, 255, 0.7)', borderRadius: 16, padding: '12px 14px', border: '1px solid rgba(235, 230, 245, 0.9)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              type="text"
              required
              placeholder="Customer Name *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="input-field"
              style={{ fontSize: 14, paddingTop: 9, paddingBottom: 9 }}
            />

            <input
              type="tel"
              placeholder="WhatsApp Number (optional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="input-field"
              style={{ fontSize: 14, paddingTop: 9, paddingBottom: 9 }}
            />

            {/* Date & Time Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--warm-gray)', display: 'block', marginBottom: 3 }}>Due Date *</label>
                <input
                  type="date"
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="input-field"
                  style={{ fontSize: 13, paddingTop: 8, paddingBottom: 8 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--warm-gray)', display: 'block', marginBottom: 3 }}>Time</label>
                <input
                  type="time"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="input-field"
                  style={{ fontSize: 13, paddingTop: 8, paddingBottom: 8 }}
                />
              </div>
            </div>
          </div>

          {/* Group 2: Cake Details & Reference Photo */}
          <div style={{ background: 'rgba(255, 255, 255, 0.7)', borderRadius: 16, padding: '12px 14px', border: '1px solid rgba(235, 230, 245, 0.9)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Flavor */}
            <div>
              <input
                type="text"
                placeholder="Cake Flavor (e.g. Belgian Truffle)"
                value={flavor}
                onChange={(e) => setFlavor(e.target.value)}
                className="input-field"
                style={{ fontSize: 14, paddingTop: 9, paddingBottom: 9, marginBottom: 6 }}
              />
              <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
                {QUICK_FLAVORS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFlavor(f)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 10,
                      fontSize: 11,
                      whiteSpace: 'nowrap',
                      border: 'none',
                      background: flavor === f ? 'linear-gradient(135deg, #ff8fdc, #9d7cff)' : 'rgba(151, 145, 190, 0.12)',
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

            {/* Weight Chips */}
            <div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {WEIGHT_PRESETS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWeight(w)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 10,
                      fontSize: 11.5,
                      border: 'none',
                      background: weight === w ? 'linear-gradient(135deg, #ff8fdc, #9d7cff)' : 'rgba(151, 145, 190, 0.12)',
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
                  placeholder="Custom size (e.g. 2.5 kg, 2-tier)"
                  value={customWeight}
                  onChange={(e) => setCustomWeight(e.target.value)}
                  className="input-field"
                  style={{ fontSize: 13, marginTop: 6, paddingTop: 7, paddingBottom: 7 }}
                />
              )}
            </div>

            {/* Message on cake */}
            <input
              type="text"
              placeholder="Message on cake (e.g. Happy Birthday!)"
              value={cakeMessage}
              onChange={(e) => setCakeMessage(e.target.value)}
              className="input-field"
              style={{ fontSize: 13, paddingTop: 8, paddingBottom: 8 }}
            />

            {/* Photo Attachment Bar */}
            <div>
              {referencePhoto ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 6, background: 'rgba(151, 145, 190, 0.08)', borderRadius: 12 }}>
                  <img src={referencePhoto} alt="Ref preview" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                  <span style={{ fontSize: 12, color: 'var(--charcoal)', flex: 1, fontWeight: 500 }}>Photo attached</span>
                  <button
                    type="button"
                    onClick={() => setReferencePhoto(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#d63031',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '4px 8px',
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(151, 145, 190, 0.08)', borderRadius: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--warm-gray)' }}>
                    {optimizing ? 'Processing photo…' : 'Attach cake photo:'}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      style={{
                        padding: '4px 9px',
                        borderRadius: 8,
                        background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
                        color: 'white',
                        border: 'none',
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <span>📸</span> Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      style={{
                        padding: '4px 9px',
                        borderRadius: 8,
                        background: 'white',
                        border: '1px solid rgba(151, 145, 190, 0.3)',
                        color: 'var(--charcoal)',
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <span>🖼️</span> Gallery
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Group 3: Payment & Notes */}
          <div style={{ background: 'rgba(255, 255, 255, 0.7)', borderRadius: 16, padding: '12px 14px', border: '1px solid rgba(235, 230, 245, 0.9)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--warm-gray)', display: 'block', marginBottom: 3 }}>Total Price (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
                  className="input-field"
                  style={{ fontSize: 14, fontWeight: 600, paddingTop: 8, paddingBottom: 8 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--warm-gray)', display: 'block', marginBottom: 3 }}>Advance Paid (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(e.target.value)}
                  className="input-field"
                  style={{ fontSize: 14, fontWeight: 600, paddingTop: 8, paddingBottom: 8 }}
                />
              </div>
            </div>

            {/* Inline live balance text */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5, paddingTop: 2 }}>
              <span style={{ color: 'var(--warm-gray)' }}>Balance due:</span>
              <span style={{ fontWeight: 700, color: balanceDue > 0 ? '#d63031' : '#27ae60' }}>
                {balanceDue > 0 ? `₹${balanceDue.toLocaleString()}` : (totalNum > 0 ? 'Paid in Full ✅' : '₹0')}
              </span>
            </div>

            {/* Special notes */}
            <input
              type="text"
              placeholder="Notes (e.g. eggless, candle & knife)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              style={{ fontSize: 12.5, paddingTop: 7, paddingBottom: 7 }}
            />
          </div>

          {error && (
            <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(255, 237, 237, 0.85)', color: '#c24a2d', fontSize: 12 }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: 8, paddingTop: 4, paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: 14,
                border: '1px solid rgba(151, 145, 190, 0.25)',
                background: 'rgba(255, 255, 255, 0.7)',
                color: 'var(--warm-gray)',
                fontSize: 13.5,
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
                padding: '12px 14px',
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
                color: 'white',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(142, 106, 232, 0.28)',
                opacity: saving || optimizing ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving…' : (orderToEdit ? 'Save Changes' : '🎂 Save Order')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
