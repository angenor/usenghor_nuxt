<script setup lang="ts">
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
      class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800 relative overflow-hidden"
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
        <!-- Header -->
        <div class="text-center mb-12">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('governance.donorCountries.title') }}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {{ t('governance.donorCountries.description') }}
          </p>

          <!-- Stats -->
          <div class="flex justify-center gap-12 mt-8">
            <div class="text-center">
              <span class="text-5xl font-bold text-amber-500">{{ paysBailleurs.length }}</span>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Pays membres</p>
            </div>
            <div class="text-center">
              <span class="text-5xl font-bold text-amber-500">1989</span>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Année de création</p>
            </div>
          </div>
        </div>

        <!-- Grille pays -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <div
            v-for="(pays, index) in paysBailleurs"
            :key="pays.id"
            class="group relative bg-white dark:bg-gray-700 rounded-2xl p-6
                   text-center shadow-sm hover:shadow-xl transition-all duration-300
                   hover:-translate-y-2 cursor-default"
            :style="{ animationDelay: `${index * 50}ms` }"
          >
            <!-- Drapeau -->
            <span class="text-5xl block mb-3 group-hover:scale-110 transition-transform duration-300">
              {{ getFlagEmoji(pays.code) }}
            </span>

            <!-- Nom du pays -->
            <h3 class="font-medium text-sm text-gray-900 dark:text-white">
              {{ pays.name_fr }}
            </h3>

            <!-- Badge fondateur -->
            <span
              v-if="pays.contribution_type_fr"
              class="inline-block mt-2 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full"
            >
              {{ pays.contribution_type_fr }}
            </span>

            <!-- Tooltip -->
            <div
              class="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none
                     group-hover:opacity-100 transition-opacity duration-300
                     bg-gray-900 dark:bg-gray-600 text-white text-xs px-3 py-1.5 rounded-lg
                     whitespace-nowrap shadow-lg z-10"
            >
              Membre depuis {{ pays.member_since }}
              <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-600"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

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
</style>
