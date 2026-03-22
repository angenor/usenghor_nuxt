<script setup lang="ts">
const props = withDefaults(defineProps<{
  slug: string
  isActive?: boolean
}>(), {
  isActive: true,
})

const emit = defineEmits<{
  success: []
}>()

const { t } = useI18n()
const { submitInterest } = usePublicFundraisingApi()

const showForm = ref(false)
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const fullName = ref('')
const email = ref('')
const message = ref('')
const honeypot = ref('')

let formOpenedAt = 0

function toggleForm() {
  showForm.value = !showForm.value
  if (showForm.value && formOpenedAt === 0) {
    formOpenedAt = Math.floor(Date.now() / 1000)
  }
}

function isValidEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
}

async function onSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!fullName.value.trim() || !email.value.trim()) {
    errorMessage.value = t('leveesDeFonds.interest.error')
    return
  }

  if (!isValidEmail(email.value.trim())) {
    errorMessage.value = t('leveesDeFonds.interest.error')
    return
  }

  const challengeToken = btoa(String(formOpenedAt) + 'usenghor-antispam')

  loading.value = true

  try {
    await submitInterest(props.slug, {
      full_name: fullName.value.trim(),
      email: email.value.trim(),
      message: message.value.trim(),
      honeypot: honeypot.value,
      challenge_token: challengeToken,
    })

    successMessage.value = t('leveesDeFonds.interest.success')
    fullName.value = ''
    email.value = ''
    message.value = ''
    emit('success')
  }
  catch {
    errorMessage.value = t('leveesDeFonds.interest.error')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="isActive" class="mt-8">
    <!-- Toggle button -->
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-700 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:ring-offset-2 dark:bg-brand-blue-500 dark:hover:bg-brand-blue-600 dark:focus:ring-offset-gray-900"
      @click="toggleForm"
    >
      {{ t('leveesDeFonds.interest.button') }}
      <svg
        class="size-4 transition-transform"
        :class="{ 'rotate-180': showForm }"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </button>

    <!-- Form -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-[600px] opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="max-h-[600px] opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div v-if="showForm" class="mt-6 overflow-hidden">
        <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 class="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
            {{ t('leveesDeFonds.interest.title') }}
          </h3>
          <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
            {{ t('leveesDeFonds.interest.subtitle') }}
          </p>

          <!-- Success message -->
          <div
            v-if="successMessage"
            class="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
          >
            {{ successMessage }}
          </div>

          <!-- Error message -->
          <div
            v-if="errorMessage"
            class="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
          >
            {{ errorMessage }}
          </div>

          <form v-if="!successMessage" @submit.prevent="onSubmit">
            <!-- Honeypot -->
            <div class="absolute -left-[9999px] opacity-0" aria-hidden="true">
              <label for="interest-website">Website</label>
              <input
                id="interest-website"
                v-model="honeypot"
                type="text"
                name="website"
                tabindex="-1"
                autocomplete="off"
              >
            </div>

            <!-- Full name -->
            <div class="mb-4">
              <label
                for="interest-full-name"
                class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t('leveesDeFonds.interest.fullName') }} <span class="text-red-500">*</span>
              </label>
              <input
                id="interest-full-name"
                v-model="fullName"
                type="text"
                required
                :placeholder="t('leveesDeFonds.interest.fullNamePlaceholder')"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-brand-blue-400 dark:focus:ring-brand-blue-400"
              >
            </div>

            <!-- Email -->
            <div class="mb-4">
              <label
                for="interest-email"
                class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t('leveesDeFonds.interest.email') }} <span class="text-red-500">*</span>
              </label>
              <input
                id="interest-email"
                v-model="email"
                type="email"
                required
                :placeholder="t('leveesDeFonds.interest.emailPlaceholder')"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-brand-blue-400 dark:focus:ring-brand-blue-400"
              >
            </div>

            <!-- Message -->
            <div class="mb-6">
              <label
                for="interest-message"
                class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t('leveesDeFonds.interest.message') }}
              </label>
              <textarea
                id="interest-message"
                v-model="message"
                rows="4"
                :placeholder="t('leveesDeFonds.interest.messagePlaceholder')"
                class="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-brand-blue-400 dark:focus:ring-brand-blue-400"
              />
            </div>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="loading"
              class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-700 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-blue-500 dark:hover:bg-brand-blue-600 dark:focus:ring-offset-gray-900"
            >
              <svg
                v-if="loading"
                class="size-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ loading ? t('leveesDeFonds.interest.sending') : t('leveesDeFonds.interest.submit') }}
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>
