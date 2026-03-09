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
})

const emit = defineEmits<Emits>()

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
        <ToastUIEditor
          :model-value="modelValue"
          :placeholder="placeholder"
          :height="height"
          language="fr-FR"
          direction="ltr"
          @update:model-value="onMdChangeFr"
          @update:html="onHtmlChangeFr"
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
          @update:model-value="onMdChangeEn"
          @update:html="onHtmlChangeEn"
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
          @update:model-value="onMdChangeAr"
          @update:html="onHtmlChangeAr"
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
        @update:model-value="onMdChangeFr"
        @update:html="onHtmlChangeFr"
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
      @update:model-value="onMdChangeFr"
      @update:html="onHtmlChangeFr"
      @ready="onReady"
    />
  </div>
</template>
