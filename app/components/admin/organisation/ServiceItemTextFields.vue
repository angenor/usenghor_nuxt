<script setup lang="ts">
/**
 * Champs texte trilingues d'un objectif / d'une réalisation / d'un projet de service :
 * titre FR (requis), titres EN / AR, bouton « Traduire » (même comportement que la
 * modale service : les traductions générées remplacent les champs EN / AR) et
 * description riche FR / EN / AR (`AdminRichTextEditor` en mode `modal`, seul mode
 * qui affiche les onglets de langue).
 *
 * Un v-model par champ (et non un objet) : l'éditeur riche émet ses six valeurs
 * dans le même tick à la validation, sans risque d'écrasement.
 */
import type {
  ServiceSubItemTranslateRequest,
  ServiceSubItemTranslateResponse,
} from '~/composables/useServicesApi'

const props = withDefaults(defineProps<{
  /** Traduction FR → EN/AR sans persistance (translateServiceObjective, etc.) */
  translate: (payload: ServiceSubItemTranslateRequest) => Promise<ServiceSubItemTranslateResponse>
  titleLabel?: string
  titlePlaceholder?: string
  descriptionLabel?: string
  descriptionPlaceholder?: string
  /** Message d'erreur de validation du titre FR */
  titleError?: string | null
  disabled?: boolean
}>(), {
  titleLabel: 'Titre',
  titlePlaceholder: '',
  descriptionLabel: 'Description',
  descriptionPlaceholder: 'Rédigez la description…',
  titleError: null,
  disabled: false,
})

const title = defineModel<string>('title', { default: '' })
const titleEn = defineModel<string>('titleEn', { default: '' })
const titleAr = defineModel<string>('titleAr', { default: '' })
const descriptionMd = defineModel<string>('descriptionMd', { default: '' })
const descriptionHtml = defineModel<string>('descriptionHtml', { default: '' })
const descriptionEnMd = defineModel<string>('descriptionEnMd', { default: '' })
const descriptionEnHtml = defineModel<string>('descriptionEnHtml', { default: '' })
const descriptionArMd = defineModel<string>('descriptionArMd', { default: '' })
const descriptionArHtml = defineModel<string>('descriptionArHtml', { default: '' })

const { t } = useI18n()
const uid = useId()
const ids = {
  title: `service-item-title-${uid}`,
  titleError: `service-item-title-error-${uid}`,
  titleEn: `service-item-title-en-${uid}`,
  titleAr: `service-item-title-ar-${uid}`,
  translateHint: `service-item-translate-hint-${uid}`,
}

// === TRADUCTION AUTO FR → EN/AR (reprise de la modale service) ===
const translating = ref(false)
const translateMessage = ref<{ type: 'success' | 'error', text: string } | null>(null)

async function handleTranslate() {
  translateMessage.value = null
  if (!title.value.trim() && !descriptionMd.value.trim()) {
    translateMessage.value = { type: 'error', text: t('adminTranslate.translateNeedsFr') }
    return
  }
  translating.value = true
  try {
    const res = await props.translate({
      title: title.value.trim() || null,
      description_html: descriptionHtml.value || null,
      description_md: descriptionMd.value || null,
    })
    if (res.title_en != null) titleEn.value = res.title_en
    if (res.title_ar != null) titleAr.value = res.title_ar
    if (res.description_en_html != null) descriptionEnHtml.value = res.description_en_html
    if (res.description_en_md != null) descriptionEnMd.value = res.description_en_md
    if (res.description_ar_html != null) descriptionArHtml.value = res.description_ar_html
    if (res.description_ar_md != null) descriptionArMd.value = res.description_ar_md
    translateMessage.value = { type: 'success', text: t('adminTranslate.translateSuccess') }
  }
  catch (e) {
    console.error('Erreur traduction :', e)
    translateMessage.value = { type: 'error', text: t('adminTranslate.translateError') }
  }
  finally {
    translating.value = false
  }
}

const inputClass = 'w-full rounded-lg border bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-red-500 disabled:opacity-60 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500'
const smallInputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
</script>

<template>
  <div class="space-y-5">
    <!-- Titre FR -->
    <div>
      <label :for="ids.title" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ titleLabel }} <span class="text-red-600 dark:text-red-400" aria-hidden="true">*</span>
        <span class="sr-only">(obligatoire)</span>
      </label>
      <input
        :id="ids.title"
        v-model="title"
        data-autofocus
        type="text"
        maxlength="255"
        required
        aria-required="true"
        :aria-invalid="titleError ? 'true' : undefined"
        :aria-describedby="titleError ? ids.titleError : undefined"
        :disabled="disabled"
        :placeholder="titlePlaceholder"
        :class="[inputClass, titleError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600']"
      >
      <p v-if="titleError" :id="ids.titleError" class="mt-1 text-xs text-red-600 dark:text-red-400">
        {{ titleError }}
      </p>
    </div>

    <!-- Traduction auto FR → EN/AR -->
    <div class="space-y-3 rounded-lg border border-dashed border-blue-300 bg-blue-50/50 p-3 dark:border-blue-700 dark:bg-blue-900/20">
      <div class="flex flex-wrap items-center gap-3">
        <button
          type="button"
          :disabled="translating || disabled"
          :aria-describedby="ids.translateHint"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 dark:focus-visible:ring-offset-gray-800"
          @click="handleTranslate"
        >
          <font-awesome-icon v-if="translating" :icon="['fas', 'spinner']" class="animate-spin" aria-hidden="true" />
          <font-awesome-icon v-else :icon="['fas', 'language']" aria-hidden="true" />
          {{ translating ? t('adminTranslate.translating') : t('adminTranslate.translate') }}
        </button>
        <p :id="ids.translateHint" class="min-w-0 flex-1 text-xs text-gray-600 dark:text-gray-400">
          {{ t('adminTranslate.translateHint') }}
        </p>
      </div>
      <p
        v-if="translateMessage"
        :role="translateMessage.type === 'error' ? 'alert' : 'status'"
        class="text-xs"
        :class="translateMessage.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'"
      >
        {{ translateMessage.text }}
      </p>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label :for="ids.titleEn" class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">{{ titleLabel }} (EN)</label>
          <input
            :id="ids.titleEn"
            v-model="titleEn"
            type="text"
            lang="en"
            maxlength="255"
            :disabled="disabled"
            :class="smallInputClass"
          >
        </div>
        <div>
          <label :for="ids.titleAr" class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">{{ titleLabel }} (AR)</label>
          <input
            :id="ids.titleAr"
            v-model="titleAr"
            type="text"
            lang="ar"
            dir="rtl"
            maxlength="255"
            :disabled="disabled"
            :class="smallInputClass"
          >
        </div>
      </div>
      <p class="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <font-awesome-icon :icon="['fas', 'circle-info']" class="mt-0.5 h-3 w-3 flex-shrink-0" aria-hidden="true" />
        <span>
          Les traductions EN/AR de la description se trouvent dans les onglets de l'éditeur.
          Les traductions laissées vides sont complétées automatiquement à l'enregistrement.
        </span>
      </p>
    </div>

    <!-- Description riche FR / EN / AR -->
    <AdminRichTextEditor
      v-model="descriptionMd"
      v-model:html-value="descriptionHtml"
      v-model:model-value-en="descriptionEnMd"
      v-model:html-value-en="descriptionEnHtml"
      v-model:model-value-ar="descriptionArMd"
      v-model:html-value-ar="descriptionArHtml"
      mode="modal"
      :languages="['fr', 'en', 'ar']"
      :label="descriptionLabel"
      :placeholder="descriptionPlaceholder"
      :show-card="false"
    />
  </div>
</template>
