<script setup lang="ts">
const { t, locale, setLocale } = useI18n()
const localePath = useLocalePath()
const { isDark, toggle: originalToggleDarkMode } = useDarkMode()

const props = withDefaults(defineProps<{
  campusName: string
  countryFlag?: string
}>(), {
  countryFlag: ''
})

// Scroll behavior
const isScrolled = ref(false)
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Search modal
const isSearchOpen = ref(false)
const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value
}
const closeSearch = () => {
  isSearchOpen.value = false
}

// Language dropdown
const languages = [
  { code: 'fr', name: 'Français', flag: 'https://flagcdn.com/w40/fr.png' },
  { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
  { code: 'ar', name: 'العربية', flag: 'https://flagcdn.com/w40/eg.png' }
]

const isLanguageDropdownOpen = ref(false)
const currentLanguage = computed(() => {
  return languages.find(l => l.code === locale.value) || languages[0]
})

const changeLanguage = (langCode: string) => {
  setLocale(langCode)
  if (import.meta.client) {
    document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr'
  }
  isLanguageDropdownOpen.value = false
}

const toggleLanguageDropdown = () => {
  isLanguageDropdownOpen.value = !isLanguageDropdownOpen.value
}

const closeLanguageDropdown = () => {
  isLanguageDropdownOpen.value = false
}

// Dark mode toggle with toast
const showModeToast = ref(false)
let toastTimeout: ReturnType<typeof setTimeout> | null = null

const toggleDarkMode = () => {
  originalToggleDarkMode()
  showModeToast.value = true
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    showModeToast.value = false
  }, 2000)
}

// Mobile menu
const isMobileMenuOpen = ref(false)
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out"
    :class="[
      isScrolled
        ? 'bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/20 border-b border-gray-100 dark:border-gray-800'
        : 'bg-gradient-to-b from-black/50 to-transparent'
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <!-- Left Section: Logo + Campus Name -->
        <div class="flex items-center gap-4">
          <!-- Logo -->
          <NuxtLink :to="localePath('/')" class="flex items-center group flex-shrink-0">
            <img
              src="/images/logos/logo-web-noir-petit.png"
              alt="Université Senghor"
              class="h-10 sm:h-12 w-auto transition-all duration-300 group-hover:scale-105"
              :class="{ 'brightness-0 invert': !isScrolled || isDark }"
            />
          </NuxtLink>

          <!-- Separator -->
          <div
            class="hidden sm:block h-8 w-px"
            :class="isScrolled ? 'bg-gray-200 dark:bg-gray-700' : 'bg-white/30'"
          />

          <!-- Campus Name -->
          <div class="hidden sm:flex items-center gap-2">
            <span v-if="countryFlag" class="text-xl">{{ countryFlag }}</span>
            <h1
              class="text-lg font-bold truncate max-w-[200px] lg:max-w-[300px]"
              :class="[
                isScrolled
                  ? 'text-gray-900 dark:text-white'
                  : 'text-white'
              ]"
            >
              {{ campusName }}
            </h1>
          </div>
        </div>

        <!-- Right Section: Actions (Desktop) -->
        <div class="hidden md:flex items-center gap-2">
          <!-- Search Button -->
          <button
            @click="toggleSearch"
            class="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300"
            :class="[
              isScrolled
                ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                : 'text-white/90 hover:bg-white/10'
            ]"
          >
            <font-awesome-icon icon="fa-solid fa-magnifying-glass" class="w-4 h-4" />
          </button>

          <!-- Dark Mode Toggle -->
          <button
            @click="toggleDarkMode"
            class="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300"
            :class="[
              isScrolled
                ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                : 'text-white/90 hover:bg-white/10'
            ]"
          >
            <font-awesome-icon v-if="isDark" icon="fa-solid fa-sun" class="w-4 h-4" />
            <font-awesome-icon v-else icon="fa-solid fa-moon" class="w-4 h-4" />
          </button>

          <!-- Language Dropdown -->
          <div
            class="relative"
            @mouseenter="isLanguageDropdownOpen = true"
            @mouseleave="closeLanguageDropdown"
          >
            <button
              @click="toggleLanguageDropdown"
              class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-300"
              :class="[
                isScrolled
                  ? isLanguageDropdownOpen
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  : isLanguageDropdownOpen
                    ? 'bg-white/20 text-white'
                    : 'text-white/90 hover:bg-white/10'
              ]"
            >
              <img
                :src="currentLanguage.flag"
                :alt="currentLanguage.name"
                class="w-5 h-4 object-cover rounded-sm"
              />
              <span>{{ locale.toUpperCase() }}</span>
              <font-awesome-icon
                icon="fa-solid fa-chevron-down"
                class="w-3 h-3 transition-transform duration-300 opacity-60"
                :class="{ 'rotate-180': isLanguageDropdownOpen }"
              />
            </button>

            <!-- Language Dropdown Menu -->
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <div
                v-if="isLanguageDropdownOpen"
                class="absolute top-full ltr:right-0 rtl:left-0 mt-2 w-40 bg-white dark:bg-gray-900 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/30 border border-gray-100 dark:border-gray-800 overflow-hidden py-1"
              >
                <button
                  v-for="lang in languages"
                  :key="lang.code"
                  @click="changeLanguage(lang.code)"
                  class="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors duration-200"
                  :class="[
                    locale === lang.code
                      ? 'bg-brand-blue-50 dark:bg-brand-blue-900/20 text-brand-blue-700 dark:text-brand-blue-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  ]"
                >
                  <img
                    :src="lang.flag"
                    :alt="lang.name"
                    class="w-5 h-4 object-cover rounded-sm"
                  />
                  <span>{{ lang.name }}</span>
                  <font-awesome-icon
                    v-if="locale === lang.code"
                    icon="fa-solid fa-check"
                    class="w-3 h-3 ltr:ml-auto rtl:mr-auto text-brand-red-500"
                  />
                </button>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Mobile Menu Button -->
        <button
          @click="toggleMobileMenu"
          class="md:hidden p-2.5 rounded-xl transition-all duration-300"
          :class="[
            isScrolled
              ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              : 'text-white hover:bg-white/10'
          ]"
        >
          <font-awesome-icon v-if="!isMobileMenuOpen" icon="fa-solid fa-bars" class="w-6 h-6" />
          <font-awesome-icon v-else icon="fa-solid fa-xmark" class="w-6 h-6" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-2xl border-t border-gray-100 dark:border-gray-800"
      >
        <div class="px-4 py-6 space-y-4">
          <!-- Campus Name (Mobile) -->
          <div class="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <span v-if="countryFlag" class="text-2xl">{{ countryFlag }}</span>
            <span class="text-lg font-bold text-gray-900 dark:text-white">{{ campusName }}</span>
          </div>

          <!-- Search Button Mobile -->
          <button
            @click="toggleSearch; isMobileMenuOpen = false"
            class="flex items-center gap-3 w-full px-4 py-3 text-gray-600 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <font-awesome-icon icon="fa-solid fa-magnifying-glass" class="w-4 h-4" />
            <span>{{ t('nav.search') }}</span>
          </button>

          <!-- Dark Mode Toggle Mobile -->
          <button
            @click="toggleDarkMode"
            class="flex items-center justify-center gap-3 w-full px-4 py-3 text-gray-600 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <font-awesome-icon v-if="isDark" icon="fa-solid fa-sun" class="w-4 h-4 text-brand-red-400" />
            <font-awesome-icon v-else icon="fa-solid fa-moon" class="w-4 h-4 text-gray-400" />
            <span>{{ isDark ? t('theme.lightMode') : t('theme.darkMode') }}</span>
          </button>

          <!-- Language Selection Mobile -->
          <div class="p-2 rounded-xl border border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-400 px-2 mb-2 font-medium uppercase tracking-wide">
              <font-awesome-icon icon="fa-solid fa-globe" class="w-3 h-3 mr-1" />
              {{ t('nav.language') }}
            </p>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="lang in languages"
                :key="lang.code"
                @click="changeLanguage(lang.code)"
                class="flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200"
                :class="[
                  locale === lang.code
                    ? 'bg-brand-blue-100 dark:bg-brand-blue-900/30 text-brand-blue-700 dark:text-brand-blue-400 ring-2 ring-brand-blue-500/50'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                ]"
              >
                <img
                  :src="lang.flag"
                  :alt="lang.name"
                  class="w-8 h-6 object-cover rounded-sm shadow-sm"
                />
                <span class="text-xs font-medium">{{ lang.code.toUpperCase() }}</span>
              </button>
            </div>
          </div>

          <!-- Back to Main Site -->
          <NuxtLink
            :to="localePath('/')"
            class="flex items-center justify-center gap-2 w-full px-4 py-4 text-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 shadow-lg"
            @click="isMobileMenuOpen = false"
          >
            <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
            <span>{{ t('nav.backToMainSite') }}</span>
          </NuxtLink>
        </div>
      </div>
    </Transition>

    <!-- Search Modal -->
    <SearchModal :is-open="isSearchOpen" @close="closeSearch" />

    <!-- Dark Mode Toast -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="showModeToast"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-3 rounded-full shadow-xl backdrop-blur-lg"
        :class="isDark ? 'bg-gray-800/90 text-white' : 'bg-white/90 text-gray-900'"
      >
        <font-awesome-icon
          :icon="isDark ? 'fa-solid fa-moon' : 'fa-solid fa-sun'"
          class="w-5 h-5"
          :class="isDark ? 'text-indigo-400' : 'text-brand-red-500'"
        />
        <span class="text-sm font-medium">{{ t(isDark ? 'theme.darkMode' : 'theme.lightMode') }}</span>
      </div>
    </Transition>
  </nav>
</template>
