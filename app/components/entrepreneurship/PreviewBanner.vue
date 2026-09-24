<script setup lang="ts">
/**
 * Bandeau du mode aperçu du mini-site PEI (`usePeiPreview`), fixé sous l'en-tête du site.
 * À placer en tête des pages du mini-site ; la sous-navigation se décale avec
 * `<EntrepreneurshipSubNav :below-preview-banner="preview" />`.
 */
const { t } = useI18n()
const route = useRoute()
const { preview } = usePeiPreview()

/** Même page, état réel (`?apercu=0`), sans l'ancre. */
const exitHref = computed(() => `${route.path}?${PEI_PREVIEW_QUERY}=0`)
</script>

<template>
  <div
    v-if="preview"
    role="note"
    class="fixed inset-x-0 top-20 z-40 flex h-11 items-center border-b border-amber-300 bg-amber-100 text-amber-950 shadow-sm dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
  >
    <div class="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
      <font-awesome-icon icon="fa-solid fa-eye" class="h-4 w-4 shrink-0" aria-hidden="true" />
      <p class="line-clamp-2 min-w-0 flex-1 text-xs leading-tight sm:text-[13px]">
        <strong class="font-extrabold">{{ t('pei.home.preview.label') }}</strong>
        — {{ t('pei.home.preview.message') }}
      </p>
      <a
        :href="exitHref"
        class="inline-flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded-md px-2 text-xs font-bold hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-900 dark:hover:bg-amber-900 dark:focus-visible:outline-amber-100 sm:text-[13px]"
      >
        <font-awesome-icon icon="fa-solid fa-xmark" class="h-4 w-4 sm:hidden" aria-hidden="true" />
        <span class="sr-only underline underline-offset-2 sm:not-sr-only">{{ t('pei.home.preview.exit') }}</span>
      </a>
    </div>
  </div>
</template>
