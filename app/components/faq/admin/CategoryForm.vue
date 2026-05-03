<script setup lang="ts">
import type {
  FaqCategoryAdmin,
  FaqCategoryCreatePayload,
  FaqCategoryUpdatePayload,
} from '~/types/api/faq'

interface Props {
  category?: FaqCategoryAdmin | null
  saving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  category: null,
  saving: false,
})

const emit = defineEmits<{
  (e: 'submit', payload: FaqCategoryCreatePayload | FaqCategoryUpdatePayload): void
  (e: 'cancel'): void
}>()

const { t } = useI18n()

const isEditMode = computed(() => !!props.category)

const form = reactive({
  code: props.category?.code ?? '',
  label_fr: props.category?.label_fr ?? '',
  label_en: props.category?.label_en ?? '',
  label_ar: props.category?.label_ar ?? '',
  description_fr: props.category?.description_fr ?? '',
  description_en: props.category?.description_en ?? '',
  description_ar: props.category?.description_ar ?? '',
  is_active: props.category?.is_active ?? true,
})

function handleSubmit() {
  if (isEditMode.value) {
    const payload: FaqCategoryUpdatePayload = {
      label_fr: form.label_fr,
      label_en: form.label_en || null,
      label_ar: form.label_ar || null,
      description_fr: form.description_fr || null,
      description_en: form.description_en || null,
      description_ar: form.description_ar || null,
      is_active: form.is_active,
    }
    emit('submit', payload)
  }
  else {
    const payload: FaqCategoryCreatePayload = {
      code: form.code,
      label_fr: form.label_fr,
      label_en: form.label_en || null,
      label_ar: form.label_ar || null,
      description_fr: form.description_fr || null,
      description_en: form.description_en || null,
      description_ar: form.description_ar || null,
      is_active: form.is_active,
    }
    emit('submit', payload)
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <label class="flex flex-col gap-1 text-sm">
      <span class="font-medium">{{ t('faq.admin.fieldCode') }} *</span>
      <input
        v-model="form.code"
        type="text"
        required
        :readonly="isEditMode"
        :disabled="isEditMode"
        maxlength="60"
        class="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
      >
      <span v-if="isEditMode" class="text-xs text-gray-500">
        {{ t('faq.admin.codeImmutable') }}
      </span>
    </label>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium">{{ t('faq.admin.fieldLabelFr') }} *</span>
        <input
          v-model="form.label_fr"
          type="text"
          required
          minlength="1"
          maxlength="120"
          class="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        >
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium">{{ t('faq.admin.fieldLabelEn') }}</span>
        <input
          v-model="form.label_en"
          type="text"
          maxlength="120"
          class="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        >
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium">{{ t('faq.admin.fieldLabelAr') }}</span>
        <input
          v-model="form.label_ar"
          type="text"
          dir="rtl"
          maxlength="120"
          class="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        >
      </label>
    </div>

    <label class="flex items-center gap-2 text-sm">
      <input v-model="form.is_active" type="checkbox" class="rounded">
      <span>{{ t('faq.admin.fieldIsActive') }}</span>
    </label>

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
