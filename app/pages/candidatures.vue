<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { getFormationsWithOpenApplications, getFormationBySlug } = useMockData()

// SEO
useSeoMeta({
  title: () => t('formations.candidature.seo.title'),
  description: () => t('formations.candidature.seo.description')
})

// Get formations with open applications
const openFormations = computed(() => getFormationsWithOpenApplications())

// Pre-select formation from query param
const selectedFormationSlug = ref(route.query.formation as string || '')

// Get selected formation details
const selectedFormation = computed(() => {
  if (!selectedFormationSlug.value) return null
  return getFormationBySlug(selectedFormationSlug.value)
})

// Get localized title
const getLocalizedTitle = (f: any) => {
  if (!f) return ''
  if (locale.value === 'en' && f.title_en) return f.title_en
  if (locale.value === 'ar' && f.title_ar) return f.title_ar
  return f.title_fr
}

// Form state
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  birthDate: '',
  nationality: '',
  country: '',
  address: '',
  lastDiploma: '',
  diplomaYear: '',
  institution: '',
  fieldOfStudy: '',
  motivation: ''
})

// File uploads (just refs for UI, not actual upload)
const cvFile = ref<File | null>(null)
const diplomaFile = ref<File | null>(null)
const idFile = ref<File | null>(null)
const photoFile = ref<File | null>(null)

// Form submission state
const isSubmitting = ref(false)
const isSubmitted = ref(false)
const hasError = ref(false)

// Handle file selection
const handleFileSelect = (event: Event, fileRef: typeof cvFile) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    fileRef.value = target.files[0]
  }
}

// Submit form (mock)
const submitForm = async () => {
  isSubmitting.value = true
  hasError.value = false

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Mock success
  isSubmitting.value = false
  isSubmitted.value = true
}

// Format date for display
const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.training'), to: '/carrieres#etudiants' },
  { label: t('formations.candidature.hero.title') }
])
</script>

<template>
  <div>
    <!-- Hero -->
    <PageHero
      :title="t('formations.candidature.hero.title')"
      :subtitle="t('formations.candidature.hero.subtitle')"
      image="/images/bg/backgroud_senghor2.jpg"
      :breadcrumb="breadcrumb"
    />

    <!-- Main Content -->
    <section class="py-12 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Success Message -->
        <div v-if="isSubmitted" class="max-w-2xl mx-auto">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div class="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <font-awesome-icon icon="fa-solid fa-check" class="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {{ t('formations.candidature.form.success.title') }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mb-8">
              {{ t('formations.candidature.form.success.message') }}
            </p>
            <NuxtLink
              :to="localePath('/')"
              class="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
            >
              <font-awesome-icon icon="fa-solid fa-home" class="w-4 h-4" />
              {{ t('formations.candidature.form.success.back') }}
            </NuxtLink>
          </div>
        </div>

        <!-- Application Form -->
        <div v-else class="flex flex-col lg:flex-row gap-8">
          <!-- Form Section -->
          <div class="flex-1">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <!-- Form Header -->
              <div class="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-8">
                <h2 class="text-2xl font-bold text-white mb-2">
                  {{ t('formations.candidature.form.title') }}
                </h2>
                <p class="text-amber-100">
                  {{ t('formations.candidature.form.subtitle') }}
                </p>
              </div>

              <form @submit.prevent="submitForm" class="p-6 space-y-8">
                <!-- Program Selection -->
                <div>
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <font-awesome-icon icon="fa-solid fa-graduation-cap" class="text-amber-500" />
                    {{ t('formations.candidature.form.programChoice') }}
                  </h3>
                  <select
                    v-model="selectedFormationSlug"
                    required
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="" disabled>{{ t('formations.candidature.form.selectProgram') }}</option>
                    <option
                      v-for="formation in openFormations"
                      :key="formation.id"
                      :value="formation.slug"
                    >
                      {{ getLocalizedTitle(formation) }}
                    </option>
                  </select>
                </div>

                <!-- Personal Information -->
                <div>
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <font-awesome-icon icon="fa-solid fa-user" class="text-amber-500" />
                    {{ t('formations.candidature.form.personalInfo') }}
                  </h3>
                  <div class="grid md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('formations.candidature.form.firstName') }} *
                      </label>
                      <input
                        v-model="form.firstName"
                        type="text"
                        required
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('formations.candidature.form.lastName') }} *
                      </label>
                      <input
                        v-model="form.lastName"
                        type="text"
                        required
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('formations.candidature.form.email') }} *
                      </label>
                      <input
                        v-model="form.email"
                        type="email"
                        required
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('formations.candidature.form.phone') }} *
                      </label>
                      <input
                        v-model="form.phone"
                        type="tel"
                        required
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('formations.candidature.form.birthDate') }} *
                      </label>
                      <input
                        v-model="form.birthDate"
                        type="date"
                        required
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('formations.candidature.form.nationality') }} *
                      </label>
                      <input
                        v-model="form.nationality"
                        type="text"
                        required
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('formations.candidature.form.country') }} *
                      </label>
                      <input
                        v-model="form.country"
                        type="text"
                        required
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                    </div>
                    <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('formations.candidature.form.address') }} *
                      </label>
                      <input
                        v-model="form.address"
                        type="text"
                        required
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                    </div>
                  </div>
                </div>

                <!-- Academic Information -->
                <div>
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <font-awesome-icon icon="fa-solid fa-book" class="text-amber-500" />
                    {{ t('formations.candidature.form.academicInfo') }}
                  </h3>
                  <div class="grid md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('formations.candidature.form.lastDiploma') }} *
                      </label>
                      <input
                        v-model="form.lastDiploma"
                        type="text"
                        required
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('formations.candidature.form.diplomaYear') }} *
                      </label>
                      <input
                        v-model="form.diplomaYear"
                        type="number"
                        min="1990"
                        max="2025"
                        required
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('formations.candidature.form.institution') }} *
                      </label>
                      <input
                        v-model="form.institution"
                        type="text"
                        required
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('formations.candidature.form.fieldOfStudy') }} *
                      </label>
                      <input
                        v-model="form.fieldOfStudy"
                        type="text"
                        required
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                    </div>
                  </div>
                </div>

                <!-- Motivation Letter -->
                <div>
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <font-awesome-icon icon="fa-solid fa-pen" class="text-amber-500" />
                    {{ t('formations.candidature.form.motivation') }}
                  </h3>
                  <textarea
                    v-model="form.motivation"
                    rows="6"
                    required
                    :placeholder="t('formations.candidature.form.motivationPlaceholder')"
                    class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  ></textarea>
                </div>

                <!-- Documents -->
                <div>
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <font-awesome-icon icon="fa-solid fa-paperclip" class="text-amber-500" />
                    {{ t('formations.candidature.form.documents') }}
                  </h3>
                  <div class="grid md:grid-cols-2 gap-4">
                    <!-- CV -->
                    <div class="relative">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('formations.candidature.form.cv') }} *
                      </label>
                      <div class="relative">
                        <input
                          type="file"
                          accept=".pdf"
                          required
                          @change="(e) => handleFileSelect(e, cvFile)"
                          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        >
                        <div class="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-amber-500 transition-colors">
                          <font-awesome-icon icon="fa-solid fa-file-pdf" class="w-6 h-6 text-red-500" />
                          <span class="text-gray-600 dark:text-gray-400 text-sm truncate">
                            {{ cvFile?.name || t('formations.candidature.form.cv') }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Diploma Copy -->
                    <div class="relative">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('formations.candidature.form.diplomaCopy') }} *
                      </label>
                      <div class="relative">
                        <input
                          type="file"
                          accept=".pdf"
                          required
                          @change="(e) => handleFileSelect(e, diplomaFile)"
                          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        >
                        <div class="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-amber-500 transition-colors">
                          <font-awesome-icon icon="fa-solid fa-file-pdf" class="w-6 h-6 text-red-500" />
                          <span class="text-gray-600 dark:text-gray-400 text-sm truncate">
                            {{ diplomaFile?.name || t('formations.candidature.form.diplomaCopy') }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- ID Copy -->
                    <div class="relative">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('formations.candidature.form.idCopy') }} *
                      </label>
                      <div class="relative">
                        <input
                          type="file"
                          accept=".pdf"
                          required
                          @change="(e) => handleFileSelect(e, idFile)"
                          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        >
                        <div class="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-amber-500 transition-colors">
                          <font-awesome-icon icon="fa-solid fa-file-pdf" class="w-6 h-6 text-red-500" />
                          <span class="text-gray-600 dark:text-gray-400 text-sm truncate">
                            {{ idFile?.name || t('formations.candidature.form.idCopy') }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Photo -->
                    <div class="relative">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('formations.candidature.form.photo') }} *
                      </label>
                      <div class="relative">
                        <input
                          type="file"
                          accept="image/*"
                          required
                          @change="(e) => handleFileSelect(e, photoFile)"
                          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        >
                        <div class="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-amber-500 transition-colors">
                          <font-awesome-icon icon="fa-solid fa-image" class="w-6 h-6 text-blue-500" />
                          <span class="text-gray-600 dark:text-gray-400 text-sm truncate">
                            {{ photoFile?.name || t('formations.candidature.form.photo') }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Submit Button -->
                <div class="pt-4">
                  <button
                    type="submit"
                    :disabled="isSubmitting"
                    class="w-full flex items-center justify-center gap-2 px-6 py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold rounded-lg transition-colors"
                  >
                    <font-awesome-icon
                      v-if="isSubmitting"
                      icon="fa-solid fa-spinner"
                      class="w-5 h-5 animate-spin"
                    />
                    <font-awesome-icon
                      v-else
                      icon="fa-solid fa-paper-plane"
                      class="w-5 h-5"
                    />
                    {{ isSubmitting ? t('formations.candidature.form.submitting') : t('formations.candidature.form.submit') }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Sidebar -->
          <aside class="lg:w-96 flex-shrink-0">
            <div class="sticky top-24 space-y-6">
              <!-- Selected Formation Card -->
              <div v-if="selectedFormation" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div class="h-32 overflow-hidden">
                  <img
                    :src="selectedFormation.image || `https://picsum.photos/seed/${selectedFormation.slug}/400/200`"
                    :alt="getLocalizedTitle(selectedFormation)"
                    class="w-full h-full object-cover"
                  >
                </div>
                <div class="p-4">
                  <h3 class="font-bold text-gray-900 dark:text-white mb-2">
                    {{ getLocalizedTitle(selectedFormation) }}
                  </h3>
                  <div v-if="selectedFormation.application_deadline" class="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <font-awesome-icon icon="fa-solid fa-calendar" class="w-4 h-4" />
                    {{ t('formations.candidature.info.deadline') }} {{ formatDate(selectedFormation.application_deadline) }}
                  </div>
                </div>
              </div>

              <!-- Important Information -->
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <font-awesome-icon icon="fa-solid fa-circle-info" class="text-amber-500" />
                  {{ t('formations.candidature.info.title') }}
                </h3>

                <!-- Documents List -->
                <div class="mb-6">
                  <h4 class="font-medium text-gray-900 dark:text-white mb-3">
                    {{ t('formations.candidature.info.documents') }}
                  </h4>
                  <ul class="space-y-2">
                    <li
                      v-for="(doc, index) in t('formations.candidature.info.documentsList')"
                      :key="index"
                      class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <font-awesome-icon icon="fa-solid fa-check" class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {{ doc }}
                    </li>
                  </ul>
                </div>

                <!-- Selection Process -->
                <div class="mb-6">
                  <h4 class="font-medium text-gray-900 dark:text-white mb-3">
                    {{ t('formations.candidature.info.process.title') }}
                  </h4>
                  <ol class="space-y-3">
                    <li
                      v-for="(step, index) in t('formations.candidature.info.process.steps')"
                      :key="index"
                      class="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <span class="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {{ index + 1 }}
                      </span>
                      {{ step }}
                    </li>
                  </ol>
                </div>

                <!-- Contact -->
                <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ t('formations.candidature.info.contact') }}
                  </p>
                  <a href="mailto:candidatures@usenghor.edu.eg" class="text-amber-600 dark:text-amber-400 hover:underline font-medium">
                    candidatures@usenghor.edu.eg
                  </a>
                </div>
              </div>

              <!-- Back Link -->
              <NuxtLink
                :to="localePath('/carrieres') + '#etudiants'"
                class="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition-colors"
              >
                <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
                {{ t('formations.detail.back') }}
              </NuxtLink>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>
