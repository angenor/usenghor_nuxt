<script setup lang="ts">
/** Encadré citation + impact du pôle (fond sombre). */
const props = defineProps<{
  quote: string
  author?: string | null
  role?: string | null
  authorImage?: string | null
  impactText?: string | null
  impactImage?: string | null
}>()

const initial = computed(() => props.author?.trim().charAt(0).toUpperCase() ?? '')
</script>

<template>
  <section class="relative overflow-hidden bg-gradient-to-br from-brand-blue-900 via-brand-blue-800 to-brand-blue-950 py-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-16 lg:grid-cols-12 items-center">
      <div :class="impactImage ? 'lg:col-span-7' : 'lg:col-span-12 max-w-4xl'">
        <font-awesome-icon icon="fa-solid fa-quote-left" class="w-8 h-8 text-brand-red-500 rtl:-scale-x-100" aria-hidden="true" />
        <figure class="mt-6">
          <blockquote class="text-xl sm:text-2xl font-semibold leading-snug text-white">
            <p>« {{ quote }} »</p>
          </blockquote>
          <figcaption v-if="author" class="mt-8 flex items-center gap-4">
            <img
              v-if="authorImage"
              :src="authorImage"
              :alt="author"
              class="w-12 h-12 rounded-full object-cover"
              width="48"
              height="48"
              loading="lazy"
            >
            <span v-else class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold text-white" aria-hidden="true">
              {{ initial }}
            </span>
            <span>
              <span class="block font-semibold text-white">{{ author }}</span>
              <span v-if="role" class="block text-sm text-white/70">{{ role }}</span>
            </span>
          </figcaption>
        </figure>
        <p v-if="impactText" class="mt-10 text-white/80 leading-relaxed">
          {{ impactText }}
        </p>
      </div>
      <div v-if="impactImage" class="lg:col-span-5">
        <img
          :src="impactImage"
          alt=""
          class="w-full rounded-2xl aspect-[4/3] object-cover"
          loading="lazy"
        >
      </div>
    </div>
  </section>
</template>
