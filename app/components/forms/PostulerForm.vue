<script setup lang="ts">
interface Props {
  callTitle: string
  projectTitle: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'submitted'): void
}>()

const { t, locale } = useI18n()

// Form data
const formData = reactive({
  civilite: '',
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  pays: '',
  organisation: '',
  fonction: '',
  motivation: '',
  cv: null as File | null
})

// Form state
const isSubmitting = ref(false)
const cvFileName = ref('')

// Handle file input
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    if (file.size > 5 * 1024 * 1024) {
      alert(locale.value === 'ar' ? 'الحجم الأقصى 5 ميجابايت' : locale.value === 'en' ? 'Maximum size is 5MB' : 'Taille maximale : 5 Mo')
      return
    }
    formData.cv = file
    cvFileName.value = file.name
  }
}

// Submit form
const handleSubmit = async () => {
  isSubmitting.value = true

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))

  isSubmitting.value = false
  emit('submitted')
}

// Countries list (simplified)
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
  { code: 'OTHER', name_fr: 'Autre', name_en: 'Other', name_ar: 'آخر' }
]

const getCountryName = (country: typeof countries[0]) => {
  if (locale.value === 'en') return country.name_en
  if (locale.value === 'ar') return country.name_ar
  return country.name_fr
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Civilité -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ t('projets.postuler.form.civilite') }} <span class="text-red-500">*</span>
      </label>
      <div class="flex gap-4">
        <label class="inline-flex items-center">
          <input
            v-model="formData.civilite"
            type="radio"
            value="mr"
            required
            class="w-4 h-4 text-brand-blue-600 border-gray-300 focus:ring-brand-blue-500"
          />
          <span class="ms-2 text-gray-700 dark:text-gray-300">{{ t('projets.postuler.form.mr') }}</span>
        </label>
        <label class="inline-flex items-center">
          <input
            v-model="formData.civilite"
            type="radio"
            value="mme"
            required
            class="w-4 h-4 text-brand-blue-600 border-gray-300 focus:ring-brand-blue-500"
          />
          <span class="ms-2 text-gray-700 dark:text-gray-300">{{ t('projets.postuler.form.mme') }}</span>
        </label>
      </div>
    </div>

    <!-- Nom et Prénom -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="nom" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ t('projets.postuler.form.nom') }} <span class="text-red-500">*</span>
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
          {{ t('projets.postuler.form.prenom') }} <span class="text-red-500">*</span>
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

    <!-- Email et Téléphone -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ t('projets.postuler.form.email') }} <span class="text-red-500">*</span>
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
          {{ t('projets.postuler.form.telephone') }} <span class="text-red-500">*</span>
        </label>
        <input
          id="telephone"
          v-model="formData.telephone"
          type="tel"
          required
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <!-- Pays -->
    <div>
      <label for="pays" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ t('projets.postuler.form.pays') }} <span class="text-red-500">*</span>
      </label>
      <select
        id="pays"
        v-model="formData.pays"
        required
        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
      >
        <option value="" disabled>{{ locale === 'ar' ? 'اختر بلداً' : locale === 'en' ? 'Select a country' : 'Sélectionnez un pays' }}</option>
        <option
          v-for="country in countries"
          :key="country.code"
          :value="country.code"
        >
          {{ getCountryName(country) }}
        </option>
      </select>
    </div>

    <!-- Organisation et Fonction -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="organisation" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ t('projets.postuler.form.organisation') }}
        </label>
        <input
          id="organisation"
          v-model="formData.organisation"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label for="fonction" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ t('projets.postuler.form.fonction') }}
        </label>
        <input
          id="fonction"
          v-model="formData.fonction"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <!-- Motivation -->
    <div>
      <label for="motivation" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ t('projets.postuler.form.motivation') }} <span class="text-red-500">*</span>
      </label>
      <textarea
        id="motivation"
        v-model="formData.motivation"
        required
        rows="5"
        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent resize-none"
      ></textarea>
    </div>

    <!-- CV Upload -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ t('projets.postuler.form.cv') }} <span class="text-red-500">*</span>
      </label>
      <div class="relative">
        <input
          type="file"
          accept=".pdf"
          required
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          @change="handleFileChange"
        />
        <div class="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-brand-blue-500 transition-colors">
          <font-awesome-icon icon="fa-solid fa-file-pdf" class="w-6 h-6 text-gray-400" />
          <div class="flex-1">
            <span v-if="cvFileName" class="text-gray-900 dark:text-white font-medium">
              {{ cvFileName }}
            </span>
            <span v-else class="text-gray-500 dark:text-gray-400">
              {{ t('projets.postuler.form.selectFile') }}
            </span>
          </div>
          <span class="text-xs text-gray-400">{{ t('projets.postuler.form.maxSize') }}</span>
        </div>
      </div>
    </div>

    <!-- Submit button -->
    <div class="pt-4">
      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue-600 hover:bg-brand-blue-700 disabled:bg-brand-blue-400 text-white font-bold rounded-lg transition-colors"
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
        {{ t('projets.postuler.form.submit') }}
      </button>
    </div>
  </form>
</template>
