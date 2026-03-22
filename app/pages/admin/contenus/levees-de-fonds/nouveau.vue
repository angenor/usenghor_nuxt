<script setup lang="ts">
import type { FundraiserCreatePayload, FundraiserStatus } from '~/types/fundraising'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const { t } = useI18n()

const {
  createFundraiser,
  slugify,
} = useAdminFundraisingApi()

// === STATE ===
const isSubmitting = ref(false)
const error = ref<string | null>(null)
const autoSlug = ref(true)

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

// === VALIDATION ===
const validationErrors = reactive({
  title: '',
  goal_amount: '',
})

function validate(): boolean {
  let valid = true
  validationErrors.title = ''
  validationErrors.goal_amount = ''

  if (!form.title.trim()) {
    validationErrors.title = 'Le titre est obligatoire'
    valid = false
  }
  if (!form.goal_amount || form.goal_amount <= 0) {
    validationErrors.goal_amount = 'L\'objectif doit être supérieur à 0'
    valid = false
  }
  return valid
}

// === AUTO SLUG ===
watch(() => form.title, (newTitle) => {
  if (autoSlug.value) {
    form.slug = slugify(newTitle)
  }
})

function onSlugManualEdit() {
  autoSlug.value = false
}

// === SUBMIT ===
async function handleSubmit() {
  if (!validate()) return

  isSubmitting.value = true
  error.value = null

  try {
    const payload: FundraiserCreatePayload = {
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

    const result = await createFundraiser(payload)
    await router.push(`/admin/contenus/levees-de-fonds/${result.id}/edit`)
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors de la création de la campagne'
  } finally {
    isSubmitting.value = false
  }
}

</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <NuxtLink
        to="/admin/contenus/levees-de-fonds"
        class="inline-flex items-center gap-2 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
      >
        <i class="fa-solid fa-arrow-left" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Nouvelle campagne de levée de fonds
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Remplissez les informations de la campagne
        </p>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
      <i class="fa-solid fa-circle-exclamation mr-2" />
      {{ error }}
    </div>

    <!-- Form -->
    <form class="space-y-6" @submit.prevent="handleSubmit">
      <!-- Informations principales -->
      <div class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Informations principales</h2>

        <!-- Titre -->
        <div class="mb-4">
          <label for="title" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Titre <span class="text-red-500">*</span>
          </label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            :class="{ 'border-red-500': validationErrors.title }"
            placeholder="Titre de la campagne"
          >
          <p v-if="validationErrors.title" class="mt-1 text-xs text-red-500">{{ validationErrors.title }}</p>
        </div>

        <!-- Slug -->
        <div class="mb-4">
          <label for="slug" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Slug (URL)
          </label>
          <input
            id="slug"
            v-model="form.slug"
            type="text"
            class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            placeholder="slug-auto-genere"
            @input="onSlugManualEdit"
          >
          <p v-if="!autoSlug" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Slug modifié manuellement.
            <button type="button" class="text-brand-blue-600 hover:underline" @click="autoSlug = true; form.slug = slugify(form.title)">
              Régénérer automatiquement
            </button>
          </p>
        </div>

        <!-- Objectif + Statut -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="goal_amount" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Objectif (EUR) <span class="text-red-500">*</span>
            </label>
            <input
              id="goal_amount"
              v-model.number="form.goal_amount"
              type="number"
              min="1"
              step="1"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              :class="{ 'border-red-500': validationErrors.goal_amount }"
            >
            <p v-if="validationErrors.goal_amount" class="mt-1 text-xs text-red-500">{{ validationErrors.goal_amount }}</p>
          </div>
          <div>
            <label for="status" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Statut
            </label>
            <select
              id="status"
              v-model="form.status"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="draft">Brouillon</option>
              <option value="active">Active</option>
              <option value="completed">Clôturée</option>
            </select>
          </div>
        </div>

        <!-- Cover image -->
        <div class="mt-4">
          <label for="cover_image" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Image de couverture (UUID média)
          </label>
          <input
            id="cover_image"
            v-model="form.cover_image_external_id"
            type="text"
            class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            placeholder="UUID du média (optionnel)"
          >
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
      />

      <!-- Submit -->
      <div class="flex justify-end gap-3">
        <NuxtLink
          to="/admin/contenus/levees-de-fonds"
          class="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Annuler
        </NuxtLink>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-blue-700 disabled:opacity-50 transition-colors"
        >
          <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin" />
          <i v-else class="fa-solid fa-plus" />
          Créer la campagne
        </button>
      </div>
    </form>
  </div>
</template>
