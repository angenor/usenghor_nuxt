<script setup lang="ts">
import type {
  FundraiserRead,
  FundraiserUpdatePayload,
  ContributorRead,
  ContributorCreatePayload,
  ContributorCategory,
} from '~/types/fundraising'
import { contributorCategoryOptions } from '~/composables/useAdminFundraisingApi'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()
const fundraiserId = route.params.id as string

const {
  getFundraiserById,
  updateFundraiser,
  slugify,
  formatCurrency,
  listContributors,
  addContributor,
  updateContributor: updateContributorApi,
  deleteContributor: deleteContributorApi,
  associateNews,
  dissociateNews,
  searchPublishedNews,
} = useAdminFundraisingApi()

// State
const fundraiser = ref<FundraiserRead | null>(null)
const contributors = ref<ContributorRead[]>([])
const loading = ref(true)
const saving = ref(false)
const autoSlug = ref(false)

// Form
const form = reactive<FundraiserUpdatePayload>({})

// Contributor form
const showContributorForm = ref(false)
const editingContributor = ref<ContributorRead | null>(null)
const contributorForm = reactive<ContributorCreatePayload>({
  name: '',
  name_en: null,
  name_ar: null,
  category: 'state_organization',
  amount: 0,
  logo_external_id: null,
})

// News association
const newsSearchQuery = ref('')
const newsSearchResults = ref<any[]>([])
const searchingNews = ref(false)
const associatedNews = ref<any[]>([])

// Computed
const totalRaised = computed(() =>
  contributors.value.reduce((sum, c) => sum + Number(c.amount), 0),
)

const progressPercentage = computed(() => {
  const goal = form.goal_amount || fundraiser.value?.goal_amount || 1
  return Math.min(Math.round((totalRaised.value / Number(goal)) * 100), 100)
})

// Load data
async function loadData() {
  loading.value = true
  try {
    const data = await getFundraiserById(fundraiserId)
    fundraiser.value = data

    // Populate form
    form.title = data.title
    form.slug = data.slug
    form.description_html = data.description_html
    form.description_md = data.description_md
    form.description_en_html = data.description_en_html
    form.description_en_md = data.description_en_md
    form.description_ar_html = data.description_ar_html
    form.description_ar_md = data.description_ar_md
    form.cover_image_external_id = data.cover_image_external_id
    form.goal_amount = data.goal_amount
    form.status = data.status

    // Load contributors
    contributors.value = await listContributors(fundraiserId)
  }
  catch (e) {
    console.error('Erreur chargement:', e)
  }
  finally {
    loading.value = false
  }
}

// Save fundraiser
async function handleSave() {
  if (saving.value) return
  saving.value = true
  try {
    await updateFundraiser(fundraiserId, form)
    fundraiser.value = await getFundraiserById(fundraiserId)
  }
  catch (e) {
    console.error('Erreur sauvegarde:', e)
  }
  finally {
    saving.value = false
  }
}

// Slug auto
watch(() => form.title, (val) => {
  if (autoSlug.value && val) {
    form.slug = slugify(val)
  }
})

// Contributors
function resetContributorForm() {
  contributorForm.name = ''
  contributorForm.name_en = null
  contributorForm.name_ar = null
  contributorForm.category = 'state_organization'
  contributorForm.amount = 0
  contributorForm.logo_external_id = null
  editingContributor.value = null
}

function editContributor(contributor: ContributorRead) {
  editingContributor.value = contributor
  contributorForm.name = contributor.name
  contributorForm.name_en = contributor.name_en
  contributorForm.name_ar = contributor.name_ar
  contributorForm.category = contributor.category
  contributorForm.amount = Number(contributor.amount)
  contributorForm.logo_external_id = contributor.logo_external_id
  showContributorForm.value = true
}

async function saveContributor() {
  try {
    if (editingContributor.value) {
      await updateContributorApi(fundraiserId, editingContributor.value.id, contributorForm)
    }
    else {
      await addContributor(fundraiserId, contributorForm)
    }
    contributors.value = await listContributors(fundraiserId)
    showContributorForm.value = false
    resetContributorForm()
  }
  catch (e) {
    console.error('Erreur contributeur:', e)
  }
}

async function removeContributor(contributorId: string) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce contributeur ?')) return
  try {
    await deleteContributorApi(fundraiserId, contributorId)
    contributors.value = await listContributors(fundraiserId)
  }
  catch (e) {
    console.error('Erreur suppression contributeur:', e)
  }
}

// News
async function handleNewsSearch() {
  if (!newsSearchQuery.value.trim()) {
    newsSearchResults.value = []
    return
  }
  searchingNews.value = true
  try {
    const result = await searchPublishedNews(newsSearchQuery.value)
    newsSearchResults.value = result.items || []
  }
  catch (e) {
    console.error('Erreur recherche news:', e)
  }
  finally {
    searchingNews.value = false
  }
}

async function handleAssociateNews(newsId: string) {
  try {
    await associateNews(fundraiserId, newsId)
    newsSearchResults.value = newsSearchResults.value.filter(n => n.id !== newsId)
    // Reload fundraiser to get updated news list
    fundraiser.value = await getFundraiserById(fundraiserId)
  }
  catch (e) {
    console.error('Erreur association:', e)
  }
}

async function handleDissociateNews(newsId: string) {
  if (!confirm('Dissocier cette actualité ?')) return
  try {
    await dissociateNews(fundraiserId, newsId)
    fundraiser.value = await getFundraiserById(fundraiserId)
  }
  catch (e) {
    console.error('Erreur dissociation:', e)
  }
}

const categoryLabel = (category: ContributorCategory) => {
  return contributorCategoryOptions.find(c => c.value === category)?.label || category
}

onMounted(loadData)
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue-600" />
    </div>

    <template v-else-if="fundraiser">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Modifier la levée de fonds</h1>
        <NuxtLink
          to="/admin/contenus/levees-de-fonds"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400"
        >
          ← Retour
        </NuxtLink>
      </div>

      <!-- Résumé progression -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-500">{{ formatCurrency(totalRaised) }} / {{ formatCurrency(Number(form.goal_amount || 0)) }}</span>
          <span class="text-sm font-medium text-brand-blue-600">{{ progressPercentage }}%</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div class="bg-brand-blue-600 h-3 rounded-full transition-all" :style="{ width: `${progressPercentage}%` }" />
        </div>
        <p class="mt-2 text-sm text-gray-500">{{ contributors.length }} contributeur(s)</p>
      </div>

      <form class="space-y-6" @submit.prevent="handleSave">
        <!-- Informations principales -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations principales</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre</label>
              <input v-model="form.title" type="text" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
              <input v-model="form.slug" type="text" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Objectif financier (EUR)</label>
              <input v-model.number="form.goal_amount" type="number" min="1" step="0.01" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
              <select v-model="form.status" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="draft">Brouillon</option>
                <option value="active">En cours</option>
                <option value="completed">Terminée</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Description</h2>
          <AdminRichTextEditor
            title="Description"
            description="Décrivez la campagne"
            icon="fas fa-align-left"
            icon-color="text-brand-blue-500"
            :model-value="form.description_md || ''"
            :model-value-en="form.description_en_md || ''"
            :model-value-ar="form.description_ar_md || ''"
            :html-value="form.description_html || ''"
            :html-value-en="form.description_en_html || ''"
            :html-value-ar="form.description_ar_html || ''"
            @update:model-value="form.description_md = $event"
            @update:model-value-en="form.description_en_md = $event"
            @update:model-value-ar="form.description_ar_md = $event"
            @update:html-value="form.description_html = $event"
            @update:html-value-en="form.description_en_html = $event"
            @update:html-value-ar="form.description_ar_html = $event"
          />
        </div>

        <!-- Bouton sauvegarder -->
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="saving"
            class="px-6 py-2 bg-brand-blue-600 text-white rounded-lg hover:bg-brand-blue-700 disabled:opacity-50"
          >
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>

      <!-- Section Contributeurs -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mt-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Contributeurs ({{ contributors.length }})
          </h2>
          <button
            class="bg-brand-blue-600 text-white px-4 py-2 rounded-lg hover:bg-brand-blue-700 text-sm"
            @click="resetContributorForm(); showContributorForm = true"
          >
            + Ajouter
          </button>
        </div>

        <!-- Formulaire contributeur -->
        <div v-if="showContributorForm" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <h3 class="font-medium text-gray-900 dark:text-white mb-3">
            {{ editingContributor ? 'Modifier le contributeur' : 'Nouveau contributeur' }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Nom (FR) *</label>
              <input v-model="contributorForm.name" type="text" class="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Nom (EN)</label>
              <input v-model="contributorForm.name_en" type="text" class="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Nom (AR)</label>
              <input v-model="contributorForm.name_ar" type="text" dir="rtl" class="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Catégorie *</label>
              <select v-model="contributorForm.category" class="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white">
                <option v-for="opt in contributorCategoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Montant (EUR) *</label>
              <input v-model.number="contributorForm.amount" type="number" min="0" step="0.01" class="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-3">
            <button class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400" @click="showContributorForm = false; resetContributorForm()">
              Annuler
            </button>
            <button
              class="px-3 py-1.5 text-sm bg-brand-blue-600 text-white rounded hover:bg-brand-blue-700"
              :disabled="!contributorForm.name.trim()"
              @click="saveContributor"
            >
              {{ editingContributor ? 'Mettre à jour' : 'Ajouter' }}
            </button>
          </div>
        </div>

        <!-- Liste des contributeurs -->
        <div v-if="contributors.length === 0 && !showContributorForm" class="text-center py-8 text-gray-500">
          Aucun contributeur. Cliquez sur « + Ajouter » pour en créer un.
        </div>
        <div v-else class="divide-y divide-gray-200 dark:divide-gray-600">
          <div
            v-for="contributor in contributors"
            :key="contributor.id"
            class="flex items-center justify-between py-3"
          >
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ contributor.name }}</p>
              <p class="text-sm text-gray-500">{{ categoryLabel(contributor.category) }} · {{ formatCurrency(Number(contributor.amount)) }}</p>
            </div>
            <div class="flex gap-2">
              <button class="text-sm text-brand-blue-600 hover:text-brand-blue-800" @click="editContributor(contributor)">
                Modifier
              </button>
              <button class="text-sm text-red-600 hover:text-red-800" @click="removeContributor(contributor.id)">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Actualités associées -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mt-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actualités associées</h2>

        <!-- Recherche -->
        <div class="flex gap-2 mb-4">
          <input
            v-model="newsSearchQuery"
            type="text"
            placeholder="Rechercher une actualité publiée..."
            class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
            @keyup.enter="handleNewsSearch"
          />
          <button
            class="px-4 py-2 bg-brand-blue-600 text-white rounded-lg hover:bg-brand-blue-700 text-sm"
            :disabled="searchingNews"
            @click="handleNewsSearch"
          >
            {{ searchingNews ? '...' : 'Rechercher' }}
          </button>
        </div>

        <!-- Résultats de recherche -->
        <div v-if="newsSearchResults.length > 0" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4 max-h-60 overflow-y-auto">
          <p class="text-xs text-gray-500 mb-2">Résultats :</p>
          <div
            v-for="newsItem in newsSearchResults"
            :key="newsItem.id"
            class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-0"
          >
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ newsItem.title }}</p>
              <p class="text-xs text-gray-500">{{ newsItem.slug }}</p>
            </div>
            <button
              class="text-sm text-brand-blue-600 hover:text-brand-blue-800"
              @click="handleAssociateNews(newsItem.id)"
            >
              Associer
            </button>
          </div>
        </div>

        <!-- Liste vide -->
        <div v-if="!fundraiser.fundraiser_news?.length" class="text-center py-6 text-gray-500 text-sm">
          Aucune actualité associée. Utilisez la recherche ci-dessus pour en ajouter.
        </div>

        <!-- Note: Les actualités associées seraient affichées ici en récupérant les données complètes -->
      </div>
    </template>
  </div>
</template>
