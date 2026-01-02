<script setup lang="ts">
const { t, tm } = useI18n()
const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeIn', threshold: 0.1 })

// Get translated arrays
const partnerTypes = computed(() => tm('careers.partners.types.items') as any[])

// Form state
const form = reactive({
  name: '',
  email: '',
  organization: '',
  type: '',
  message: ''
})

const isSubmitting = ref(false)
const submitStatus = ref<'idle' | 'success' | 'error'>('idle')

// Handle form submission
const handleSubmit = async () => {
  isSubmitting.value = true
  submitStatus.value = 'idle'

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // In production, you would send the form data to your API
    console.log('Form submitted:', form)

    submitStatus.value = 'success'
    // Reset form
    form.name = ''
    form.email = ''
    form.organization = ''
    form.type = ''
    form.message = ''
  } catch (error) {
    submitStatus.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section
    id="partenaires"
    ref="sectionRef"
    class="py-16 lg:py-24 bg-white dark:bg-gray-900 transition-colors duration-300 scroll-mt-20"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="max-w-3xl mx-auto text-center mb-12">
        <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
          <font-awesome-icon icon="fa-solid fa-handshake" class="w-3.5 h-3.5 mr-2" />
          {{ t('careers.opportunities.partners.title') }}
        </span>
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {{ t('careers.partners.title') }}
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          {{ t('careers.partners.text') }}
        </p>
      </div>

      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16">
        <!-- Partner types -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {{ t('careers.partners.types.title') }}
          </h3>
          <div class="space-y-4">
            <div
              v-for="(type, index) in partnerTypes"
              :key="index"
              class="flex items-start gap-4 p-5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
            >
              <div class="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <font-awesome-icon
                  :icon="type.icon"
                  class="w-5 h-5 text-amber-600 dark:text-amber-400"
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
              {{ t('careers.partners.form.title') }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {{ t('careers.partners.form.text') }}
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
                  class="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
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
                  class="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
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
                  class="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
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
                  class="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
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
                  class="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors resize-none"
                ></textarea>
              </div>

              <!-- Submit -->
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30"
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
