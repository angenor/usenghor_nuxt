<script setup lang="ts">
import 'survey-core/survey-core.min.css'
import 'survey-core/i18n/french'
import 'survey-core/i18n/arabic'
import { Model } from 'survey-core'
import { SurveyComponent } from 'survey-vue3-ui'

const props = defineProps<{
  surveyJson: Record<string, any>
  locale?: string
  slug?: string
  sessionId?: string
}>()

const emit = defineEmits<{
  complete: [data: Record<string, any>]
  uploadFiles: [question: any, options: any]
}>()

const { locale: i18nLocale } = useI18n()
const { submitResponse, uploadFile } = usePublicSurveyApi()

const submitting = ref(false)
const submitError = ref<string | null>(null)

function normalizeSurveyJson(json: Record<string, any>): Record<string, any> {
  const copy = JSON.parse(JSON.stringify(json))
  const elements = copy.elements || copy.pages?.flatMap((p: any) => p.elements || []) || []
  for (const el of elements) {
    if (el.type === 'rating' && el.rateCount && !el.rateMax) {
      el.rateMax = el.rateCount
      delete el.rateCount
    }
  }
  return copy
}

const surveyModel = computed(() => {
  const model = new Model(normalizeSurveyJson(props.surveyJson))

  // Configurer la locale
  const surveyLocale = props.locale || i18nLocale.value
  model.locale = surveyLocale

  // Ajouter un champ honeypot invisible
  model.onAfterRenderSurvey.add((sender) => {
    const container = document.querySelector('.survey-renderer')
    if (container && !container.querySelector('.hp-field')) {
      const hp = document.createElement('div')
      hp.className = 'hp-field'
      hp.style.position = 'absolute'
      hp.style.left = '-9999px'
      hp.style.opacity = '0'
      hp.style.height = '0'
      hp.style.overflow = 'hidden'
      hp.innerHTML = '<input type="text" name="website" tabindex="-1" autocomplete="off">'
      container.appendChild(hp)
    }
  })

  // Callback de soumission
  model.onComplete.add(async (sender) => {
    if (!props.slug) {
      emit('complete', sender.data)
      return
    }

    submitting.value = true
    submitError.value = null

    try {
      await submitResponse(props.slug, sender.data, props.sessionId || '')
      emit('complete', sender.data)
    } catch (e: any) {
      submitError.value = e?.data?.detail || 'Erreur lors de la soumission'
      // Remettre le survey en mode édition si erreur
      sender.clear(false, true)
    } finally {
      submitting.value = false
    }
  })

  // Callback d'upload de fichiers
  if (props.slug) {
    model.onUploadFiles.add(async (sender, options) => {
      try {
        const uploaded = []
        for (const file of options.files) {
          const result = await uploadFile(props.slug!, file)
          uploaded.push({
            file,
            content: result.url,
          })
        }
        options.callback('success', uploaded)
      } catch {
        options.callback('error')
      }
    })
  } else {
    model.onUploadFiles.add((sender, options) => {
      emit('uploadFiles', sender, options)
    })
  }

  return model
})
</script>

<template>
  <div class="survey-renderer relative">
    <!-- Erreur de soumission -->
    <div v-if="submitError" class="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
      {{ submitError }}
    </div>

    <SurveyComponent :model="surveyModel" />
  </div>
</template>

<style scoped>
.survey-renderer :deep(.sd-root-modern) {
  --sjs-primary-backcolor: #1e3a5f;
  --sjs-primary-backcolor-light: rgba(30, 58, 95, 0.1);
  --sjs-primary-backcolor-dark: #162d4a;
  --sjs-primary-forecolor: #fff;
}
</style>

<!-- Dark mode non-scoped : html.dark est hors du scope du composant -->
<style>
html.dark .survey-renderer .sd-root-modern {
  --sjs-general-backcolor: transparent;
  --sjs-general-backcolor-dim: transparent;
  --sjs-general-backcolor-dim-light: rgba(255, 255, 255, 0.03);
  --sjs-general-forecolor: rgba(255, 255, 255, 0.85);
  --sjs-general-forecolor-light: rgba(255, 255, 255, 0.5);
  --sjs-border-default: rgba(255, 255, 255, 0.12);
  --sjs-border-light: rgba(255, 255, 255, 0.08);
  --sjs-editor-background: rgba(255, 255, 255, 0.06);
  --sjs-editorpanel-backcolor: rgba(255, 255, 255, 0.04);
  --sjs-primary-backcolor: #3b82f6;
  --sjs-primary-backcolor-light: rgba(59, 130, 246, 0.15);
  --sjs-primary-backcolor-dark: #2563eb;
  --sjs-shadow-small: 0 1px 2px rgba(0, 0, 0, 0.4);
  --sjs-shadow-medium: 0 4px 8px rgba(0, 0, 0, 0.35);
  --sjs-shadow-large: 0 8px 16px rgba(0, 0, 0, 0.3);
  --sjs-shadow-inner: inset 0 1px 3px rgba(0, 0, 0, 0.3);
  --sjs-font-questiontitle-color: rgba(255, 255, 255, 0.9);
  --sjs-font-questiondescription-color: rgba(255, 255, 255, 0.5);
  --sjs-font-editorfont-color: rgba(255, 255, 255, 0.85);
  --sjs-font-editorfont-placeholdercolor: rgba(255, 255, 255, 0.35);
}
</style>
