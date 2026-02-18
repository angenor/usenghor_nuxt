<script setup lang="ts">
import { useFooterDataStore } from '~/stores/footerData'

const { t } = useI18n()
const localePath = useLocalePath()

const apiBase = useApiBase()

const email = ref('')
const firstName = ref('')
const lastName = ref('')
const isSubmitting = ref(false)
const submitStatus = ref<'success' | 'error' | null>(null)
const showNameModal = ref(false)

const currentYear = computed(() => new Date().getFullYear())

// Étape 1 : l'utilisateur entre son email et clique sur S'abonner → popup
const handleNewsletterSubmit = () => {
  if (!email.value || isSubmitting.value) return
  showNameModal.value = true
}

// Étape 2 : finaliser l'inscription depuis la popup
const finalizeSubscription = async () => {
  if (!email.value || isSubmitting.value) return

  isSubmitting.value = true
  submitStatus.value = null

  try {
    await $fetch(`${apiBase}/api/public/newsletter/subscribe`, {
      method: 'POST',
      body: {
        email: email.value.trim().toLowerCase(),
        first_name: firstName.value.trim() || undefined,
        last_name: lastName.value.trim() || undefined,
        source: 'website_form',
      },
    })
    showNameModal.value = false
    submitStatus.value = 'success'
    email.value = ''
    firstName.value = ''
    lastName.value = ''

    setTimeout(() => {
      submitStatus.value = null
    }, 5000)
  } catch {
    showNameModal.value = false
    submitStatus.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

// Données dynamiques du footer (réseaux sociaux, contact)
const footerStore = useFooterDataStore()

// Fallback statique pour les réseaux sociaux
const fallbackSocialLinks = [
  { name: 'facebook', icon: 'fa-brands fa-facebook-f', url: 'https://facebook.com/usenghor' },
  { name: 'twitter', icon: 'fa-brands fa-x-twitter', url: 'https://twitter.com/usenghor' },
  { name: 'linkedin', icon: 'fa-brands fa-linkedin-in', url: 'https://linkedin.com/school/usenghor' },
  { name: 'youtube', icon: 'fa-brands fa-youtube', url: 'https://youtube.com/usenghor' },
  { name: 'instagram', icon: 'fa-brands fa-instagram', url: 'https://instagram.com/usenghor' },
]

// Réseaux sociaux : API si disponibles, sinon fallback
const socialLinks = computed(() => {
  if (footerStore.socialLinks.length > 0) {
    const result = []
    for (const link of footerStore.socialLinks) {
      result.push({ name: link.platform, icon: link.icon, url: link.url })
    }
    return result
  }
  return fallbackSocialLinks
})

// Contact : API si disponible, sinon fallback i18n
const contactAddressText = computed(() => {
  const addr = footerStore.contactAddress
  if (addr) return `${addr.street}, ${addr.postal_code ? addr.postal_code + ' ' : ''}${addr.city}, ${addr.country}`
  return t('footer.contact.address')
})

const contactPhone = computed(() => {
  return footerStore.contactPhones?.main || t('footer.contact.phone')
})

const contactPhoneHref = computed(() => {
  const phone = footerStore.contactPhones?.main
  if (phone) return `tel:${phone.replace(/\s/g, '')}`
  return 'tel:+20348435044'
})

const contactEmail = computed(() => {
  return footerStore.contactEmails?.general || t('footer.contact.email')
})

const contactEmailHref = computed(() => {
  const addr = footerStore.contactEmails?.general
  if (addr) return `mailto:${addr}`
  return 'mailto:info@usenghor.org'
})

onMounted(() => {
  footerStore.fetchData()
})
</script>

<template>
  <footer id="footer" class="relative bg-gray-900 dark:bg-gray-950 text-white overflow-hidden">
    <!-- Decorative Background -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-brand-blue-500/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-red-500/10 rounded-full blur-3xl"></div>
      <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
    </div>

    <div class="relative">
      <!-- Newsletter Section -->
      <div class="border-b border-white/10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div class="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <!-- Newsletter Content -->
            <div>
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue-400 to-brand-blue-600 flex items-center justify-center">
                  <font-awesome-icon icon="fa-solid fa-envelope" class="w-5 h-5 text-white" />
                </div>
                <h3 class="text-2xl font-bold text-white">{{ t('footer.newsletter.title') }}</h3>
              </div>
              <p class="text-gray-400 text-lg mb-2">
                {{ t('footer.newsletter.description') }}
              </p>
            </div>

            <!-- Newsletter Form -->
            <div>
              <form @submit.prevent="handleNewsletterSubmit" class="space-y-4">
                <div class="flex flex-col sm:flex-row gap-3">
                  <div class="flex-1 relative">
                    <input
                      v-model="email"
                      type="email"
                      required
                      :placeholder="t('footer.newsletter.placeholder')"
                      :disabled="isSubmitting"
                      class="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50"
                    >
                  </div>
                  <button
                    type="submit"
                    :disabled="isSubmitting"
                    class="group px-8 py-4 bg-gradient-to-r from-brand-blue-500 to-brand-blue-600 text-white font-semibold rounded-xl transition-all duration-300 hover:from-brand-blue-600 hover:to-brand-blue-700 hover:shadow-lg hover:shadow-brand-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>{{ t('footer.newsletter.subscribe') }}</span>
                    <font-awesome-icon
                      icon="fa-solid fa-arrow-right"
                      class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </button>
                </div>

                <!-- Status Messages -->
                <Transition
                  enter-active-class="transition duration-300 ease-out"
                  enter-from-class="transform -translate-y-2 opacity-0"
                  enter-to-class="transform translate-y-0 opacity-100"
                  leave-active-class="transition duration-200 ease-in"
                  leave-from-class="transform translate-y-0 opacity-100"
                  leave-to-class="transform -translate-y-2 opacity-0"
                >
                  <div v-if="submitStatus === 'success'" class="flex items-center gap-2 text-green-400">
                    <font-awesome-icon icon="fa-solid fa-check-circle" class="w-4 h-4" />
                    <span class="text-sm">{{ t('footer.newsletter.success') }}</span>
                  </div>
                  <div v-else-if="submitStatus === 'error'" class="flex items-center gap-2 text-red-400">
                    <font-awesome-icon icon="fa-solid fa-exclamation-circle" class="w-4 h-4" />
                    <span class="text-sm">{{ t('footer.newsletter.error') }}</span>
                  </div>
                </Transition>

                <p class="text-xs text-gray-500">
                  {{ t('footer.newsletter.privacy') }}
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Footer Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">
          <!-- Logo vertical -->
          <div class="col-span-2 md:col-span-3 lg:col-span-2 flex flex-col">
            <div class="flex-1 flex flex-col items-start justify-between">
              <!-- Logo blanc pour le footer sombre -->
              <img
                src="/images/logos/senghor_logo_vertical_blanc.png"
                alt="Université Senghor"
                class="h-24 lg:h-28 w-auto object-contain"
              />

              <!-- Social Links -->
              <div class="flex gap-3 mt-6">
                <a
                  v-for="social in socialLinks"
                  :key="social.name"
                  :href="social.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-gray-400 hover:bg-brand-blue-500 hover:text-white transition-all duration-300 hover:scale-110"
                  :aria-label="social.name"
                >
                  <font-awesome-icon :icon="social.icon" class="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <!-- Programs -->
          <div>
            <h4 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {{ t('footer.programs.title') }}
            </h4>
            <ul class="space-y-3">
              <li>
                <NuxtLink :to="localePath('/formations/masters')" class="text-gray-400 hover:text-brand-blue-400 transition-colors duration-300">
                  {{ t('footer.programs.masters') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink :to="localePath('/formations/diplomes-universitaires')" class="text-gray-400 hover:text-brand-blue-400 transition-colors duration-300">
                  {{ t('footer.programs.diplomas') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink :to="localePath('/formations/certifiantes')" class="text-gray-400 hover:text-brand-blue-400 transition-colors duration-300">
                  {{ t('footer.programs.certifications') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink :to="localePath('/formations/doctorat')" class="text-gray-400 hover:text-brand-blue-400 transition-colors duration-300">
                  {{ t('footer.programs.doctorate') }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- University -->
          <div>
            <h4 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {{ t('footer.university.title') }}
            </h4>
            <ul class="space-y-3">
              <li>
                <NuxtLink :to="localePath('/a-propos')" class="text-gray-400 hover:text-brand-blue-400 transition-colors duration-300">
                  {{ t('footer.university.about') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink :to="localePath('/a-propos/strategie')" class="text-gray-400 hover:text-brand-blue-400 transition-colors duration-300">
                  {{ t('footer.university.mission') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink :to="localePath('/a-propos/organisation')" class="text-gray-400 hover:text-brand-blue-400 transition-colors duration-300">
                  {{ t('footer.university.governance') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink :to="localePath('/site')" class="text-gray-400 hover:text-brand-blue-400 transition-colors duration-300">
                  {{ t('footer.university.campus') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink :to="localePath('/a-propos/histoire')" class="text-gray-400 hover:text-brand-blue-400 transition-colors duration-300">
                  {{ t('footer.university.history') }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Resources -->
          <div>
            <h4 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {{ t('footer.resources.title') }}
            </h4>
            <ul class="space-y-3">
              <li>
                <NuxtLink :to="localePath('/actualites')" class="text-gray-400 hover:text-brand-blue-400 transition-colors duration-300">
                  {{ t('footer.resources.news') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink :to="localePath('/actualites/evenements')" class="text-gray-400 hover:text-brand-blue-400 transition-colors duration-300">
                  {{ t('footer.resources.events') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink :to="localePath('/carrieres')" class="text-gray-400 hover:text-brand-blue-400 transition-colors duration-300">
                  {{ t('footer.resources.jobs') }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Network -->
          <div>
            <h4 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {{ t('footer.network.title') }}
            </h4>
            <ul class="space-y-3">
              <li>
                <NuxtLink :to="localePath('/alumni')" class="text-gray-400 hover:text-brand-blue-400 transition-colors duration-300">
                  {{ t('footer.network.alumni') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink :to="localePath('/a-propos/partenaires')" class="text-gray-400 hover:text-brand-blue-400 transition-colors duration-300">
                  {{ t('footer.network.partners') }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="mt-12 pt-8 border-t border-white/10">
          <div class="grid md:grid-cols-3 gap-6">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <font-awesome-icon icon="fa-solid fa-location-dot" class="w-4 h-4 text-brand-blue-400" />
              </div>
              <div>
                <h5 class="text-sm font-medium text-white mb-1">{{ t('footer.contact.addressTitle') }}</h5>
                <p class="text-sm text-gray-400">{{ contactAddressText }}</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <font-awesome-icon icon="fa-solid fa-phone" class="w-4 h-4 text-brand-blue-400" />
              </div>
              <div>
                <h5 class="text-sm font-medium text-white mb-1">{{ t('footer.contact.phoneTitle') }}</h5>
                <a :href="contactPhoneHref" class="text-sm text-gray-400 hover:text-brand-blue-400 transition-colors">
                  {{ contactPhone }}
                </a>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <font-awesome-icon icon="fa-solid fa-envelope" class="w-4 h-4 text-brand-blue-400" />
              </div>
              <div>
                <h5 class="text-sm font-medium text-white mb-1">Email</h5>
                <a :href="contactEmailHref" class="text-sm text-gray-400 hover:text-brand-blue-400 transition-colors">
                  {{ contactEmail }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-white/10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <!-- Copyright -->
            <div class="flex flex-col sm:flex-row items-center gap-2 text-sm text-gray-400">
              <span>© {{ t('footer.bottom.copyright', { year: currentYear }) }}</span>
              <span class="hidden sm:inline">•</span>
              <span class="flex items-center gap-2">
                <font-awesome-icon icon="fa-solid fa-globe" class="w-4 h-4 text-brand-blue-400" />
                {{ t('footer.bottom.oif') }}
              </span>
            </div>

            <!-- Legal Links -->
          </div>
        </div>
      </div>
    </div>
  </footer>

  <!-- Modal nom/prénom -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showNameModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
        @click.self="finalizeSubscription"
      >
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div
            v-if="showNameModal"
            class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800"
          >
            <div class="mb-5 flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue-400 to-brand-blue-600">
                <font-awesome-icon icon="fa-solid fa-user" class="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ t('footer.newsletter.modalTitle') }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ email }}
                </p>
              </div>
            </div>

            <p class="mb-4 text-sm text-gray-600 dark:text-gray-300">
              {{ t('footer.newsletter.modalDescription') }}
            </p>

            <div class="mb-5 space-y-3">
              <input
                v-model="firstName"
                type="text"
                :placeholder="t('footer.newsletter.firstNamePlaceholder')"
                :disabled="isSubmitting"
                class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
              >
              <input
                v-model="lastName"
                type="text"
                :placeholder="t('footer.newsletter.lastNamePlaceholder')"
                :disabled="isSubmitting"
                class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
              >
            </div>

            <div class="flex gap-3">
              <button
                :disabled="isSubmitting"
                class="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="finalizeSubscription"
              >
                {{ t('footer.newsletter.skipButton') }}
              </button>
              <button
                :disabled="isSubmitting"
                class="flex-1 rounded-xl bg-gradient-to-r from-brand-blue-500 to-brand-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:from-brand-blue-600 hover:to-brand-blue-700 disabled:opacity-50"
                @click="finalizeSubscription"
              >
                <font-awesome-icon
                  v-if="isSubmitting"
                  icon="fa-solid fa-spinner"
                  spin
                  class="mr-2 h-4 w-4"
                />
                {{ t('footer.newsletter.confirmButton') }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
