import { useState } from 'react'

export default function AiDiffView({
  action,
  result,
  recipe,
  selectedAdditions,
  onToggleAddition,
  copyToastMessage,
  onCopyText,
}) {
  if (!result) return null

  switch (action) {
    case 'fixFormatting':
    case 'polishMethod':
      return <MethodDiffView action={action} result={result} originalMethod={recipe.method || []} />

    case 'extractIngredients':
      return (
        <ExtractIngredientsDiffView
          result={result}
          existingIngredients={recipe.ingredients || []}
          selectedAdditions={selectedAdditions}
          onToggleAddition={onToggleAddition}
        />
      )

    case 'missingDetails':
      return (
        <MissingDetailsDiffView
          result={result}
          selectedAdditions={selectedAdditions}
          onToggleAddition={onToggleAddition}
        />
      )

    case 'scaleRecipe':
      return <ScaleRecipeDiffView result={result} recipe={recipe} />

    case 'shoppingList':
      return (
        <ShoppingListDiffView
          result={result}
          recipeName={recipe.name}
          onCopyText={onCopyText}
          copyToastMessage={copyToastMessage}
        />
      )

    default:
      return null
  }
}

function MethodDiffView({ action, result, originalMethod }) {
  const newSteps = result.method || []
  const summary = result.summary || ''
  const isPolished = action === 'polishMethod'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {summary && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(255,224,245,0.7), rgba(220,227,255,0.7))',
            border: '1px solid rgba(255,255,255,0.8)',
            fontSize: 13,
            color: 'var(--charcoal)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.4,
          }}
        >
          <strong style={{ color: 'var(--rose)' }}>Summary:</strong> {summary}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--warm-gray)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Original ({originalMethod.length} steps)
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--rose)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {isPolished ? 'Polished' : 'Formatted'} ({newSteps.length} steps)
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {newSteps.map((step, index) => {
          const original = originalMethod[index] || ''
          const isChanged = original.trim() !== step.trim()

          return (
            <div
              key={index}
              style={{
                borderRadius: 16,
                background: isChanged ? 'rgba(255, 255, 255, 0.72)' : 'rgba(255, 255, 255, 0.45)',
                border: isChanged ? '1px solid rgba(244, 114, 208, 0.35)' : '1px solid rgba(255, 255, 255, 0.6)',
                padding: '12px 14px',
                boxShadow: isChanged ? '0 6px 18px rgba(142, 106, 232, 0.1)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: isChanged ? 'var(--rose)' : 'rgba(151, 145, 190, 0.2)',
                    color: isChanged ? 'white' : 'var(--charcoal)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {index + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.55, color: 'var(--charcoal)' }}>
                    {step}
                  </p>
                  {isChanged && original && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed rgba(151, 145, 190, 0.3)' }}>
                      <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--warm-gray)', textDecoration: 'line-through' }}>
                        {original}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ExtractIngredientsDiffView({ result, existingIngredients, selectedAdditions, onToggleAddition }) {
  const missing = result.missingIngredients || []
  const found = result.existingIngredientsFound || []
  const uncertain = result.uncertainIngredients || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', fontFamily: 'var(--font-body)' }}>
          Missing Ingredients Found in Method ({missing.length})
        </p>
        <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--warm-gray)', fontFamily: 'var(--font-body)' }}>
          Select the items you would like to automatically add to your recipe:
        </p>

        {missing.length === 0 ? (
          <div style={{ padding: '16px', borderRadius: 14, background: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--warm-gray)', fontFamily: 'var(--font-body)' }}>
              ✨ Great job! All ingredients mentioned in the method are already in your ingredient list.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {missing.map((item, index) => {
              const isChecked = selectedAdditions[`missing-${index}`] !== false
              return (
                <label
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 14,
                    background: isChecked ? 'rgba(244, 114, 208, 0.08)' : 'rgba(255, 255, 255, 0.45)',
                    border: isChecked ? '1px solid rgba(244, 114, 208, 0.3)' : '1px solid rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleAddition(`missing-${index}`)}
                    style={{ width: 18, height: 18, accentColor: 'var(--rose)', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--charcoal)' }}>
                      {item.name}
                    </span>
                    {item.amount && (
                      <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--rose)', fontWeight: 500 }}>
                        ({item.amount})
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'rgba(244, 114, 208, 0.16)', color: 'var(--rose)', fontWeight: 600 }}>
                    Add
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {found.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(151, 145, 190, 0.2)', paddingTop: 14 }}>
          <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: 'var(--warm-gray)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Already Present in Ingredient List ({found.length})
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {found.map((name, index) => (
              <span
                key={index}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  borderRadius: 12,
                  background: 'rgba(151, 145, 190, 0.14)',
                  fontSize: 12,
                  color: 'var(--warm-gray)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                ✓ {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {uncertain.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(151, 145, 190, 0.2)', paddingTop: 14 }}>
          <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: 'var(--warm-gray)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Uncertain Mentions
          </p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--light-warm)', fontStyle: 'italic', fontFamily: 'var(--font-body)' }}>
            Method references: {uncertain.join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}

function MissingDetailsDiffView({ result, selectedAdditions, onToggleAddition }) {
  const warnings = result.warnings || []
  const fixes = result.suggestedFixes || {}
  const fixMeta = fixes.meta || []
  const fixIngredients = fixes.ingredients || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', fontFamily: 'var(--font-body)' }}>
          Audit Warnings ({warnings.length})
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {warnings.map((w, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '12px 14px',
                borderRadius: 14,
                background: 'rgba(255, 237, 219, 0.65)',
                border: '1px solid rgba(240, 160, 80, 0.35)',
              }}
            >
              <span style={{ fontSize: 16 }}>⚠️</span>
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 13, color: '#8a4b08', lineHeight: 1.45 }}>
                {w.message}
              </p>
            </div>
          ))}
        </div>
      </div>

      {(fixMeta.length > 0 || fixIngredients.length > 0) && (
        <div style={{ borderTop: '1px solid rgba(151, 145, 190, 0.2)', paddingTop: 14 }}>
          <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', fontFamily: 'var(--font-body)' }}>
            Suggested Fixes to Apply
          </p>
          <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--warm-gray)', fontFamily: 'var(--font-body)' }}>
            Check the suggested details you want to add:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {fixMeta.map((meta, index) => {
              const key = `meta-${index}`
              const isChecked = selectedAdditions[key] !== false
              return (
                <label
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: isChecked ? 'rgba(180, 149, 255, 0.12)' : 'rgba(255,255,255,0.4)',
                    border: isChecked ? '1px solid rgba(180, 149, 255, 0.35)' : '1px solid rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleAddition(key)}
                    style={{ width: 17, height: 17, accentColor: 'var(--rose)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--light-warm)', fontWeight: 600 }}>
                      Add Detail: {meta.label}
                    </span>
                    <p style={{ margin: '1px 0 0', fontSize: 13.5, fontWeight: 600, color: 'var(--charcoal)' }}>
                      {meta.value}
                    </p>
                  </div>
                </label>
              )
            })}

            {fixIngredients.map((ing, index) => {
              const key = `ing-${index}`
              const isChecked = selectedAdditions[key] !== false
              return (
                <label
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: isChecked ? 'rgba(244, 114, 208, 0.12)' : 'rgba(255,255,255,0.4)',
                    border: isChecked ? '1px solid rgba(244, 114, 208, 0.35)' : '1px solid rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleAddition(key)}
                    style={{ width: 17, height: 17, accentColor: 'var(--rose)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--light-warm)', fontWeight: 600 }}>
                      Add Ingredient: {ing.name}
                    </span>
                    {ing.amount && (
                      <p style={{ margin: '1px 0 0', fontSize: 13, fontWeight: 600, color: 'var(--charcoal)' }}>
                        {ing.amount}
                      </p>
                    )}
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function ScaleRecipeDiffView({ result, recipe }) {
  const advice = result.advice || []
  const summary = result.summary || ''
  const adjustedBakeTime = result.adjustedBakeTime || ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {summary && (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(220,227,255,0.7), rgba(255,224,245,0.7))',
            border: '1px solid rgba(255,255,255,0.8)',
            fontSize: 13,
            color: 'var(--charcoal)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.45,
          }}
        >
          <strong style={{ color: 'var(--sage)' }}>Scaling Insight:</strong> {summary}
        </div>
      )}

      {adjustedBakeTime && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.8)',
          }}
        >
          <p style={{ margin: '0 0 2px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--light-warm)', fontWeight: 600 }}>
            Estimated Baking Time
          </p>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--charcoal)' }}>
            ⏱️ {adjustedBakeTime}
          </p>
        </div>
      )}

      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', fontFamily: 'var(--font-body)' }}>
          Baker&apos;s Advice & Pan Adjustments
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {advice.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                padding: '10px 12px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.7)',
              }}
            >
              <span style={{ fontSize: 14, color: 'var(--rose)', marginTop: 1 }}>💡</span>
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--charcoal)', lineHeight: 1.5 }}>
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ShoppingListDiffView({ result, recipeName, onCopyText, copyToastMessage }) {
  const categories = result.categories || []

  const buildFormattedText = () => {
    let text = `🛒 Shopping List for ${recipeName}:\n\n`
    categories.forEach((cat) => {
      text += `*${cat.name}*\n`
      cat.items.forEach((item) => {
        text += `• ${item.name} - ${item.amount}\n`
      })
      text += '\n'
    })
    return text.trim()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button
          onClick={() => onCopyText(buildFormattedText())}
          style={{
            padding: '8px 14px',
            borderRadius: 12,
            border: '1px solid rgba(244, 114, 208, 0.35)',
            background: 'linear-gradient(135deg, rgba(255,218,241,0.8), rgba(219,225,255,0.8))',
            color: 'var(--rose)',
            fontFamily: 'var(--font-body)',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>📋</span> {copyToastMessage || 'Copy for WhatsApp'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {categories.map((cat, catIndex) => (
          <div
            key={catIndex}
            style={{
              padding: '12px 14px',
              borderRadius: 16,
              background: 'rgba(255, 255, 255, 0.58)',
              border: '1px solid rgba(255, 255, 255, 0.75)',
            }}
          >
            <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--rose)' }}>
              {cat.name}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {cat.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 13.5,
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <span style={{ color: 'var(--charcoal)', fontWeight: 500 }}>{item.name}</span>
                  <span style={{ color: 'var(--warm-gray)', fontWeight: 600 }}>{item.amount}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

