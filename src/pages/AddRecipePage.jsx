import { useState, useEffect } from 'react'
import { useStore, TAGS } from '../store/useStore'

const EMOJIS = ['🍰', '🎂', '🧁', '🍞', '🥐', '🥖', '🥨', '🍩', '🍪', '🫓', '🍕', '🍔', '🥖', '🌾', '🍫', '🎃']

function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
}
function TrashIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
}
function BackIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
}

const emptyIngredient = () => ({ id: Date.now() + Math.random(), name: '', amount: '' })
const emptyStep = () => ({ id: Date.now() + Math.random(), text: '' })

const EMPTY_FORM = {
  emoji: '🍰',
  name: '',
  tag: 'Bread',
  meta: [
    { id: 1, label: 'Flour', value: '' },
    { id: 2, label: 'Yield', value: '' },
    { id: 3, label: 'Bake Temp', value: '' },
    { id: 4, label: 'Time', value: '' },
  ],
  ingredients: [emptyIngredient()],
  ingredientNote: '',
  method: [emptyStep()],
  tips: '',
  notes: '',
}

export default function AddRecipePage() {
  const { setPage, addRecipe, updateRecipe, editingRecipe, isAdmin } = useStore()
  const isEditing = !!editingRecipe
  const [form, setForm] = useState(isEditing ? {
    ...editingRecipe,
    ingredients: editingRecipe.ingredients?.map(i => ({ ...i, id: i.id || Date.now() + Math.random() })) || [emptyIngredient()],
    method: editingRecipe.method?.map((s, i) => ({ id: i, text: s })) || [emptyStep()],
    meta: editingRecipe.meta?.map((m, i) => ({ ...m, id: i })) || EMPTY_FORM.meta,
  } : { ...EMPTY_FORM, meta: EMPTY_FORM.meta.map(m => ({ ...m })), ingredients: [emptyIngredient()], method: [emptyStep()] })
  const [saving, setSaving] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!isAdmin) {
      setPage('library')
    }
  }, [isAdmin, setPage])

  if (!isAdmin) {
    return null
  }

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  // Ingredients
  const addIngredient = () => update('ingredients', [...form.ingredients, emptyIngredient()])
  const removeIngredient = (id) => update('ingredients', form.ingredients.filter(i => i.id !== id))
  const updateIngredient = (id, field, val) => update('ingredients', form.ingredients.map(i => i.id === id ? { ...i, [field]: val } : i))

  // Method
  const addStep = () => update('method', [...form.method, emptyStep()])
  const removeStep = (id) => update('method', form.method.filter(s => s.id !== id))
  const updateStep = (id, val) => update('method', form.method.map(s => s.id === id ? { ...s, text: val } : s))

  // Meta
  const updateMeta = (id, field, val) => update('meta', form.meta.map(m => m.id === id ? { ...m, [field]: val } : m))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Recipe name is required'
    if (form.ingredients.filter(i => i.name.trim()).length === 0) e.ingredients = 'Add at least one ingredient'
    if (form.method.filter(s => s.text.trim()).length === 0) e.method = 'Add at least one step'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    const recipe = {
      ...form,
      id: editingRecipe?.id,
      ingredients: form.ingredients.filter(i => i.name.trim()),
      method: form.method.filter(s => s.text.trim()).map(s => s.text),
      meta: form.meta.filter(m => m.label.trim()),
    }
    try {
      if (isEditing) {
        await updateRecipe(recipe)
        setPage('view', { recipe })
      } else {
        const saved = await addRecipe(recipe)
        setPage('view', { recipe: saved })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        background: 'rgba(250,248,255,0.74)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.55)',
        padding: '54px 20px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
      }} className="no-print">
        <button onClick={() => setPage(isEditing ? 'view' : 'library')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rose)', padding: 4, display: 'flex' }}>
          <BackIcon />
        </button>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, flex: 1 }}>
          {isEditing ? 'Edit Recipe' : 'New Recipe'}
        </h2>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '10px 22px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
            color: 'white', fontFamily: 'var(--font-body)', fontWeight: 600,
            fontSize: 14, cursor: 'pointer',
            boxShadow: '0 12px 24px rgba(142, 106, 232, 0.24)',
            opacity: saving ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {saving ? '…' : 'Save'}
        </button>
      </div>

      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Emoji + Name */}
        <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.05s' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                style={{
                  width: 64, height: 64, borderRadius: 18, border: '1.5px solid rgba(201,169,110,0.3)',
                  background: 'rgba(255,255,255,0.5)', fontSize: 30, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {form.emoji}
              </button>
              {showEmojiPicker && (
                <div style={{
                  position: 'absolute', top: 70, left: 0, zIndex: 60,
                  background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.58)', borderRadius: 18,
                  padding: 12, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6,
                  boxShadow: '0 8px 32px rgba(45,40,38,0.15)', width: 160,
                }}>
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => { update('emoji', e); setShowEmojiPicker(false) }}
                      style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: 8, transition: 'background 0.15s' }}
                      onMouseOver={ev => ev.target.style.background = 'rgba(180,149,255,0.14)'}
                      onMouseOut={ev => ev.target.style.background = 'none'}
                    >{e}</button>
                  ))}
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div className="section-label">Recipe Name *</div>
              <input className="input-field" placeholder="e.g. Sourdough Boule" value={form.name} onChange={e => update('name', e.target.value)} style={{ borderColor: errors.name ? '#e05a3a' : undefined }} />
              {errors.name && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#e05a3a', fontFamily: 'var(--font-body)' }}>{errors.name}</p>}
            </div>
          </div>
        </div>

        {/* Tag */}
        <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.08s' }}>
          <div className="section-label">Category</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TAGS.filter(t => t !== 'All').map(tag => (
              <button key={tag} onClick={() => update('tag', tag)} style={{
                padding: '8px 16px', borderRadius: 20, border: '1.5px solid',
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                background: form.tag === tag ? 'linear-gradient(135deg, #ff8fdc, #9d7cff)' : 'rgba(255,255,255,0.55)',
                color: form.tag === tag ? 'white' : 'var(--warm-gray)',
                borderColor: form.tag === tag ? 'transparent' : 'rgba(255,255,255,0.58)',
                transition: 'all 0.2s',
              }}>{tag}</button>
            ))}
          </div>
        </div>

        {/* Meta info */}
        <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.1s' }}>
          <div className="section-label">Recipe Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {form.meta.map(m => (
              <div key={m.id}>
                <input className="input-field" placeholder="Label (e.g. Flour)" value={m.label}
                  onChange={e => updateMeta(m.id, 'label', e.target.value)}
                  style={{ marginBottom: 6, fontSize: 12, padding: '8px 14px', borderRadius: 10 }} />
                <input className="input-field" placeholder="Value (e.g. 300g)" value={m.value}
                  onChange={e => updateMeta(m.id, 'value', e.target.value)}
                  style={{ fontSize: 13, padding: '8px 14px', borderRadius: 10 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.12s' }}>
          <div className="section-label">🌾 Ingredients *</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {form.ingredients.map((ing, i) => (
              <div key={ing.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: 'var(--rose)', fontSize: 13, minWidth: 18, fontWeight: 600, fontFamily: 'var(--font-body)' }}>{i + 1}.</span>
                <input className="input-field" placeholder="Ingredient name" value={ing.name}
                  onChange={e => updateIngredient(ing.id, 'name', e.target.value)} style={{ flex: 2 }} />
                <input className="input-field" placeholder="Amount" value={ing.amount}
                  onChange={e => updateIngredient(ing.id, 'amount', e.target.value)} style={{ flex: 1, minWidth: 80 }} />
                {form.ingredients.length > 1 && (
                  <button onClick={() => removeIngredient(ing.id)} style={{ color: 'var(--light-warm)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                    <TrashIcon />
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.ingredients && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#e05a3a', fontFamily: 'var(--font-body)' }}>{errors.ingredients}</p>}
          <input className="input-field" placeholder="Extra note (e.g. Milk Wash: …)" value={form.ingredientNote}
            onChange={e => update('ingredientNote', e.target.value)} style={{ marginTop: 8, fontSize: 13 }} />
          <button onClick={addIngredient} style={{
            marginTop: 10, padding: '10px', borderRadius: 12, border: '1.5px dashed rgba(212,136,106,0.4)',
            background: 'rgba(255,143,220,0.08)', color: 'var(--rose)', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 13, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <PlusIcon /> Add Ingredient
          </button>
        </div>

        {/* Method */}
        <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.14s' }}>
          <div className="section-label">👩‍🍳 Method *</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {form.method.map((step, i) => (
              <div key={step.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{
                  minWidth: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(255,143,220,0.16), rgba(157,124,255,0.16))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: 'var(--rose)', flexShrink: 0, marginTop: 10,
                  fontFamily: 'var(--font-body)',
                }}>{i + 1}</span>
                <textarea className="input-field" placeholder={`Step ${i + 1}…`} value={step.text}
                  onChange={e => updateStep(step.id, e.target.value)} rows={2} style={{ flex: 1 }} />
                {form.method.length > 1 && (
                  <button onClick={() => removeStep(step.id)} style={{ color: 'var(--light-warm)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0, marginTop: 10 }}>
                    <TrashIcon />
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.method && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#e05a3a', fontFamily: 'var(--font-body)' }}>{errors.method}</p>}
          <button onClick={addStep} style={{
            marginTop: 10, padding: '10px', borderRadius: 12, border: '1.5px dashed rgba(143,166,139,0.4)',
            background: 'rgba(138,167,255,0.08)', color: 'var(--sage)', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 13, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <PlusIcon /> Add Step
          </button>
        </div>

        {/* Tips */}
        <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.16s' }}>
          <div className="section-label">💡 Baker's Tips (optional)</div>
          <textarea className="input-field" placeholder="Any tips for getting this recipe perfect…" value={form.tips}
            onChange={e => update('tips', e.target.value)} rows={3} />
        </div>

        {/* Notes */}
        <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.18s' }}>
          <div className="section-label">📝 My Notes (optional)</div>
          <textarea className="input-field" placeholder="Personal tweaks, tasting notes, variations…" value={form.notes}
            onChange={e => update('notes', e.target.value)} rows={3} />
        </div>

        {/* Save button */}
        <div className="animate-fade-up" style={{ opacity: 0, animationDelay: '0.2s' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%', padding: '16px', borderRadius: 16, border: 'none',
              background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
              color: 'white', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 16,
              cursor: 'pointer', boxShadow: '0 14px 28px rgba(142,106,232,0.24)',
              opacity: saving ? 0.7 : 1, transition: 'opacity 0.2s, transform 0.1s',
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {saving ? 'Saving…' : isEditing ? 'Save Changes' : '✨ Save Recipe'}
          </button>
        </div>
      </div>
    </div>
  )
}
