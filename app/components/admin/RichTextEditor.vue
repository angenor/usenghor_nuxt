<script setup lang="ts">
type Language = 'fr' | 'en' | 'ar'

interface Props {
  /** Titre de la section (ex: "Contenu détaillé") */
  title?: string
  /** Description sous le titre */
  description?: string
  /** Icône FontAwesome (ex: "fa-solid fa-file-lines") */
  icon?: string
  /** Couleur de l'icône (classe Tailwind, ex: "text-indigo-500") */
  iconColor?: string
  /** v-model pour le contenu Markdown FR */
  modelValue?: string
  /** v-model pour le contenu Markdown EN */
  modelValueEn?: string
  /** v-model pour le contenu Markdown AR */
  modelValueAr?: string
  /** v-model pour le contenu HTML FR */
  htmlValue?: string
  /** v-model pour le contenu HTML EN */
  htmlValueEn?: string
  /** v-model pour le contenu HTML AR */
  htmlValueAr?: string
  /** Placeholder pour l'éditeur FR */
  placeholder?: string
  /** Placeholder pour l'éditeur EN */
  placeholderEn?: string
  /** Placeholder pour l'éditeur AR */
  placeholderAr?: string
  /** Hauteur de l'éditeur */
  height?: string
  /** Afficher dans une carte avec styling de section admin */
  showCard?: boolean
  /** Label pour l'éditeur simple (sans tabs) */
  label?: string
  /** Champ requis */
  required?: boolean
  /** Langues à afficher (défaut: toutes les langues avec un v-model fourni) */
  languages?: Language[]
  /** Mode d'affichage : inline (éditeurs visibles) ou modal (bouton → modale plein écran) */
  mode?: 'inline' | 'modal'
}

interface Emits {
  (e: 'update:modelValue', data: string): void
  (e: 'update:modelValueEn', data: string): void
  (e: 'update:modelValueAr', data: string): void
  (e: 'update:htmlValue', data: string): void
  (e: 'update:htmlValueEn', data: string): void
  (e: 'update:htmlValueAr', data: string): void
  (e: 'change'): void
  (e: 'ready'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  icon: 'fa-solid fa-file-lines',
  iconColor: 'text-indigo-500',
  modelValue: '',
  modelValueEn: undefined,
  modelValueAr: undefined,
  htmlValue: '',
  htmlValueEn: undefined,
  htmlValueAr: undefined,
  placeholder: 'Commencez à écrire...',
  placeholderEn: 'Start writing...',
  placeholderAr: 'ابدأ في الكتابة هنا...',
  height: '400px',
  showCard: true,
  label: '',
  required: false,
  languages: undefined,
  mode: 'modal',
})

const emit = defineEmits<Emits>()

// Upload d'images via l'API média
const { uploadMedia, getMediaUrl } = useMediaApi()

async function handleImageUpload(payload: { blob: Blob, callback: (url: string, alt?: string) => void }) {
  try {
    const file = payload.blob instanceof File
      ? payload.blob
      : new File([payload.blob], `image-${Date.now()}.png`, { type: payload.blob.type })

    const result = await uploadMedia(file, { folder: 'editor' })
    const url = getMediaUrl(result)
    if (url) {
      payload.callback(url, file.name)
    }
  }
  catch (error) {
    console.error('Erreur upload image éditeur:', error)
    alert('Impossible d\'uploader l\'image')
  }
}

// Déterminer les langues disponibles
const availableLanguages = computed<Language[]>(() => {
  if (props.languages) {
    return props.languages
  }
  // Auto-détection basée sur les props fournis
  const langs: Language[] = ['fr']
  if (props.modelValueEn !== undefined) {
    langs.push('en')
  }
  if (props.modelValueAr !== undefined) {
    langs.push('ar')
  }
  return langs
})

// Mode multilingue activé si plus d'une langue
const isMultilingual = computed(() => availableLanguages.value.length > 1)

// Tab active pour l'éditeur multilingue
const activeTab = ref<Language>('fr')

// Handlers pour les changements de contenu
function onMdChangeFr(md: string) {
  emit('update:modelValue', md)
  emit('change')
}

function onHtmlChangeFr(html: string) {
  emit('update:htmlValue', html)
}

function onMdChangeEn(md: string) {
  emit('update:modelValueEn', md)
  emit('change')
}

function onHtmlChangeEn(html: string) {
  emit('update:htmlValueEn', html)
}

function onMdChangeAr(md: string) {
  emit('update:modelValueAr', md)
  emit('change')
}

function onHtmlChangeAr(html: string) {
  emit('update:htmlValueAr', html)
}

function onReady() {
  emit('ready')
}

// Configuration des onglets
const tabConfig: Record<Language, { label: string; icon: string }> = {
  fr: { label: 'Français', icon: 'fa-solid fa-flag' },
  en: { label: 'English', icon: 'fa-solid fa-globe' },
  ar: { label: 'العربية', icon: 'fa-solid fa-language' },
}

// === Modal mode ===
const isModalOpen = ref(false)

// Copies locales pour édition dans la modale (évite d'émettre avant validation)
const modalMdFr = ref('')
const modalHtmlFr = ref('')
const modalMdEn = ref('')
const modalHtmlEn = ref('')
const modalMdAr = ref('')
const modalHtmlAr = ref('')
const modalActiveTab = ref<Language>('fr')

// Snapshots pour détecter les modifications
const snapshotFr = ref('')
const snapshotEn = ref('')
const snapshotAr = ref('')

function openModal() {
  // Prendre un snapshot et copier les valeurs
  modalMdFr.value = props.modelValue || ''
  modalHtmlFr.value = props.htmlValue || ''
  modalMdEn.value = props.modelValueEn || ''
  modalHtmlEn.value = props.htmlValueEn || ''
  modalMdAr.value = props.modelValueAr || ''
  modalHtmlAr.value = props.htmlValueAr || ''
  snapshotFr.value = props.modelValue || ''
  snapshotEn.value = props.modelValueEn || ''
  snapshotAr.value = props.modelValueAr || ''
  modalActiveTab.value = 'fr'
  isModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

function hasModalChanges(): boolean {
  return modalMdFr.value !== snapshotFr.value
    || modalMdEn.value !== snapshotEn.value
    || modalMdAr.value !== snapshotAr.value
}

function handleModalConfirm() {
  // Émettre toutes les valeurs
  emit('update:modelValue', modalMdFr.value)
  emit('update:htmlValue', modalHtmlFr.value)
  if (props.modelValueEn !== undefined) {
    emit('update:modelValueEn', modalMdEn.value)
    emit('update:htmlValueEn', modalHtmlEn.value)
  }
  if (props.modelValueAr !== undefined) {
    emit('update:modelValueAr', modalMdAr.value)
    emit('update:htmlValueAr', modalHtmlAr.value)
  }
  emit('change')
  closeModal()
}

function handleModalCancel() {
  if (hasModalChanges()) {
    const confirmed = window.confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment annuler ?')
    if (!confirmed) return
  }
  closeModal()
}

function closeModal() {
  isModalOpen.value = false
  document.body.style.overflow = ''
}

function onModalKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    handleModalCancel()
  }
}

// Aperçu du contenu pour le bouton
const contentPreview = computed(() => {
  const md = props.modelValue || ''
  if (!md) return ''
  return md
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/!\[.*?\]\(.+?\)/g, '')
    .replace(/^[-*+]\s/gm, '')
    .replace(/^\d+\.\s/gm, '')
    .replace(/^>\s/gm, '')
    .replace(/\n{2,}/g, ' ')
    .replace(/\n/g, ' ')
    .trim()
    .slice(0, 100)
})

// Texte de fallback si contenu FR vide mais d'autres langues ont du contenu
const fallbackPreview = computed(() => {
  if (contentPreview.value) return ''
  const langs: string[] = []
  if (props.modelValueEn) langs.push('EN')
  if (props.modelValueAr) langs.push('AR')
  if (langs.length > 0) return `Contenu disponible en ${langs.join('/')}`
  return ''
})

watch(isModalOpen, (open) => {
  if (open) {
    document.addEventListener('keydown', onModalKeydown)
  } else {
    document.removeEventListener('keydown', onModalKeydown)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', onModalKeydown)
  if (isModalOpen.value) {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <!-- ========== MODE MODAL : bouton + modale plein écran ========== -->
  <template v-if="mode === 'modal'">
    <!-- Carte avec titre si showCard -->
    <div v-if="showCard && title" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
        <font-awesome-icon :icon="icon" class="h-5 w-5" :class="iconColor" />
        {{ title }}
      </h2>
      <p v-if="description" class="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {{ description }}
      </p>

      <!-- Bouton d'ouverture -->
      <button
        type="button"
        class="group w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-left transition-colors hover:border-brand-red-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-brand-red-500 dark:hover:bg-gray-800"
        @click="openModal"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 group-hover:bg-brand-red-50 group-hover:text-brand-red-500 dark:bg-gray-700 dark:group-hover:bg-brand-red-900/30">
            <font-awesome-icon :icon="['fas', 'pen-to-square']" class="h-5 w-5" />
          </div>
          <div class="min-w-0 flex-1">
            <p v-if="contentPreview" class="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
              {{ contentPreview }}{{ modelValue && modelValue.length > 100 ? '...' : '' }}
            </p>
            <p v-else-if="fallbackPreview" class="text-sm italic text-gray-500 dark:text-gray-400">
              {{ fallbackPreview }}
            </p>
            <p v-else class="text-sm italic text-gray-400 dark:text-gray-500">
              Aucun contenu
            </p>
          </div>
          <font-awesome-icon :icon="['fas', 'expand']" class="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-brand-red-500" />
        </div>
      </button>
    </div>

    <!-- Mode simple sans carte -->
    <div v-else>
      <label v-if="label" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </label>
      <button
        type="button"
        class="group w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-left transition-colors hover:border-brand-red-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-brand-red-500 dark:hover:bg-gray-800"
        @click="openModal"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 group-hover:bg-brand-red-50 group-hover:text-brand-red-500 dark:bg-gray-700 dark:group-hover:bg-brand-red-900/30">
            <font-awesome-icon :icon="['fas', 'pen-to-square']" class="h-5 w-5" />
          </div>
          <div class="min-w-0 flex-1">
            <p v-if="contentPreview" class="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
              {{ contentPreview }}{{ modelValue && modelValue.length > 100 ? '...' : '' }}
            </p>
            <p v-else-if="fallbackPreview" class="text-sm italic text-gray-500 dark:text-gray-400">
              {{ fallbackPreview }}
            </p>
            <p v-else class="text-sm italic text-gray-400 dark:text-gray-500">
              Aucun contenu
            </p>
          </div>
          <font-awesome-icon :icon="['fas', 'expand']" class="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-brand-red-500" />
        </div>
      </button>
    </div>

    <!-- Modale plein écran multilingue -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-[9999] flex flex-col bg-gray-900/80">
        <!-- Header -->
        <div class="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ title || label || 'Éditeur de contenu' }}
          </h2>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="handleModalCancel"
            >
              <font-awesome-icon :icon="['fas', 'xmark']" class="h-4 w-4" />
              Annuler
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-red-700"
              @click="handleModalConfirm"
            >
              <font-awesome-icon :icon="['fas', 'check']" class="h-4 w-4" />
              Valider
            </button>
          </div>
        </div>

        <!-- Body avec onglets de langue -->
        <div class="flex flex-1 flex-col bg-white dark:bg-gray-900">
          <!-- Onglets de langue (si multilingue) -->
          <div v-if="isMultilingual" class="border-b border-gray-200 bg-gray-50 px-4 dark:border-gray-700 dark:bg-gray-800">
            <nav class="-mb-px flex gap-4">
              <button
                v-for="lang in availableLanguages"
                :key="lang"
                type="button"
                :class="[
                  'py-3 px-1 text-sm font-medium border-b-2 transition-colors',
                  modalActiveTab === lang
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                ]"
                @click="modalActiveTab = lang"
              >
                <font-awesome-icon :icon="tabConfig[lang].icon" class="mr-1 h-3 w-3" />
                {{ tabConfig[lang].label }}
              </button>
            </nav>
          </div>

          <!-- Éditeurs inline dans la modale -->
          <div class="flex-1">
            <!-- Français -->
            <div v-if="availableLanguages.includes('fr')" v-show="modalActiveTab === 'fr'" class="h-full">
              <ToastUIEditor
                :model-value="modalMdFr"
                :placeholder="placeholder"
                :height="isMultilingual ? 'calc(100vh - 112px)' : 'calc(100vh - 64px)'"
                language="fr-FR"
                direction="ltr"
                mode="inline"
                @update:model-value="modalMdFr = $event"
                @update:html="modalHtmlFr = $event"
                @image-upload="handleImageUpload"
                @ready="onReady"
              />
            </div>

            <!-- Anglais -->
            <div v-if="availableLanguages.includes('en')" v-show="modalActiveTab === 'en'" class="h-full">
              <ToastUIEditor
                :model-value="modalMdEn"
                :placeholder="placeholderEn"
                :height="isMultilingual ? 'calc(100vh - 112px)' : 'calc(100vh - 64px)'"
                language="fr-FR"
                direction="ltr"
                mode="inline"
                @update:model-value="modalMdEn = $event"
                @update:html="modalHtmlEn = $event"
                @image-upload="handleImageUpload"
              />
            </div>

            <!-- Arabe (RTL) -->
            <div v-if="availableLanguages.includes('ar')" v-show="modalActiveTab === 'ar'" class="h-full">
              <ToastUIEditor
                :model-value="modalMdAr"
                :placeholder="placeholderAr"
                :height="isMultilingual ? 'calc(100vh - 112px)' : 'calc(100vh - 64px)'"
                language="fr-FR"
                direction="rtl"
                mode="inline"
                @update:model-value="modalMdAr = $event"
                @update:html="modalHtmlAr = $event"
                @image-upload="handleImageUpload"
              />
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </template>

  <!-- ========== MODE INLINE : comportement original ========== -->
  <template v-else>
    <!-- Mode carte avec section stylisée -->
    <div v-if="showCard && title" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
        <font-awesome-icon :icon="icon" class="h-5 w-5" :class="iconColor" />
        {{ title }}
      </h2>
      <p v-if="description" class="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {{ description }}
      </p>

      <!-- Tabs pour le mode multilingue -->
      <template v-if="isMultilingual">
        <div class="mb-4 border-b border-gray-200 dark:border-gray-700">
          <nav class="-mb-px flex gap-4">
            <button
              v-for="lang in availableLanguages"
              :key="lang"
              type="button"
              :class="[
                'pb-3 px-1 text-sm font-medium border-b-2 transition-colors',
                activeTab === lang
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              ]"
              @click="activeTab = lang"
            >
              <font-awesome-icon :icon="tabConfig[lang].icon" class="mr-1 h-3 w-3" />
              {{ tabConfig[lang].label }}
            </button>
          </nav>
        </div>

        <!-- Éditeur Français -->
        <div v-if="availableLanguages.includes('fr')" v-show="activeTab === 'fr'">
          <ToastUIEditor
            :model-value="modelValue"
            :placeholder="placeholder"
            :height="height"
            language="fr-FR"
            direction="ltr"
            mode="inline"
            @update:model-value="onMdChangeFr"
            @update:html="onHtmlChangeFr"
            @image-upload="handleImageUpload"
            @ready="onReady"
          />
        </div>

        <!-- Éditeur Anglais -->
        <div v-if="availableLanguages.includes('en')" v-show="activeTab === 'en'">
          <ToastUIEditor
            :model-value="modelValueEn"
            :placeholder="placeholderEn"
            :height="height"
            language="fr-FR"
            direction="ltr"
            mode="inline"
            @update:model-value="onMdChangeEn"
            @update:html="onHtmlChangeEn"
            @image-upload="handleImageUpload"
          />
        </div>

        <!-- Éditeur Arabe (RTL) -->
        <div v-if="availableLanguages.includes('ar')" v-show="activeTab === 'ar'">
          <ToastUIEditor
            :model-value="modelValueAr"
            :placeholder="placeholderAr"
            :height="height"
            language="fr-FR"
            direction="rtl"
            mode="inline"
            @update:model-value="onMdChangeAr"
            @update:html="onHtmlChangeAr"
            @image-upload="handleImageUpload"
          />
        </div>
      </template>

      <!-- Mode mono-langue -->
      <template v-else>
        <ToastUIEditor
          :model-value="modelValue"
          :placeholder="placeholder"
          :height="height"
          language="fr-FR"
          direction="ltr"
          mode="inline"
          @update:model-value="onMdChangeFr"
          @update:html="onHtmlChangeFr"
          @image-upload="handleImageUpload"
          @ready="onReady"
        />
      </template>
    </div>

    <!-- Mode simple (sans carte) avec label optionnel -->
    <div v-else>
      <label v-if="label" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </label>
      <ToastUIEditor
        :model-value="modelValue"
        :placeholder="placeholder"
        :height="height"
        language="fr-FR"
        direction="ltr"
        mode="inline"
        @update:model-value="onMdChangeFr"
        @update:html="onHtmlChangeFr"
        @ready="onReady"
      />
    </div>
  </template>
</template>
