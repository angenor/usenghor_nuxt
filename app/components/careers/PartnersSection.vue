<script setup lang="ts">
const { t, tm } = useI18n()
const { getContent, getRawContent } = useEditorialContent('careers')
const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeIn', threshold: 0.1 })
const { submitRequest } = usePartnershipRequestsApi()

// Types de partenariats avec override éditorial
const partnerTypes = computed(() => {
  const i18nItems = tm('careers.partners.types.items') as any[]
  return [1, 2].map((n, i) => ({
    icon: getRawContent(`careers.partners.types.item${n}.icon`) ?? i18nItems[i]?.icon ?? '',
    title: getRawContent(`careers.partners.types.item${n}.title`) ?? i18nItems[i]?.title ?? '',
    text: getRawContent(`careers.partners.types.item${n}.text`) ?? i18nItems[i]?.text ?? '',
  }))
})

// Form state
const form = reactive({
  name: '',
  email: '',
  organization: '',
  type: '',
  message: '',
})

const isSubmitting = ref(false)
const submitStatus = ref<'idle' | 'success' | 'error'>('idle')

// Handle form submission
const handleSubmit = async () => {
  isSubmitting.value = true
  submitStatus.value = 'idle'

  try {
    await submitRequest({
      contact_name: form.name,
      email: form.email,
      organization: form.organization,
      type: form.type as 'academic' | 'institutional' | 'business' | 'other',
      message: form.message || undefined,
    })

    submitStatus.value = 'success'
    // Reset form
    form.name = ''
    form.email = ''
    form.organization = ''
    form.type = ''
    form.message = ''
  }
  catch (error) {
    submitStatus.value = 'error'
    console.error('Erreur soumission demande de partenariat:', error)
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section
    id="partenaires"
    ref="sectionRef"
    class="py-16 lg:py-24 bg-white dark:bg-gray-900 bg-grid-pattern transition-colors duration-300 scroll-mt-20"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="max-w-3xl mx-auto text-center mb-12">
        <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-brand-blue-100 dark:bg-brand-blue-900/30 text-brand-blue-700 dark:text-brand-blue-400">
          <font-awesome-icon icon="fa-solid fa-handshake" class="w-3.5 h-3.5 mr-2" />
          {{ t('careers.opportunities.partners.title') }}
        </span>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          <span class="relative inline-block">
            {{ getContent('careers.partners.title') }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
          </span>
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          {{ getContent('careers.partners.text') }}
        </p>
      </div>

      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16">
        <!-- Partner types -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {{ getContent('careers.partners.types.title') }}
          </h3>
          <div class="space-y-4">
            <div
              v-for="(type, index) in partnerTypes"
              :key="index"
              class="flex items-start gap-4 p-5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
            >
              <div class="w-12 h-12 rounded-xl bg-brand-red-100 dark:bg-brand-red-900/30 flex items-center justify-center flex-shrink-0">
                <font-awesome-icon
                  :icon="type.icon"
                  class="w-5 h-5 text-brand-red-600 dark:text-brand-red-400"
                />
              </div>
              <div>
                <h4 class="font-semibold text-gray-900 dark:text-white mb-1">
                  {{ type.title }}
                </h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ type.text }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact form -->
        <div>
          <div class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {{ getContent('careers.partners.form.title') }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {{ getContent('careers.partners.form.text') }}
            </p>

            <form @submit.prevent="handleSubmit" class="space-y-4">
              <!-- Name -->
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('careers.partners.form.name') }}
                </label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('careers.partners.form.email') }}
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <!-- Organization -->
              <div>
                <label for="organization" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('careers.partners.form.organization') }}
                </label>
                <input
                  id="organization"
                  v-model="form.organization"
                  type="text"
                  required
                  class="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <!-- Type -->
              <div>
                <label for="type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('careers.partners.form.type') }}
                </label>
                <select
                  id="type"
                  v-model="form.type"
                  required
                  class="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="" disabled>--</option>
                  <option value="academic">{{ t('careers.partners.form.type_options.academic') }}</option>
                  <option value="institutional">{{ t('careers.partners.form.type_options.institutional') }}</option>
                  <option value="business">{{ t('careers.partners.form.type_options.business') }}</option>
                  <option value="other">{{ t('careers.partners.form.type_options.other') }}</option>
                </select>
              </div>

              <!-- Message -->
              <div>
                <label for="message" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('careers.partners.form.message') }}
                </label>
                <textarea
                  id="message"
                  v-model="form.message"
                  rows="4"
                  required
                  class="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent transition-colors resize-none"
                ></textarea>
              </div>

              <!-- Submit -->
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue-500 hover:bg-brand-blue-600 disabled:bg-brand-blue-400 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-brand-blue-500/30"
              >
                <font-awesome-icon
                  v-if="isSubmitting"
                  icon="fa-solid fa-spinner"
                  class="w-4 h-4 animate-spin"
                />
                <font-awesome-icon
                  v-else
                  icon="fa-solid fa-paper-plane"
                  class="w-4 h-4"
                />
                {{ t('careers.partners.form.submit') }}
              </button>

              <!-- Status messages -->
              <p
                v-if="submitStatus === 'success'"
                class="text-sm text-green-600 dark:text-green-400 text-center"
              >
                {{ t('careers.partners.form.success') }}
              </p>
              <p
                v-if="submitStatus === 'error'"
                class="text-sm text-red-600 dark:text-red-400 text-center"
              >
                {{ t('careers.partners.form.error') }}
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
