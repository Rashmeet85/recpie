import { create } from 'zustand'
import { openDB } from 'idb'

const DB_NAME = 'kaurscakery'
const STORE_NAME = 'recipes'
const DB_VERSION = 1

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

// Seed data from the uploaded recipe book
const SEED_RECIPES = [
  {
    id: 'seed-1',
    name: 'Burger Buns',
    emoji: '🍔',
    tag: 'Bread',
    createdAt: new Date('2024-01-01').toISOString(),
    meta: [
      { label: 'Total Dough', value: '~329 g' },
      { label: 'Medium Buns', value: '80g × 4 pcs' },
      { label: 'Small Buns', value: '65g × 5 pcs' },
      { label: 'Bake Temp', value: '200°C' },
    ],
    ingredients: [
      { name: 'Maida (All-purpose flour)', amount: '180 g' },
      { name: 'Yeast', amount: '3.6 g' },
      { name: 'Sugar (powdered)', amount: '18 g' },
      { name: 'Milk Powder', amount: '12.56 g' },
      { name: 'Unsalted Butter', amount: '12.56 g' },
      { name: 'Salt', amount: '3.6 g' },
      { name: 'Water', amount: '~99 g' },
      { name: 'White Sesame Seeds', amount: 'for topping' },
    ],
    ingredientNote: 'Milk Wash: ¼ cup milk + 1 tsp sugar or honey',
    method: [
      'In a bowl, add maida, yeast, sugar, and milk powder. Mix well.',
      'Add about ¾ of the water and start mixing.',
      'Knead the dough by hand or in a stand mixer.',
      'Add remaining water gradually if needed to make a soft (not dry) dough.',
      'Once the dough is about 70% kneaded, add soft butter and knead again.',
      'Add salt and continue kneading till smooth.',
      'Check for windowpane stage (dough should stretch thin without tearing).',
      'Cover and rest the dough for 20–30 minutes.',
      'Divide into portions, shape into buns, and place on tray.',
      'Proof for 25–30 minutes or till doubled.',
      'Apply milk wash and sprinkle sesame seeds on top.',
      'Bake at 200°C until golden brown.',
    ],
    tips: "Dough should be soft and slightly sticky, not dry. Do not overproof, or buns may collapse. Brush with butter after baking for extra softness.",
    notes: ''
  },
  {
    id: 'seed-2',
    name: 'Whole Wheat Bread',
    emoji: '🌾',
    tag: 'Bread',
    createdAt: new Date('2024-01-02').toISOString(),
    meta: [
      { label: 'Flour', value: '300 g WWF' },
      { label: 'Liquid', value: '120ml Water + 96ml Milk' },
      { label: 'Yeast', value: '6 g Instant' },
      { label: 'Bake', value: '200°C / 25–30 min' },
    ],
    ingredients: [
      { name: 'Whole wheat flour', amount: '300 g' },
      { name: 'Instant yeast', amount: '6 g' },
      { name: 'Salt', amount: '6 g' },
      { name: 'Honey/Sugar', amount: '18 g' },
      { name: 'Warm water', amount: '120 ml' },
      { name: 'Warm milk', amount: '96 ml' },
      { name: 'Oil', amount: '6 ml' },
      { name: 'Softened butter', amount: '12 ml' },
      { name: 'Seeds (for topping)', amount: 'as required' },
    ],
    ingredientNote: '',
    method: [
      'In a bowl, combine whole wheat flour, instant yeast, honey/sugar, and oil.',
      'Add warm water and warm milk. Mix everything properly to form a dough.',
      'Knead the dough well until it starts coming together. Add extra water if required.',
      'Add softened butter and continue kneading.',
      'Add salt and knead further until you achieve a smooth dough (windowpane stage).',
      'Cover and let the dough rest until it doubles in size.',
      'Shape the dough and add seeds on top if desired.',
      'Bake at 200°C for 25–30 minutes or until the bread gets a nice golden color.',
    ],
    tips: '',
    notes: ''
  },
  {
    id: 'seed-3',
    name: 'Ladi Pav',
    emoji: '🥖',
    tag: 'Bread',
    createdAt: new Date('2024-01-03').toISOString(),
    meta: [
      { label: 'Flour', value: '312.5 g Maida' },
      { label: 'Yield', value: '9 Pavs' },
      { label: 'Proof Time', value: '30–40 min' },
      { label: 'Bake', value: '200°C / 15–20 min' },
    ],
    ingredients: [
      { name: 'Maida (Refined flour)', amount: '312.5 g' },
      { name: 'Instant Yeast', amount: '17.5 g' },
      { name: 'Sugar', amount: '25 g' },
      { name: 'Milk + Water (50:50)', amount: '162.5 ml' },
      { name: 'Salt', amount: '7.5 g' },
      { name: 'Butter (soft)', amount: '2.5 tbsp (approx. 32 g)' },
    ],
    ingredientNote: 'Milk Wash: Apply milk wash on top before baking for a golden glossy finish.',
    method: [
      'In a bowl, combine maida, yeast, and sugar. (Salt can be added later if preferred.)',
      'Add the milk + water mixture gradually and mix to form a dough.',
      'Start kneading the dough until it begins to come together.',
      'Add softened butter and continue kneading.',
      'Add salt and knead further until you achieve a smooth dough (windowpane stage).',
      'Let the dough rest for about 15 minutes.',
      'Divide the dough into 9 equal portions.',
      'Shape into balls and place them in a greased baking tray.',
      'Cover and let them proof for 30–40 minutes in a warm place.',
      'Apply milk wash on top.',
      'Bake at 200°C for 15–20 minutes until golden brown.',
    ],
    tips: '',
    notes: ''
  },
  {
    id: 'seed-4',
    name: 'Focaccia Bread',
    emoji: '🫓',
    tag: 'Bread',
    createdAt: new Date('2024-01-04').toISOString(),
    meta: [
      { label: 'Flour', value: '275 g' },
      { label: 'Tray', value: '9×9 inch' },
      { label: 'Rise', value: '1–1.5 hrs' },
      { label: 'Bake', value: '200°C / 22–25 min' },
    ],
    ingredients: [
      { name: 'Warm water', amount: '250 ml' },
      { name: 'Sugar', amount: '0.5 tbsp' },
      { name: 'Salt', amount: '0.75 tbsp' },
      { name: 'Instant dry yeast', amount: '1 tsp' },
      { name: 'Olive oil', amount: '0.5 tbsp' },
      { name: 'Flour', amount: '275 g' },
    ],
    ingredientNote: 'Toppings: Bell pepper, Olives, Jalapeños, Onion, Capsicum',
    method: [
      'In a bowl, whisk together warm water, sugar, salt, yeast, and olive oil.',
      'Add flour and mix until a sticky dough forms.',
      'Cover and let the dough rest for 10 minutes.',
      'Perform gentle stretch and folds every 15 minutes, repeating 4 times.',
      'Cover and let it rise at room temperature for 1 to 1.5 hours (or refrigerate up to 12 hours).',
      'Transfer the dough to a greased 9×9 inch baking tray.',
      'Cover and let it proof again until it doubles in the tray.',
      'Preheat oven to 200°C.',
      'Dimple the dough using oiled fingertips.',
      'Marinate all veggies in olive oil for 10 minutes for enhanced flavour.',
      'Add the marinated toppings over the dough and drizzle a little more olive oil.',
      'Bake for 22–25 minutes until golden brown and crispy.',
      'Let it cool slightly before slicing and serving.',
    ],
    tips: '',
    notes: ''
  },
  {
    id: 'seed-5',
    name: 'Pizza Base',
    emoji: '🍕',
    tag: 'Bread',
    createdAt: new Date('2024-01-05').toISOString(),
    meta: [
      { label: 'Flour', value: '140 g Maida' },
      { label: 'Dough Yield', value: '~253 g' },
      { label: 'Portions', value: '100–120 g each' },
      { label: 'Bake', value: '200°C / 3–5 min' },
    ],
    ingredients: [
      { name: 'Maida (Refined flour)', amount: '140 g' },
      { name: 'Yeast', amount: '4.2 g' },
      { name: 'Powdered sugar', amount: '2.8 g' },
      { name: 'Improver (Optional)', amount: '0.7 g' },
      { name: 'Oil', amount: '18.2 g' },
      { name: 'Water', amount: '84 g' },
      { name: 'Salt', amount: '2.8 g' },
    ],
    ingredientNote: '',
    method: [
      'In a bowl, combine maida, yeast, powdered sugar, and improver (if using).',
      'Add water gradually and mix to form a dough.',
      'Knead until the dough reaches about 50–70% development.',
      'Add oil and continue kneading to form a soft dough.',
      'Check for the windowpane stage (dough should stretch thin without tearing).',
      'Add salt and knead again until fully incorporated.',
      'Cover and let the dough rest for 20–30 minutes.',
      'Degas the dough gently.',
      'Divide into equal portions of 100–120 g each.',
      'Roll each portion evenly into a round base.',
      'Dock using a fork.',
      'Bake at 200°C for 3–5 minutes until semi-baked (do not brown; keep light in color).',
    ],
    tips: '',
    notes: ''
  },
]

async function loadRecipes() {
  try {
    const db = await getDB()
    const all = await db.getAll(STORE_NAME)
    if (all.length === 0) {
      // Seed the database
      const tx = db.transaction(STORE_NAME, 'readwrite')
      await Promise.all(SEED_RECIPES.map(r => tx.store.put(r)))
      await tx.done
      return SEED_RECIPES
    }
    return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (e) {
    console.error('DB error:', e)
    return SEED_RECIPES
  }
}

async function saveRecipeToDB(recipe) {
  try {
    const db = await getDB()
    await db.put(STORE_NAME, recipe)
  } catch (e) { console.error(e) }
}

async function deleteRecipeFromDB(id) {
  try {
    const db = await getDB()
    await db.delete(STORE_NAME, id)
  } catch (e) { console.error(e) }
}

export const useStore = create((set, get) => ({
  recipes: [],
  loading: true,
  currentPage: 'library',
  selectedRecipe: null,
  editingRecipe: null,
  searchQuery: '',
  activeTag: 'All',

  init: async () => {
    const recipes = await loadRecipes()
    set({ recipes, loading: false })
  },

  setPage: (page, data = null) => set({ 
    currentPage: page, 
    selectedRecipe: data?.recipe || null,
    editingRecipe: data?.editing || null 
  }),

  setSearch: (q) => set({ searchQuery: q }),
  setTag: (tag) => set({ activeTag: tag }),

  addRecipe: async (recipe) => {
    const newRecipe = { ...recipe, id: `recipe-${Date.now()}`, createdAt: new Date().toISOString() }
    await saveRecipeToDB(newRecipe)
    set(s => ({ recipes: [newRecipe, ...s.recipes] }))
    return newRecipe
  },

  updateRecipe: async (recipe) => {
    await saveRecipeToDB(recipe)
    set(s => ({ recipes: s.recipes.map(r => r.id === recipe.id ? recipe : r) }))
  },

  deleteRecipe: async (id) => {
    await deleteRecipeFromDB(id)
    set(s => ({ recipes: s.recipes.filter(r => r.id !== id) }))
  },

  getFilteredRecipes: () => {
    const { recipes, searchQuery, activeTag } = get()
    return recipes.filter(r => {
      const matchSearch = !searchQuery || 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tag?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchTag = activeTag === 'All' || r.tag === activeTag
      return matchSearch && matchTag
    })
  }
}))

export const TAGS = ['All', 'Bread', 'Cake', 'Cookies', 'Pastry', 'Other']

export const TAG_COLORS = {
  Bread: { bg: 'rgba(201,169,110,0.15)', color: '#8a6424', border: 'rgba(201,169,110,0.4)' },
  Cake: { bg: 'rgba(212,136,106,0.15)', color: '#8a3e22', border: 'rgba(212,136,106,0.4)' },
  Cookies: { bg: 'rgba(143,166,139,0.15)', color: '#3d5e3a', border: 'rgba(143,166,139,0.4)' },
  Pastry: { bg: 'rgba(176,158,150,0.15)', color: '#5e4a43', border: 'rgba(176,158,150,0.4)' },
  Other: { bg: 'rgba(176,158,150,0.1)', color: '#6b5e57', border: 'rgba(176,158,150,0.3)' },
}
