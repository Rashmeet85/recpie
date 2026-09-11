const ABBREVIATIONS = [
  'tsp',
  'tbsp',
  'approx',
  'gm',
  'gms',
  'oz',
  'lb',
  'lbs',
  'ml',
  'l',
  'cm',
  'mm',
  'no',
  'nos',
  'e.g',
  'i.e',
  'etc',
]

const DOT_PLACEHOLDER = '<DOT>'

function protectInnerDots(text) {
  let protectedText = text.replace(/(\d)\.(\d)/g, `$1${DOT_PLACEHOLDER}$2`)

  ABBREVIATIONS.forEach((abbr) => {
    const escaped = abbr.replace(/\./g, '\\.')
    const pattern = new RegExp(`\\b${escaped}\\.\\s+(?=[a-z])`, 'gi')
    protectedText = protectedText.replace(pattern, (match) => match.replace('.', DOT_PLACEHOLDER))
  })

  return protectedText
}

function restoreInnerDots(text) {
  return text.replaceAll(DOT_PLACEHOLDER, '.')
}

function normalizeStepText(text) {
  return restoreInnerDots(text)
    .replace(/\s+/g, ' ')
    .replace(/^(?:[-*]\s+|\d+[.)]\s*)/, '')
    .trim()
}

function splitWithIntlSegmenter(text) {
  if (typeof Intl === 'undefined' || typeof Intl.Segmenter !== 'function') {
    return null
  }

  const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' })
  return Array.from(segmenter.segment(text), (item) => item.segment)
}

function splitWithFallback(text) {
  return text.split(/(?<=[.!?])\s+/)
}

function splitBlockIntoSteps(block) {
  const protectedBlock = protectInnerDots(block)
  const lineBlocks = protectedBlock
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)

  return lineBlocks.flatMap((line) => {
    const segments = splitWithIntlSegmenter(line) || splitWithFallback(line)
    return segments.map(normalizeStepText).filter(Boolean)
  })
}

export function normalizeMethodSteps(method) {
  return method
    .map((step) => (typeof step === 'string' ? step : step?.text || ''))
    .map((step) => step.trim())
    .filter(Boolean)
    .flatMap(splitBlockIntoSteps)
}
