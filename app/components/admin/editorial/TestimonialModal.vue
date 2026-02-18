<script setup lang="ts">
import type { Testimonial, TestimonialData } from '~/types/api'

const props = defineProps<{
  show: boolean
  editingTestimonial: Testimonial | null
  isSaving: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [data: TestimonialData]
}>()

const {
  testimonialCivilities,
  testimonialDepartments,
} = useEditorialValuesApi()

const defaultForm = (): TestimonialData => ({
  civility: 'M.',
  first_name: '',
  last_name: '',
  photo: '',
  graduation_year: new Date().getFullYear(),
  promotion: '',
  department: '',
  current_position_fr: '',
  current_position_en: '',
  current_position_ar: '',
  organization: '',
  country: '',
  testimonial_fr: '',
  testimonial_en: '',
  testimonial_ar: '',
  is_featured: false,
  is_active: true,
  linkedin: '',
  display_order: 0,
})

const form = ref<TestimonialData>(defaultForm())
const formErrors = ref<Record<string, string>>({})

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.editingTestimonial) {
      form.value = {
        civility: props.editingTestimonial.civility,
        first_name: props.editingTestimonial.first_name,
        last_name: props.editingTestimonial.last_name,
        photo: props.editingTestimonial.photo,
        graduation_year: props.editingTestimonial.graduation_year,
        promotion: props.editingTestimonial.promotion,
        department: props.editingTestimonial.department,
        current_position_fr: props.editingTestimonial.current_position_fr,
        current_position_en: props.editingTestimonial.current_position_en,
        current_position_ar: props.editingTestimonial.current_position_ar,
        organization: props.editingTestimonial.organization,
        country: props.editingTestimonial.country,
        testimonial_fr: props.editingTestimonial.testimonial_fr,
        testimonial_en: props.editingTestimonial.testimonial_en,
        testimonial_ar: props.editingTestimonial.testimonial_ar,
        is_featured: props.editingTestimonial.is_featured,
        is_active: props.editingTestimonial.is_active,
        linkedin: props.editingTestimonial.linkedin,
        display_order: props.editingTestimonial.display_order,
      }
    }
    else {
      form.value = defaultForm()
    }
    formErrors.value = {}
  }
})

function validateForm(): boolean {
  formErrors.value = {}

  if (!form.value.first_name.trim()) {
    formErrors.value.first_name = 'Le prénom est requis'
  }
  if (!form.value.last_name.trim()) {
    formErrors.value.last_name = 'Le nom est requis'
  }
  if (!form.value.testimonial_fr.trim()) {
    formErrors.value.testimonial_fr = 'Le témoignage en français est requis'
  }
  if (form.value.graduation_year < 1989 || form.value.graduation_year > new Date().getFullYear()) {
    formErrors.value.graduation_year = 'Année invalide'
  }

  return Object.keys(formErrors.value).length === 0
}

function handleSubmit() {
  if (!validateForm()) return
  emit('save', { ...form.value })
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="handleClose"
    >
      <div class="w-full max-w-2xl rounded-xl bg-white shadow-xl dark:bg-gray-800 max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingTestimonial ? 'Modifier le témoignage' : 'Ajouter un témoignage' }}
          </h3>
          <button
            class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            @click="handleClose"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
          </button>
        </div>

        <!-- Form (scrollable) -->
        <form class="overflow-y-auto p-6 space-y-6" @submit.prevent="handleSubmit">
          <!-- Identité -->
          <fieldset>
            <legend class="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Identité
            </legend>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Civilité</label>
                <select
                  v-model="form.civility"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option v-for="c in testimonialCivilities" :key="c.value" :value="c.value">{{ c.label }}</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Prénom *</label>
                <input
                  v-model="form.first_name"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  :class="{ 'border-red-500': formErrors.first_name }"
                />
                <p v-if="formErrors.first_name" class="mt-1 text-sm text-red-500">{{ formErrors.first_name }}</p>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Nom *</label>
                <input
                  v-model="form.last_name"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  :class="{ 'border-red-500': formErrors.last_name }"
                />
                <p v-if="formErrors.last_name" class="mt-1 text-sm text-red-500">{{ formErrors.last_name }}</p>
              </div>
            </div>
            <div class="mt-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">URL de la photo</label>
              <input
                v-model="form.photo"
                type="text"
                placeholder="https://..."
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </fieldset>

          <!-- Formation -->
          <fieldset>
            <legend class="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Formation
            </legend>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Année de diplôme</label>
                <input
                  v-model.number="form.graduation_year"
                  type="number"
                  min="1989"
                  :max="new Date().getFullYear()"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  :class="{ 'border-red-500': formErrors.graduation_year }"
                />
                <p v-if="formErrors.graduation_year" class="mt-1 text-sm text-red-500">{{ formErrors.graduation_year }}</p>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Promotion</label>
                <input
                  v-model="form.promotion"
                  type="text"
                  placeholder="ex: Promotion 2020"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div class="col-span-2">
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Département</label>
                <select
                  v-model="form.department"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">— Sélectionner —</option>
                  <option v-for="d in testimonialDepartments" :key="d.value" :value="d.value">{{ d.label }}</option>
                </select>
              </div>
            </div>
          </fieldset>

          <!-- Situation actuelle -->
          <fieldset>
            <legend class="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Situation actuelle
            </legend>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Organisation</label>
                  <input
                    v-model="form.organization"
                    type="text"
                    class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Pays</label>
                  <input
                    v-model="form.country"
                    type="text"
                    class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Poste actuel (FR)</label>
                <input
                  v-model="form.current_position_fr"
                  type="text"
                  placeholder="ex: Directrice générale"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Poste actuel (EN)</label>
                <input
                  v-model="form.current_position_en"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Poste actuel (AR)</label>
                <input
                  v-model="form.current_position_ar"
                  type="text"
                  dir="rtl"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn</label>
                <input
                  v-model="form.linkedin"
                  type="text"
                  placeholder="https://linkedin.com/in/..."
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </fieldset>

          <!-- Témoignage -->
          <fieldset>
            <legend class="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Témoignage
            </legend>
            <div class="space-y-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Témoignage (FR) *</label>
                <textarea
                  v-model="form.testimonial_fr"
                  rows="3"
                  placeholder="Le témoignage en français..."
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  :class="{ 'border-red-500': formErrors.testimonial_fr }"
                />
                <p v-if="formErrors.testimonial_fr" class="mt-1 text-sm text-red-500">{{ formErrors.testimonial_fr }}</p>
                <p v-else class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ form.testimonial_fr.length }} caractères</p>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Témoignage (EN)</label>
                <textarea
                  v-model="form.testimonial_en"
                  rows="3"
                  placeholder="Testimonial in English..."
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Témoignage (AR)</label>
                <textarea
                  v-model="form.testimonial_ar"
                  rows="3"
                  dir="rtl"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </fieldset>

          <!-- Options -->
          <fieldset>
            <legend class="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Options
            </legend>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <input
                  id="is_featured"
                  v-model="form.is_featured"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 bg-white text-amber-600 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label for="is_featured" class="text-sm text-gray-700 dark:text-gray-300">
                  <font-awesome-icon :icon="['fas', 'star']" class="mr-1 h-3 w-3 text-amber-500" />
                  Témoignage en vedette (affiché dans la section « Parcours inspirants »)
                </label>
              </div>
              <div class="flex items-center gap-3">
                <input
                  id="is_active"
                  v-model="form.is_active"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 bg-white text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label for="is_active" class="text-sm text-gray-700 dark:text-gray-300">
                  Actif (visible sur le site public)
                </label>
              </div>
            </div>
          </fieldset>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              @click="handleClose"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
              :disabled="isSaving"
            >
              <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
              {{ editingTestimonial ? 'Enregistrer' : 'Ajouter' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
