import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  LevelFormat,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'
import { saveAs } from 'file-saver'

const EXPORT_PAGE = {
  width: 816,
  height: 1056,
  background: '#F6F4FF',
  surface: '#FFFFFF',
  surfaceSoft: '#F5F1FF',
  shell: '#E7DEFF',
  primary: '#F472D0',
  secondary: '#A97FFF',
  text: '#201B38',
  muted: '#6A658D',
  bodyFont: "-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',sans-serif",
  displayFont: "'SF Pro Display','Aptos','Segoe UI',sans-serif",
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function splitEmoji(text) {
  const value = String(text ?? '')
  const emojiRe = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu
  const segments = []
  let lastIndex = 0
  let match

  while ((match = emojiRe.exec(value)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: value.slice(lastIndex, match.index), isEmoji: false })
    }

    segments.push({ text: match[0], isEmoji: true })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < value.length) {
    segments.push({ text: value.slice(lastIndex), isEmoji: false })
  }

  return segments.length ? segments : [{ text: value, isEmoji: false }]
}

function emojiRuns(text, baseProps = {}) {
  return splitEmoji(text).map((segment) => new TextRun({
    ...baseProps,
    text: segment.text,
    font: segment.isEmoji ? 'Segoe UI Emoji' : (baseProps.font || 'Aptos'),
  }))
}

function sectionHeading(label) {
  return new Paragraph({
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'C9B4FF', space: 0 },
    },
    spacing: { before: 180, after: 80 },
    children: [new TextRun({ text: label, bold: true, size: 24, color: 'B15CDB', font: 'Aptos Display' })],
  })
}

function recipeMeta(recipe) {
  return (recipe.meta || []).filter((item) => item?.label || item?.value)
}

function recipeTips(recipe) {
  return Array.isArray(recipe.tips) ? recipe.tips.filter(Boolean) : (recipe.tips ? [recipe.tips] : [])
}

function createMetaGrid(recipe) {
  const items = recipeMeta(recipe)
  if (!items.length) return ''

  return `
    <div style="display:grid;grid-template-columns:repeat(${Math.min(4, items.length)},1fr);gap:10px;margin-bottom:22px;">
      ${items.map((item) => `
        <div style="background:rgba(255,255,255,0.74);padding:12px;text-align:center;border-radius:18px;border:1px solid rgba(231,222,255,0.95);box-shadow:0 12px 24px rgba(122,100,201,0.08);">
          <div style="font-size:11px;color:${EXPORT_PAGE.muted};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">${escapeHtml(item.label)}</div>
          <div style="font-size:15px;font-weight:700;color:${EXPORT_PAGE.text};">${escapeHtml(item.value)}</div>
        </div>
      `).join('')}
    </div>
  `
}

function createSectionHTML(title, body) {
  return `
    <section style="margin-top:28px;">
      <div style="border-bottom:1px solid rgba(169,127,255,0.32);padding-bottom:8px;margin-bottom:12px;">
        <span style="font-size:17px;font-weight:700;color:${EXPORT_PAGE.primary};font-family:${EXPORT_PAGE.displayFont};letter-spacing:0.01em;">${escapeHtml(title)}</span>
      </div>
      ${body}
    </section>
  `
}

function createIngredientsHTML(recipe) {
  return createSectionHTML('Ingredients', `
    <ul style="margin:0;padding-left:22px;">
      ${(recipe.ingredients || []).map((ingredient) => `
        <li style="font-size:13px;line-height:1.7;color:${EXPORT_PAGE.text};margin-bottom:8px;">
          <strong>${escapeHtml(ingredient.name)}</strong>
          <span style="color:${EXPORT_PAGE.muted};"> - </span>
          ${escapeHtml(ingredient.amount)}
        </li>
      `).join('')}
    </ul>
    ${recipe.ingredientNote ? `
      <p style="font-size:12px;line-height:1.7;color:${EXPORT_PAGE.muted};margin:14px 0 0;">
        <strong style="color:${EXPORT_PAGE.primary};">Note:</strong> ${escapeHtml(recipe.ingredientNote)}
      </p>
    ` : ''}
  `)
}

function createMethodHTML(recipe) {
  return createSectionHTML('Method', `
    <ol style="margin:0;padding-left:24px;">
      ${(recipe.method || []).map((step) => `
        <li style="font-size:13px;line-height:1.72;color:${EXPORT_PAGE.text};margin-bottom:10px;">${escapeHtml(step)}</li>
      `).join('')}
    </ol>
  `)
}

function createTipsHTML(recipe) {
  const tips = recipeTips(recipe)
  if (!tips.length) return ''

  return `
    <div style="border:1px solid rgba(169,127,255,0.18);border-left:5px solid ${EXPORT_PAGE.secondary};background:linear-gradient(135deg, rgba(255,232,245,0.96), rgba(233,238,255,0.9));padding:16px 18px;border-radius:18px;margin-top:28px;">
      <div style="font-size:14px;font-weight:700;color:${EXPORT_PAGE.secondary};margin-bottom:10px;font-family:${EXPORT_PAGE.displayFont};">Baker's Tips</div>
      <ul style="margin:0;padding-left:18px;">
        ${tips.map((tip) => `<li style="font-size:13px;line-height:1.68;color:${EXPORT_PAGE.text};margin-bottom:7px;">${escapeHtml(tip)}</li>`).join('')}
      </ul>
    </div>
  `
}

function createNotesHTML(recipe) {
  return `
    <div style="border:1px solid rgba(169,127,255,0.16);background:${EXPORT_PAGE.surfaceSoft};padding:16px 18px;border-radius:18px;margin-top:28px;">
      <div style="font-size:14px;font-weight:700;color:${EXPORT_PAGE.secondary};margin-bottom:10px;font-family:${EXPORT_PAGE.displayFont};">My Notes</div>
      <div style="font-size:13px;line-height:1.72;color:${recipe.notes ? EXPORT_PAGE.text : EXPORT_PAGE.muted};font-style:${recipe.notes ? 'normal' : 'italic'};">
        ${escapeHtml(recipe.notes || 'Write your tips, tweaks, and tasting notes here...')}
      </div>
    </div>
  `
}

function buildRecipeHTML(recipe) {
  return `
    <div style="width:${EXPORT_PAGE.width}px;min-height:${EXPORT_PAGE.height}px;background:linear-gradient(180deg, #fbf9ff 0%, ${EXPORT_PAGE.background} 100%);font-family:${EXPORT_PAGE.bodyFont};color:${EXPORT_PAGE.text};display:flex;flex-direction:column;box-sizing:border-box;">
      <div style="padding:24px 28px 0;">
        <div style="background:linear-gradient(135deg, rgba(255,233,246,0.96), rgba(221,228,255,0.94));border:1px solid rgba(255,255,255,0.86);border-radius:28px;box-shadow:0 20px 44px rgba(124,102,202,0.12);padding:24px 28px 22px;text-align:center;">
          <div style="font-size:40px;line-height:1;margin-bottom:10px;">${escapeHtml(recipe.emoji || '🍴')}</div>
          <div style="font-size:30px;font-weight:700;color:${EXPORT_PAGE.text};font-family:${EXPORT_PAGE.displayFont};letter-spacing:-0.02em;">${escapeHtml(recipe.name || 'Recipe')}</div>
        </div>
      </div>

      <div style="padding:24px 28px 22px;display:flex;flex:1;flex-direction:column;">
        <div style="flex:1;">
          ${createMetaGrid(recipe)}
          ${createIngredientsHTML(recipe)}
          ${createMethodHTML(recipe)}
          ${createTipsHTML(recipe)}
          ${createNotesHTML(recipe)}
        </div>

        <div style="border-top:1px solid rgba(169,127,255,0.18);margin-top:28px;padding-top:12px;text-align:center;font-size:11px;color:${EXPORT_PAGE.muted};">
          Made with love by Kaur's Cakery
        </div>
      </div>
    </div>
  `
}

function buildCoverHTML(recipeCount) {
  return `
    <div style="width:${EXPORT_PAGE.width}px;height:${EXPORT_PAGE.height}px;background:linear-gradient(180deg, #fbf9ff 0%, ${EXPORT_PAGE.background} 100%);font-family:${EXPORT_PAGE.bodyFont};display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;padding:48px;box-sizing:border-box;">
      <div style="position:absolute;inset:28px;background:linear-gradient(135deg, rgba(255,234,246,0.88), rgba(221,227,255,0.82));border-radius:36px;border:1px solid rgba(255,255,255,0.8);box-shadow:0 26px 60px rgba(117,91,198,0.12);"></div>
      <div style="position:relative;font-size:54px;font-weight:700;color:${EXPORT_PAGE.text};font-family:${EXPORT_PAGE.displayFont};letter-spacing:-0.03em;text-align:center;">KAUR'S CAKERY</div>
      <div style="position:relative;width:96px;height:3px;background:${EXPORT_PAGE.secondary};border-radius:999px;margin:18px 0 14px;"></div>
      <div style="position:relative;font-size:26px;font-weight:700;color:${EXPORT_PAGE.muted};font-family:${EXPORT_PAGE.displayFont};text-align:center;">RECIPE COLLECTION</div>
      <div style="position:relative;font-size:16px;color:${EXPORT_PAGE.muted};font-style:italic;margin-top:10px;">${recipeCount} recipes from your kitchen</div>
      <div style="position:relative;font-size:13px;color:${EXPORT_PAGE.muted};margin-top:24px;">Crafted with love, baked with passion</div>
    </div>
  `
}

async function renderHtmlToCanvas(html) {
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-99999px;top:0;z-index:-1;pointer-events:none;'
  container.innerHTML = html
  document.body.appendChild(container)

  try {
    return await html2canvas(container.firstElementChild, {
      scale: 1.35,
      useCORS: true,
      backgroundColor: EXPORT_PAGE.background,
      logging: false,
    })
  } finally {
    document.body.removeChild(container)
  }
}

function fillPdfBackground(doc) {
  doc.setFillColor(246, 244, 255)
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F')
}

function drawCanvasOnPdfPage(doc, canvas) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const imageData = canvas.toDataURL('image/jpeg', 0.74)
  const canvasRatio = canvas.height / canvas.width
  const pageRatio = pageHeight / pageWidth

  fillPdfBackground(doc)

  if (canvasRatio <= pageRatio) {
    const imageHeight = pageWidth * canvasRatio
    const offsetY = (pageHeight - imageHeight) / 2
    doc.addImage(imageData, 'JPEG', 0, offsetY, pageWidth, imageHeight, undefined, 'FAST')
    return
  }

  const imageWidth = pageHeight / canvasRatio
  const offsetX = (pageWidth - imageWidth) / 2
  doc.addImage(imageData, 'JPEG', offsetX, 0, imageWidth, pageHeight, undefined, 'FAST')
}

async function appendRecipePage(doc, recipe, isFirstPage) {
  if (!isFirstPage) doc.addPage()
  const canvas = await renderHtmlToCanvas(buildRecipeHTML(recipe))
  drawCanvasOnPdfPage(doc, canvas)
}

async function appendCoverPage(doc, recipeCount) {
  const canvas = await renderHtmlToCanvas(buildCoverHTML(recipeCount))
  drawCanvasOnPdfPage(doc, canvas)
}

export async function exportToPDF(recipes) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter', compress: true })
  await appendCoverPage(doc, recipes.length)

  for (const recipe of recipes) {
    await appendRecipePage(doc, recipe, false)
  }

  doc.save(`Kaurs_Cakery_Recipes_${new Date().toISOString().slice(0, 10)}.pdf`)
}

export async function exportSinglePDF(recipe) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter', compress: true })
  await appendRecipePage(doc, recipe, true)
  doc.save(`${(recipe.name || 'recipe').replace(/\s+/g, '_')}.pdf`)
}

function createMetaTable(recipe) {
  const items = recipeMeta(recipe)
  if (!items.length) return null

  const columnWidth = Math.floor(9360 / items.length)
  const hiddenBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: items.map(() => columnWidth),
    rows: [
      new TableRow({
        children: items.map((item) => new TableCell({
          borders: { top: hiddenBorder, bottom: hiddenBorder, left: hiddenBorder, right: hiddenBorder },
          width: { size: columnWidth, type: WidthType.DXA },
          shading: { fill: 'F5F1FF', type: ShadingType.CLEAR },
          margins: { top: 90, bottom: 90, left: 140, right: 140 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: item.label, size: 16, color: '6A658D', font: 'Aptos' })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: item.value, bold: true, color: '201B38', font: 'Aptos' })],
            }),
          ],
        })),
      }),
    ],
  })
}

function recipeToDocxElements(recipe) {
  const elements = []
  const tips = recipeTips(recipe)

  elements.push(
    new Paragraph({
      shading: { fill: 'ECDFFF', type: ShadingType.CLEAR },
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 0 },
      children: emojiRuns(recipe.emoji || '🍴', { size: 44 }),
    }),
    new Paragraph({
      shading: { fill: 'ECDFFF', type: ShadingType.CLEAR },
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: emojiRuns(recipe.name || 'Recipe', { bold: true, size: 40, color: '201B38', font: 'Aptos Display' }),
    }),
    new Paragraph({
      shading: { fill: 'ECDFFF', type: ShadingType.CLEAR },
      spacing: { before: 0, after: 0 },
      children: [],
    }),
    new Paragraph({ spacing: { before: 100, after: 0 }, children: [] }),
  )

  const metaTable = createMetaTable(recipe)
  if (metaTable) {
    elements.push(metaTable, new Paragraph({ spacing: { before: 90, after: 0 }, children: [] }))
  }

  elements.push(sectionHeading('Ingredients'))
  ;(recipe.ingredients || []).forEach((ingredient) => {
    elements.push(new Paragraph({
      numbering: { reference: 'bullets', level: 0 },
      spacing: { before: 30, after: 24 },
      children: [
        new TextRun({ text: ingredient.name, bold: true, color: '201B38', font: 'Aptos' }),
        new TextRun({ text: ' - ', color: '6A658D', font: 'Aptos' }),
        new TextRun({ text: ingredient.amount, color: '201B38', font: 'Aptos' }),
      ],
    }))
  })

  if (recipe.ingredientNote) {
    elements.push(new Paragraph({
      spacing: { before: 60, after: 40 },
      children: [
        new TextRun({ text: 'Note: ', bold: true, color: 'B15CDB', font: 'Aptos' }),
        new TextRun({ text: recipe.ingredientNote, italics: true, color: '201B38', font: 'Aptos' }),
      ],
    }))
  }

  elements.push(sectionHeading('Method'))
  ;(recipe.method || []).forEach((step) => {
    elements.push(new Paragraph({
      numbering: { reference: 'numbers', level: 0 },
      spacing: { before: 30, after: 30 },
      children: [new TextRun({ text: step, color: '201B38', font: 'Aptos' })],
    }))
  })

  if (tips.length) {
    elements.push(
      new Paragraph({ spacing: { before: 120, after: 0 }, children: [] }),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 2, color: 'C9B4FF' },
                  left: { style: BorderStyle.THICK, size: 8, color: 'A97FFF' },
                  bottom: { style: BorderStyle.SINGLE, size: 2, color: 'C9B4FF' },
                  right: { style: BorderStyle.SINGLE, size: 2, color: 'C9B4FF' },
                },
                width: { size: 9360, type: WidthType.DXA },
                shading: { fill: 'FFF1FA', type: ShadingType.CLEAR },
                margins: { top: 90, bottom: 90, left: 200, right: 200 },
                children: [
                  new Paragraph({
                    spacing: { before: 0, after: 60 },
                    children: [new TextRun({ text: "Baker's Tips", bold: true, color: '8E68FF', font: 'Aptos Display' })],
                  }),
                  ...tips.map((tip) => new Paragraph({
                    numbering: { reference: 'tips-bullets', level: 0 },
                    spacing: { before: 20, after: 20 },
                    children: [new TextRun({ text: tip, color: '201B38', font: 'Aptos' })],
                  })),
                ],
              }),
            ],
          }),
        ],
      }),
    )
  }

  elements.push(
    new Paragraph({ spacing: { before: 90, after: 0 }, children: [] }),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [9360],
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: {
                top: { style: BorderStyle.SINGLE, size: 2, color: 'C9B4FF' },
                left: { style: BorderStyle.SINGLE, size: 2, color: 'C9B4FF' },
                bottom: { style: BorderStyle.SINGLE, size: 2, color: 'C9B4FF' },
                right: { style: BorderStyle.SINGLE, size: 2, color: 'C9B4FF' },
              },
              width: { size: 9360, type: WidthType.DXA },
              shading: { fill: 'F5F1FF', type: ShadingType.CLEAR },
              margins: { top: 90, bottom: 90, left: 200, right: 200 },
              children: [
                new Paragraph({
                  spacing: { before: 0, after: 40 },
                  children: [new TextRun({ text: 'My Notes', bold: true, size: 22, color: '8E68FF', font: 'Aptos Display' })],
                }),
                new Paragraph({
                  spacing: { after: 120 },
                  children: [new TextRun({
                    text: recipe.notes || 'Write your tips, tweaks, and tasting notes here...',
                    italics: !recipe.notes,
                    color: recipe.notes ? '201B38' : '6A658D',
                    font: 'Aptos',
                  })],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  )

  return elements
}

const NUMBERING_CONFIG = {
  config: [
    {
      reference: 'bullets',
      levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 180 } } } }],
    },
    {
      reference: 'numbers',
      levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 420, hanging: 240 } } } }],
    },
    {
      reference: 'tips-bullets',
      levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 180 } } } }],
    },
  ],
}

const PAGE_PROPS = {
  size: { width: 12240, height: 15840 },
  margin: { top: 900, right: 1080, bottom: 900, left: 1080 },
}

function makeFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 2, color: 'DED4FF', space: 0 } },
        spacing: { before: 60 },
        children: [
          new TextRun({ text: "Made with love by Kaur's Cakery  •  Page ", size: 16, color: '6A658D', font: 'Aptos' }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '6A658D', font: 'Aptos' }),
        ],
      }),
    ],
  })
}

function buildCoverElements(recipes) {
  const previewNames = recipes.slice(0, 5).map((recipe) => recipe.name).join('  |  ')

  return [
    new Paragraph({ spacing: { before: 1440, after: 400 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: "KAUR'S CAKERY", bold: true, size: 72, color: 'B15CDB', font: 'Aptos Display' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: 'RECIPE COLLECTION', bold: true, size: 44, color: '201B38', font: 'Aptos Display' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: `${recipes.length} recipes from your kitchen`, italics: true, size: 28, color: '6A658D', font: 'Aptos' })],
    }),
    new Paragraph({ spacing: { before: 300 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: previewNames, color: '6A658D', font: 'Aptos' })],
    }),
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 3, color: 'D7CBFF', space: 0 } },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: ' ' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120 },
      children: [new TextRun({ text: 'Crafted with love, baked with passion', italics: true, size: 22, color: '6A658D', font: 'Aptos' })],
    }),
  ]
}

export async function exportToDocx(recipes) {
  const children = [...buildCoverElements(recipes), new Paragraph({ children: [new PageBreak()] })]

  recipes.forEach((recipe, index) => {
    children.push(...recipeToDocxElements(recipe))
    if (index < recipes.length - 1) children.push(new Paragraph({ children: [new PageBreak()] }))
  })

  const doc = new Document({
    numbering: NUMBERING_CONFIG,
    sections: [{ properties: { page: PAGE_PROPS }, footers: { default: makeFooter() }, children }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `Kaurs_Cakery_Recipes_${new Date().toISOString().slice(0, 10)}.docx`)
}

export async function exportSingleDocx(recipe) {
  const doc = new Document({
    numbering: NUMBERING_CONFIG,
    sections: [{ properties: { page: PAGE_PROPS }, footers: { default: makeFooter() }, children: recipeToDocxElements(recipe) }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${(recipe.name || 'recipe').replace(/\s+/g, '_')}.docx`)
}
