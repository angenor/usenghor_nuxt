<script setup lang="ts">
const { t, locale, setLocale } = useI18n()
const localePath = useLocalePath()
const { isDark, toggle: originalToggleDarkMode } = useDarkMode()

// Contenus éditoriaux pour les éléments globaux
const { getContent, getRawContent, loadContent } = useEditorialContent('global')
const editorialStore = useEditorialContentStore()

const isScrolled = ref(false)
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

const isMobileMenuOpen = ref(false)
const activeDropdown = ref<string | null>(null)
const expandedMobileMenus = ref<string[]>([])

// Primary nav items (displayed first with accent styling)
// Based on carte_mentale_senghor.md structure
const primaryNavItems = [
  {
    key: 'training',
    route: '/formations',
    hasDropdown: true,
    megaMenu: true,
    icon: 'fa-solid fa-graduation-cap',
    accent: true,
    featured: {
      image: '/images/bg/backgroud_senghor2.jpg',
      titleKey: 'featured',
      descKey: 'featuredDesc'
    },
    children: [
      { key: 'doctorate', route: '/formations/doctorat', icon: 'fa-solid fa-book-open' },
      { key: 'masters', route: '/formations/masters', icon: 'fa-solid fa-graduation-cap', badge: 'popular' },
      { key: 'universityDiplomas', route: '/formations/diplomes-universitaires', icon: 'fa-solid fa-award' },
      { key: 'certifications', route: '/formations/certifiantes', icon: 'fa-solid fa-certificate' },
      { key: 'externalCampus', route: '/a-propos/partenaires#campus-externalises', icon: 'fa-solid fa-building-columns' }
    ]
  },
  {
    key: 'news',
    route: '/actualites',
    hasDropdown: true,
    megaMenu: true,
    icon: 'fa-solid fa-newspaper',
    accent: true,
    featured: {
      image: '/images/bg/backgroud_senghor1.jpg',
      titleKey: 'featured',
      descKey: 'featuredDesc'
    },
    children: [
      { key: 'callsForApplications', route: '/actualites/appels', icon: 'fa-solid fa-bullhorn' },
      { key: 'recruitment', route: '/actualites/appels?type=recruitment', icon: 'fa-solid fa-briefcase' },
      { key: 'events', route: '/actualites/evenements', icon: 'fa-solid fa-calendar-days' },
      { key: 'allNews', route: '/actualites', icon: 'fa-solid fa-newspaper' }
    ]
  }
]

// Type pour les enfants de navigation (avec _label optionnel pour overrides éditoriaux)
interface NavChild {
  key: string
  route: string
  icon: string
  badge?: string
  _label?: string
}

interface SecondaryNavItem {
  key: string
  route: string
  icon: string
  children: NavChild[]
}

// Secondary nav items par défaut (grouped in "More" dropdown)
// Based on carte_mentale_senghor.md structure
const defaultSecondaryNavItems: SecondaryNavItem[] = [
  {
    key: 'about',
    route: '/a-propos',
    icon: 'fa-solid fa-info-circle',
    children: [
      { key: 'mission', route: '/a-propos', icon: 'fa-solid fa-bullseye' },
      { key: 'history', route: '/a-propos', icon: 'fa-solid fa-landmark' },
      { key: 'governance', route: '/a-propos', icon: 'fa-solid fa-sitemap' }
    ]
  },
  {
    key: 'projects',
    route: '/projets',
    icon: 'fa-solid fa-rocket',
    children: [
      { key: 'transformAction', route: '/projets/transformaction', icon: 'fa-solid fa-rocket', badge: 'flagship' },
      { key: 'kreAfrika', route: '/projets/kreafrika', icon: 'fa-solid fa-lightbulb' },
      { key: 'fundraising', route: '/projets/levee-de-fonds', icon: 'fa-solid fa-hand-holding-dollar' }
    ]
  },
  {
    key: 'alumni',
    route: '/alumni',
    icon: 'fa-solid fa-user-graduate',
    children: [
      { key: 'alumniNetwork', route: '/alumni/reseau', icon: 'fa-solid fa-users', badge: '4200+' },
      { key: 'alumniProgram', route: '/alumni/programme', icon: 'fa-solid fa-star' }
    ]
  },
  {
    key: 'site',
    route: '/site',
    icon: 'fa-solid fa-building-columns',
    children: [
      { key: 'housing', route: '/site', icon: 'fa-solid fa-house' },
      { key: 'library', route: '/site', icon: 'fa-solid fa-book' },
      { key: 'conferenceHall', route: '/site', icon: 'fa-solid fa-microphone' },
      { key: 'academicSpaces', route: '/site', icon: 'fa-solid fa-chalkboard' },
      { key: 'sports', route: '/site', icon: 'fa-solid fa-futbol' },
      { key: 'hotel', route: '/site', icon: 'fa-solid fa-hotel' }
    ]
  }
]

// Réactif pour permettre les overrides éditoriaux
const secondaryNavItems = ref<SecondaryNavItem[]>(defaultSecondaryNavItems)

// For mobile menu compatibility
const navItems = computed(() => [
  ...primaryNavItems,
  ...secondaryNavItems.value.map(item => ({ ...item, hasDropdown: true, megaMenu: false }))
])

// Dropdowns déroulés par défaut en mobile
const defaultExpandedMenus = navItems.value.filter(item => item.hasDropdown).map(item => item.key)
expandedMobileMenus.value = defaultExpandedMenus

const isMoreMenuOpen = ref(false)
const isSearchOpen = ref(false)

const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value
}

const closeSearch = () => {
  isSearchOpen.value = false
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (!isMobileMenuOpen.value) {
    expandedMobileMenus.value = [...defaultExpandedMenus]
  }
}

const languages = [
  { code: 'fr', name: 'Français', flag: 'https://flagcdn.com/w40/fr.png' },
  { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
  { code: 'ar', name: 'العربية', flag: 'https://flagcdn.com/w40/eg.png' }
]

const isLanguageDropdownOpen = ref(false)

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

const currentLanguage = computed(() => {
  return languages.find(l => l.code === locale.value) || languages[0]
})

const openDropdown = (key: string) => {
  activeDropdown.value = key
}

const closeDropdown = () => {
  activeDropdown.value = null
}

// Empêche la navigation directe sur les items avec dropdown :
// 1er clic → ouvre le dropdown, 2e clic → ferme le dropdown
// La navigation se fait via les liens dans le dropdown ("Explorer tout" ou sous-items)
const handleNavItemClick = (event: Event, itemKey: string) => {
  event.preventDefault()
  if (activeDropdown.value === itemKey) {
    activeDropdown.value = null
  } else {
    activeDropdown.value = itemKey
  }
}

const toggleMobileSubmenu = (key: string) => {
  const index = expandedMobileMenus.value.indexOf(key)
  if (index === -1) {
    expandedMobileMenus.value.push(key)
  } else {
    expandedMobileMenus.value.splice(index, 1)
  }
}

const isMobileSubmenuExpanded = (key: string) => {
  return expandedMobileMenus.value.includes(key)
}

// Bouton Candidater - valeurs éditables avec fallback
const applyButtonText = ref(t('nav.apply'))
const applyButtonLink = ref('/carrieres')

// Fonction pour mettre à jour les valeurs depuis le store
function updateApplyButtonValues() {
  const textValue = getRawContent('navbar.apply.text')
  const linkValue = getRawContent('navbar.apply.link')
  if (textValue) applyButtonText.value = textValue
  if (linkValue) applyButtonLink.value = linkValue
}

// Fonction pour mettre à jour les sous-menus secondaires depuis les overrides éditoriaux
function updateSecondaryNavItems() {
  secondaryNavItems.value = defaultSecondaryNavItems.map((section) => {
    const editorialJson = getRawContent(`navbar.secondary.${section.key}.children` as any)
    if (!editorialJson) return section

    try {
      const editorialChildren = JSON.parse(editorialJson) as Array<{
        id: string
        label: string
        route: string
        icon: string
        badge?: string
        sort_order: number
      }>

      if (!Array.isArray(editorialChildren) || editorialChildren.length === 0) return section

      return {
        ...section,
        children: editorialChildren
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(child => ({
            key: child.id,
            route: child.route,
            icon: child.icon,
            badge: child.badge,
            _label: child.label,
          })),
      }
    }
    catch {
      return section
    }
  })
}

// Chargement SSR non-bloquant du contenu éditorial (ne bloque pas le rendu de la page)
useLazyAsyncData('editorial-global', () => loadContent())

// Mise à jour quand les données éditoriales sont prêtes
watch(() => editorialStore.isPageLoaded('global'), (ready) => {
  if (ready) {
    updateApplyButtonValues()
    updateSecondaryNavItems()
  }
}, { immediate: true })

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
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
        <!-- Logo -->
        <div class="flex-shrink-0">
          <NuxtLink :to="localePath('/')" class="flex items-center group">
            <img
              src="/images/logos/logo-web-noir-petit.png"
              alt="Université Senghor"
              class="h-12 w-auto transition-all duration-300 group-hover:scale-105"
              :class="{ 'brightness-0 invert': !isScrolled || isDark }"
            />
          </NuxtLink>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden lg:flex items-center gap-2">
          <!-- Primary Nav Items (Accented) -->
          <div
            v-for="item in primaryNavItems"
            :key="item.key"
            class="relative group/primary"
            @mouseenter="openDropdown(item.key)"
            @mouseleave="closeDropdown"
          >
            <NuxtLink
              :to="localePath(item.route)"
              class="group relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 no-underline"
              :class="[
                isScrolled
                  ? activeDropdown === item.key
                    ? 'bg-brand-blue-500 text-white shadow-lg shadow-brand-blue-500/25'
                    : 'bg-brand-blue-50 dark:bg-brand-blue-900/20 text-brand-blue-700 dark:text-brand-blue-400 hover:bg-brand-blue-500 hover:text-white hover:shadow-lg hover:shadow-brand-blue-500/25'
                  : activeDropdown === item.key
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'bg-white/15 text-white backdrop-blur-sm hover:bg-white hover:text-gray-900'
              ]"
              @click="handleNavItemClick($event, item.key)"
            >
              <font-awesome-icon :icon="item.icon" class="w-4 h-4" />
              <span>{{ t(`nav.${item.key}`) }}</span>
              <font-awesome-icon
                icon="fa-solid fa-chevron-down"
                class="w-3 h-3 transition-transform duration-300 opacity-60"
                :class="{ 'rotate-180': activeDropdown === item.key }"
              />
            </NuxtLink>

            <!-- Mega Menu Dropdown — CSS hover (pré-hydratation) + JS state (post-hydratation) -->
            <div
              class="absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-300 ease-out"
              :class="activeDropdown === item.key
                ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                : 'opacity-0 invisible -translate-y-4 pointer-events-none group-hover/primary:opacity-100 group-hover/primary:visible group-hover/primary:translate-y-0 group-hover/primary:pointer-events-auto'"
            >
              <div class="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl shadow-black/15 dark:shadow-black/40 border border-gray-100 dark:border-gray-800 overflow-hidden w-[700px]">
                  <div class="flex">
                    <!-- Featured Section -->
                    <div class="w-64 relative overflow-hidden">
                      <img
                        :src="item.featured.image"
                        :alt="t(`nav.${item.key}`)"
                        class="absolute inset-0 w-full h-full object-cover"
                      />
                      <div class="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/85 to-gray-900/90"></div>
                      <div class="relative p-6 h-full flex flex-col justify-end min-h-[320px]">
                        <div class="mb-4">
                          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-sm border border-white/10">
                            <font-awesome-icon icon="fa-solid fa-star" class="w-3 h-3 mr-1.5 text-brand-blue-400" />
                            {{ t(`nav.dropdowns.${item.key}.${item.featured.titleKey}`) }}
                          </span>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-2">{{ t(`nav.${item.key}`) }}</h3>
                        <p class="text-white/70 text-sm leading-relaxed mb-4">{{ t(`nav.dropdowns.${item.key}.${item.featured.descKey}`) }}</p>
                        <NuxtLink
                          :to="localePath(item.route)"
                          class="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue-400 hover:text-brand-blue-300 hover:gap-3 transition-all duration-300"
                          @click="closeDropdown"
                        >
                          <span>{{ t('nav.exploreAll') }}</span>
                          <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
                        </NuxtLink>
                      </div>
                    </div>

                    <!-- Menu Items -->
                    <div class="flex-1 p-4">
                      <div class="grid grid-cols-2 gap-1">
                        <NuxtLink
                          v-for="child in item.children"
                          :key="child.key"
                          :to="localePath(child.route)"
                          class="group flex items-start gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          @click="closeDropdown"
                        >
                          <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-all duration-300 group-hover:bg-brand-blue-50 dark:group-hover:bg-brand-blue-900/30">
                            <font-awesome-icon :icon="child.icon" class="text-gray-400 dark:text-gray-500 group-hover:text-brand-blue-500 dark:group-hover:text-brand-blue-400 transition-colors" />
                          </div>
                          <div class="flex-1 min-w-0 pt-0.5">
                            <div class="flex items-center gap-2">
                              <span class="block text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                {{ t(`nav.dropdowns.${item.key}.${child.key}`) }}
                              </span>
                              <span
                                v-if="child.badge"
                                class="px-1.5 py-0.5 text-[9px] font-semibold uppercase rounded"
                                :class="child.badge === 'new' ? 'bg-brand-red-50 dark:bg-brand-red-900/30 text-brand-red-600 dark:text-brand-red-400' : child.badge === 'popular' ? 'bg-brand-blue-50 dark:bg-brand-blue-900/30 text-brand-blue-600 dark:text-brand-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'"
                              >
                                {{ child.badge === 'new' ? t('nav.badges.new') : child.badge === 'popular' ? t('nav.badges.popular') : child.badge }}
                              </span>
                            </div>
                            <span class="block text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors">
                              {{ t(`nav.dropdowns.${item.key}.${child.key}Desc`) }}
                            </span>
                          </div>
                        </NuxtLink>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>

          <!-- Separator -->
          <div class="h-6 w-px mx-2" :class="isScrolled ? 'bg-gray-200 dark:bg-gray-700' : 'bg-white/20'"></div>

          <!-- More Menu (Secondary Items) -->
          <div
            class="relative group/more"
            @mouseenter="isMoreMenuOpen = true"
            @mouseleave="isMoreMenuOpen = false"
          >
            <button
              class="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-300"
              :class="[
                isScrolled
                  ? isMoreMenuOpen
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  : isMoreMenuOpen
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
              ]"
            >
              <font-awesome-icon icon="fa-solid fa-ellipsis" class="w-4 h-4" />
              <span>{{ t('nav.more') }}</span>
              <font-awesome-icon
                icon="fa-solid fa-chevron-down"
                class="w-3 h-3 transition-transform duration-300 opacity-60"
                :class="{ 'rotate-180': isMoreMenuOpen }"
              />
            </button>

            <!-- More Menu Dropdown — CSS hover (pré-hydratation) + JS state (post-hydratation) -->
            <div
              class="absolute top-full right-0 pt-4 transition-all duration-300 ease-out"
              :class="isMoreMenuOpen
                ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                : 'opacity-0 invisible -translate-y-4 pointer-events-none group-hover/more:opacity-100 group-hover/more:visible group-hover/more:translate-y-0 group-hover/more:pointer-events-auto'"
            >
              <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-black/15 dark:shadow-black/40 border border-gray-100 dark:border-gray-800 overflow-hidden w-[420px] p-3">
                  <!-- Categories Grid -->
                  <div class="grid grid-cols-1 gap-2">
                    <template v-for="section in secondaryNavItems" :key="section.key">
                      <div
                        class="p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/50"
                      >
                        <NuxtLink
                          :to="localePath(section.route)"
                          class="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-900 dark:text-white hover:text-brand-blue-600 dark:hover:text-brand-blue-400 transition-colors"
                        >
                          <font-awesome-icon :icon="section.icon" class="w-4 h-4 text-brand-blue-500" />
                          {{ t(`nav.${section.key}`) }}
                          <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
                        </NuxtLink>
                        <div class="grid grid-cols-2 gap-1">
                          <NuxtLink
                            v-for="child in section.children"
                            :key="child.key"
                            :to="localePath(child.route)"
                            class="group flex items-center gap-2 px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-brand-blue-600 dark:hover:text-brand-blue-400 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
                          >
                            <font-awesome-icon :icon="child.icon" class="w-3 h-3 opacity-50 group-hover:opacity-100" />
                            <span>{{ child._label || t(`nav.dropdowns.${section.key}.${child.key}`) }}</span>
                            <span
                              v-if="child.badge"
                              class="ml-auto px-1 py-0.5 text-[8px] font-semibold uppercase rounded bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300"
                            >
                              {{ child.badge === 'flagship' ? t('nav.badges.flagship') : child.badge }}
                            </span>
                          </NuxtLink>
                        </div>
                      </div>
                    </template>
                  </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Section -->
        <div class="hidden lg:flex items-center gap-2">
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
                    class="w-3 h-3 ltr:ml-auto rtl:mr-auto text-brand-blue-500"
                  />
                </button>
              </div>
            </Transition>
          </div>

          <!-- CTA Button -->
          <NuxtLink
            :to="localePath(applyButtonLink)"
            class="group relative inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl overflow-hidden transition-all duration-300 ml-2"
            :class="[
              isScrolled
                ? 'bg-gradient-to-r from-brand-blue-500 to-brand-blue-600 text-white shadow-lg shadow-brand-blue-500/25 hover:shadow-xl hover:shadow-brand-blue-500/30 hover:-translate-y-0.5'
                : 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg'
            ]"
          >
            <font-awesome-icon icon="fa-solid fa-paper-plane" class="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            <span>{{ applyButtonText }}</span>
          </NuxtLink>
        </div>

        <!-- Mobile Menu Button -->
        <button
          @click="toggleMobileMenu"
          class="lg:hidden p-2.5 rounded-xl transition-all duration-300"
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
        class="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-2xl border-t border-gray-100 dark:border-gray-800 max-h-[85vh] overflow-y-auto"
      >
        <div class="px-4 py-6 space-y-1">
          <template v-for="item in navItems" :key="item.key">
            <!-- Menu Item without Dropdown -->
            <NuxtLink
              v-if="!item.hasDropdown"
              :to="localePath(item.route)"
              class="flex items-center px-4 py-3.5 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
              @click="isMobileMenuOpen = false"
            >
              {{ t(`nav.${item.key}`) }}
            </NuxtLink>

            <!-- Menu Item with Dropdown -->
            <div v-else class="rounded-xl overflow-hidden">
              <button
                @click="toggleMobileSubmenu(item.key)"
                class="flex items-center justify-between w-full px-4 py-3.5 text-gray-700 dark:text-gray-200 font-medium transition-all duration-200"
                :class="isMobileSubmenuExpanded(item.key) ? 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800'"
              >
                <span>{{ t(`nav.${item.key}`) }}</span>
                <font-awesome-icon
                  icon="fa-solid fa-chevron-down"
                  class="w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-300"
                  :class="{ 'rotate-180': isMobileSubmenuExpanded(item.key) }"
                />
              </button>

              <!-- Mobile Submenu -->
              <Transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-[500px]"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="opacity-100 max-h-[500px]"
                leave-to-class="opacity-0 max-h-0"
              >
                <div
                  v-if="isMobileSubmenuExpanded(item.key)"
                  class="overflow-hidden"
                >
                  <div class="p-2 space-y-0.5 bg-gray-50/50 dark:bg-gray-800/50">
                    <NuxtLink
                      v-for="child in item.children"
                      :key="child.key"
                      :to="localePath(child.route)"
                      class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                      @click="isMobileMenuOpen = false"
                    >
                      <div class="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <font-awesome-icon :icon="child.icon" class="text-gray-400 dark:text-gray-500 text-sm" />
                      </div>
                      <div class="flex-1">
                        <span class="text-sm font-medium">{{ child._label || t(`nav.dropdowns.${item.key}.${child.key}`) }}</span>
                      </div>
                      <span
                        v-if="child.badge"
                        class="px-1.5 py-0.5 text-[9px] font-semibold uppercase rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      >
                        {{ child.badge === 'new' ? t('nav.badges.new') : child.badge === 'popular' ? t('nav.badges.popular') : child.badge === 'flagship' ? t('nav.badges.flagship') : child.badge }}
                      </span>
                    </NuxtLink>
                  </div>
                </div>
              </Transition>
            </div>
          </template>

          <!-- Divider -->
          <div class="my-4 border-t border-gray-100 dark:border-gray-800"></div>

          <!-- Search & Dark Mode Toggle Mobile -->
          <div class="grid grid-cols-2 gap-2">
            <!-- Search Button Mobile -->
            <button
              @click="toggleSearch(); isMobileMenuOpen = false"
              class="flex items-center justify-center gap-2 px-4 py-3 text-gray-600 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <font-awesome-icon icon="fa-solid fa-magnifying-glass" class="w-4 h-4 text-brand-blue-500" />
              <span>{{ t('nav.search') }}</span>
            </button>

            <!-- Dark Mode Toggle Mobile -->
            <button
              @click="toggleDarkMode"
              class="flex items-center justify-center gap-2 px-4 py-3 text-gray-600 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <font-awesome-icon v-if="isDark" icon="fa-solid fa-sun" class="w-4 h-4 text-brand-blue-400" />
              <font-awesome-icon v-else icon="fa-solid fa-moon" class="w-4 h-4 text-gray-400" />
              <span>{{ isDark ? t('theme.light') : t('theme.dark') }}</span>
            </button>
          </div>

          <!-- Language Selection Mobile -->
          <div class="mt-2 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
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

          <!-- CTA Button Mobile -->
          <NuxtLink
            :to="localePath(applyButtonLink)"
            class="flex items-center justify-center gap-2 w-full px-4 py-4 mt-3 text-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 shadow-lg"
            @click="isMobileMenuOpen = false"
          >
            <font-awesome-icon icon="fa-solid fa-paper-plane" class="text-gray-400 dark:text-gray-500" />
            <span>{{ applyButtonText }}</span>
          </NuxtLink>
        </div>
      </div>
    </Transition>

    <!-- Search Modal Component -->
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
          :class="isDark ? 'text-brand-blue-400' : 'text-brand-blue-500'"
        />
        <span class="text-sm font-medium">{{ t(isDark ? 'theme.darkMode' : 'theme.lightMode') }}</span>
      </div>
    </Transition>
  </nav>
</template>
