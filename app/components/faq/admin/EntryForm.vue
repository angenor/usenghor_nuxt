<script setup lang="ts">
import type {
  FaqCategoryAdmin,
  FaqEntryAdminFull,
  FaqEntryCreatePayload,
  FaqEntryUpdatePayload,
} from '~/types/api/faq'

interface Props {
  entry?: FaqEntryAdminFull | null
  categories: FaqCategoryAdmin[]
  saving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  entry: null,
  saving: false,
})

const emit = defineEmits<{
  (e: 'submit', payload: FaqEntryCreatePayload | FaqEntryUpdatePayload): void
  (e: 'cancel'): void
}>()

const { t } = useI18n()
const { slugify } = useFaqApi()

const isEditMode = computed(() => !!props.entry)

const form = reactive({
  category_id: props.entry?.category_id ?? props.categories[0]?.id ?? '',
  slug: props.entry?.slug ?? '',
  question_fr: props.entry?.question_fr ?? '',
  question_en: props.entry?.question_en ?? '',
  question_ar: props.entry?.question_ar ?? '',
  answer_fr_md: props.entry?.answer_fr_md ?? '',
  answer_fr_html: props.entry?.answer_fr_html ?? '',
  answer_en_md: props.entry?.answer_en_md ?? '',
  answer_en_html: props.entry?.answer_en_html ?? '',
  answer_ar_md: props.entry?.answer_ar_md ?? '',
  answer_ar_html: props.entry?.answer_ar_html ?? '',
})

const slugManuallyEdited = ref(isEditMode.value)
const isPublished = computed(() => props.entry?.is_published ?? false)
const slugChanged = computed(
  () => isEditMode.value && form.slug !== (props.entry?.slug ?? ''),
)

watch(
  () => form.question_fr,
  (newVal) => {
    if (!slugManuallyEdited.value && newVal) {
      form.slug = slugify(newVal)
    }
  },
)

function regenerateSlug() {
  form.slug = slugify(form.question_fr)
  slugManuallyEdited.value = false
}

function onSlugInput() {
  slugManuallyEdited.value = true
}

function onAnswerUpdate(lang: 'fr' | 'en' | 'ar', md: string, html: string) {
  form[`answer_${lang}_md`] = md
  form[`answer_${lang}_html`] = html
}

const errorMessage = ref<string | null>(null)

function handleSubmit() {
  errorMessage.value = null
  if (!form.category_id) {
    errorMessage.value = t('faq.admin.fieldCategory') + ' *'
    return
  }
  if (!form.question_fr || form.question_fr.length < 3) {
    errorMessage.value = t('faq.admin.fieldQuestionFr') + ' *'
    return
  }
  if (!form.answer_fr_html || !form.answer_fr_md) {
    errorMessage.value = t('faq.admin.fieldAnswerFr') + ' *'
    return
  }

  if (isEditMode.value) {
    const payload: FaqEntryUpdatePayload = {
      category_id: form.category_id,
      slug: form.slug,
      question_fr: form.question_fr,
      question_en: form.question_en || null,
      question_ar: form.question_ar || null,
      answer_fr_md: form.answer_fr_md,
      answer_fr_html: form.answer_fr_html,
      answer_en_md: form.answer_en_md || null,
      answer_en_html: form.answer_en_html || null,
      answer_ar_md: form.answer_ar_md || null,
      answer_ar_html: form.answer_ar_html || null,
    }
    emit('submit', payload)
  }
  else {
    const payload: FaqEntryCreatePayload = {
      category_id: form.category_id,
      slug: form.slug || undefined,
      question_fr: form.question_fr,
      question_en: form.question_en || null,
      question_ar: form.question_ar || null,
      answer_fr_md: form.answer_fr_md,
      answer_fr_html: form.answer_fr_html,
      answer_en_md: form.answer_en_md || null,
      answer_en_html: form.answer_en_html || null,
      answer_ar_md: form.answer_ar_md || null,
      answer_ar_html: form.answer_ar_html || null,
    }
    emit('submit', payload)
  }
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div v-if="errorMessage" class="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
      {{ errorMessage }}
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium">{{ t('faq.admin.fieldCategory') }} *</span>
        <select
          v-model="form.category_id"
          class="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
          required
        >
          <option v-for="c in categories" :key="c.id" :value="c.id">
            {{ c.label_fr }} ({{ c.code }})
          </option>
        </select>
      </label>

      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium">{{ t('faq.admin.fieldSlug') }}</span>
        <div class="flex gap-2">
          <input
            v-model="form.slug"
            type="text"
            class="flex-1 rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
            @input="onSlugInput"
          >
          <button
            type="button"
            class="rounded-lg bg-gray-100 px-3 text-xs hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            @click="regenerateSlug"
          >
            {{ t('faq.admin.regenerateSlug') }}
          </button>
        </div>
        <p
          v-if="isPublished && slugChanged"
          class="mt-1 text-xs text-amber-700 dark:text-amber-400"
        >
          ⚠ {{ t('faq.admin.slugWarningPublished') }}
        </p>
      </label>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium">{{ t('faq.admin.fieldQuestionFr') }} *</span>
        <input
          v-model="form.question_fr"
          type="text"
          required
          minlength="3"
          maxlength="300"
          class="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        >
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium">{{ t('faq.admin.fieldQuestionEn') }}</span>
        <input
          v-model="form.question_en"
          type="text"
          maxlength="300"
          class="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        >
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium">{{ t('faq.admin.fieldQuestionAr') }}</span>
        <input
          v-model="form.question_ar"
          type="text"
          dir="rtl"
          maxlength="300"
          class="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        >
      </label>
    </div>

    <div class="space-y-4">
      <div>
        <p class="mb-2 text-sm font-medium">
          {{ t('faq.admin.fieldAnswerFr') }} *
        </p>
        <ToastUIEditor
          :model-value="form.answer_fr_md"
          mode="inline"
          height="320px"
          @update:model-value="(md) => form.answer_fr_md = md"
          @update:html="(html) => form.answer_fr_html = html"
        />
      </div>
      <div>
        <p class="mb-2 text-sm font-medium">
          {{ t('faq.admin.fieldAnswerEn') }}
        </p>
        <ToastUIEditor
          :model-value="form.answer_en_md ?? ''"
          mode="inline"
          height="320px"
          @update:model-value="(md) => form.answer_en_md = md"
          @update:html="(html) => form.answer_en_html = html"
        />
      </div>
      <div>
        <p class="mb-2 text-sm font-medium">
          {{ t('faq.admin.fieldAnswerAr') }}
        </p>
        <ToastUIEditor
          :model-value="form.answer_ar_md ?? ''"
          mode="inline"
          height="320px"
          direction="rtl"
          @update:model-value="(md) => form.answer_ar_md = md"
          @update:html="(html) => form.answer_ar_html = html"
        />
      </div>
    </div>

    <div class="flex justify-end gap-3">
      <button
        type="button"
        class="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        @click="emit('cancel')"
      >
        {{ t('faq.admin.cancel') }}
      </button>
      <button
        type="submit"
        :disabled="saving"
        class="rounded-lg bg-brand-blue-600 px-4 py-2 text-sm text-white hover:bg-brand-blue-700 disabled:opacity-50"
      >
        {{ t('faq.admin.save') }}
      </button>
    </div>
  </form>
</template>
