import { create } from 'zustand'
import { openDB } from 'idb'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../lib/firebase'

const DB_NAME = 'kaurscakery'
const STORE_NAME = 'recipes'
const DB_VERSION = 1
const OWNER_EMAIL = 'h.r17731785@gmail.com'
const ROLES_COLLECTION = 'roles'

async function getLocalDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    },
  })
}

const SEED_RECIPES = [
  {
    id: 'seed-1',
    name: 'Burger Buns',
    emoji: '🍔',
    tag: 'Bread',
    createdAt: new Date('2024-01-01').toISOString(),
    meta: [
      { label: 'Total Dough', value: '~329 g' },
      { label: 'Medium Buns', value: '80 g × 4 pcs' },
      { label: 'Small Buns', value: '65 g × 5 pcs' },
      { label: 'Bake Temp', value: '200°C' },
    ],
    ingredients: [
      { name: 'Maida (all-purpose flour)', amount: '180 g' },
      { name: 'Yeast', amount: '3.6 g' },
      { name: 'Sugar (powdered)', amount: '18 g' },
      { name: 'Milk powder', amount: '12.56 g' },
      { name: 'Unsalted butter', amount: '12.56 g' },
      { name: 'Salt', amount: '3.6 g' },
      { name: 'Water', amount: '~99 g' },
      { name: 'White sesame seeds', amount: 'for topping' },
    ],
    ingredientNote: 'Milk wash: 1/4 cup milk + 1 tsp sugar or honey',
    method: [
      'In a bowl, add maida, yeast, sugar, and milk powder. Mix well.',
      'Add about 3/4 of the water and start mixing.',
      'Knead the dough by hand or in a stand mixer.',
      'Add remaining water gradually if needed to make a soft dough.',
      'Once the dough is about 70% kneaded, add soft butter and knead again.',
      'Add salt and continue kneading until smooth.',
      'Check for the windowpane stage.',
      'Cover and rest the dough for 20-30 minutes.',
      'Divide into portions, shape into buns, and place on the tray.',
      'Proof for 25-30 minutes until doubled.',
      'Apply milk wash and sprinkle sesame seeds on top.',
      'Bake at 200°C until golden brown.',
    ],
    tips: 'Keep the dough soft and slightly sticky, not dry. Brush with butter after baking for extra softness.',
    notes: '',
  },
  {
    id: 'seed-2',
    name: 'Whole Wheat Bread',
    emoji: '🌾',
    tag: 'Bread',
    createdAt: new Date('2024-01-02').toISOString(),
    meta: [
      { label: 'Flour', value: '300 g whole wheat flour' },
      { label: 'Liquid', value: '120 ml water + 96 ml milk' },
      { label: 'Yeast', value: '6 g instant' },
      { label: 'Bake', value: '200°C / 25-30 min' },
    ],
    ingredients: [
      { name: 'Whole wheat flour', amount: '300 g' },
      { name: 'Instant yeast', amount: '6 g' },
      { name: 'Salt', amount: '6 g' },
      { name: 'Honey or sugar', amount: '18 g' },
      { name: 'Warm water', amount: '120 ml' },
      { name: 'Warm milk', amount: '96 ml' },
      { name: 'Oil', amount: '6 ml' },
      { name: 'Softened butter', amount: '12 ml' },
      { name: 'Seeds', amount: 'as required' },
    ],
    ingredientNote: '',
    method: [
      'Combine whole wheat flour, instant yeast, honey or sugar, and oil.',
      'Add warm water and warm milk. Mix to form a dough.',
      'Knead until it starts coming together. Add extra water if required.',
      'Add softened butter and continue kneading.',
      'Add salt and knead until the dough reaches a smooth windowpane stage.',
      'Cover and let the dough rest until doubled in size.',
      'Shape the dough and add seeds on top if desired.',
      'Bake at 200°C for 25-30 minutes until golden.',
    ],
    tips: '',
    notes: '',
  },
  {
    id: 'seed-3',
    name: 'Ladi Pav',
    emoji: '🥖',
    tag: 'Bread',
    createdAt: new Date('2024-01-03').toISOString(),
    meta: [
      { label: 'Flour', value: '312.5 g maida' },
      { label: 'Yield', value: '9 pavs' },
      { label: 'Proof Time', value: '30-40 min' },
      { label: 'Bake', value: '200°C / 15-20 min' },
    ],
    ingredients: [
      { name: 'Maida (refined flour)', amount: '312.5 g' },
      { name: 'Instant yeast', amount: '17.5 g' },
      { name: 'Sugar', amount: '25 g' },
      { name: 'Milk + water (50:50)', amount: '162.5 ml' },
      { name: 'Salt', amount: '7.5 g' },
      { name: 'Butter (soft)', amount: '2.5 tbsp (about 32 g)' },
    ],
    ingredientNote: 'Milk wash before baking for a golden glossy finish.',
    method: [
      'Combine maida, yeast, and sugar in a bowl.',
      'Add the milk and water mixture gradually and mix to form a dough.',
      'Start kneading until the dough comes together.',
      'Add softened butter and continue kneading.',
      'Add salt and knead until smooth.',
      'Let the dough rest for about 15 minutes.',
      'Divide the dough into 9 equal portions.',
      'Shape into balls and place in a greased tray.',
      'Cover and proof for 30-40 minutes in a warm place.',
      'Apply milk wash on top.',
      'Bake at 200°C for 15-20 minutes until golden brown.',
    ],
    tips: '',
    notes: '',
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
      { label: 'Rise', value: '1-1.5 hrs' },
      { label: 'Bake', value: '200°C / 22-25 min' },
    ],
    ingredients: [
      { name: 'Warm water', amount: '250 ml' },
      { name: 'Sugar', amount: '0.5 tbsp' },
      { name: 'Salt', amount: '0.75 tbsp' },
      { name: 'Instant dry yeast', amount: '1 tsp' },
      { name: 'Olive oil', amount: '0.5 tbsp' },
      { name: 'Flour', amount: '275 g' },
    ],
    ingredientNote: 'Toppings: bell pepper, olives, jalapenos, onion, capsicum',
    method: [
      'Whisk together warm water, sugar, salt, yeast, and olive oil.',
      'Add flour and mix until a sticky dough forms.',
      'Cover and let the dough rest for 10 minutes.',
      'Perform gentle stretch and folds every 15 minutes, repeating 4 times.',
      'Let it rise at room temperature for 1 to 1.5 hours.',
      'Transfer the dough to a greased 9×9 inch baking tray.',
      'Proof again until it doubles in the tray.',
      'Preheat the oven to 200°C.',
      'Dimple the dough using oiled fingertips.',
      'Marinate the vegetables in olive oil for 10 minutes.',
      'Add the toppings and drizzle a little more olive oil.',
      'Bake for 22-25 minutes until golden brown and crispy.',
      'Let it cool slightly before slicing and serving.',
    ],
    tips: '',
    notes: '',
  },
  {
    id: 'seed-5',
    name: 'Pizza Base',
    emoji: '🍕',
    tag: 'Bread',
    createdAt: new Date('2024-01-05').toISOString(),
    meta: [
      { label: 'Flour', value: '140 g maida' },
      { label: 'Dough Yield', value: '~253 g' },
      { label: 'Portions', value: '100-120 g each' },
      { label: 'Bake', value: '200°C / 3-5 min' },
    ],
    ingredients: [
      { name: 'Maida (refined flour)', amount: '140 g' },
      { name: 'Yeast', amount: '4.2 g' },
      { name: 'Powdered sugar', amount: '2.8 g' },
      { name: 'Improver (optional)', amount: '0.7 g' },
      { name: 'Oil', amount: '18.2 g' },
      { name: 'Water', amount: '84 g' },
      { name: 'Salt', amount: '2.8 g' },
    ],
    ingredientNote: '',
    method: [
      'Combine maida, yeast, powdered sugar, and improver if using.',
      'Add water gradually and mix to form a dough.',
      'Knead until the dough reaches about 50-70% development.',
      'Add oil and continue kneading to form a soft dough.',
      'Check for the windowpane stage.',
      'Add salt and knead again until fully incorporated.',
      'Cover and let the dough rest for 20-30 minutes.',
      'Degas the dough gently.',
      'Divide into equal portions of 100-120 g each.',
      'Roll each portion evenly into a round base.',
      'Dock using a fork.',
      'Bake at 200°C for 3-5 minutes until semi-baked.',
    ],
    tips: '',
    notes: '',
  },
]

function normalizeRecipes(recipes) {
  return recipes
    .map((recipe) => ({
      ...recipe,
      createdAt: recipe.createdAt || new Date().toISOString(),
      meta: recipe.meta || [],
      ingredients: recipe.ingredients || [],
      method: recipe.method || [],
      tips: recipe.tips || '',
      notes: recipe.notes || '',
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

async function getLocalRecipes() {
  try {
    const database = await getLocalDB()
    const recipes = await database.getAll(STORE_NAME)

    if (recipes.length === 0) {
      const tx = database.transaction(STORE_NAME, 'readwrite')
      await Promise.all(SEED_RECIPES.map((recipe) => tx.store.put(recipe)))
      await tx.done
      return normalizeRecipes(SEED_RECIPES)
    }

    return normalizeRecipes(recipes)
  } catch (error) {
    console.error('Local DB error:', error)
    return normalizeRecipes(SEED_RECIPES)
  }
}

async function saveLocalRecipe(recipe) {
  try {
    const database = await getLocalDB()
    await database.put(STORE_NAME, recipe)
  } catch (error) {
    console.error('Local save error:', error)
  }
}

async function saveLocalRecipes(recipes) {
  try {
    const database = await getLocalDB()
    const tx = database.transaction(STORE_NAME, 'readwrite')
    await tx.store.clear()
    await Promise.all(recipes.map((recipe) => tx.store.put(recipe)))
    await tx.done
  } catch (error) {
    console.error('Local sync error:', error)
  }
}

async function deleteLocalRecipe(id) {
  try {
    const database = await getLocalDB()
    await database.delete(STORE_NAME, id)
  } catch (error) {
    console.error('Local delete error:', error)
  }
}

function getRecipesCollection() {
  return collection(db, 'recipes')
}

function getRolesCollection() {
  return collection(db, ROLES_COLLECTION)
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function sortRoles(roles) {
  const priority = { owner: 0, admin: 1, viewer: 2 }
  return [...roles].sort((a, b) => {
    const roleDiff = (priority[a.role] ?? 9) - (priority[b.role] ?? 9)
    if (roleDiff !== 0) return roleDiff
    return a.email.localeCompare(b.email)
  })
}

async function loadRemoteRecipes() {
  const snapshot = await getDocs(getRecipesCollection())
  return normalizeRecipes(snapshot.docs.map((entry) => entry.data()))
}

async function saveRemoteRecipe(recipe) {
  await setDoc(doc(db, 'recipes', recipe.id), recipe)
}

async function deleteRemoteRecipe(id) {
  await deleteDoc(doc(db, 'recipes', id))
}

async function loadRoleEntries() {
  const snapshot = await getDocs(getRolesCollection())
  return sortRoles(snapshot.docs.map((entry) => ({
    email: entry.id,
    ...entry.data(),
  })))
}

async function loadUserRole(email) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return 'viewer'

  const roleDoc = await getDoc(doc(db, ROLES_COLLECTION, normalizedEmail))
  return roleDoc.exists() ? roleDoc.data().role || 'viewer' : 'viewer'
}

async function saveRole(email, role) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return

  await setDoc(doc(db, ROLES_COLLECTION, normalizedEmail), {
    email: normalizedEmail,
    role,
    updatedAt: new Date().toISOString(),
  })
}

async function removeRole(email) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return
  await deleteDoc(doc(db, ROLES_COLLECTION, normalizedEmail))
}

async function ensureOwnerRole() {
  await saveRole(OWNER_EMAIL, 'owner')
}

async function migrateLocalRecipesIfNeeded(canManageRecipes) {
  const remoteRecipes = await loadRemoteRecipes()
  if (remoteRecipes.length > 0 || !canManageRecipes) {
    return remoteRecipes
  }

  const localRecipes = await getLocalRecipes()
  await Promise.all(localRecipes.map((recipe) => saveRemoteRecipe(recipe)))
  return localRecipes
}

let hasInitializedAuthListener = false

export const useStore = create((set, get) => ({
  recipes: [],
  loading: true,
  authReady: false,
  currentPage: 'library',
  selectedRecipe: null,
  editingRecipe: null,
  searchQuery: '',
  activeTag: 'All',
  user: null,
  userRole: 'viewer',
  isOwner: false,
  isAdmin: false,
  roleEntries: [],
  authError: '',

  init: async () => {
    if (hasInitializedAuthListener) return
    hasInitializedAuthListener = true

    const localRecipes = await getLocalRecipes()
    set({ recipes: localRecipes, loading: true })

    onAuthStateChanged(auth, async (user) => {
      const email = normalizeEmail(user?.email)
      const isOwner = email === OWNER_EMAIL

      if (!user) {
        set({
          user: null,
          userRole: 'viewer',
          isOwner: false,
          isAdmin: false,
          roleEntries: [],
          authReady: true,
          loading: false,
          recipes: localRecipes,
          currentPage: 'library',
          selectedRecipe: null,
          editingRecipe: null,
        })
        return
      }

      set({ user, loading: true, authReady: true, authError: '' })

      try {
        if (isOwner) {
          await ensureOwnerRole()
        }

        const userRole = isOwner ? 'owner' : await loadUserRole(email)
        const canManageRecipes = isOwner || userRole === 'admin'
        const roleEntries = isOwner ? await loadRoleEntries() : []
        const recipes = await migrateLocalRecipesIfNeeded(canManageRecipes)
        await saveLocalRecipes(recipes)
        set({
          recipes,
          loading: false,
          userRole,
          isOwner,
          isAdmin: canManageRecipes,
          roleEntries,
        })
      } catch (error) {
        console.error('Cloud load error:', error)
        set({
          recipes: localRecipes,
          loading: false,
          userRole: isOwner ? 'owner' : 'viewer',
          isOwner,
          isAdmin: isOwner,
          roleEntries: [],
          authError: error?.code ? `Firebase error: ${error.code}` : 'Could not load recipes from Firebase. Showing local recipes for now.',
        })
      }
    })
  },

  signIn: async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      set({ authError: '' })
    } catch (error) {
      console.error('Sign in error:', error)
      set({ authError: error?.code ? `Google sign-in failed: ${error.code}` : 'Google sign-in did not complete. Please try again.' })
    }
  },

  signOutUser: async () => {
    await signOut(auth)
  },

  setPage: (page, data = null) => {
    const { isAdmin } = get()
    const nextPage = page === 'add' && !isAdmin ? 'library' : page

    set({
      currentPage: nextPage,
      selectedRecipe: data?.recipe || null,
      editingRecipe: data?.editing || null,
    })
  },

  setSearch: (searchQuery) => set({ searchQuery }),
  setTag: (activeTag) => set({ activeTag }),

  addRecipe: async (recipe) => {
    const { isAdmin } = get()
    if (!isAdmin) return null

    const newRecipe = {
      ...recipe,
      id: `recipe-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    await saveRemoteRecipe(newRecipe)
    await saveLocalRecipe(newRecipe)
    set((state) => ({ recipes: normalizeRecipes([newRecipe, ...state.recipes]) }))
    return newRecipe
  },

  updateRecipe: async (recipe) => {
    const { isAdmin } = get()
    if (!isAdmin) return

    await saveRemoteRecipe(recipe)
    await saveLocalRecipe(recipe)
    set((state) => ({
      recipes: normalizeRecipes(state.recipes.map((entry) => (entry.id === recipe.id ? recipe : entry))),
      selectedRecipe: state.selectedRecipe?.id === recipe.id ? recipe : state.selectedRecipe,
    }))
  },

  deleteRecipe: async (id) => {
    const { isAdmin } = get()
    if (!isAdmin) return

    await deleteRemoteRecipe(id)
    await deleteLocalRecipe(id)
    set((state) => ({
      recipes: state.recipes.filter((recipe) => recipe.id !== id),
      selectedRecipe: state.selectedRecipe?.id === id ? null : state.selectedRecipe,
    }))
  },

  getFilteredRecipes: () => {
    const { recipes, searchQuery, activeTag } = get()
    return recipes.filter((recipe) => {
      const matchSearch = !searchQuery
        || recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
        || recipe.tag?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchTag = activeTag === 'All' || recipe.tag === activeTag
      return matchSearch && matchTag
    })
  },

  refreshRoles: async () => {
    const { isOwner } = get()
    if (!isOwner) return

    const roleEntries = await loadRoleEntries()
    set({ roleEntries })
  },

  setUserRole: async (email, role) => {
    const { isOwner, user } = get()
    if (!isOwner) return

    const normalizedEmail = normalizeEmail(email)
    if (!normalizedEmail) return

    const finalRole = normalizedEmail === OWNER_EMAIL ? 'owner' : role
    await saveRole(normalizedEmail, finalRole)

    const roleEntries = await loadRoleEntries()
    const currentUserEmail = normalizeEmail(user?.email)
    const currentUserRole = currentUserEmail === OWNER_EMAIL ? 'owner' : await loadUserRole(currentUserEmail)

    set({
      roleEntries,
      userRole: currentUserRole,
      isOwner: currentUserEmail === OWNER_EMAIL,
      isAdmin: currentUserEmail === OWNER_EMAIL || currentUserRole === 'admin',
    })
  },

  revokeUserRole: async (email) => {
    const { isOwner, user } = get()
    if (!isOwner) return

    const normalizedEmail = normalizeEmail(email)
    if (!normalizedEmail || normalizedEmail === OWNER_EMAIL) return

    await removeRole(normalizedEmail)

    const roleEntries = await loadRoleEntries()
    const currentUserEmail = normalizeEmail(user?.email)
    const currentUserRole = currentUserEmail === OWNER_EMAIL ? 'owner' : await loadUserRole(currentUserEmail)

    set({
      roleEntries,
      userRole: currentUserRole,
      isOwner: currentUserEmail === OWNER_EMAIL,
      isAdmin: currentUserEmail === OWNER_EMAIL || currentUserRole === 'admin',
    })
  },
}))

export const TAGS = ['All', 'Bread', 'Cake', 'Cookies', 'Pastry', 'Other']

export const TAG_COLORS = {
  Bread: { bg: 'rgba(180, 149, 255, 0.16)', color: '#6f46d8', border: 'rgba(180, 149, 255, 0.35)' },
  Cake: { bg: 'rgba(244, 114, 208, 0.16)', color: '#c03da2', border: 'rgba(244, 114, 208, 0.34)' },
  Cookies: { bg: 'rgba(138, 167, 255, 0.16)', color: '#4864da', border: 'rgba(138, 167, 255, 0.34)' },
  Pastry: { bg: 'rgba(255, 175, 220, 0.16)', color: '#c14e96', border: 'rgba(255, 175, 220, 0.34)' },
  Other: { bg: 'rgba(209, 201, 255, 0.16)', color: '#6958b7', border: 'rgba(209, 201, 255, 0.34)' },
}
