<script setup lang="ts">
import type { CallRequiredDocumentRead } from '~/types/api'

interface Props {
  documents: CallRequiredDocumentRead[]
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <div v-if="documents && documents.length > 0" class="mb-8">
    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
      <font-awesome-icon icon="fa-solid fa-file-alt" class="text-brand-blue-500" />
      {{ t('actualites.detail.call.requiredDocuments') || 'Documents requis' }}
    </h3>
    <div class="space-y-3">
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-blue-100 dark:bg-brand-blue-900/30 text-brand-blue-600 dark:text-brand-blue-400 flex items-center justify-center">
              <font-awesome-icon icon="fa-solid fa-file" class="w-5 h-5" />
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ doc.document_name }}
                <span v-if="doc.is_mandatory" class="text-red-600 ml-1">*</span>
              </p>
              <p v-if="doc.description" class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ doc.description }}</p>
              <div class="flex flex-wrap gap-2 mt-2">
                <span v-if="doc.accepted_formats" class="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                  {{ doc.accepted_formats.toUpperCase() }}
                </span>
                <span v-if="doc.max_size_mb" class="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                  Max {{ doc.max_size_mb }} Mo
                </span>
              </div>
            </div>
          </div>
          <span
            v-if="doc.is_mandatory"
            class="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded font-medium"
          >
            Obligatoire
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
