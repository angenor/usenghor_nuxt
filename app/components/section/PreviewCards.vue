<script setup lang="ts">
interface PreviewCard {
  title: string
  summary: string
  image: string
  to: string
  icon?: string
  color?: string
}

interface Props {
  title?: string
  cards: PreviewCard[]
}

const props = defineProps<Props>()

const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.1 })
</script>

<template>
  <section
    ref="sectionRef"
    class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900 bg-grid-pattern transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div v-if="props.title" class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          {{ props.title }}
        </h2>
      </div>

      <!-- Cards Grid - 2 columns on sm, 3 on lg -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <CardsCardPreview
          v-for="(card, index) in props.cards"
          :key="index"
          :title="card.title"
          :summary="card.summary"
          :image="card.image"
          :to="card.to"
          :icon="card.icon"
          :color="card.color"
        />
      </div>
    </div>
  </section>
</template>
