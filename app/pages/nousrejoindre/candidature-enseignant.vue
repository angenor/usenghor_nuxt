<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { uploadDocument, submitSpontaneous } = usePublicApplicationsApi()

// SEO
useSeoMeta({
  title: () => t('careers.application.seo.title'),
  description: () => t('careers.application.seo.description'),
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('about.tabs.careers'), to: localePath('/nousrejoindre') },
  { label: t('careers.application.breadcrumb') },
])

// Form data
const formData = reactive({
  civilite: '',
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  pays: '',
  institution: '',
  fonction: '',
  specialite: '',
  motivation: '',
  cv: null as File | null,
})

const cvFileName = ref('')
const isSubmitting = ref(false)
const isSubmitted = ref(false)
const referenceNumber = ref('')
const error = ref<string | null>(null)

// Liste des pays francophones
const countries = [
  { code: 'DZ', name_fr: 'Algérie', name_en: 'Algeria', name_ar: 'الجزائر' },
  { code: 'BJ', name_fr: 'Bénin', name_en: 'Benin', name_ar: 'بنين' },
  { code: 'BF', name_fr: 'Burkina Faso', name_en: 'Burkina Faso', name_ar: 'بوركينا فاسو' },
  { code: 'BI', name_fr: 'Burundi', name_en: 'Burundi', name_ar: 'بوروندي' },
  { code: 'CM', name_fr: 'Cameroun', name_en: 'Cameroon', name_ar: 'الكاميرون' },
  { code: 'CF', name_fr: 'Centrafrique', name_en: 'Central African Republic', name_ar: 'جمهورية أفريقيا الوسطى' },
  { code: 'TD', name_fr: 'Tchad', name_en: 'Chad', name_ar: 'تشاد' },
  { code: 'KM', name_fr: 'Comores', name_en: 'Comoros', name_ar: 'جزر القمر' },
  { code: 'CG', name_fr: 'Congo', name_en: 'Congo', name_ar: 'الكونغو' },
  { code: 'CD', name_fr: 'RD Congo', name_en: 'DR Congo', name_ar: 'الكونغو الديمقراطية' },
  { code: 'CI', name_fr: 'Côte d\'Ivoire', name_en: 'Ivory Coast', name_ar: 'ساحل العاج' },
  { code: 'DJ', name_fr: 'Djibouti', name_en: 'Djibouti', name_ar: 'جيبوتي' },
  { code: 'EG', name_fr: 'Égypte', name_en: 'Egypt', name_ar: 'مصر' },
  { code: 'GA', name_fr: 'Gabon', name_en: 'Gabon', name_ar: 'الغابون' },
  { code: 'GN', name_fr: 'Guinée', name_en: 'Guinea', name_ar: 'غينيا' },
  { code: 'GW', name_fr: 'Guinée-Bissau', name_en: 'Guinea-Bissau', name_ar: 'غينيا بيساو' },
  { code: 'GQ', name_fr: 'Guinée équatoriale', name_en: 'Equatorial Guinea', name_ar: 'غينيا الاستوائية' },
  { code: 'MG', name_fr: 'Madagascar', name_en: 'Madagascar', name_ar: 'مدغشقر' },
  { code: 'ML', name_fr: 'Mali', name_en: 'Mali', name_ar: 'مالي' },
  { code: 'MA', name_fr: 'Maroc', name_en: 'Morocco', name_ar: 'المغرب' },
  { code: 'MR', name_fr: 'Mauritanie', name_en: 'Mauritania', name_ar: 'موريتانيا' },
  { code: 'MU', name_fr: 'Maurice', name_en: 'Mauritius', name_ar: 'موريشيوس' },
  { code: 'NE', name_fr: 'Niger', name_en: 'Niger', name_ar: 'النيجر' },
  { code: 'RW', name_fr: 'Rwanda', name_en: 'Rwanda', name_ar: 'رواندا' },
  { code: 'SN', name_fr: 'Sénégal', name_en: 'Senegal', name_ar: 'السنغال' },
  { code: 'SC', name_fr: 'Seychelles', name_en: 'Seychelles', name_ar: 'سيشل' },
  { code: 'TG', name_fr: 'Togo', name_en: 'Togo', name_ar: 'توغو' },
  { code: 'TN', name_fr: 'Tunisie', name_en: 'Tunisia', name_ar: 'تونس' },
  { code: 'VN', name_fr: 'Vietnam', name_en: 'Vietnam', name_ar: 'فيتنام' },
  { code: 'OTHER', name_fr: 'Autre', name_en: 'Other', name_ar: 'آخر' },
]

const getCountryName = (country: typeof countries[0]) => {
  if (locale.value === 'en') return country.name_en
  if (locale.value === 'ar') return country.name_ar
  return country.name_fr
}

// Gestion upload fichier
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files?.[0]) {
    const file = target.files[0]
    if (file.size > 5 * 1024 * 1024) {
      error.value = t('careers.application.cvSizeError')
      return
    }
    if (file.type !== 'application/pdf') {
      error.value = t('careers.application.cvTypeError')
      return
    }
    formData.cv = file
    cvFileName.value = file.name
    error.value = null
  }
}

// Soumission
const handleSubmit = async () => {
  isSubmitting.value = true
  error.value = null

  try {
    // Étape 1 : Upload CV si présent
    let cvMediaId: string | null = null
    if (formData.cv) {
      const uploadResult = await uploadDocument(formData.cv)
      cvMediaId = uploadResult.id
    }

    // Étape 2 : Soumettre la candidature
    const result = await submitSpontaneous({
      salutation: formData.civilite || undefined,
      last_name: formData.nom,
      first_name: formData.prenom,
      email: formData.email,
      phone: formData.telephone || undefined,
      country_external_id: formData.pays || undefined,
      employer_name: formData.institution || undefined,
      job_title: formData.fonction || undefined,
      current_job: formData.specialite || undefined,
      motivation_text: formData.motivation || undefined,
      has_work_experience: true,
      employment_status: 'teacher',
      documents: cvMediaId
        ? [{ document_name: 'Curriculum Vitae', media_external_id: cvMediaId }]
        : [],
    })

    referenceNumber.value = result.reference_number
    isSubmitted.value = true
  }
  catch (err: any) {
    error.value = err?.data?.detail || t('careers.application.error')
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="bg-grid-pattern">
    <!-- Hero -->
    <PageHero
      :title="t('careers.application.hero.title')"
      :subtitle="t('careers.application.hero.subtitle')"
      image="/images/bg/hero_section_default_backgroune.jpeg"
      :breadcrumb="breadcrumb"
    />

    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <!-- État succès -->
      <div
        v-if="isSubmitted"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center"
      >
        <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <font-awesome-icon icon="fa-solid fa-check" class="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {{ t('careers.application.success.title') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          {{ t('careers.application.success.message') }}
        </p>
        <div v-if="referenceNumber" class="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {{ t('careers.application.success.reference') }}
          </p>
          <p class="text-lg font-mono font-bold text-brand-blue-600 dark:text-brand-blue-400">
            {{ referenceNumber }}
          </p>
        </div>
        <NuxtLink
          :to="localePath('/nousrejoindre')"
          class="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-semibold rounded-full transition-colors"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
          {{ t('careers.application.success.back') }}
        </NuxtLink>
      </div>

      <!-- Formulaire -->
      <form
        v-else
        class="space-y-8"
        @submit.prevent="handleSubmit"
      >
        <!-- Titre -->
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {{ t('careers.application.form.title') }}
          </h2>
          <p class="text-gray-600 dark:text-gray-300">
            {{ t('careers.application.form.subtitle') }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-3">
            {{ t('careers.application.form.callsHint') }}
            <NuxtLink
              :to="localePath('/actualites/appels?type=recruitment')"
              class="text-brand-blue-600 dark:text-brand-blue-400 hover:underline font-medium"
            >
              {{ t('careers.application.form.callsLink') }}
            </NuxtLink>
          </p>
        </div>

        <!-- Section 1 : Informations personnelles -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-user" class="w-5 h-5 text-brand-blue-500" />
            {{ t('careers.application.form.personalInfo') }}
          </h3>

          <!-- Civilité -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('careers.application.form.civilite') }}
            </label>
            <div class="flex gap-4">
              <label class="inline-flex items-center">
                <input
                  v-model="formData.civilite"
                  type="radio"
                  value="mr"
                  class="w-4 h-4 text-brand-blue-600 border-gray-300 focus:ring-brand-blue-500"
                />
                <span class="ms-2 text-gray-700 dark:text-gray-300">{{ t('careers.application.form.mr') }}</span>
              </label>
              <label class="inline-flex items-center">
                <input
                  v-model="formData.civilite"
                  type="radio"
                  value="mme"
                  class="w-4 h-4 text-brand-blue-600 border-gray-300 focus:ring-brand-blue-500"
                />
                <span class="ms-2 text-gray-700 dark:text-gray-300">{{ t('careers.application.form.mme') }}</span>
              </label>
            </div>
          </div>

          <!-- Nom & Prénom -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label for="nom" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('careers.application.form.nom') }} <span class="text-red-500">*</span>
              </label>
              <input
                id="nom"
                v-model="formData.nom"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label for="prenom" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('careers.application.form.prenom') }} <span class="text-red-500">*</span>
              </label>
              <input
                id="prenom"
                v-model="formData.prenom"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Email & Téléphone -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('careers.application.form.email') }} <span class="text-red-500">*</span>
              </label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label for="telephone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('careers.application.form.telephone') }}
              </label>
              <input
                id="telephone"
                v-model="formData.telephone"
                type="tel"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Pays -->
          <div>
            <label for="pays" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('careers.application.form.pays') }}
            </label>
            <select
              id="pays"
              v-model="formData.pays"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
            >
              <option value="" disabled>
                {{ t('careers.application.form.selectCountry') }}
              </option>
              <option
                v-for="country in countries"
                :key="country.code"
                :value="country.code"
              >
                {{ getCountryName(country) }}
              </option>
            </select>
          </div>
        </div>

        <!-- Section 2 : Informations professionnelles -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-briefcase" class="w-5 h-5 text-brand-blue-500" />
            {{ t('careers.application.form.professionalInfo') }}
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label for="institution" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('careers.application.form.institution') }}
              </label>
              <input
                id="institution"
                v-model="formData.institution"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label for="fonction" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('careers.application.form.fonction') }}
              </label>
              <input
                id="fonction"
                v-model="formData.fonction"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label for="specialite" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('careers.application.form.specialite') }}
            </label>
            <input
              id="specialite"
              v-model="formData.specialite"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Section 3 : Motivation -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-pen-fancy" class="w-5 h-5 text-brand-blue-500" />
            {{ t('careers.application.form.motivation') }}
          </h3>

          <textarea
            id="motivation"
            v-model="formData.motivation"
            rows="6"
            :placeholder="t('careers.application.form.motivationPlaceholder')"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <!-- Section 4 : CV -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-file-pdf" class="w-5 h-5 text-brand-blue-500" />
            {{ t('careers.application.form.cv') }}
          </h3>

          <div class="relative">
            <input
              type="file"
              accept=".pdf"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              @change="handleFileChange"
            />
            <div class="flex items-center gap-3 px-4 py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-brand-blue-500 transition-colors">
              <font-awesome-icon icon="fa-solid fa-cloud-arrow-up" class="w-8 h-8 text-gray-400" />
              <div class="flex-1">
                <span v-if="cvFileName" class="text-gray-900 dark:text-white font-medium">
                  {{ cvFileName }}
                </span>
                <span v-else class="text-gray-500 dark:text-gray-400">
                  {{ t('careers.application.form.selectFile') }}
                </span>
              </div>
              <span class="text-xs text-gray-400">{{ t('careers.application.form.maxSize') }}</span>
            </div>
          </div>
        </div>

        <!-- Erreur -->
        <div
          v-if="error"
          class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="w-4 h-4" />
            {{ error }}
          </p>
        </div>

        <!-- Bouton submit -->
        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full flex items-center justify-center gap-2 px-6 py-4 bg-lime-600 hover:bg-lime-700 disabled:bg-lime-400 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-lime-500/30"
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
          {{ isSubmitting ? t('careers.application.form.submitting') : t('careers.application.form.submit') }}
        </button>
      </form>
    </div>
  </div>
</template>
