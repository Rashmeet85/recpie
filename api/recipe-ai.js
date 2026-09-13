// Vercel Serverless Function: POST /api/recipe-ai

function cleanApiKey(key) {
  if (!key) return ''
  return String(key).trim().replace(/^["']|["']$/g, '')
}

function getApiKey() {
  return (
    cleanApiKey(process.env.GEMINI_API_KEY) ||
    cleanApiKey(process.env.VITE_GEMINI_API_KEY)
  )
}

function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
}

function buildSystemPrompt(action, recipe, options = {}) {
  const recipeContext = JSON.stringify({
    name: recipe.name || '',
    tag: recipe.tag || '',
    meta: recipe.meta || [],
    ingredients: recipe.ingredients || [],
    ingredientNote: recipe.ingredientNote || '',
    method: recipe.method || [],
    tips: recipe.tips || '',
    notes: recipe.notes || '',
  }, null, 2)

  switch (action) {
    case 'fixFormatting':
      return {
        prompt: `You are an expert culinary editor. Fix minimal formatting, punctuation, casing, spacing, and minor typos in the recipe method steps.
CRITICAL RULES:
- Return JSON only.
- Do NOT rewrite or paraphrase steps.
- Do NOT improve grammar or tone.
- Do NOT alter any numbers, oven temperatures, timings, or ingredient names.
- Fix punctuation (e.g., "curd ,vanilla" -> "curd, vanilla", "top .keep" -> "top. Keep").
- Standardize capitalization and list numbering.
- If a step is already well-formatted, keep it exactly as-is.

Recipe Data:
${recipeContext}`,
        schema: {
          type: 'OBJECT',
          properties: {
            method: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: 'The method steps with only formatting/punctuation corrected.',
            },
            summary: {
              type: 'STRING',
              description: 'A brief 1-sentence summary of what formatting was cleaned up.',
            },
          },
          required: ['method', 'summary'],
        },
      }

    case 'polishMethod':
      return {
        prompt: `You are a master baker and technical recipe editor. Polish the recipe method to be crystal-clear, professional, and easy to follow.
CRITICAL RULES:
- Return JSON only.
- Split compound or overly long instructions into clear, logical discrete steps.
- Use clear imperative baking instructions (e.g., "Cream butter and sugar until light and fluffy", "Preheat oven to 200°C").
- NEVER invent new ingredients, measurements, or quantities.
- PRESERVE EVERY oven temperature, bake duration, pan dimension, and rest time exactly as written.
- Preserve technical bakery terms (windowpane stage, proofing, degassing, autolyse, etc.).

Recipe Data:
${recipeContext}`,
        schema: {
          type: 'OBJECT',
          properties: {
            method: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: 'Polished step-by-step method instructions.',
            },
            summary: {
              type: 'STRING',
              description: 'A brief summary of improvements made (e.g. split into 8 clear steps, clarified kneading cues).',
            },
          },
          required: ['method', 'summary'],
        },
      }

    case 'extractIngredients':
      return {
        prompt: `You are an expert recipe auditor. Carefully inspect the recipe method and identify every ingredient mentioned in the instructions.
Compare them against the existing ingredient list:
Existing Ingredients:
${JSON.stringify((recipe.ingredients || []).map((i) => i.name), null, 2)}

CRITICAL RULES:
- Return JSON only.
- Identify which existing ingredients were found in the method.
- Identify any MISSING ingredients that are mentioned or required in the method but NOT present in the existing ingredient list (e.g., if the method says "add curd and vanilla essence" but the ingredient list only has flour and sugar).
- For missing ingredients, extract the mentioned amount if present in text; if no amount is mentioned, leave amount as an empty string "".
- If uncertain whether something is an ingredient or technique/topping, place it in uncertainIngredients.

Recipe Data:
${recipeContext}`,
        schema: {
          type: 'OBJECT',
          properties: {
            existingIngredientsFound: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: 'Names of ingredients already in the list that were mentioned in the method.',
            },
            missingIngredients: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  name: { type: 'STRING' },
                  amount: { type: 'STRING' },
                },
                required: ['name', 'amount'],
              },
              description: 'Ingredients mentioned in the method but missing from the ingredient list.',
            },
            uncertainIngredients: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: 'Items that might be ingredients or toppings where presence is ambiguous.',
            },
          },
          required: ['existingIngredientsFound', 'missingIngredients'],
        },
      }

    case 'missingDetails':
      return {
        prompt: `You are a professional bakery recipe auditor. Audit this recipe for missing critical baking details, inconsistencies, or omissions.
CHECK FOR:
1. Missing Oven Temperature or Pan/Tin Size (if recipe involves baking).
2. Ingredients mentioned in the method steps that are completely absent from the ingredients list.
3. Missing yield or portion sizes.
4. Ambiguous instructions (e.g. "bake until done" without time estimate or visual cue).

CRITICAL RULES:
- Return JSON only.
- Do NOT generate false alarms if the recipe already contains the detail in meta, notes, or tips.
- Provide constructive, friendly warnings and specific suggested fixes.

Recipe Data:
${recipeContext}`,
        schema: {
          type: 'OBJECT',
          properties: {
            warnings: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  type: { type: 'STRING', description: 'e.g. missingTemperature, missingIngredient, missingYield, unclearStep' },
                  message: { type: 'STRING' },
                },
                required: ['type', 'message'],
              },
            },
            suggestedFixes: {
              type: 'OBJECT',
              properties: {
                meta: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      label: { type: 'STRING' },
                      value: { type: 'STRING' },
                    },
                    required: ['label', 'value'],
                  },
                },
                ingredients: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      name: { type: 'STRING' },
                      amount: { type: 'STRING' },
                    },
                    required: ['name', 'amount'],
                  },
                },
                tips: { type: 'STRING' },
              },
            },
          },
          required: ['warnings'],
        },
      }

    case 'shoppingList':
      return {
        prompt: `You are a kitchen organizer. Convert this recipe's ingredient list into a structured, categorized shopping grocery list.
Categorize items into common supermarket sections like:
- "Flours & Dry Goods"
- "Dairy & Refrigerated"
- "Sweeteners & Sugars"
- "Leaveners & Extracts"
- "Produce & Fresh"
- "Other / Pantry"

CRITICAL RULES:
- Return JSON only.
- Include every ingredient with its specified amount.
- Consolidate identical or closely related items if applicable.

Recipe Data:
${recipeContext}`,
        schema: {
          type: 'OBJECT',
          properties: {
            categories: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  name: { type: 'STRING', description: 'Category name (e.g. Dairy & Refrigerated)' },
                  items: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        name: { type: 'STRING' },
                        amount: { type: 'STRING' },
                      },
                      required: ['name', 'amount'],
                    },
                  },
                },
                required: ['name', 'items'],
              },
            },
          },
          required: ['categories'],
        },
      }

    case 'scaleRecipe':
      const targetFactor = options.factor || 2
      return {
        prompt: `You are an expert baker. The user is scaling this recipe by a factor of ${targetFactor}x.
CRITICAL RULES:
- Return JSON only.
- Carefully review what adjustments are needed when scaling by ${targetFactor}x.
- Note whether baking time, pan sizes, or leavening ratio should be adjusted.
- In baking, large batch scaling may need slightly adjusted yeast or liquid absorption. Provide professional baker guidance.

Recipe Data:
${recipeContext}`,
        schema: {
          type: 'OBJECT',
          properties: {
            advice: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: 'Specific advice regarding pan size, bake time, or dough handling for this scaled batch.',
            },
            adjustedBakeTime: {
              type: 'STRING',
              description: 'Recommended bake time adjustment if any (or "Same as original" if unchanged).',
            },
            summary: {
              type: 'STRING',
              description: 'Brief summary of the scaling considerations.',
            },
          },
          required: ['advice', 'summary'],
        },
      }

    default:
      throw new Error(`Unsupported AI action: ${action}`)
  }
}

export async function processAiAction({ action, recipe, options = {} }) {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.')
  }

  if (!recipe || typeof recipe !== 'object') {
    throw new Error('Invalid recipe payload provided.')
  }

  const { prompt, schema } = buildSystemPrompt(action, recipe, options)

  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.15,
      responseMimeType: 'application/json',
      responseSchema: schema,
    },
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Gemini API Error:', response.status, errorText)
    throw new Error(`Gemini API error (${response.status}): ${errorText.slice(0, 200)}`)
  }

  const data = await response.json()
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!rawText) {
    throw new Error('No content received from Gemini model.')
  }

  let parsed
  try {
    parsed = JSON.parse(rawText)
  } catch (err) {
    console.error('JSON parse error from Gemini:', rawText)
    throw new Error('Failed to parse structured response from AI.')
  }

  // Deduplication post-processing for extractIngredients
  if (action === 'extractIngredients' && Array.isArray(parsed.missingIngredients)) {
    const existingNormalized = new Set(
      (recipe.ingredients || []).map((i) => normalizeName(i.name))
    )
    parsed.missingIngredients = parsed.missingIngredients.filter((item) => {
      const norm = normalizeName(item.name)
      return norm && !existingNormalized.has(norm)
    })
  }

  return {
    action,
    result: parsed,
    timestamp: new Date().toISOString(),
  }
}

// Vercel Serverless Function entry point
export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    let body = req.body
    if (typeof body === 'string') {
      body = JSON.parse(body)
    }

    const { action, recipe, options } = body || {}

    if (!action) {
      return res.status(400).json({ error: 'Missing action parameter.' })
    }

    const response = await processAiAction({ action, recipe, options })
    return res.status(200).json(response)
  } catch (error) {
    console.error('Recipe AI Handler Error:', error)
    return res.status(500).json({
      error: error.message || 'Internal AI service error',
    })
  }
}
