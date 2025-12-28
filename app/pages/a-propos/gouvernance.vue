<script setup lang="ts">
import type { PaysBailleur } from '@bank/mock-data/pays-bailleurs'
import type { Map as LeafletMap } from 'leaflet'

const { t } = useI18n()
const {
  paysBailleurs,
  conseilAdministration,
  getFlagEmoji,
  getTextesFondateurs,
  getCAPresident
} = useMockData()

// SEO
useSeoMeta({
  title: () => t('governance.title'),
  description: () => t('governance.subtitle'),
  ogTitle: () => t('governance.title'),
  ogDescription: () => t('governance.subtitle')
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.about'), to: '/a-propos' },
  { label: t('governance.badge') }
])

// Données
const foundingTexts = computed(() => getTextesFondateurs())
const president = computed(() => getCAPresident())
const members = computed(() =>
  conseilAdministration.value.filter(m => m.ca_role === 'membre')
)
const vicePresidents = computed(() =>
  conseilAdministration.value.filter(m => m.ca_role === 'vice_president')
)
const observers = computed(() =>
  conseilAdministration.value.filter(m => m.ca_role === 'observateur')
)

// === PAYS BAILLEURS ===
// Égypte (pays hôte - hero card)
const egypte = computed(() =>
  paysBailleurs.value.find(p => p.code === 'EG')
)

// Autres fondateurs 1989 (France, Sénégal, Cameroun, CI, Gabon)
const otherFounders = computed(() =>
  paysBailleurs.value.filter(p => p.member_since === 1989 && p.code !== 'EG')
)

// Pays non-fondateurs (1990-1996) pour la timeline
const laterMembers = computed(() =>
  paysBailleurs.value.filter(p => p.member_since > 1989)
)

// Années uniques pour timeline (excluant 1989)
const timelineYears = computed(() =>
  [...new Set(laterMembers.value.map(p => p.member_since))].sort()
)

const getPaysByYear = (year: number) =>
  paysBailleurs.value.filter(p => p.member_since === year)

// === DRAWER ===
const selectedPays = ref<PaysBailleur | null>(null)

const openDrawer = (pays: PaysBailleur) => {
  selectedPays.value = pays
  if (import.meta.client) {
    document.body.style.overflow = 'hidden'
  }
}

const closeDrawer = () => {
  selectedPays.value = null
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
}

// Fermer avec Escape
onMounted(() => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeDrawer()
  }
  window.addEventListener('keydown', handleEsc)
  onUnmounted(() => window.removeEventListener('keydown', handleEsc))
})

// === SCROLLYTELLING MAP ===
const mapRef = ref<HTMLElement | null>(null)
const mapInstance = shallowRef<LeafletMap | null>(null)
const activeStep = ref(0)
const polylineRef = shallowRef<L.Polyline | null>(null)

// Initialiser la carte Leaflet et scrollama
onMounted(async () => {
  if (!import.meta.client) return

  // Attendre que le DOM soit prêt
  await nextTick()

  // Import dynamique de Leaflet (client-side only)
  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  // Import scrollama
  const scrollama = (await import('scrollama')).default

  // Créer la carte
  if (mapRef.value) {
    const map = L.map(mapRef.value, { zoomControl: false })
      .setView([15, 10], 5) // Zoom plus proche pour mieux voir les transitions

    mapInstance.value = map

    // Tiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    // Polyline VIDE au départ (sera mise à jour progressivement au scroll)
    polylineRef.value = L.polyline([], {
      color: '#f59e0b', // amber-500
      dashArray: '12 12',
      weight: 3
    }).addTo(map)

    // Marqueurs numérotés
    laterMembers.value.forEach((pays, index) => {
      if (!pays.location) return

      const numberIcon = L.divIcon({
        className: 'number-icon',
        html: `<div>${index + 1}</div>`,
        iconSize: [28, 28]
      })

      L.marker([pays.location.lat, pays.location.lng], { icon: numberIcon })
        .bindPopup(`<strong>${getFlagEmoji(pays.code)} ${pays.name_fr}</strong><br>${pays.capital}`)
        .addTo(map)
    })

    // Initialiser scrollama
    const scroller = scrollama()
    scroller
      .setup({
        step: '.step-card',
        offset: 0.5
      })
      .onStepEnter((response: { element: Element }) => {
        const stepIndex = parseInt(response.element.getAttribute('data-step') || '1') - 1
        activeStep.value = stepIndex

        // Mettre à jour la polyline progressivement
        const latlngs = laterMembers.value
          .slice(0, stepIndex + 1) // Seulement les points jusqu'au step actuel
          .filter(p => p.location)
          .map(p => [p.location!.lat, p.location!.lng] as [number, number])

        if (polylineRef.value) {
          polylineRef.value.setLatLngs(latlngs)
        }

        // FlyTo vers le pays actuel avec zoom
        const pays = laterMembers.value[stepIndex]
        if (pays?.location && mapInstance.value) {
          mapInstance.value.flyTo([pays.location.lat, pays.location.lng], 6, {
            animate: true,
            duration: 1.5
          })
        }
      })
  }
})

// Scroll animations
const { elementRef: textsRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.2 })
const { elementRef: countriesRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.2 })
const { elementRef: boardRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.2 })

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<template>
  <div>
    <!-- Hero -->
    <PageHero
      :title="t('governance.badge')"
      :subtitle="t('governance.subtitle')"
      image="/images/bg/backgroud_senghor3.jpg"
      :breadcrumb="breadcrumb"
    />

    <!-- Section 1: Textes Fondateurs -->
    <section
      ref="textsRef"
      class="pt-24 lg:pt-32 bg-white dark:bg-gray-900 relative overflow-hidden min-h-[60vh] flex flex-col"
    >
      <!-- Wave background -->
      <div class="absolute bottom-0 left-0 right-0 pointer-events-none h-full">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-full h-full" viewBox="0 0 1200 240" width="1200" height="240" preserveAspectRatio="none" role="img" aria-label="Generated SVG wave">
          <path d="M 0 240 L 0 121.58603132062797 L 25 113.32254151484581 L 50 105.696240619329 L 75 98.89491347236677 L 100 93.086031320628 L 125 88.412628121263 L 150 84.98977857117623 L 175 82.90176458607712 L 200 82.19999999999999 L 225 82.90176458607715 L 250 84.98977857117623 L 275 88.41262812126304 L 300 93.08603132062801 L 325 98.89491347236681 L 350 105.696240619329 L 375 113.32254151484585 L 400 121.58603132062797 L 425 130.28323549270686 L 450 139.2 L 475 148.1167645072932 L 500 156.81396867937198 L 525 165.07745848515418 L 550 172.70375938067093 L 575 179.5050865276332 L 600 185.313968679372 L 625 189.98737187873698 L 650 193.41022142882375 L 675 195.49823541392283 L 700 196.2 L 725 195.49823541392283 L 750 193.41022142882375 L 775 189.98737187873695 L 800 185.313968679372 L 825 179.50508652763318 L 850 172.703759380671 L 875 165.07745848515412 L 900 156.813968679372 L 925 148.1167645072931 L 950 139.20000000000002 L 975 130.2832354927068 L 1000 121.58603132062801 L 1025 113.3225415148458 L 1050 105.69624061932905 L 1075 98.89491347236677 L 1100 93.086031320628 L 1125 88.412628121263 L 1150 84.98977857117625 L 1175 82.90176458607714 L 1200 82.19999999999999 L 1200 240 Z" fill="#ff9b0f" fill-opacity="0.27" stroke="none" />
          <path d="M 0 240 L 0 107.7269173078498 L 25 102.14982904734076 L 50 97.38654568291494 L 75 93.55435505943568 L 100 90.74761842836452 L 125 89.03544696058324 L 150 88.45999999999998 L 175 89.03544696058324 L 200 90.7476184283645 L 225 93.55435505943566 L 250 97.38654568291494 L 275 102.14982904734075 L 300 107.72691730784979 L 325 113.98048404217356 L 350 120.75654568291493 L 375 127.88825310401958 L 400 135.2 L 425 142.51174689598037 L 450 149.64345431708503 L 475 156.4195159578264 L 500 162.67308269215016 L 525 168.2501709526592 L 550 173.013454317085 L 575 176.84564494056428 L 600 179.65238157163546 L 625 181.36455303941673 L 650 181.94 L 675 181.36455303941673 L 700 179.6523815716355 L 725 176.84564494056428 L 750 173.01345431708503 L 775 168.25017095265926 L 800 162.6730826921502 L 825 156.41951595782638 L 850 149.64345431708506 L 875 142.51174689598042 L 900 135.20000000000002 L 925 127.88825310401957 L 950 120.75654568291496 L 975 113.98048404217363 L 1000 107.72691730784982 L 1025 102.14982904734075 L 1050 97.38654568291496 L 1075 93.5543550594357 L 1100 90.74761842836452 L 1125 89.03544696058324 L 1150 88.45999999999998 L 1175 89.03544696058324 L 1200 90.74761842836449 L 1200 240 Z" fill="#f08c00" fill-opacity="0.27" stroke="none" />
          <path d="M 0 240 L 0 101.6870600452019 L 25 98.69608199760833 L 50 96.50545828555278 L 75 95.16912933508937 L 100 94.71999999999998 L 125 95.16912933508937 L 150 96.50545828555278 L 175 98.69608199760833 L 200 101.6870600452019 L 225 105.40474462231472 L 250 109.75759399637056 L 275 114.63842656950132 L 300 119.9270600452019 L 325 125.49327071533236 L 350 131.2 L 375 136.9067292846676 L 400 142.47293995479805 L 425 147.76157343049866 L 450 152.6424060036294 L 475 156.99525537768523 L 500 160.71293995479806 L 525 163.70391800239165 L 550 165.8945417144472 L 575 167.2308706649106 L 600 167.68 L 625 167.2308706649106 L 650 165.8945417144472 L 675 163.70391800239165 L 700 160.7129399547981 L 725 156.99525537768528 L 750 152.64240600362942 L 775 147.76157343049863 L 800 142.47293995479808 L 825 136.90672928466765 L 850 131.2 L 875 125.49327071533234 L 900 119.92706004520191 L 925 114.63842656950136 L 950 109.75759399637057 L 975 105.40474462231472 L 1000 101.68706004520192 L 1025 98.69608199760835 L 1050 96.50545828555279 L 1075 95.16912933508937 L 1100 94.71999999999998 L 1125 95.16912933508935 L 1150 96.50545828555278 L 1175 98.69608199760833 L 1200 101.68706004520193 L 1200 240 Z" fill="#d17a00" fill-opacity="0.27" stroke="none" />
          <path d="M 0 240 L 0 102.26329814274106 L 25 101.30281170959549 L 50 100.97999999999999 L 75 101.30281170959547 L 100 102.26329814274106 L 125 103.83780893578098 L 150 105.98757440748886 L 175 108.6596601972887 L 200 111.78827068489133 L 225 115.29636909682907 L 250 119.09757440748886 L 275 123.09828832664513 L 300 127.19999999999999 L 325 131.30171167335484 L 350 135.3024255925111 L 375 139.1036309031709 L 400 142.61172931510862 L 425 145.74033980271125 L 450 148.4124255925111 L 475 150.56219106421898 L 500 152.1367018572589 L 525 153.0971882904045 L 550 153.42 L 575 153.09718829040452 L 600 152.1367018572589 L 625 150.56219106421898 L 650 148.4124255925111 L 675 145.74033980271128 L 700 142.61172931510865 L 725 139.10363090317088 L 750 135.30242559251113 L 775 131.30171167335487 L 800 127.2 L 825 123.09828832664512 L 850 119.09757440748888 L 875 115.2963690968291 L 900 111.78827068489136 L 925 108.6596601972887 L 950 105.98757440748886 L 975 103.837808935781 L 1000 102.26329814274106 L 1025 101.30281170959547 L 1050 100.97999999999999 L 1075 101.30281170959547 L 1100 102.26329814274106 L 1125 103.83780893578098 L 1150 105.98757440748886 L 1175 108.65966019728872 L 1200 111.78827068489133 L 1200 240 Z" fill="#b36800" fill-opacity="0.27" stroke="none" />
        </svg>
      </div>

      <!-- Layout asymétrique : contenu à gauche dans container, card collée à droite -->
      <div class="relative z-10 mt-auto">
        <div class="grid lg:grid-cols-2 gap-8 lg:gap-0 items-end">
          <!-- Colonne gauche : Titre + Texte + Points clés (dans container) -->
          <div class="px-4 sm:px-6 lg:pl-8 xl:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pr-12">
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              <span class="relative inline-block">
                {{ t('governance.foundingTexts.title') }}
                <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
              </span>
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {{ t('governance.foundingTexts.description') }}
            </p>
          </div>

          <!-- Colonne droite : Flip cards documents -->
          <div class="px-4 sm:px-6 lg:px-8 py-8 border-l-2 border-y rounded-l-3xl">
            <!-- Documents en flex wrap -->
            <div class="flex flex-wrap justify-center lg:justify-start gap-6">
              <div
                v-for="doc in foundingTexts"
                :key="doc.id"
                class="flip-card-container cursor-pointer"
              >
                <div class="flip-card">
                  <!-- Face avant -->
                  <div
                    class="flip-card-front"
                    :style="{ backgroundImage: `url(${doc.cover_image || 'https://picsum.photos/seed/' + doc.id + '/400/500'})` }"
                  >
                    <div class="flip-card-inner">
                      <div class="w-14 h-14 bg-amber-500/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                        <font-awesome-icon icon="fa-solid fa-file-pdf" class="text-white text-2xl" />
                      </div>
                      <h4 class="text-white font-bold text-base leading-tight line-clamp-3">
                        {{ doc.title_fr }}
                      </h4>
                      <p class="text-white/70 text-sm mt-2">{{ doc.year }}</p>
                      <div class="mt-4 text-white/50">
                        <font-awesome-icon icon="fa-solid fa-rotate" class="text-lg" />
                      </div>
                    </div>
                  </div>

                  <!-- Face arrière -->
                  <div
                    class="flip-card-back"
                    :style="{ backgroundImage: `url(${doc.cover_image || 'https://picsum.photos/seed/' + doc.id + '/400/500'})` }"
                  >
                    <div class="flip-card-inner">
                      <h4 class="text-white font-bold text-base leading-tight mb-3 line-clamp-2">
                        {{ doc.title_fr }}
                      </h4>
                      <p class="text-white/80 text-sm mb-4 line-clamp-3">
                        {{ doc.description_fr }}
                      </p>
                      <a
                        :href="doc.file_url"
                        download
                        class="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600
                               rounded-lg text-white text-sm font-medium transition-all shadow-lg"
                        @click.stop
                      >
                        <font-awesome-icon icon="fa-solid fa-download" />
                        Télécharger
                      </a>
                      <p class="text-white/50 text-xs mt-3">{{ formatFileSize(doc.file_size) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 2: Pays Bailleurs -->
    <section
      ref="countriesRef"
      class="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 relative overflow-hidden"
    >
      <!-- Background pattern -->
      <div class="absolute inset-0 opacity-5 dark:opacity-[0.02]">
        <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <pattern id="africa-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1.5" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#africa-pattern)" />
        </svg>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <!-- Header avec stats -->
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('governance.donorCountries.title') }}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {{ t('governance.donorCountries.description') }}
          </p>

          <!-- Stats animées -->
          <div class="flex flex-wrap justify-center gap-8 sm:gap-12 mt-8">
            <div class="text-center">
              <span class="text-4xl sm:text-5xl font-bold text-amber-500">{{ paysBailleurs.length }}</span>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Pays membres</p>
            </div>
            <div class="text-center">
              <span class="text-4xl sm:text-5xl font-bold text-amber-500">35+</span>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Années de partenariat</p>
            </div>
            <div class="text-center">
              <span class="text-4xl sm:text-5xl font-bold text-amber-500">3</span>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Continents</p>
            </div>
          </div>
        </div>

        <!-- Pays fondateurs 1989 -->
        <div class="mb-16">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span class="w-1.5 h-6 bg-amber-500 rounded-full"></span>
            Pays fondateurs
          </h3>

          <!-- Égypte : Hero card -->
          <div
            v-if="egypte"
            class="bg-gradient-to-br from-amber-500 via-amber-500 to-amber-600
                   rounded-3xl p-6 sm:p-8 text-white mb-6 relative overflow-hidden cursor-pointer
                   hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300"
            @click="openDrawer(egypte)"
          >
            <!-- Decorative elements -->
            <div class="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div class="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div class="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <span class="text-6xl sm:text-7xl">{{ getFlagEmoji(egypte.code) }}</span>
              <div class="flex-1">
                <div class="flex flex-wrap items-center gap-3 mb-2">
                  <h4 class="text-2xl sm:text-3xl font-bold">{{ egypte.name_fr }}</h4>
                  <span class="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    Pays hôte
                  </span>
                </div>
                <p class="text-white/90 text-sm sm:text-base max-w-2xl">
                  {{ egypte.description_fr }}
                </p>
                <div class="flex flex-wrap gap-4 mt-4 text-sm text-white/75">
                  <span class="flex items-center gap-1">
                    <font-awesome-icon icon="fa-solid fa-location-dot" class="text-xs" />
                    Capitale : {{ egypte.capital }}
                  </span>
                  <span class="flex items-center gap-1">
                    <font-awesome-icon icon="fa-solid fa-calendar" class="text-xs" />
                    Membre depuis {{ egypte.member_since }}
                  </span>
                </div>
              </div>
              <font-awesome-icon icon="fa-solid fa-chevron-right" class="text-white/50 text-xl hidden sm:block" />
            </div>
          </div>

          <!-- 5 autres fondateurs en grille -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <button
              v-for="pays in otherFounders"
              :key="pays.id"
              class="founder-card group"
              @click="openDrawer(pays)"
            >
              <span class="text-4xl sm:text-5xl block mb-3 group-hover:scale-110 transition-transform duration-300">
                {{ getFlagEmoji(pays.code) }}
              </span>
              <h4 class="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                {{ pays.name_fr }}
              </h4>
              <span class="text-xs text-amber-600 dark:text-amber-400 mt-1 block">
                Membre fondateur
              </span>
            </button>
          </div>
        </div>

      </div>
    </section>

    <!-- Chronologie des adhésions - Scrollytelling avec carte -->
    <section class="relative">
      <!-- Header HORS de la carte -->
      <div class="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <span class="w-1.5 h-6 bg-blue-500 rounded-full"></span>
          Chronologie des adhésions
        </h3>
        <p class="text-gray-600 dark:text-gray-300 max-w-2xl">
          Découvrez les pays qui ont rejoint l'Université Senghor après sa fondation.
        </p>
      </div>

      <ClientOnly>
        <!-- Carte Leaflet (sticky background) -->
        <div class="scroll__graphic sticky top-0 w-full h-screen z-0">
          <div class="absolute inset-0 bg-white/20 dark:bg-gray-900/40 z-10"></div>
          <div id="map-chronologie" ref="mapRef" class="w-full h-full"></div>
        </div>

        <!-- Step Cards (scrolling content) -->
        <div class="scroll__text relative z-20 -mt-[100vh] pb-[50vh]">
          <!-- Step cards pour chaque pays -->
          <div class="flex flex-col items-end px-4 sm:px-6 lg:px-8 pt-[20vh] space-y-[30vh]">
            <div
              v-for="(pays, index) in laterMembers"
              :key="pays.id"
              :data-step="index + 1"
              class="step-card"
              :class="{ 'step-active': activeStep === index }"
              @click="openDrawer(pays)"
            >
              <h3 class="text-lg font-bold text-amber-600 dark:text-amber-400">
                {{ pays.member_since }}
              </h3>
              <h4 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mt-1">
                <span class="text-3xl">{{ getFlagEmoji(pays.code) }}</span>
                {{ pays.name_fr }}
              </h4>
              <p class="text-gray-700 dark:text-gray-300 mt-3 leading-relaxed text-sm">
                {{ pays.description_fr }}
              </p>
              <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-3">
                <font-awesome-icon icon="fa-solid fa-location-dot" class="text-xs" />
                <span>{{ pays.capital }}</span>
              </div>
            </div>
          </div>
        </div>

        <template #fallback>
          <!-- Fallback pour SSR : timeline simple -->
          <div class="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-blue-500 rounded-full"></span>
              Chronologie des adhésions
            </h3>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="pays in laterMembers"
                :key="pays.id"
                class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <span class="text-3xl">{{ getFlagEmoji(pays.code) }}</span>
                <h4 class="font-semibold mt-2">{{ pays.name_fr }}</h4>
                <p class="text-sm text-gray-500">Membre depuis {{ pays.member_since }}</p>
              </div>
            </div>
          </div>
        </template>
      </ClientOnly>
    </section>

    <!-- Drawer latéral pour détails pays -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="selectedPays" class="fixed inset-0 z-50">
          <!-- Backdrop -->
          <div
            class="absolute inset-0 bg-black/50 backdrop-blur-sm"
            @click="closeDrawer"
          ></div>

          <!-- Drawer panel -->
          <div class="drawer-panel absolute top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl">
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-4">
                <span class="text-5xl">{{ getFlagEmoji(selectedPays.code) }}</span>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                    {{ selectedPays.name_fr }}
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Membre depuis {{ selectedPays.member_since }}
                  </p>
                </div>
              </div>
              <button
                class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center
                       hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                @click="closeDrawer"
              >
                <font-awesome-icon icon="fa-solid fa-xmark" class="text-gray-500" />
              </button>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-6 overflow-y-auto h-[calc(100%-88px)]">
              <!-- Badge contribution -->
              <div v-if="selectedPays.contribution_type_fr">
                <span class="inline-block px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium">
                  {{ selectedPays.contribution_type_fr }}
                </span>
              </div>

              <!-- Description -->
              <div>
                <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Contribution
                </h4>
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {{ selectedPays.description_fr || 'Ce pays contribue au développement et au rayonnement de l\'Université Senghor.' }}
                </p>
              </div>

              <!-- Infos -->
              <div class="space-y-4">
                <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                    <font-awesome-icon icon="fa-solid fa-location-dot" class="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Capitale</p>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ selectedPays.capital || 'Non renseignée' }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <font-awesome-icon icon="fa-solid fa-calendar" class="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Membre depuis</p>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ selectedPays.member_since }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Section 3: Conseil d'Administration -->
    <section
      ref="boardRef"
      class="py-16 lg:py-24 bg-white dark:bg-gray-900"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-12">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('governance.board.title') }}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {{ t('governance.board.description') }}
          </p>
        </div>

        <!-- Président (featured) -->
        <div v-if="president" class="max-w-3xl mx-auto mb-16">
          <div
            class="relative bg-gradient-to-br from-amber-500 via-amber-500 to-amber-600
                   rounded-3xl p-8 md:p-10 text-white overflow-hidden shadow-2xl shadow-amber-500/20"
          >
            <!-- Decorative elements -->
            <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div class="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <!-- Badge -->
            <div class="absolute top-4 right-4">
              <span class="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium">
                Président du Conseil
              </span>
            </div>

            <!-- Content -->
            <div class="relative flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <img
                :src="president.photo || 'https://i.pravatar.cc/200?u=president'"
                :alt="`${president.first_name} ${president.last_name}`"
                class="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white/30 object-cover shadow-xl"
              />
              <div class="text-center md:text-left">
                <h3 class="text-2xl md:text-3xl font-bold">
                  {{ president.civility }} {{ president.first_name }} {{ president.last_name }}
                </h3>
                <p class="text-white/90 text-lg mt-1">{{ president.title_fr }}</p>
                <p class="text-white/75 mt-3 flex items-center justify-center md:justify-start gap-2">
                  <span class="text-3xl">{{ getFlagEmoji(president.country_code) }}</span>
                  <span>{{ president.representing_fr }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Vice-Présidents -->
        <div v-if="vicePresidents.length > 0" class="mb-12">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span class="w-1.5 h-6 bg-amber-500 rounded-full"></span>
            Vice-Présidents
          </h3>
          <div class="grid sm:grid-cols-2 gap-6">
            <div
              v-for="vp in vicePresidents"
              :key="vp.id"
              class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50
                     rounded-2xl p-6 flex items-center gap-5
                     border border-gray-200 dark:border-gray-700
                     hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <img
                :src="vp.photo || 'https://i.pravatar.cc/150?u=' + vp.id"
                :alt="`${vp.first_name} ${vp.last_name}`"
                class="w-20 h-20 rounded-full object-cover ring-4 ring-white dark:ring-gray-700 shadow"
              />
              <div>
                <span class="text-2xl">{{ getFlagEmoji(vp.country_code) }}</span>
                <h4 class="font-semibold text-gray-900 dark:text-white mt-1">
                  {{ vp.civility }} {{ vp.first_name }} {{ vp.last_name }}
                </h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ vp.title_fr }}</p>
                <p class="text-xs text-amber-600 dark:text-amber-400 mt-1">{{ vp.representing_fr }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Membres -->
        <div v-if="members.length > 0" class="mb-12">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span class="w-1.5 h-6 bg-blue-500 rounded-full"></span>
            Membres
          </h3>
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              v-for="(member, index) in members"
              :key="member.id"
              class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 text-center
                     hover:shadow-lg transition-all duration-300 hover:-translate-y-1
                     border border-transparent hover:border-amber-200 dark:hover:border-amber-800"
              :style="{ animationDelay: `${index * 75}ms` }"
            >
              <img
                :src="member.photo || 'https://i.pravatar.cc/150?u=' + member.id"
                :alt="`${member.first_name} ${member.last_name}`"
                class="w-20 h-20 rounded-full mx-auto mb-4 object-cover
                       ring-4 ring-white dark:ring-gray-700 shadow"
              />
              <span class="text-3xl">{{ getFlagEmoji(member.country_code) }}</span>
              <h4 class="font-semibold text-gray-900 dark:text-white mt-2">
                {{ member.civility }} {{ member.first_name }} {{ member.last_name }}
              </h4>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ member.title_fr }}</p>
              <p class="text-xs text-amber-600 dark:text-amber-400 mt-2">{{ member.representing_fr }}</p>
            </div>
          </div>
        </div>

        <!-- Observateurs -->
        <div v-if="observers.length > 0">
          <h3 class="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2">
            <span class="w-1.5 h-6 bg-gray-400 rounded-full"></span>
            Observateurs
          </h3>
          <div class="grid sm:grid-cols-2 gap-6">
            <div
              v-for="obs in observers"
              :key="obs.id"
              class="border-2 border-dashed border-gray-300 dark:border-gray-600
                     rounded-2xl p-6 flex items-center gap-4
                     hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <img
                :src="obs.photo || 'https://i.pravatar.cc/150?u=' + obs.id"
                :alt="`${obs.first_name} ${obs.last_name}`"
                class="w-16 h-16 rounded-full object-cover opacity-90"
              />
              <div>
                <h4 class="font-semibold text-gray-700 dark:text-gray-300">
                  {{ obs.civility }} {{ obs.first_name }} {{ obs.last_name }}
                </h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ obs.title_fr }}</p>
                <span
                  class="inline-block mt-2 text-xs bg-gray-200 dark:bg-gray-700
                         text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded"
                >
                  Observateur
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Container avec perspective 3D */
.flip-card-container {
  perspective: 1000px;
  -webkit-perspective: 1000px;
  width: 180px;
  height: 260px;
  flex-shrink: 0;
}

/* Card avec transform-style preserve-3d */
.flip-card {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1);
}

/* Rotation au hover */
.flip-card-container:hover .flip-card {
  transform: rotateY(180deg);
  -webkit-transform: rotateY(180deg);
}

/* Faces communes */
.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 1rem;
  background-size: cover;
  background-position: center;
  overflow: hidden;
}

/* Overlay sombre sur les images */
.flip-card-front::before,
.flip-card-back::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.75));
  z-index: 1;
}

/* Face avant */
.flip-card-front {
  transform: rotateY(0deg);
  -webkit-transform: rotateY(0deg);
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
}

/* Face arrière (pré-tournée) */
.flip-card-back {
  transform: rotateY(180deg);
  -webkit-transform: rotateY(180deg);
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
}

/* Contenu centré avec effet 3D */
.flip-card-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  text-align: center;
  z-index: 2;
  /* Effet de profondeur 3D */
  transform: translateZ(60px) scale(0.94);
  -webkit-transform: translateZ(60px) scale(0.94);
}

/* Responsive: taille plus grande sur desktop */
@media (min-width: 768px) {
  .flip-card-container {
    width: 200px;
    height: 280px;
  }
}

/* === PAYS BAILLEURS === */

/* Cards fondateurs */
.founder-card {
  @apply bg-white dark:bg-gray-800 rounded-2xl p-6 text-center
         border border-gray-100 dark:border-gray-700
         hover:border-amber-300 dark:hover:border-amber-600
         hover:shadow-lg hover:-translate-y-1
         transition-all duration-300 cursor-pointer;
}

/* Timeline chips */
.country-chip {
  @apply flex flex-col items-center gap-1 px-3 py-2
         bg-white dark:bg-gray-800 rounded-xl
         border border-gray-200 dark:border-gray-700
         hover:border-amber-400 dark:hover:border-amber-500
         hover:shadow-md hover:-translate-y-0.5
         transition-all duration-200 cursor-pointer;
}

/* === DRAWER === */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active .drawer-panel,
.drawer-leave-active .drawer-panel {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer-panel,
.drawer-leave-to .drawer-panel {
  transform: translateX(100%);
}

/* Scrollbar pour timeline */
.timeline-container::-webkit-scrollbar {
  height: 6px;
}

.timeline-container::-webkit-scrollbar-track {
  background: transparent;
}

.timeline-container::-webkit-scrollbar-thumb {
  background: theme('colors.gray.300');
  border-radius: 3px;
}

.timeline-container::-webkit-scrollbar-thumb:hover {
  background: theme('colors.gray.400');
}

:is(.dark) .timeline-container::-webkit-scrollbar-thumb {
  background: theme('colors.gray.600');
}

:is(.dark) .timeline-container::-webkit-scrollbar-thumb:hover {
  background: theme('colors.gray.500');
}

/* === SCROLLYTELLING MAP === */

/* Step Cards */
.step-card {
  background-color: #fdf3d7;
  background-image: url("https://assets.codepen.io/252820/soft-wallpaper.png");
  background-size: cover;
  box-shadow: 2px 4px 10px rgba(0, 0, 0, 0.2);
  border: 1px solid #d1a878;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  max-width: 100%;
  width: 380px;
  position: relative;
}

.step-card:hover {
  transform: translateY(-4px);
  box-shadow: 4px 8px 16px rgba(0, 0, 0, 0.25);
}

/* Numéro en badge */
.step-card::before {
  content: attr(data-step);
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 1.1em;
  font-weight: 700;
  width: 36px;
  height: 36px;
  background-color: #f59e0b;
  color: white;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 12px;
  top: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* État actif */
.step-card.step-active {
  border-color: #f59e0b;
  box-shadow: 0 0 0 2px #f59e0b, 2px 4px 15px rgba(245, 158, 11, 0.35);
}

/* Dark mode */
:is(.dark) .step-card {
  background-color: #1f2937;
  background-image: none;
  border-color: #374151;
}

:is(.dark) .step-card:hover {
  border-color: #4b5563;
}

:is(.dark) .step-card.step-active {
  border-color: #f59e0b;
  box-shadow: 0 0 0 2px #f59e0b, 2px 4px 15px rgba(245, 158, 11, 0.3);
}
</style>

<!-- Styles globaux pour Leaflet (non scoped car DOM généré dynamiquement) -->
<style>
/* Map markers numérotés */
.number-icon {
  background: #f59e0b;
  color: white;
  border-radius: 50%;
  width: 28px !important;
  height: 28px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  font-family: system-ui, -apple-system, sans-serif;
}

.number-icon div {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* Popup Leaflet */
.leaflet-popup-content-wrapper {
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.leaflet-popup-content {
  margin: 12px 16px;
  font-family: system-ui, -apple-system, sans-serif;
}

/* Attribution discrète */
.leaflet-control-attribution {
  font-size: 10px;
  opacity: 0.6;
}
</style>
