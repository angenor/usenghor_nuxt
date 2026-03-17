<script setup lang="ts">
import type { FundraiserCreatePayload } from '~/types/fundraising'

definePageMeta({ layout: 'admin' })

const router = useRouter()
const { createFundraiser, slugify } = useAdminFundraisingApi()

const form = reactive<FundraiserCreatePayload>({
  title: '',
  slug: '',
  description_html: null,
  description_md: null,
  description_en_html: null,
  description_en_md: null,
  description_ar_html: null,
  description_ar_md: null,
  cover_image_external_id: null,
  goal_amount: 0,
  status: 'draft',
})

const submitting = ref(false)
const autoSlug = ref(true)

watch(() => form.title, (val) => {
  if (autoSlug.value && val) {
    form.slug = slugify(val)
  }
})

function onSlugInput() {
  autoSlug.value = false
}

const isValid = computed(() => {
  return form.title.trim().length > 0 && form.slug.trim().length > 0 && form.goal_amount > 0
})

async function handleSubmit() {
  if (!isValid.value || submitting.value) return

  submitting.value = true
  try {
    const result = await createFundraiser(form)
    router.push(`/admin/contenus/levees-de-fonds/${result.id}/edit`)
  }
  catch (e) {
    console.error('Erreur création:', e)
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Nouvelle levée de fonds</h1>
      <NuxtLink
        to="/admin/contenus/levees-de-fonds"
        class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        ← Retour à la liste
      </NuxtLink>
    </div>

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <!-- Informations principales -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations principales</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre *</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Titre de la campagne"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug *</label>
            <input
              v-model="form.slug"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="slug-url"
              @input="onSlugInput"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Objectif financier (EUR) *</label>
            <input
              v-model.number="form.goal_amount"
              type="number"
              min="1"
              step="0.01"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="1000000"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
            <select
              v-model="form.status"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="draft">Brouillon</option>
              <option value="active">En cours</option>
              <option value="completed">Terminée</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Description enrichie -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Description</h2>
        <AdminRichTextEditor
          title="Description de la campagne"
          description="Décrivez les objectifs et le contexte de la levée de fonds"
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

      <!-- Actions -->
      <div class="flex justify-end gap-3">
        <NuxtLink
          to="/admin/contenus/levees-de-fonds"
          class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Annuler
        </NuxtLink>
        <button
          type="submit"
          :disabled="!isValid || submitting"
          class="px-6 py-2 bg-brand-blue-600 text-white rounded-lg hover:bg-brand-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? 'Création...' : 'Créer la levée de fonds' }}
        </button>
      </div>
    </form>
  </div>
</template>
