const SKIP_META_LABELS = /(temp|temperature|time|proof|bake|oven|tray|pan|tin)/i

function decimalPlaces(value) {
  const text = String(value)
  if (!text.includes('.')) return 0
  return text.split('.')[1].length
}

function formatScaledNumber(rawValue, factor) {
  const value = Number(rawValue)
  if (!Number.isFinite(value)) return rawValue

  const scaled = value * factor
  const precision = Math.min(3, Math.max(decimalPlaces(rawValue), decimalPlaces(factor)))
  const normalized = scaled.toFixed(precision).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')
  return normalized
}

function scaleNumericText(text, factor) {
  if (!text || factor === 1) return text

  return String(text).replace(/\d+(?:\.\d+)?/g, (match, offset, source) => {
    const nextSlice = source.slice(offset, offset + 14).toLowerCase()
    const prevSlice = source.slice(Math.max(0, offset - 6), offset).toLowerCase()

    if (
      nextSlice.includes('min') ||
      nextSlice.includes('hour') ||
      nextSlice.includes('hrs') ||
      nextSlice.includes('sec') ||
      nextSlice.includes('deg') ||
      nextSlice.includes('°') ||
      nextSlice.includes('%') ||
      nextSlice.includes('inch') ||
      nextSlice.includes('cm') ||
      nextSlice.includes('mm') ||
      prevSlice.includes('@')
    ) {
      return match
    }

    return formatScaledNumber(match, factor)
  })
}

export function scaleRecipe(recipe, factor) {
  const safeFactor = Number(factor)
  if (!recipe || !Number.isFinite(safeFactor) || safeFactor <= 0 || safeFactor === 1) {
    return recipe
  }

  return {
    ...recipe,
    meta: (recipe.meta || []).map((item) => ({
      ...item,
      value: SKIP_META_LABELS.test(item.label || '')
        ? item.value
        : scaleNumericText(item.value, safeFactor),
    })),
    ingredients: (recipe.ingredients || []).map((ingredient) => ({
      ...ingredient,
      amount: scaleNumericText(ingredient.amount, safeFactor),
    })),
    ingredientNote: scaleNumericText(recipe.ingredientNote, safeFactor),
    method: (recipe.method || []).map((step) => scaleNumericText(step, safeFactor)),
    tips: Array.isArray(recipe.tips)
      ? recipe.tips.map((tip) => scaleNumericText(tip, safeFactor))
      : scaleNumericText(recipe.tips, safeFactor),
    notes: scaleNumericText(recipe.notes, safeFactor),
  }
}
