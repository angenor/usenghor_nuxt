<script setup lang="ts">
import type { OutputData, API } from '@editorjs/editorjs'

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
  /** v-model pour le contenu FR */
  modelValue?: OutputData
  /** v-model pour le contenu EN (optionnel, active les tabs multilingues) */
  modelValueEn?: OutputData
  /** v-model pour le contenu AR (optionnel, active les tabs multilingues avec arabe) */
  modelValueAr?: OutputData
  /** Placeholder pour l'éditeur FR */
  placeholder?: string
  /** Placeholder pour l'éditeur EN */
  placeholderEn?: string
  /** Placeholder pour l'éditeur AR */
  placeholderAr?: string
  /** Hauteur minimale de l'éditeur */
  minHeight?: number
  /** Afficher dans une carte avec styling de section admin */
  showCard?: boolean
  /** Label pour l'éditeur simple (sans tabs) */
  label?: string
  /** Champ requis */
  required?: boolean
  /** Langues à afficher (défaut: toutes les langues avec un v-model fourni) */
  languages?: Language[]
}

interface Emits {
  (e: 'update:modelValue', data: OutputData | undefined): void
  (e: 'update:modelValueEn', data: OutputData | undefined): void
  (e: 'update:modelValueAr', data: OutputData | undefined): void
  (e: 'change'): void
  (e: 'ready', api: API): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  icon: 'fa-solid fa-file-lines',
  iconColor: 'text-indigo-500',
  modelValue: undefined,
  modelValueEn: undefined,
  modelValueAr: undefined,
  placeholder: 'Commencez à écrire...',
  placeholderEn: 'Start writing...',
  placeholderAr: 'ابدأ في الكتابة هنا...',
  minHeight: 300,
  showCard: true,
  label: '',
  required: false,
  languages: undefined
})

const emit = defineEmits<Emits>()

// Déterminer les langues disponibles
const availableLanguages = computed<Language[]>(() => {
  if (props.languages) {
    return props.languages
  }
  // Auto-détection basée sur les props fournis
  const langs: Language[] = ['fr']
  if (props.modelValueEn !== undefined || props.placeholderEn !== 'Start writing...') {
    langs.push('en')
  }
  if (props.modelValueAr !== undefined || props.placeholderAr !== 'ابدأ بالكتابة...') {
    langs.push('ar')
  }
  return langs
})

// Mode multilingue activé si plus d'une langue
const isMultilingual = computed(() => availableLanguages.value.length > 1)

// Tab active pour l'éditeur multilingue
const activeTab = ref<Language>('fr')

// Valeurs locales pour v-model
const contentFr = ref<OutputData | undefined>(props.modelValue)
const contentEn = ref<OutputData | undefined>(props.modelValueEn)
const contentAr = ref<OutputData | undefined>(props.modelValueAr)

// Sync props -> local
watch(() => props.modelValue, (val) => {
  contentFr.value = val
}, { deep: true })

watch(() => props.modelValueEn, (val) => {
  contentEn.value = val
}, { deep: true })

watch(() => props.modelValueAr, (val) => {
  contentAr.value = val
}, { deep: true })

// Handlers
const onContentFrChange = () => {
  emit('update:modelValue', contentFr.value)
  emit('change')
}

const onContentEnChange = () => {
  emit('update:modelValueEn', contentEn.value)
  emit('change')
}

const onContentArChange = () => {
  emit('update:modelValueAr', contentAr.value)
  emit('change')
}

const onReady = (api: API) => {
  emit('ready', api)
}

// Configuration des onglets
const tabConfig: Record<Language, { label: string; icon: string; loadingText: string }> = {
  fr: { label: 'Français', icon: 'fa-solid fa-flag', loadingText: 'Chargement de l\'éditeur...' },
  en: { label: 'English', icon: 'fa-solid fa-globe', loadingText: 'Loading editor...' },
  ar: { label: 'العربية', icon: 'fa-solid fa-language', loadingText: 'جارٍ تحميل المحرر...' }
}
</script>

<template>
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
        <ClientOnly>
          <EditorJS
            v-model="contentFr"
            :placeholder="placeholder"
            :min-height="minHeight"
            @change="onContentFrChange"
            @ready="onReady"
          />
          <template #fallback>
            <div
              class="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              :style="{ minHeight: `${minHeight}px` }"
            >
              <div class="text-center">
                <font-awesome-icon icon="fa-solid fa-spinner" class="h-6 w-6 animate-spin text-gray-400" />
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ tabConfig.fr.loadingText }}</p>
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>

      <!-- Éditeur Anglais -->
      <div v-if="availableLanguages.includes('en')" v-show="activeTab === 'en'">
        <ClientOnly>
          <EditorJS
            v-model="contentEn"
            :placeholder="placeholderEn"
            :min-height="minHeight"
            @change="onContentEnChange"
          />
          <template #fallback>
            <div
              class="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              :style="{ minHeight: `${minHeight}px` }"
            >
              <div class="text-center">
                <font-awesome-icon icon="fa-solid fa-spinner" class="h-6 w-6 animate-spin text-gray-400" />
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ tabConfig.en.loadingText }}</p>
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>

      <!-- Éditeur Arabe (RTL) -->
      <div v-if="availableLanguages.includes('ar')" v-show="activeTab === 'ar'" dir="rtl">
        <ClientOnly>
          <EditorJS
            v-model="contentAr"
            :placeholder="placeholderAr"
            :min-height="minHeight"
            class="editor-rtl"
            @change="onContentArChange"
          />
          <template #fallback>
            <div
              class="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              :style="{ minHeight: `${minHeight}px` }"
            >
              <div class="text-center">
                <font-awesome-icon icon="fa-solid fa-spinner" class="h-6 w-6 animate-spin text-gray-400" />
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ tabConfig.ar.loadingText }}</p>
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </template>

    <!-- Mode mono-langue -->
    <template v-else>
      <ClientOnly>
        <EditorJS
          v-model="contentFr"
          :placeholder="placeholder"
          :min-height="minHeight"
          @change="onContentFrChange"
          @ready="onReady"
        />
        <template #fallback>
          <div
            class="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
            :style="{ minHeight: `${minHeight}px` }"
          >
            <div class="text-center">
              <font-awesome-icon icon="fa-solid fa-spinner" class="h-6 w-6 animate-spin text-gray-400" />
              <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ tabConfig.fr.loadingText }}</p>
            </div>
          </div>
        </template>
      </ClientOnly>
    </template>
  </div>

  <!-- Mode simple (sans carte) avec label optionnel -->
  <div v-else>
    <label v-if="label" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <ClientOnly>
      <EditorJS
        v-model="contentFr"
        :placeholder="placeholder"
        :min-height="minHeight"
        @change="onContentFrChange"
        @ready="onReady"
      />
      <template #fallback>
        <div
          class="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          :style="{ minHeight: `${minHeight}px` }"
        >
          <div class="text-center">
            <font-awesome-icon icon="fa-solid fa-spinner" class="h-6 w-6 animate-spin text-gray-400" />
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ tabConfig.fr.loadingText }}</p>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
/* Styles RTL pour l'éditeur arabe */
.editor-rtl :deep(.codex-editor) {
  direction: rtl;
  text-align: right;
}

.editor-rtl :deep(.ce-block__content) {
  direction: rtl;
  text-align: right;
}

.editor-rtl :deep(.ce-paragraph) {
  direction: rtl;
  text-align: right;
}

.editor-rtl :deep(.ce-header) {
  direction: rtl;
  text-align: right;
}

.editor-rtl :deep(.cdx-list) {
  direction: rtl;
  text-align: right;
  padding-right: 40px;
  padding-left: 0;
}

.editor-rtl :deep(.cdx-quote__text) {
  direction: rtl;
  text-align: right;
  border-right: 4px solid;
  border-left: none;
  padding-right: 1rem;
  padding-left: 0;
}

.editor-rtl :deep(.ce-toolbar) {
  left: auto;
  right: 0;
}

.editor-rtl :deep(.ce-toolbar__plus) {
  left: auto;
  right: -34px;
}

.editor-rtl :deep(.ce-toolbar__actions) {
  right: auto;
  left: 0;
}
</style>
