<script setup lang="ts">
/**
 * Hero de « Nos alumni » (mini-site PEI) : fond bleu nuit, fil d'Ariane partagé, titre sur deux
 * lignes (la seconde en rouge clair, cf. `splitPeiTitle`), sous-titre et mosaïque de portraits
 * en escalier posée sur le bas du hero (1 à 3 photos ; masquée sans photo).
 */
import type { PeiBreadcrumbItem } from '~/composables/usePeiJsonLd'

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  breadcrumb?: PeiBreadcrumbItem[]
  /** Adresses des portraits de la mosaïque (les trois premières). */
  portraits?: string[]
  /** Bandeau d'aperçu fixe au-dessus : contenu décalé vers le bas. */
  belowPreviewBanner?: boolean
}>(), {
  subtitle: undefined,
  breadcrumb: () => [],
  portraits: () => [],
  belowPreviewBanner: false,
})

const { t } = useI18n()
const localePath = useLocalePath()

const titleParts = computed(() => splitPeiTitle(props.title))

const failed = ref<number[]>([])
const tiles = computed(() =>
  props.portraits
    .slice(0, 3)
    .map((src, index) => ({ src, index }))
    .filter(tile => !!tile.src && !failed.value.includes(tile.index)),
)
watch(() => props.portraits, () => { failed.value = [] })

/** Décalages verticaux de l'escalier (maquette : 96 px, 0, 48 px). */
const OFFSETS = ['mt-12 lg:mt-24', '', 'mt-6 lg:mt-12']
</script>

<template>
  <section class="relative overflow-hidden bg-brand-blue-900 text-white dark:bg-brand-blue-950" aria-labelledby="pei-alumni-title">
    <div
      class="relative mx-auto grid max-w-7xl items-end gap-10 px-4 sm:px-6 lg:gap-16 lg:px-8"
      :class="[
        belowPreviewBanner ? 'pt-40 lg:pt-44' : 'pt-28 lg:pt-36',
        tiles.length ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] xl:grid-cols-[minmax(0,1fr)_35rem]' : '',
      ]"
    >
      <div class="flex min-w-0 flex-col gap-7" :class="tiles.length ? 'lg:pb-[4.5rem]' : 'pb-16 lg:pb-24'">
        <nav v-if="breadcrumb.length" :aria-label="t('pei.breadcrumb.label')">
          <ol class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-brand-blue-200">
            <li v-for="(item, index) in breadcrumb" :key="index" class="flex items-center gap-2">
              <NuxtLink v-if="item.to" :to="localePath(item.to)" class="transition-colors hover:text-white">
                {{ item.label }}
              </NuxtLink>
              <span v-else class="font-semibold text-brand-red-300" aria-current="page">{{ item.label }}</span>
              <font-awesome-icon
                v-if="index < breadcrumb.length - 1"
                icon="fa-solid fa-chevron-right"
                class="h-2.5 w-2.5 text-white/40 rtl:rotate-180"
                aria-hidden="true"
              />
            </li>
          </ol>
        </nav>

        <h1
          id="pei-alumni-title"
          class="break-words text-[3rem] font-black leading-[0.95] tracking-[-0.045em] [text-wrap:balance] sm:text-[3.75rem] xl:text-[5.25rem]"
        >
          {{ titleParts[0] }}<template v-if="titleParts[1]">
            <br><span class="text-[#ff8a8a]">{{ titleParts[1] }}</span>
          </template>
        </h1>

        <p v-if="subtitle" class="max-w-[35rem] text-[1.125rem] leading-relaxed text-brand-blue-100 sm:text-[1.25rem]">
          {{ subtitle }}
        </p>
      </div>

      <div
        v-if="tiles.length"
        aria-hidden="true"
        class="grid h-60 gap-3 sm:h-80 lg:h-[27.5rem]"
        :style="{ gridTemplateColumns: `repeat(${tiles.length}, minmax(0, 1fr))` }"
      >
        <div
          v-for="(tile, position) in tiles"
          :key="`${tile.index}-${tile.src}`"
          class="overflow-hidden rounded-t-[1.125rem] bg-brand-blue-800"
          :class="OFFSETS[position]"
        >
          <img
            :src="tile.src"
            alt=""
            class="h-full w-full object-cover"
            :fetchpriority="position === 0 ? 'high' : 'auto'"
            decoding="async"
            @error="failed.push(tile.index)"
          >
        </div>
      </div>
    </div>
  </section>
</template>
