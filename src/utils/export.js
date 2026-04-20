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
  background: '#F9F3EE',
  rose: '#E8536A',
  gold: '#D4A843',
  dark: '#2C1810',
  grey: '#6B5B52',
  cream: '#FDF6EC',
  offwhite: '#FAFAFA',
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
    font: segment.isEmoji ? 'Segoe UI Emoji' : (baseProps.font || 'Arial'),
  }))
}

function createSectionHTML(title, body) {
  return `
    <div style="margin-top:24px;">
      <div style="border-bottom:2px solid ${EXPORT_PAGE.gold};padding-bottom:6px;margin-bottom:10px;">
        <span style="font-size:18px;font-weight:700;color:${EXPORT_PAGE.rose};font-family:Georgia,serif;">
          ${escapeHtml(title)}
        </span>
      </div>
      ${body}
    </div>
  `
}

function createMetaGrid(recipe) {
  const metaItems = recipe.meta?.filter((item) => item?.label || item?.value) || []
  if (!metaItems.length) return ''

  return `
    <div style="display:grid;grid-template-columns:repeat(${Math.min(4, metaItems.length)},1fr);gap:8px;margin-bottom:20px;">
      ${metaItems.map((item) => `
        <div style="background:${EXPORT_PAGE.cream};padding:10px 12px;text-align:center;border-radius:8px;border:1px solid rgba(212,168,67,0.18);">
          <div style="font-size:11px;color:${EXPORT_PAGE.grey};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">
            ${escapeHtml(item.label)}
          </div>
          <div style="font-size:15px;font-weight:700;color:${EXPORT_PAGE.rose};">
            ${escapeHtml(item.value)}
          </div>
        </div>
      `).join('')}
    </div>
  `
}

function createIngredientsHTML(recipe) {
  const items = recipe.ingredients || []
  const note = recipe.ingredientNote

  return createSectionHTML('Ingredients', `
    <ul style="margin:0;padding-left:22px;">
      ${items.map((ingredient) => `
        <li style="font-size:13px;line-height:1.55;color:${EXPORT_PAGE.dark};margin-bottom:7px;">
          <strong>${escapeHtml(ingredient.name)}</strong>
          <span style="color:${EXPORT_PAGE.grey};"> - </span>
          ${escapeHtml(ingredient.amount)}
        </li>
      `).join('')}
    </ul>
    ${note ? `
      <p style="font-size:12px;line-height:1.6;color:${EXPORT_PAGE.grey};margin:12px 0 0;">
        <strong style="color:${EXPORT_PAGE.rose};">Note:</strong> ${escapeHtml(note)}
      </p>
    ` : ''}
  `)
}

function createMethodHTML(recipe) {
  const steps = recipe.method || []

  return createSectionHTML('Method', `
    <ol style="margin:0;padding-left:24px;">
      ${steps.map((step) => `
        <li style="font-size:13px;line-height:1.6;color:${EXPORT_PAGE.dark};margin-bottom:8px;">
          ${escapeHtml(step)}
        </li>
      `).join('')}
    </ol>
  `)
}

function createTipsHTML(recipe) {
  const tipItems = Array.isArray(recipe.tips)
    ? recipe.tips.filter(Boolean)
    : (recipe.tips ? [recipe.tips] : [])

  if (!tipItems.length) return ''

  return `
    <div style="border:1px solid ${EXPORT_PAGE.gold};border-left:5px solid ${EXPORT_PAGE.gold};background:${EXPORT_PAGE.cream};padding:14px 16px;border-radius:10px;margin-top:24px;">
      <div style="font-size:14px;font-weight:700;color:${EXPORT_PAGE.gold};margin-bottom:8px;">Baker's Tips</div>
      <ul style="margin:0;padding-left:18px;">
        ${tipItems.map((tip) => `
          <li style="font-size:13px;line-height:1.55;color:${EXPORT_PAGE.dark};margin-bottom:6px;">
            ${escapeHtml(tip)}
          </li>
        `).join('')}
      </ul>
    </div>
  `
}

function createNotesHTML(recipe) {
  return `
    <div style="border:1px solid ${EXPORT_PAGE.gold};background:${EXPORT_PAGE.offwhite};padding:14px 16px;border-radius:10px;margin-top:24px;">
      <div style="font-size:14px;font-weight:700;color:${EXPORT_PAGE.gold};margin-bottom:8px;">My Notes</div>
      <div style="font-size:13px;line-height:1.6;color:${recipe.notes ? EXPORT_PAGE.dark : EXPORT_PAGE.grey};font-style:${recipe.notes ? 'normal' : 'italic'};">
        ${escapeHtml(recipe.notes || 'Write your tips, tweaks, and tasting notes here...')}
      </div>
    </div>
  `
}

function buildRecipeHTML(recipe) {
  return `
    <div style="width:${EXPORT_PAGE.width}px;min-height:${EXPORT_PAGE.height}px;background:${EXPORT_PAGE.background};font-family:'Segoe UI',Arial,sans-serif;color:${EXPORT_PAGE.dark};padding:0;box-sizing:border-box;display:flex;flex-direction:column;">
      <div style="background:${EXPORT_PAGE.rose};padding:26px 34px 24px;text-align:center;">
        <div style="font-size:42px;line-height:1;margin-bottom:8px;">${escapeHtml(recipe.emoji || '🍴')}</div>
        <div style="font-size:30px;font-weight:700;color:#FFFFFF;font-family:Georgia,serif;letter-spacing:0.02em;">
          ${escapeHtml(recipe.name || 'Recipe')}
        </div>
      </div>

      <div style="padding:28px 32px 22px;display:flex;flex:1;flex-direction:column;">
        <div style="flex:1;">
          ${createMetaGrid(recipe)}
          ${createIngredientsHTML(recipe)}
          ${createMethodHTML(recipe)}
          ${createTipsHTML(recipe)}
          ${createNotesHTML(recipe)}
        </div>

        <div style="border-top:1px solid #E8D5C4;margin-top:24px;padding-top:10px;text-align:center;font-size:11px;color:${EXPORT_PAGE.grey};">
          Made with love by Kaur's Cakery
        </div>
      </div>
    </div>
  `
}

function buildCoverHTML(recipeCount) {
  return `
    <div style="width:${EXPORT_PAGE.width}px;height:${EXPORT_PAGE.height}px;background:${EXPORT_PAGE.background};font-family:'Segoe UI',Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;padding:48px;box-sizing:border-box;">
      <div style="position:absolute;top:0;left:0;right:0;height:12px;background:${EXPORT_PAGE.rose};"></div>
      <div style="position:absolute;bottom:0;left:0;right:0;height:12px;background:${EXPORT_PAGE.rose};"></div>
      <div style="font-size:54px;font-weight:700;color:${EXPORT_PAGE.rose};font-family:Georgia,serif;text-align:center;letter-spacing:2px;">KAUR'S CAKERY</div>
      <div style="width:90px;height:2px;background:${EXPORT_PAGE.gold};margin:18px 0 14px;"></div>
      <div style="font-size:26px;font-weight:700;color:${EXPORT_PAGE.dark};font-family:Georgia,serif;text-align:center;">RECIPE COLLECTION</div>
      <div style="font-size:16px;color:${EXPORT_PAGE.grey};font-style:italic;margin-top:10px;">${recipeCount} recipes from your kitchen</div>
      <div style="font-size:13px;color:${EXPORT_PAGE.grey};margin-top:24px;">Crafted with love, baked with passion</div>
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
      scale: 2,
      useCORS: true,
      backgroundColor: EXPORT_PAGE.background,
      logging: false,
    })
  } finally {
    document.body.removeChild(container)
  }
}

function fillPdfBackground(doc) {
  const rgb = [249, 243, 238]
  const width = doc.internal.pageSize.getWidth()
  const height = doc.internal.pageSize.getHeight()
  doc.setFillColor(...rgb)
  doc.rect(0, 0, width, height, 'F')
}

function drawCanvasOnPdfPage(doc, canvas) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const imageData = canvas.toDataURL('image/png')
  const canvasRatio = canvas.height / canvas.width
  const pageRatio = pageHeight / pageWidth

  fillPdfBackground(doc)

  if (canvasRatio <= pageRatio) {
    const imageHeight = pageWidth * canvasRatio
    const y = (pageHeight - imageHeight) / 2
    doc.addImage(imageData, 'PNG', 0, y, pageWidth, imageHeight)
    return
  }

  const imageWidth = pageHeight / canvasRatio
  const x = (pageWidth - imageWidth) / 2
  doc.addImage(imageData, 'PNG', x, 0, imageWidth, pageHeight)
}

async function appendRecipePage(doc, recipe, isFirstPage) {
  if (!isFirstPage) {
    doc.addPage()
  }

  const canvas = await renderHtmlToCanvas(buildRecipeHTML(recipe))
  drawCanvasOnPdfPage(doc, canvas)
}

async function appendCoverPage(doc, recipeCount) {
  const canvas = await renderHtmlToCanvas(buildCoverHTML(recipeCount))
  drawCanvasOnPdfPage(doc, canvas)
}

export async function exportToPDF(recipes) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  await appendCoverPage(doc, recipes.length)

  for (const recipe of recipes) {
    await appendRecipePage(doc, recipe, false)
  }

  doc.save(`Kaurs_Cakery_Recipes_${new Date().toISOString().slice(0, 10)}.pdf`)
}

export async function exportSinglePDF(recipe) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  await appendRecipePage(doc, recipe, true)
  doc.save(`${(recipe.name || 'recipe').replace(/\s+/g, '_')}.pdf`)
}

function sectionHeading(label) {
  return new Paragraph({
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D4A843', space: 0 },
    },
    spacing: { before: 180, after: 80 },
    children: [new TextRun({ text: label, bold: true, size: 24, color: 'E8536A', font: 'Georgia' })],
  })
}

function createMetaTable(recipe) {
  if (!recipe.meta?.length) return null

  const columnCount = recipe.meta.length
  const columnWidth = Math.floor(9360 / columnCount)
  const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
  const borders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: recipe.meta.map(() => columnWidth),
    rows: [
      new TableRow({
        children: recipe.meta.map((item) => new TableCell({
          borders,
          width: { size: columnWidth, type: WidthType.DXA },
          shading: { fill: 'FDF6EC', type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 140, right: 140 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: item.label, size: 16, color: '6B5B52', font: 'Arial' })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: item.value, bold: true, color: 'E8536A', font: 'Arial' })],
            }),
          ],
        })),
      }),
    ],
  })
}

function recipeToDocxElements(recipe) {
  const elements = []

  elements.push(
    new Paragraph({
      shading: { fill: 'E8536A', type: ShadingType.CLEAR },
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 0 },
      children: emojiRuns(recipe.emoji || '🍴', { size: 44 }),
    }),
    new Paragraph({
      shading: { fill: 'E8536A', type: ShadingType.CLEAR },
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: emojiRuns(recipe.name || 'Recipe', { bold: true, size: 40, color: 'FFFFFF', font: 'Georgia' }),
    }),
    new Paragraph({
      shading: { fill: 'E8536A', type: ShadingType.CLEAR },
      spacing: { before: 0, after: 0 },
      children: [],
    }),
    new Paragraph({ spacing: { before: 100, after: 0 }, children: [] }),
  )

  const metaTable = createMetaTable(recipe)
  if (metaTable) {
    elements.push(metaTable, new Paragraph({ spacing: { before: 80, after: 0 }, children: [] }))
  }

  elements.push(sectionHeading('Ingredients'))
  recipe.ingredients?.forEach((ingredient) => {
    elements.push(new Paragraph({
      numbering: { reference: 'bullets', level: 0 },
      spacing: { before: 20, after: 20 },
      children: [
        new TextRun({ text: ingredient.name, bold: true, color: '2C1810', font: 'Arial' }),
        new TextRun({ text: ' - ', color: '6B5B52', font: 'Arial' }),
        new TextRun({ text: ingredient.amount, color: '2C1810', font: 'Arial' }),
      ],
    }))
  })

  if (recipe.ingredientNote) {
    elements.push(new Paragraph({
      spacing: { before: 60, after: 40 },
      children: [
        new TextRun({ text: 'Note: ', bold: true, color: 'E8536A', font: 'Arial' }),
        new TextRun({ text: recipe.ingredientNote, italics: true, color: '2C1810', font: 'Arial' }),
      ],
    }))
  }

  elements.push(sectionHeading('Method'))
  recipe.method?.forEach((step) => {
    elements.push(new Paragraph({
      numbering: { reference: 'numbers', level: 0 },
      spacing: { before: 28, after: 28 },
      children: [new TextRun({ text: step, color: '2C1810', font: 'Arial' })],
    }))
  })

  if (recipe.tips) {
    const tips = Array.isArray(recipe.tips) ? recipe.tips : [recipe.tips]
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
                  top: { style: BorderStyle.SINGLE, size: 3, color: 'D4A843' },
                  left: { style: BorderStyle.THICK, size: 12, color: 'D4A843' },
                  bottom: { style: BorderStyle.SINGLE, size: 3, color: 'D4A843' },
                  right: { style: BorderStyle.SINGLE, size: 3, color: 'D4A843' },
                },
                width: { size: 9360, type: WidthType.DXA },
                shading: { fill: 'FDF6EC', type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 200, right: 200 },
                children: [
                  new Paragraph({
                    spacing: { before: 0, after: 60 },
                    children: [new TextRun({ text: "Baker's Tips", bold: true, color: 'D4A843', font: 'Arial' })],
                  }),
                  ...tips.map((tip) => new Paragraph({
                    numbering: { reference: 'tips-bullets', level: 0 },
                    spacing: { before: 20, after: 20 },
                    children: [new TextRun({ text: tip, color: '2C1810', font: 'Arial' })],
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
    new Paragraph({ spacing: { before: 80, after: 0 }, children: [] }),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [9360],
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: 'D4A843' },
                left: { style: BorderStyle.SINGLE, size: 4, color: 'D4A843' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D4A843' },
                right: { style: BorderStyle.SINGLE, size: 4, color: 'D4A843' },
              },
              width: { size: 9360, type: WidthType.DXA },
              shading: { fill: 'FAFAFA', type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 200, right: 200 },
              children: [
                new Paragraph({
                  spacing: { before: 0, after: 40 },
                  children: [new TextRun({ text: 'My Notes', bold: true, size: 22, color: 'D4A843', font: 'Arial' })],
                }),
                new Paragraph({
                  spacing: { after: 120 },
                  children: [new TextRun({
                    text: recipe.notes || 'Write your tips, tweaks, and tasting notes here...',
                    italics: !recipe.notes,
                    color: recipe.notes ? '2C1810' : '6B5B52',
                    font: 'Arial',
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
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: '•',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 180 } } },
        },
      ],
    },
    {
      reference: 'numbers',
      levels: [
        {
          level: 0,
          format: LevelFormat.DECIMAL,
          text: '%1.',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 400, hanging: 220 } } },
        },
      ],
    },
    {
      reference: 'tips-bullets',
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: '•',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 180 } } },
        },
      ],
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
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'E8D5C4', space: 0 } },
        spacing: { before: 60 },
        children: [
          new TextRun({ text: "Made with love by Kaur's Cakery  •  Page ", size: 16, color: '6B5B52', font: 'Arial' }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '6B5B52', font: 'Arial' }),
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
      children: [new TextRun({ text: "KAUR'S CAKERY", bold: true, size: 72, color: 'E8536A', font: 'Georgia' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: 'RECIPE COLLECTION', bold: true, size: 44, color: '2C1810', font: 'Georgia' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: `${recipes.length} recipes from your kitchen`, italics: true, size: 28, color: '6B5B52', font: 'Georgia' })],
    }),
    new Paragraph({ spacing: { before: 300 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: previewNames, color: '6B5B52', font: 'Arial' })],
    }),
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'E8536A', space: 0 } },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: ' ' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120 },
      children: [new TextRun({ text: 'Crafted with love, baked with passion', italics: true, size: 22, color: '6B5B52', font: 'Georgia' })],
    }),
  ]
}

export async function exportToDocx(recipes) {
  const children = [
    ...buildCoverElements(recipes),
    new Paragraph({ children: [new PageBreak()] }),
  ]

  recipes.forEach((recipe, index) => {
    children.push(...recipeToDocxElements(recipe))

    if (index < recipes.length - 1) {
      children.push(new Paragraph({ children: [new PageBreak()] }))
    }
  })

  const doc = new Document({
    numbering: NUMBERING_CONFIG,
    sections: [
      {
        properties: { page: PAGE_PROPS },
        footers: { default: makeFooter() },
        children,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `Kaurs_Cakery_Recipes_${new Date().toISOString().slice(0, 10)}.docx`)
}

export async function exportSingleDocx(recipe) {
  const doc = new Document({
    numbering: NUMBERING_CONFIG,
    sections: [
      {
        properties: { page: PAGE_PROPS },
        footers: { default: makeFooter() },
        children: recipeToDocxElements(recipe),
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${(recipe.name || 'recipe').replace(/\s+/g, '_')}.docx`)
}
