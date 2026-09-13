<script setup lang="ts">
/**
 * Onglets de langue (FR / EN / AR) pour les champs simples trilingues des formulaires PEI.
 * Le slot par défaut est rendu en RTL quand l'arabe est actif.
 */
type Lang = 'fr' | 'en' | 'ar'

const props = defineProps<{
  modelValue: Lang
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Lang]
}>()

const tabs: { lang: Lang, label: string, icon: string }[] = [
  { lang: 'fr', label: 'Français', icon: 'fa-solid fa-flag' },
  { lang: 'en', label: 'English', icon: 'fa-solid fa-globe' },
  { lang: 'ar', label: 'العربية', icon: 'fa-solid fa-language' },
]
</script>

<template>
  <div>
    <div class="mb-4 border-b border-gray-200 dark:border-gray-700">
      <nav class="-mb-px flex gap-4" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.lang"
          type="button"
          role="tab"
          :aria-selected="props.modelValue === tab.lang"
          :class="[
            'border-b-2 px-1 pb-3 text-sm font-medium transition-colors',
            props.modelValue === tab.lang
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
          ]"
          @click="emit('update:modelValue', tab.lang)"
        >
          <font-awesome-icon :icon="tab.icon" class="mr-1 h-3 w-3" />
          {{ tab.label }}
        </button>
      </nav>
    </div>
    <div :dir="props.modelValue === 'ar' ? 'rtl' : 'ltr'">
      <slot />
    </div>
  </div>
</template>
