<script setup lang="ts">
interface FoundingDocument {
  id: string
  title_fr: string
  description_fr?: string
  file_url: string
  file_size?: number
  year?: number
  cover_image?: string
  // Champs du mock data compatibles
  document_category?: string
  sort_order?: number
}

interface Props {
  documents: FoundingDocument[]
  title?: string
  description?: string
}

const props = defineProps<Props>()

const { t } = useI18n()
const { elementRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.2 })

const sectionTitle = computed(() => props.title || t('governance.foundingTexts.title'))
const sectionDescription = computed(() => props.description || t('governance.foundingTexts.description'))

const formatFileSize = (bytes?: number) => {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<template>
  <section
    ref="elementRef"
    class="pt-24 lg:pt-32 bg-white dark:bg-gray-900 relative overflow-hidden min-h-[60vh] flex flex-col"
  >
    <!-- Bandes décoratives en arrière-plan -->
    <div class="absolute bottom-0 left-0 right-0 pointer-events-none h-full">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-full h-full" viewBox="0 0 1200 240" preserveAspectRatio="none">
        <rect x="0" y="80" width="1200" height="160" fill="#ff9b0f" fill-opacity="0.12" />
        <rect x="0" y="120" width="1200" height="120" fill="#f08c00" fill-opacity="0.15" />
        <rect x="0" y="155" width="1200" height="85" fill="#d17a00" fill-opacity="0.15" />
        <rect x="0" y="185" width="1200" height="55" fill="#b36800" fill-opacity="0.15" />
      </svg>
    </div>

    <!-- Layout asymétrique : contenu à gauche dans container, card collée à droite -->
    <div class="relative z-10 mt-auto">
      <div class="grid lg:grid-cols-2 gap-8 lg:gap-0 items-end">
        <!-- Colonne gauche : Titre + Texte -->
        <div class="px-4 sm:px-6 lg:pl-8 xl:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pr-12">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            <span class="relative inline-block">
              {{ sectionTitle }}
              <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
            </span>
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {{ sectionDescription }}
          </p>
        </div>

        <!-- Colonne droite : Flip cards documents -->
        <div class="px-4 sm:px-6 lg:px-8 py-8 border-l-2 border-y rounded-l-3xl">
          <div class="flex flex-wrap justify-center lg:justify-start gap-6">
            <div
              v-for="doc in props.documents"
              :key="doc.id"
              class="flip-card-container cursor-pointer"
            >
              <div class="flip-card">
                <!-- Face avant -->
                <div
                  class="flip-card-front"
                  :style="doc.cover_image ? { backgroundImage: `url(${doc.cover_image})` } : {}"
                  :class="!doc.cover_image ? 'bg-gray-700 dark:bg-gray-800' : ''"
                >
                  <div class="flip-card-inner">
                    <div class="w-14 h-14 bg-brand-red-500/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
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
                  :style="doc.cover_image ? { backgroundImage: `url(${doc.cover_image})` } : {}"
                  :class="!doc.cover_image ? 'bg-gray-700 dark:bg-gray-800' : ''"
                >
                  <div class="flip-card-inner">
                    <h4 class="text-white font-bold text-base leading-tight mb-3 line-clamp-2">
                      {{ doc.title_fr }}
                    </h4>
                    <p class="text-white/80 text-sm mb-4 line-clamp-3">
                      {{ doc.description_fr }}
                    </p>
                    <div class="flex items-center gap-3">
                      <a
                        :href="doc.file_url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-all"
                        :title="t('governance.foundingTexts.view')"
                        @click.stop
                      >
                        <font-awesome-icon icon="fa-solid fa-eye" class="w-4 h-4" />
                      </a>
                      <a
                        :href="doc.file_url"
                        download
                        class="w-10 h-10 flex items-center justify-center bg-brand-blue-500 hover:bg-brand-blue-600 rounded-full text-white transition-all shadow-lg"
                        :title="t('governance.foundingTexts.download')"
                        @click.stop
                      >
                        <font-awesome-icon icon="fa-solid fa-download" class="w-4 h-4" />
                      </a>
                    </div>
                    <p v-if="doc.file_size" class="text-white/50 text-xs mt-3">{{ formatFileSize(doc.file_size) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
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
  transform: translateZ(60px) scale(0.94);
  -webkit-transform: translateZ(60px) scale(0.94);
}

/* Responsive */
@media (min-width: 768px) {
  .flip-card-container {
    width: 200px;
    height: 280px;
  }
}
</style>
