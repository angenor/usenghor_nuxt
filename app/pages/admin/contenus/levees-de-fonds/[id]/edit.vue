<script setup lang="ts">
import type {
  FundraiserRead,
  FundraiserUpdatePayload,
  FundraiserStatus,
  ContributorRead,
  ContributorCreatePayload,
  ContributorUpdatePayload,
  ContributorCategory,
  FundraiserMediaRead,
  FundraiserNewsPublic,
} from '~/types/fundraising'
import {
  fundraiserStatusLabels,
  fundraiserStatusColors,
  contributorCategoryLabels,
} from '~/types/fundraising'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const { t } = useI18n()
const id = computed(() => route.params.id as string)

const {
  getFundraiserById,
  updateFundraiser,
  slugify,
  formatCurrency,
  listContributors,
  addContributor,
  updateContributor,
  deleteContributor: apiDeleteContributor,
  listFundraiserNews,
  associateNews,
  dissociateNews,
  searchPublishedNews,
  listFundraiserMedia,
  addMedia,
  updateMedia,
  removeMedia,
} = useAdminFundraisingApi()

// ── Options ──────────────────────────────────────────────────────────

const statusOptions: { value: FundraiserStatus; label: string }[] = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Clôturée' },
]

const categoryOptions: { value: ContributorCategory; label: string }[] = [
  { value: 'state_organization', label: 'Organisation étatique' },
  { value: 'foundation_philanthropist', label: 'Fondation / Philanthrope' },
  { value: 'company', label: 'Entreprise' },
]

// ── State ────────────────────────────────────────────────────────────

const activeTab = ref<'info' | 'contributors' | 'news' | 'media'>('info')
const isLoading = ref(true)
const isSaving = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

const fundraiser = ref<FundraiserRead | null>(null)

const tabs = [
  { key: 'info' as const, label: 'Informations', icon: 'fa-solid fa-circle-info' },
  { key: 'contributors' as const, label: 'Contributeurs', icon: 'fa-solid fa-users' },
  { key: 'news' as const, label: 'Actualités', icon: 'fa-solid fa-newspaper' },
  { key: 'media' as const, label: 'Médiathèque', icon: 'fa-solid fa-photo-video' },
]

// ── Messages helpers ─────────────────────────────────────────────────

function showSuccess(msg: string) {
  successMessage.value = msg
  errorMessage.value = null
  setTimeout(() => { successMessage.value = null }, 4000)
}

function showError(msg: string) {
  errorMessage.value = msg
  successMessage.value = null
}

function clearMessages() {
  successMessage.value = null
  errorMessage.value = null
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 1 : Informations
// ═══════════════════════════════════════════════════════════════════════

const autoSlug = ref(false)
const formInitialized = ref(false)

const form = reactive({
  title: '',
  slug: '',
  goal_amount: 0,
  status: 'draft' as FundraiserStatus,
  cover_image_external_id: null as string | null,
})

// Contenu TOAST UI Editor (description)
const descMd = ref('')
const descMdEn = ref('')
const descMdAr = ref('')
const descHtml = ref('')
const descHtmlEn = ref('')
const descHtmlAr = ref('')

// Contenu TOAST UI Editor (reason)
const reasonMd = ref('')
const reasonMdEn = ref('')
const reasonMdAr = ref('')
const reasonHtml = ref('')
const reasonHtmlEn = ref('')
const reasonHtmlAr = ref('')

const contentChanged = ref(false)
const onContentChange = () => { contentChanged.value = true }

watch(() => form.title, (newTitle) => {
  if (autoSlug.value) {
    form.slug = slugify(newTitle)
  }
})

function populateForm(data: FundraiserRead) {
  form.title = data.title
  form.slug = data.slug
  form.goal_amount = data.goal_amount
  form.status = data.status
  form.cover_image_external_id = data.cover_image_external_id

  // Contenu TOAST UI
  descMd.value = data.description_md || ''
  descHtml.value = data.description_html || ''
  descMdEn.value = data.description_en_md || ''
  descHtmlEn.value = data.description_en_html || ''
  descMdAr.value = data.description_ar_md || ''
  descHtmlAr.value = data.description_ar_html || ''

  reasonMd.value = data.reason_md || ''
  reasonHtml.value = data.reason_html || ''
  reasonMdEn.value = data.reason_en_md || ''
  reasonHtmlEn.value = data.reason_en_html || ''
  reasonMdAr.value = data.reason_ar_md || ''
  reasonHtmlAr.value = data.reason_ar_html || ''

  formInitialized.value = true
}

async function handleSave() {
  if (!form.title.trim()) {
    showError('Le titre est obligatoire')
    return
  }
  if (!form.goal_amount || form.goal_amount <= 0) {
    showError('L\'objectif doit être supérieur à 0')
    return
  }

  isSaving.value = true
  clearMessages()
  try {
    const payload: FundraiserUpdatePayload = {
      title: form.title,
      slug: form.slug,
      goal_amount: form.goal_amount,
      status: form.status,
      cover_image_external_id: form.cover_image_external_id || null,
      description_html: descHtml.value || null,
      description_md: descMd.value || null,
      description_en_html: descHtmlEn.value || null,
      description_en_md: descMdEn.value || null,
      description_ar_html: descHtmlAr.value || null,
      description_ar_md: descMdAr.value || null,
      reason_html: reasonHtml.value || null,
      reason_md: reasonMd.value || null,
      reason_en_html: reasonHtmlEn.value || null,
      reason_en_md: reasonMdEn.value || null,
      reason_ar_html: reasonHtmlAr.value || null,
      reason_ar_md: reasonMdAr.value || null,
    }
    const updated = await updateFundraiser(id.value, payload)
    fundraiser.value = updated
    populateForm(updated)
    showSuccess('Campagne mise à jour avec succès')
  } catch (e: any) {
    showError(e?.data?.detail || 'Erreur lors de la sauvegarde')
  } finally {
    isSaving.value = false
  }
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 2 : Contributeurs
// ═══════════════════════════════════════════════════════════════════════

const contributors = ref<ContributorRead[]>([])
const isLoadingContributors = ref(false)
const showContributorModal = ref(false)
const editingContributorId = ref<string | null>(null)
const isContributorSubmitting = ref(false)
const showDeleteContributorModal = ref(false)
const deletingContributorId = ref<string | null>(null)
const isDeletingContributor = ref(false)

const contributorForm = reactive({
  name: '',
  name_en: '',
  name_ar: '',
  category: 'company' as ContributorCategory,
  amount: 0,
  show_amount_publicly: true,
  logo_external_id: null as string | null,
  display_order: 0,
})

function resetContributorForm() {
  contributorForm.name = ''
  contributorForm.name_en = ''
  contributorForm.name_ar = ''
  contributorForm.category = 'company'
  contributorForm.amount = 0
  contributorForm.show_amount_publicly = true
  contributorForm.logo_external_id = null
  contributorForm.display_order = contributors.value.length
}

function openContributorCreate() {
  editingContributorId.value = null
  resetContributorForm()
  showContributorModal.value = true
}

function openContributorEdit(contributor: ContributorRead) {
  editingContributorId.value = contributor.id
  contributorForm.name = contributor.name
  contributorForm.name_en = contributor.name_en || ''
  contributorForm.name_ar = contributor.name_ar || ''
  contributorForm.category = contributor.category
  contributorForm.amount = contributor.amount
  contributorForm.show_amount_publicly = contributor.show_amount_publicly
  contributorForm.logo_external_id = contributor.logo_external_id
  contributorForm.display_order = contributor.display_order
  showContributorModal.value = true
}

async function saveContributor() {
  if (!contributorForm.name.trim()) {
    showError('Le nom du contributeur est obligatoire')
    return
  }

  isContributorSubmitting.value = true
  clearMessages()
  try {
    if (editingContributorId.value) {
      const payload: ContributorUpdatePayload = {
        name: contributorForm.name,
        name_en: contributorForm.name_en || null,
        name_ar: contributorForm.name_ar || null,
        category: contributorForm.category,
        amount: contributorForm.amount,
        show_amount_publicly: contributorForm.show_amount_publicly,
        logo_external_id: contributorForm.logo_external_id || null,
        display_order: contributorForm.display_order,
      }
      await updateContributor(id.value, editingContributorId.value, payload)
      showSuccess('Contributeur mis à jour')
    } else {
      const payload: ContributorCreatePayload = {
        name: contributorForm.name,
        name_en: contributorForm.name_en || null,
        name_ar: contributorForm.name_ar || null,
        category: contributorForm.category,
        amount: contributorForm.amount,
        show_amount_publicly: contributorForm.show_amount_publicly,
        logo_external_id: contributorForm.logo_external_id || null,
        display_order: contributorForm.display_order,
      }
      await addContributor(id.value, payload)
      showSuccess('Contributeur ajouté')
    }
    showContributorModal.value = false
    await loadContributors()
  } catch (e: any) {
    showError(e?.data?.detail || 'Erreur lors de l\'enregistrement du contributeur')
  } finally {
    isContributorSubmitting.value = false
  }
}

function confirmDeleteContributor(contributorId: string) {
  deletingContributorId.value = contributorId
  showDeleteContributorModal.value = true
}

async function executeDeleteContributor() {
  if (!deletingContributorId.value) return
  isDeletingContributor.value = true
  clearMessages()
  try {
    await apiDeleteContributor(id.value, deletingContributorId.value)
    showDeleteContributorModal.value = false
    deletingContributorId.value = null
    showSuccess('Contributeur supprimé')
    await loadContributors()
  } catch (e: any) {
    showError(e?.data?.detail || 'Erreur lors de la suppression du contributeur')
  } finally {
    isDeletingContributor.value = false
  }
}

async function loadContributors() {
  isLoadingContributors.value = true
  try {
    contributors.value = await listContributors(id.value)
  } catch (e: any) {
    // Silently fail on initial load, show error on user action
  } finally {
    isLoadingContributors.value = false
  }
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 3 : Actualités
// ═══════════════════════════════════════════════════════════════════════

const associatedNews = ref<FundraiserNewsPublic[]>([])
const isLoadingNews = ref(false)
const newsSearchQuery = ref('')
const newsSearchResults = ref<any[]>([])
const isSearchingNews = ref(false)
const isAssociatingNews = ref<string | null>(null)
const isDissociatingNews = ref<string | null>(null)

let newsSearchTimeout: ReturnType<typeof setTimeout> | null = null

async function loadNews() {
  isLoadingNews.value = true
  try {
    associatedNews.value = await listFundraiserNews(id.value)
  } catch {
    // Silently fail on initial load
  } finally {
    isLoadingNews.value = false
  }
}

function onNewsSearchInput() {
  if (newsSearchTimeout) clearTimeout(newsSearchTimeout)
  newsSearchTimeout = setTimeout(async () => {
    if (!newsSearchQuery.value || newsSearchQuery.value.length < 2) {
      newsSearchResults.value = []
      return
    }
    isSearchingNews.value = true
    try {
      const result = await searchPublishedNews(newsSearchQuery.value)
      // Filtrer les actualités déjà associées
      const associatedIds = new Set(associatedNews.value.map(n => n.id))
      newsSearchResults.value = result.items.filter((n: any) => !associatedIds.has(n.id))
    } catch {
      newsSearchResults.value = []
    } finally {
      isSearchingNews.value = false
    }
  }, 300)
}

async function handleAssociateNews(newsId: string) {
  isAssociatingNews.value = newsId
  clearMessages()
  try {
    await associateNews(id.value, newsId)
    newsSearchResults.value = newsSearchResults.value.filter(n => n.id !== newsId)
    showSuccess('Actualité associée')
    await loadNews()
  } catch (e: any) {
    showError(e?.data?.detail || 'Erreur lors de l\'association')
  } finally {
    isAssociatingNews.value = null
  }
}

async function handleDissociateNews(newsId: string) {
  isDissociatingNews.value = newsId
  clearMessages()
  try {
    await dissociateNews(id.value, newsId)
    showSuccess('Actualité dissociée')
    await loadNews()
  } catch (e: any) {
    showError(e?.data?.detail || 'Erreur lors de la dissociation')
  } finally {
    isDissociatingNews.value = null
  }
}

// ═══════════════════════════════════════════════════════════════════════
// TAB 4 : Médiathèque
// ═══════════════════════════════════════════════════════════════════════

const mediaList = ref<FundraiserMediaRead[]>([])
const isLoadingMedia = ref(false)
const showMediaModal = ref(false)
const editingMediaId = ref<string | null>(null)
const isMediaSubmitting = ref(false)
const showDeleteMediaModal = ref(false)
const deletingMediaId = ref<string | null>(null)
const isDeletingMedia = ref(false)

const mediaForm = reactive({
  media_external_id: '',
  caption_fr: '',
  caption_en: '',
  caption_ar: '',
  display_order: 0,
})

function resetMediaForm() {
  mediaForm.media_external_id = ''
  mediaForm.caption_fr = ''
  mediaForm.caption_en = ''
  mediaForm.caption_ar = ''
  mediaForm.display_order = mediaList.value.length
}

function openMediaCreate() {
  editingMediaId.value = null
  resetMediaForm()
  showMediaModal.value = true
}

function openMediaEdit(media: FundraiserMediaRead) {
  editingMediaId.value = media.id
  mediaForm.media_external_id = media.media_external_id
  mediaForm.caption_fr = media.caption_fr || ''
  mediaForm.caption_en = media.caption_en || ''
  mediaForm.caption_ar = media.caption_ar || ''
  mediaForm.display_order = media.display_order
  showMediaModal.value = true
}

async function saveMedia() {
  if (!mediaForm.media_external_id.trim()) {
    showError('L\'identifiant média est obligatoire')
    return
  }

  isMediaSubmitting.value = true
  clearMessages()
  try {
    const data = {
      media_external_id: mediaForm.media_external_id,
      caption_fr: mediaForm.caption_fr || null,
      caption_en: mediaForm.caption_en || null,
      caption_ar: mediaForm.caption_ar || null,
      display_order: mediaForm.display_order,
    }

    if (editingMediaId.value) {
      await updateMedia(id.value, editingMediaId.value, data)
      showSuccess('Média mis à jour')
    } else {
      await addMedia(id.value, data)
      showSuccess('Média ajouté')
    }
    showMediaModal.value = false
    await loadMedia()
  } catch (e: any) {
    showError(e?.data?.detail || 'Erreur lors de l\'enregistrement du média')
  } finally {
    isMediaSubmitting.value = false
  }
}

function confirmDeleteMedia(mediaId: string) {
  deletingMediaId.value = mediaId
  showDeleteMediaModal.value = true
}

async function executeDeleteMedia() {
  if (!deletingMediaId.value) return
  isDeletingMedia.value = true
  clearMessages()
  try {
    await removeMedia(id.value, deletingMediaId.value)
    showDeleteMediaModal.value = false
    deletingMediaId.value = null
    showSuccess('Média supprimé')
    await loadMedia()
  } catch (e: any) {
    showError(e?.data?.detail || 'Erreur lors de la suppression du média')
  } finally {
    isDeletingMedia.value = false
  }
}

async function loadMedia() {
  isLoadingMedia.value = true
  try {
    mediaList.value = await listFundraiserMedia(id.value)
  } catch {
    // Silently fail on initial load
  } finally {
    isLoadingMedia.value = false
  }
}

// ── Initial Load ─────────────────────────────────────────────────────

async function loadData() {
  isLoading.value = true
  clearMessages()
  try {
    const data = await getFundraiserById(id.value)
    fundraiser.value = data
    populateForm(data)

    await Promise.all([loadContributors(), loadNews(), loadMedia()])
  } catch (e: any) {
    showError(e?.data?.detail || 'Erreur lors du chargement de la campagne')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-4">
        <NuxtLink
          to="/admin/contenus/levees-de-fonds"
          class="inline-flex items-center gap-2 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <i class="fa-solid fa-arrow-left" />
        </NuxtLink>
        <div class="min-w-0">
          <h1 class="truncate text-2xl font-bold text-gray-900 dark:text-white">
            {{ fundraiser?.title || 'Chargement...' }}
          </h1>
          <div class="mt-1 flex items-center gap-2">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Campagne #{{ id.slice(0, 8) }}
            </p>
            <span
              v-if="fundraiser"
              class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              :class="fundraiserStatusColors[fundraiser.status]"
            >
              {{ fundraiserStatusLabels[fundraiser.status] }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <Transition name="fade">
      <div
        v-if="successMessage"
        class="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400"
      >
        <i class="fa-solid fa-circle-check mr-2" />
        {{ successMessage }}
      </div>
    </Transition>

    <Transition name="fade">
      <div
        v-if="errorMessage"
        class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
      >
        <i class="fa-solid fa-circle-exclamation mr-2" />
        {{ errorMessage }}
      </div>
    </Transition>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <i class="fa-solid fa-spinner fa-spin text-3xl text-brand-blue-500" />
    </div>

    <template v-else-if="fundraiser">
      <!-- Tab navigation -->
      <div class="flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          :class="activeTab === tab.key
            ? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'"
          class="flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
          @click="activeTab = tab.key"
        >
          <i :class="tab.icon" />
          {{ tab.label }}
        </button>
      </div>

      <!-- ════════════════════════════════════════════════════════════════ -->
      <!-- TAB 1 : Informations                                          -->
      <!-- ════════════════════════════════════════════════════════════════ -->
      <div v-show="activeTab === 'info'" class="space-y-6">
        <!-- Informations principales -->
        <div class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Informations principales
          </h2>

          <!-- Titre -->
          <div class="mb-4">
            <label for="edit-title" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Titre <span class="text-red-500">*</span>
            </label>
            <input
              id="edit-title"
              v-model="form.title"
              type="text"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="Titre de la campagne"
            >
          </div>

          <!-- Slug -->
          <div class="mb-4">
            <label for="edit-slug" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Slug (URL)
            </label>
            <div class="flex gap-2">
              <input
                id="edit-slug"
                v-model="form.slug"
                type="text"
                class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="slug-de-la-campagne"
                @input="autoSlug = false"
              >
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                title="Régénérer depuis le titre"
                @click="form.slug = slugify(form.title)"
              >
                <i class="fa-solid fa-rotate" />
              </button>
            </div>
          </div>

          <!-- Objectif + Statut -->
          <div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="edit-goal" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Objectif (EUR) <span class="text-red-500">*</span>
              </label>
              <input
                id="edit-goal"
                v-model.number="form.goal_amount"
                type="number"
                min="1"
                step="1"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
            </div>
            <div>
              <label for="edit-status" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Statut
              </label>
              <select
                id="edit-status"
                v-model="form.status"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Cover image -->
          <div>
            <label for="edit-cover" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Image de couverture (UUID média)
            </label>
            <input
              id="edit-cover"
              v-model="form.cover_image_external_id"
              type="text"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="UUID du média (optionnel)"
            >
            <!-- Preview -->
            <div v-if="form.cover_image_external_id" class="mt-2">
              <img
                :src="`/api/public/media/${form.cover_image_external_id}/download`"
                alt="Aperçu couverture"
                class="h-32 rounded-lg object-cover"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              >
            </div>
          </div>
        </div>

        <!-- Description (TOAST UI Editor trilingue) -->
        <AdminRichTextEditor
          v-model="descMd"
          v-model:model-value-en="descMdEn"
          v-model:model-value-ar="descMdAr"
          v-model:html-value="descHtml"
          v-model:html-value-en="descHtmlEn"
          v-model:html-value-ar="descHtmlAr"
          title="Description de la campagne"
          description="Présentez la campagne de levée de fonds en détail"
          icon="fa-solid fa-file-lines"
          icon-color="text-indigo-500"
          placeholder="Décrivez la campagne de levée de fonds..."
          placeholder-en="Describe the fundraising campaign..."
          placeholder-ar="صف حملة جمع التبرعات..."
          height="350px"
          @change="onContentChange"
        />

        <!-- Reason (TOAST UI Editor trilingue) -->
        <AdminRichTextEditor
          v-model="reasonMd"
          v-model:model-value-en="reasonMdEn"
          v-model:model-value-ar="reasonMdAr"
          v-model:html-value="reasonHtml"
          v-model:html-value-en="reasonHtmlEn"
          v-model:html-value-ar="reasonHtmlAr"
          title="Pourquoi contribuer"
          description="Expliquez les raisons de cette levée de fonds"
          icon="fa-solid fa-heart"
          icon-color="text-red-500"
          placeholder="Pourquoi contribuer à cette campagne..."
          placeholder-en="Why contribute to this campaign..."
          placeholder-ar="لماذا تساهم في هذه الحملة..."
          height="300px"
          @change="onContentChange"
        />

        <!-- Save -->
        <div class="flex justify-end">
          <button
            type="button"
            :disabled="isSaving"
            class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-blue-700 disabled:opacity-50 transition-colors"
            @click="handleSave"
          >
            <i v-if="isSaving" class="fa-solid fa-spinner fa-spin" />
            <i v-else class="fa-solid fa-floppy-disk" />
            Enregistrer
          </button>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════════ -->
      <!-- TAB 2 : Contributeurs                                         -->
      <!-- ════════════════════════════════════════════════════════════════ -->
      <div v-show="activeTab === 'contributors'" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Contributeurs ({{ contributors.length }})
          </h2>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-blue-700 transition-colors"
            @click="openContributorCreate"
          >
            <i class="fa-solid fa-plus" />
            Ajouter
          </button>
        </div>

        <!-- Loading -->
        <div v-if="isLoadingContributors" class="flex items-center justify-center py-12">
          <i class="fa-solid fa-spinner fa-spin text-2xl text-brand-blue-500" />
        </div>

        <!-- Table -->
        <div v-else-if="contributors.length" class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Nom</th>
                  <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Catégorie</th>
                  <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Montant</th>
                  <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Public</th>
                  <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Ordre</th>
                  <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="c in contributors" :key="c.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td class="whitespace-nowrap px-6 py-3">
                    <div class="flex items-center gap-3">
                      <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                        <img
                          v-if="c.logo_external_id"
                          :src="`/api/public/media/${c.logo_external_id}/download`"
                          :alt="c.name"
                          class="h-7 w-7 rounded object-contain"
                        >
                        <i v-else class="fa-solid fa-building text-xs text-gray-400" />
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white">{{ c.name }}</p>
                        <p v-if="c.name_en" class="text-xs text-gray-500 dark:text-gray-400">{{ c.name_en }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-6 py-3">
                    <span class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      {{ contributorCategoryLabels[c.category] }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-6 py-3 text-right text-sm text-gray-900 dark:text-white">
                    {{ formatCurrency(c.amount) }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-3 text-center">
                    <i :class="c.show_amount_publicly ? 'fa-solid fa-eye text-green-500' : 'fa-solid fa-eye-slash text-gray-400'" />
                  </td>
                  <td class="whitespace-nowrap px-6 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    {{ c.display_order }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-3 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-blue-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-brand-blue-400 transition-colors"
                        title="Modifier"
                        @click="openContributorEdit(c)"
                      >
                        <i class="fa-solid fa-pen-to-square text-sm" />
                      </button>
                      <button
                        type="button"
                        class="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                        title="Supprimer"
                        @click="confirmDeleteContributor(c.id)"
                      >
                        <i class="fa-solid fa-trash text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Empty -->
        <div v-else class="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <i class="fa-solid fa-users mb-3 text-4xl text-gray-300 dark:text-gray-600" />
          <p class="text-gray-500 dark:text-gray-400">Aucun contributeur pour cette campagne</p>
          <button
            type="button"
            class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-blue-600 hover:text-brand-blue-700 dark:text-brand-blue-400"
            @click="openContributorCreate"
          >
            <i class="fa-solid fa-plus" />
            Ajouter un premier contributeur
          </button>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════════ -->
      <!-- TAB 3 : Actualités                                            -->
      <!-- ════════════════════════════════════════════════════════════════ -->
      <div v-show="activeTab === 'news'" class="space-y-6">
        <!-- Search -->
        <div class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Rechercher une actualité à associer
          </h2>
          <div class="relative">
            <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              v-model="newsSearchQuery"
              type="text"
              placeholder="Rechercher par titre (min. 2 caractères)..."
              class="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              @input="onNewsSearchInput"
            >
            <i v-if="isSearchingNews" class="fa-solid fa-spinner fa-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <!-- Search results -->
          <div v-if="newsSearchResults.length" class="mt-4 divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-600">
            <div
              v-for="news in newsSearchResults"
              :key="news.id"
              class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-gray-900 dark:text-white">{{ news.title }}</p>
                <p v-if="news.published_at" class="text-xs text-gray-500 dark:text-gray-400">
                  {{ new Date(news.published_at).toLocaleDateString('fr-FR') }}
                </p>
              </div>
              <button
                type="button"
                :disabled="isAssociatingNews === news.id"
                class="ml-3 inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                @click="handleAssociateNews(news.id)"
              >
                <i :class="isAssociatingNews === news.id ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-link'" />
                Associer
              </button>
            </div>
          </div>

          <p v-else-if="newsSearchQuery.length >= 2 && !isSearchingNews" class="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Aucun résultat pour cette recherche.
          </p>
        </div>

        <!-- Associated news list -->
        <div>
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Actualités associées ({{ associatedNews.length }})
          </h2>

          <div v-if="isLoadingNews" class="flex items-center justify-center py-12">
            <i class="fa-solid fa-spinner fa-spin text-2xl text-brand-blue-500" />
          </div>

          <div v-else-if="associatedNews.length" class="space-y-3">
            <div
              v-for="news in associatedNews"
              :key="news.id"
              class="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <!-- Cover image -->
              <div class="flex h-16 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                <img
                  v-if="news.cover_image_url"
                  :src="news.cover_image_url"
                  :alt="news.title"
                  class="h-full w-full object-cover"
                >
                <i v-else class="fa-solid fa-image text-xl text-gray-400" />
              </div>

              <!-- Info -->
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium text-gray-900 dark:text-white">
                  {{ news.title }}
                </p>
                <p v-if="news.published_at" class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  Publié le {{ new Date(news.published_at).toLocaleDateString('fr-FR') }}
                </p>
              </div>

              <!-- Dissociate -->
              <button
                type="button"
                :disabled="isDissociatingNews === news.id"
                class="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                title="Dissocier"
                @click="handleDissociateNews(news.id)"
              >
                <i :class="isDissociatingNews === news.id ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-link-slash'" />
              </button>
            </div>
          </div>

          <div v-else class="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <i class="fa-solid fa-newspaper mb-3 text-4xl text-gray-300 dark:text-gray-600" />
            <p class="text-gray-500 dark:text-gray-400">Aucune actualité associée</p>
            <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Utilisez la barre de recherche ci-dessus pour associer des actualités.
            </p>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════════ -->
      <!-- TAB 4 : Médiathèque                                           -->
      <!-- ════════════════════════════════════════════════════════════════ -->
      <div v-show="activeTab === 'media'" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Médiathèque ({{ mediaList.length }})
          </h2>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-blue-700 transition-colors"
            @click="openMediaCreate"
          >
            <i class="fa-solid fa-plus" />
            Ajouter un média
          </button>
        </div>

        <!-- Loading -->
        <div v-if="isLoadingMedia" class="flex items-center justify-center py-12">
          <i class="fa-solid fa-spinner fa-spin text-2xl text-brand-blue-500" />
        </div>

        <!-- Grid -->
        <div v-else-if="mediaList.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="media in mediaList"
            :key="media.id"
            class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
          >
            <!-- Preview -->
            <div class="flex h-40 items-center justify-center bg-gray-100 dark:bg-gray-700">
              <img
                v-if="media.media_url"
                :src="media.media_url"
                :alt="media.caption_fr || 'Média'"
                class="h-full w-full object-cover"
              >
              <i v-else class="fa-solid fa-image text-3xl text-gray-400" />
            </div>

            <!-- Info -->
            <div class="p-4">
              <p v-if="media.caption_fr" class="truncate text-sm font-medium text-gray-900 dark:text-white">
                {{ media.caption_fr }}
              </p>
              <p v-else class="truncate text-sm text-gray-400 dark:text-gray-500">
                {{ media.media_external_id.slice(0, 12) }}...
              </p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Ordre : {{ media.display_order }}
              </p>

              <!-- Actions -->
              <div class="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                  @click="openMediaEdit(media)"
                >
                  <i class="fa-solid fa-pen-to-square" />
                  Modifier
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                  @click="confirmDeleteMedia(media.id)"
                >
                  <i class="fa-solid fa-trash" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else class="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <i class="fa-solid fa-photo-film mb-3 text-4xl text-gray-300 dark:text-gray-600" />
          <p class="text-gray-500 dark:text-gray-400">Aucun média pour cette campagne</p>
          <button
            type="button"
            class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-blue-600 hover:text-brand-blue-700 dark:text-brand-blue-400"
            @click="openMediaCreate"
          >
            <i class="fa-solid fa-plus" />
            Ajouter un premier média
          </button>
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- MODAL : Contributeur                                             -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showContributorModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50" @click="showContributorModal = false" />
          <div class="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <div class="mb-6 flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ editingContributorId ? 'Modifier le contributeur' : 'Nouveau contributeur' }}
              </h3>
              <button
                type="button"
                class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="showContributorModal = false"
              >
                <i class="fa-solid fa-xmark" />
              </button>
            </div>

            <form class="space-y-4" @submit.prevent="saveContributor">
              <!-- Nom FR -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nom (français) <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="contributorForm.name"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Nom du contributeur"
                >
              </div>

              <!-- Noms EN + AR -->
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Nom (anglais)</label>
                  <input
                    v-model="contributorForm.name_en"
                    type="text"
                    class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    placeholder="Name (English)"
                  >
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Nom (arabe)</label>
                  <input
                    v-model="contributorForm.name_ar"
                    type="text"
                    dir="rtl"
                    class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    placeholder="الاسم بالعربية"
                  >
                </div>
              </div>

              <!-- Catégorie -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Catégorie</label>
                <select
                  v-model="contributorForm.category"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>

              <!-- Montant + Ordre -->
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Montant (EUR)</label>
                  <input
                    v-model.number="contributorForm.amount"
                    type="number"
                    min="0"
                    step="1"
                    class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Ordre d'affichage</label>
                  <input
                    v-model.number="contributorForm.display_order"
                    type="number"
                    min="0"
                    step="1"
                    class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                </div>
              </div>

              <!-- Logo -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Logo (UUID média)</label>
                <input
                  v-model="contributorForm.logo_external_id"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="UUID du logo (optionnel)"
                >
                <!-- Logo preview -->
                <div v-if="contributorForm.logo_external_id" class="mt-2">
                  <img
                    :src="`/api/public/media/${contributorForm.logo_external_id}/download`"
                    alt="Aperçu logo"
                    class="h-12 rounded object-contain"
                    @error="($event.target as HTMLImageElement).style.display = 'none'"
                  >
                </div>
              </div>

              <!-- Show amount publicly -->
              <label class="flex cursor-pointer items-center gap-2">
                <input
                  v-model="contributorForm.show_amount_publicly"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-500 dark:border-gray-600"
                >
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Afficher le montant publiquement</span>
              </label>

              <!-- Buttons -->
              <div class="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  @click="showContributorModal = false"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  :disabled="isContributorSubmitting"
                  class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700 disabled:opacity-50 transition-colors"
                >
                  <i v-if="isContributorSubmitting" class="fa-solid fa-spinner fa-spin" />
                  {{ editingContributorId ? 'Enregistrer' : 'Ajouter' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Contributor Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteContributorModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50" @click="showDeleteContributorModal = false" />
          <div class="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Confirmer la suppression
            </h3>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Supprimer ce contributeur ? Cette action est irréversible.
            </p>
            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="showDeleteContributorModal = false"
              >
                Annuler
              </button>
              <button
                type="button"
                :disabled="isDeletingContributor"
                class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                @click="executeDeleteContributor"
              >
                <i v-if="isDeletingContributor" class="fa-solid fa-spinner fa-spin" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- MODAL : Média                                                    -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showMediaModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50" @click="showMediaModal = false" />
          <div class="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <div class="mb-6 flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ editingMediaId ? 'Modifier le média' : 'Ajouter un média' }}
              </h3>
              <button
                type="button"
                class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="showMediaModal = false"
              >
                <i class="fa-solid fa-xmark" />
              </button>
            </div>

            <form class="space-y-4" @submit.prevent="saveMedia">
              <!-- Media UUID -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Identifiant média (UUID) <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="mediaForm.media_external_id"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="UUID du fichier média"
                >
              </div>

              <!-- Preview -->
              <div v-if="mediaForm.media_external_id" class="flex justify-center">
                <img
                  :src="`/api/public/media/${mediaForm.media_external_id}/download`"
                  alt="Aperçu"
                  class="max-h-40 rounded-lg object-contain"
                  @error="($event.target as HTMLImageElement).style.display = 'none'"
                >
              </div>

              <!-- Légende FR -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Légende (français)</label>
                <input
                  v-model="mediaForm.caption_fr"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Légende en français"
                >
              </div>

              <!-- Légende EN -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Légende (anglais)</label>
                <input
                  v-model="mediaForm.caption_en"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Caption in English"
                >
              </div>

              <!-- Légende AR -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Légende (arabe)</label>
                <input
                  v-model="mediaForm.caption_ar"
                  type="text"
                  dir="rtl"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="التسمية التوضيحية بالعربية"
                >
              </div>

              <!-- Ordre d'affichage -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Ordre d'affichage</label>
                <input
                  v-model.number="mediaForm.display_order"
                  type="number"
                  min="0"
                  step="1"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
              </div>

              <!-- Buttons -->
              <div class="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  @click="showMediaModal = false"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  :disabled="isMediaSubmitting"
                  class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700 disabled:opacity-50 transition-colors"
                >
                  <i v-if="isMediaSubmitting" class="fa-solid fa-spinner fa-spin" />
                  {{ editingMediaId ? 'Enregistrer' : 'Ajouter' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Media Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteMediaModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50" @click="showDeleteMediaModal = false" />
          <div class="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Confirmer la suppression
            </h3>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Supprimer ce média ? Cette action est irréversible.
            </p>
            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="showDeleteMediaModal = false"
              >
                Annuler
              </button>
              <button
                type="button"
                :disabled="isDeletingMedia"
                class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                @click="executeDeleteMedia"
              >
                <i v-if="isDeletingMedia" class="fa-solid fa-spinner fa-spin" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
