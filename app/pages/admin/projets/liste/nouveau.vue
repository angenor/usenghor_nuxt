<script setup lang="ts">
import type { Project, ProjectStatus, PublicationStatus, ProjectPartner, ProjectCountry } from '~/bank/mock-data/projets'
import type { OutputData } from '@editorjs/editorjs'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()

const {
  generateProjectId,
  generateProjectPartnerId,
  generateProjectCountryId,
  slugifyProject,
  getAllProjectCategories,
  departments,
  projectStatusLabels,
  projectPublicationStatusLabels,
  partenaires,
  countries
} = useMockData()

// Données de référence
const categories = computed(() => getAllProjectCategories())

// Onglet actif
const activeTab = ref<'general' | 'classification' | 'dates' | 'scope' | 'partners' | 'publication'>('general')

// Contenu EditorJS (séparé du formulaire)
const descriptionFr = ref<OutputData | undefined>(undefined)
const descriptionEn = ref<OutputData | undefined>(undefined)
const descriptionAr = ref<OutputData | undefined>(undefined)

// État du formulaire
const form = ref<Partial<Project>>({
  id: generateProjectId(),
  slug: '',
  title_fr: '',
  title_en: '',
  title_ar: '',
  summary_fr: '',
  summary_en: '',
  summary_ar: '',
  cover_image: '',
  category_ids: [],
  department_id: '',
  manager_id: '',
  start_date: '',
  end_date: '',
  budget: undefined,
  currency: 'EUR',
  beneficiaries: '',
  countries: [],
  partners: [],
  status: 'planned',
  publication_status: 'draft',
  featured: false,
  website: ''
})

// Auto-génération du slug
const slugManuallyEdited = ref(false)

watch(() => form.value.title_fr, (title) => {
  if (!slugManuallyEdited.value && title) {
    form.value.slug = slugifyProject(title)
  }
})

// === GESTION DES PAYS ===
const selectedCountryCode = ref('')

const availableCountries = computed(() => {
  const usedCodes = form.value.countries?.map(c => c.code) || []
  return countries.filter(c => !usedCodes.includes(c.code))
})

const addCountry = () => {
  if (!selectedCountryCode.value) return
  const country = countries.find(c => c.code === selectedCountryCode.value)
  if (country && form.value.countries) {
    form.value.countries.push({
      id: generateProjectCountryId(),
      name: country.name,
      code: country.code
    })
    selectedCountryCode.value = ''
  }
}

const removeCountry = (code: string) => {
  if (form.value.countries) {
    form.value.countries = form.value.countries.filter(c => c.code !== code)
  }
}

// === GESTION DES PARTENAIRES ===
const selectedPartnerId = ref('')
const newPartnerRole = ref('')

const availablePartners = computed(() => {
  const usedIds = form.value.partners?.map(p => p.partner_id) || []
  return partenaires.filter(p => !usedIds.includes(p.id))
})

const addPartner = () => {
  if (!selectedPartnerId.value) return
  const partner = partenaires.find(p => p.id === selectedPartnerId.value)
  if (partner && form.value.partners) {
    form.value.partners.push({
      id: generateProjectPartnerId(),
      partner_id: partner.id,
      name: partner.name,
      logo: partner.logo,
      website: partner.website,
      role: newPartnerRole.value
    })
    selectedPartnerId.value = ''
    newPartnerRole.value = ''
  }
}

const removePartner = (partnerId: string) => {
  if (form.value.partners) {
    form.value.partners = form.value.partners.filter(p => p.partner_id !== partnerId)
  }
}

const updatePartnerRole = (partnerId: string, role: string) => {
  const partner = form.value.partners?.find(p => p.partner_id === partnerId)
  if (partner) {
    partner.role = role
  }
}

// === GESTION DES CATÉGORIES ===
const toggleCategory = (categoryId: string) => {
  if (!form.value.category_ids) {
    form.value.category_ids = []
  }
  const index = form.value.category_ids.indexOf(categoryId)
  if (index === -1) {
    form.value.category_ids.push(categoryId)
  } else {
    form.value.category_ids.splice(index, 1)
  }
}

// === SAUVEGARDE ===
const isSaving = ref(false)

const saveForm = async () => {
  // Validation basique
  if (!form.value.title_fr?.trim()) {
    alert('Veuillez saisir un titre')
    return
  }
  if (!form.value.slug?.trim()) {
    alert('Veuillez saisir un slug')
    return
  }

  isSaving.value = true
  try {
    const now = new Date().toISOString()
    const projectData = {
      ...form.value,
      description_fr: descriptionFr.value,
      description_en: descriptionEn.value,
      description_ar: descriptionAr.value,
      created_at: now,
      updated_at: now,
      published_at: form.value.publication_status === 'published' ? now : undefined
    }

    console.log('Creating project:', projectData)
    // En production: POST /api/admin/projects
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push('/admin/projets/liste')
  } finally {
    isSaving.value = false
  }
}

const saveDraft = async () => {
  form.value.publication_status = 'draft'
  await saveForm()
}

const saveAndPublish = async () => {
  form.value.publication_status = 'published'
  await saveForm()
}

const goBack = () => {
  router.push('/admin/projets/liste')
}

// Tabs configuration
const tabs = [
  { id: 'general', label: 'Général', icon: 'fa-solid fa-info-circle' },
  { id: 'classification', label: 'Classification', icon: 'fa-solid fa-tags' },
  { id: 'dates', label: 'Dates & Budget', icon: 'fa-solid fa-calendar' },
  { id: 'scope', label: 'Portée', icon: 'fa-solid fa-globe' },
  { id: 'partners', label: 'Partenaires', icon: 'fa-solid fa-handshake' },
  { id: 'publication', label: 'Publication', icon: 'fa-solid fa-eye' }
]
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <!-- En-tête -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="goBack"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-5 w-5" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Nouveau projet
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Créez un nouveau projet institutionnel
          </p>
        </div>
      </div>
      <div class="flex gap-3">
        <button
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="goBack"
        >
          Annuler
        </button>
        <button
          :disabled="isSaving"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="saveDraft"
        >
          Enregistrer brouillon
        </button>
        <button
          :disabled="isSaving"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          @click="saveAndPublish"
        >
          <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="animate-spin" />
          <font-awesome-icon v-else :icon="['fas', 'save']" />
          Publier
        </button>
      </div>
    </div>

    <!-- Onglets -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="-mb-px flex space-x-4 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="[
            'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          ]"
          @click="activeTab = tab.id as typeof activeTab"
        >
          <font-awesome-icon :icon="tab.icon.split(' ')" />
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Contenu des onglets -->
    <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <!-- Onglet Général -->
      <div v-show="activeTab === 'general'" class="space-y-6">
        <div class="grid gap-6 sm:grid-cols-2">
          <!-- Titre FR -->
          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Titre (FR) <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.title_fr"
              type="text"
              placeholder="Titre du projet en français"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <!-- Titre EN -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Titre (EN)
            </label>
            <input
              v-model="form.title_en"
              type="text"
              placeholder="Project title in English"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Titre AR -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Titre (AR)
            </label>
            <input
              v-model="form.title_ar"
              type="text"
              dir="rtl"
              placeholder="عنوان المشروع بالعربية"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Slug -->
          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Slug <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.slug"
              type="text"
              placeholder="slug-du-projet"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              @input="slugManuallyEdited = true"
            />
            <p class="mt-1 text-xs text-gray-500">Auto-généré à partir du titre. URL: /projets/{{ form.slug || 'slug' }}</p>
          </div>

          <!-- Résumé FR -->
          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Résumé (FR)
            </label>
            <textarea
              v-model="form.summary_fr"
              rows="3"
              placeholder="Brève description du projet en français..."
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Résumé EN -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Résumé (EN)
            </label>
            <textarea
              v-model="form.summary_en"
              rows="2"
              placeholder="Brief description in English..."
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Résumé AR -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Résumé (AR)
            </label>
            <textarea
              v-model="form.summary_ar"
              rows="2"
              dir="rtl"
              placeholder="وصف مختصر بالعربية..."
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Image de couverture -->
          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Image de couverture
            </label>
            <input
              v-model="form.cover_image"
              type="url"
              placeholder="https://example.com/image.jpg"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <div v-if="form.cover_image" class="mt-2">
              <img :src="form.cover_image" alt="Aperçu" class="h-32 w-auto rounded-lg object-cover" />
            </div>
          </div>

          <!-- Site web -->
          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Site web du projet
            </label>
            <input
              v-model="form.website"
              type="url"
              placeholder="https://projet.example.com"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <!-- Onglet Classification -->
      <div v-show="activeTab === 'classification'" class="space-y-6">
        <!-- Catégories -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Catégories
          </label>
          <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <label
              v-for="category in categories"
              :key="category.id"
              class="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
              :class="form.category_ids?.includes(category.id) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'"
            >
              <input
                type="checkbox"
                :checked="form.category_ids?.includes(category.id)"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                @change="toggleCategory(category.id)"
              />
              <font-awesome-icon v-if="category.icon" :icon="['fas', category.icon]" class="text-gray-500" />
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ category.name }}</span>
            </label>
          </div>
        </div>

        <!-- Département -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Département porteur
          </label>
          <select
            v-model="form.department_id"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Sélectionnez un département</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Onglet Dates & Budget -->
      <div v-show="activeTab === 'dates'" class="space-y-6">
        <div class="grid gap-6 sm:grid-cols-2">
          <!-- Date de début -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date de début
            </label>
            <input
              v-model="form.start_date"
              type="date"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Date de fin -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date de fin prévue
            </label>
            <input
              v-model="form.end_date"
              type="date"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Budget -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Budget
            </label>
            <input
              v-model.number="form.budget"
              type="number"
              min="0"
              step="1000"
              placeholder="500000"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Devise -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Devise
            </label>
            <select
              v-model="form.currency"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="EUR">EUR - Euro</option>
              <option value="USD">USD - Dollar US</option>
              <option value="XOF">XOF - Franc CFA</option>
              <option value="EGP">EGP - Livre égyptienne</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Onglet Portée -->
      <div v-show="activeTab === 'scope'" class="space-y-6">
        <!-- Bénéficiaires -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Bénéficiaires
          </label>
          <textarea
            v-model="form.beneficiaries"
            rows="3"
            placeholder="Décrivez les bénéficiaires du projet..."
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <!-- Pays concernés -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Pays concernés
          </label>

          <!-- Liste des pays ajoutés -->
          <div v-if="form.countries && form.countries.length > 0" class="mb-3 flex flex-wrap gap-2">
            <span
              v-for="country in form.countries"
              :key="country.code"
              class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            >
              {{ getFlagEmoji(country.code) }} {{ country.name }}
              <button
                type="button"
                class="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                @click="removeCountry(country.code)"
              >
                <font-awesome-icon :icon="['fas', 'times']" class="h-3 w-3" />
              </button>
            </span>
          </div>

          <!-- Ajouter un pays -->
          <div class="flex gap-2">
            <select
              v-model="selectedCountryCode"
              class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Sélectionnez un pays</option>
              <option v-for="country in availableCountries" :key="country.code" :value="country.code">
                {{ getFlagEmoji(country.code) }} {{ country.name }}
              </option>
            </select>
            <button
              type="button"
              :disabled="!selectedCountryCode"
              class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              @click="addCountry"
            >
              <font-awesome-icon :icon="['fas', 'plus']" />
            </button>
          </div>
        </div>
      </div>

      <!-- Onglet Partenaires -->
      <div v-show="activeTab === 'partners'" class="space-y-6">
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Partenaires du projet
          </label>

          <!-- Liste des partenaires -->
          <div v-if="form.partners && form.partners.length > 0" class="mb-4 space-y-3">
            <div
              v-for="partner in form.partners"
              :key="partner.partner_id"
              class="flex items-center gap-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <img
                v-if="partner.logo"
                :src="partner.logo"
                :alt="partner.name"
                class="h-10 w-10 rounded object-contain"
              />
              <div
                v-else
                class="flex h-10 w-10 items-center justify-center rounded bg-gray-200 dark:bg-gray-700"
              >
                <font-awesome-icon :icon="['fas', 'building']" class="text-gray-400" />
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900 dark:text-white">{{ partner.name }}</div>
                <input
                  :value="partner.role"
                  type="text"
                  placeholder="Rôle du partenaire..."
                  class="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  @input="updatePartnerRole(partner.partner_id, ($event.target as HTMLInputElement).value)"
                />
              </div>
              <button
                type="button"
                class="text-red-500 hover:text-red-700"
                @click="removePartner(partner.partner_id)"
              >
                <font-awesome-icon :icon="['fas', 'trash']" />
              </button>
            </div>
          </div>

          <!-- Ajouter un partenaire -->
          <div class="flex gap-2">
            <select
              v-model="selectedPartnerId"
              class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Sélectionnez un partenaire</option>
              <option v-for="partner in availablePartners" :key="partner.id" :value="partner.id">
                {{ partner.name }}
              </option>
            </select>
            <input
              v-model="newPartnerRole"
              type="text"
              placeholder="Rôle"
              class="w-40 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="button"
              :disabled="!selectedPartnerId"
              class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              @click="addPartner"
            >
              <font-awesome-icon :icon="['fas', 'plus']" />
            </button>
          </div>
        </div>
      </div>

      <!-- Onglet Publication -->
      <div v-show="activeTab === 'publication'" class="space-y-6">
        <div class="grid gap-6 sm:grid-cols-2">
          <!-- Statut du projet -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Statut du projet
            </label>
            <select
              v-model="form.status"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option v-for="(label, key) in projectStatusLabels" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>

          <!-- Statut de publication -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Statut de publication
            </label>
            <select
              v-model="form.publication_status"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option v-for="(label, key) in projectPublicationStatusLabels" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>

          <!-- Featured -->
          <div class="sm:col-span-2">
            <label class="flex cursor-pointer items-center gap-3">
              <input
                v-model="form.featured"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                <font-awesome-icon :icon="['fas', 'star']" class="mr-1 text-yellow-500" />
                Mettre à la une
              </span>
            </label>
            <p class="ml-6 text-xs text-gray-500">Le projet sera mis en avant sur la page d'accueil</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Description détaillée -->
    <AdminRichTextEditor
      v-model="descriptionFr"
      v-model:model-value-en="descriptionEn"
      v-model:model-value-ar="descriptionAr"
      title="Description détaillée"
      description="Décrivez le projet en détail : contexte, objectifs, méthodologie, résultats attendus..."
      icon="fa-solid fa-file-lines"
      icon-color="text-blue-500"
      placeholder="Rédigez la description complète du projet..."
      placeholder-en="Write a detailed description of the project..."
      placeholder-ar="اكتب وصفاً تفصيلياً للمشروع..."
      :min-height="350"
    />

    <!-- Footer actions -->
    <div class="sticky bottom-0 -mx-4 -mb-4 border-t border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-700 dark:bg-gray-900 sm:-mx-6 sm:px-6">
      <div class="flex justify-end gap-3">
        <button
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="goBack"
        >
          Annuler
        </button>
        <button
          :disabled="isSaving"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="saveDraft"
        >
          Enregistrer brouillon
        </button>
        <button
          :disabled="isSaving"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          @click="saveAndPublish"
        >
          <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="animate-spin" />
          <font-awesome-icon v-else :icon="['fas', 'save']" />
          Publier
        </button>
      </div>
    </div>
  </div>
</template>
