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

const surveyModel = computed(() => {
  const model = new Model(props.surveyJson)

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
