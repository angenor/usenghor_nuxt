<script setup lang="ts">
const props = defineProps<{
  goalAmount: number
  totalRaised: number
  progressPercentage: number
}>()

const { t, locale } = useI18n()
const { formatCurrency } = usePublicFundraisingApi()

// Cap visual bar at 100%
const visualPercentage = computed(() => Math.min(props.progressPercentage, 100))

// Remaining amount (min 0)
const remainingAmount = computed(() => Math.max(props.goalAmount - props.totalRaised, 0))

// Locale string for currency formatting
const currencyLocale = computed(() => {
  if (locale.value === 'ar') return 'ar-EG'
  if (locale.value === 'en') return 'en-US'
  return 'fr-FR'
})

// Animated width
const animatedWidth = ref(0)

onMounted(() => {
  requestAnimationFrame(() => {
    setTimeout(() => {
      animatedWidth.value = visualPercentage.value
    }, 200)
  })
})

watch(visualPercentage, (val) => {
  animatedWidth.value = val
})
</script>

<template>
  <div class="w-full">
    <!-- Amounts row -->
    <div class="flex items-end justify-between mb-3 rtl:flex-row-reverse">
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ t('leveesDeFonds.detail.presentation.totalRaised') }}
        </p>
        <p class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {{ formatCurrency(totalRaised, currencyLocale) }}
        </p>
      </div>
      <div class="text-right rtl:text-left">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ t('leveesDeFonds.detail.presentation.goalAmount') }}
        </p>
        <p class="text-lg font-semibold text-gray-700 dark:text-gray-300">
          {{ formatCurrency(goalAmount, currencyLocale) }}
        </p>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        class="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 rounded-full bg-gradient-to-r rtl:bg-gradient-to-l from-emerald-500 to-emerald-400 transition-all duration-1000 ease-out"
        :style="{ width: `${animatedWidth}%` }"
      ></div>
    </div>

    <!-- Info row below bar -->
    <div class="flex items-center justify-between mt-2 text-sm rtl:flex-row-reverse">
      <span class="font-semibold text-emerald-600 dark:text-emerald-400">
        {{ progressPercentage.toFixed(1) }}% {{ t('leveesDeFonds.list.progress') }}
      </span>
      <span
        v-if="remainingAmount > 0"
        class="text-gray-500 dark:text-gray-400"
      >
        {{ t('leveesDeFonds.detail.presentation.remaining') }} : {{ formatCurrency(remainingAmount, currencyLocale) }}
      </span>
    </div>
  </div>
</template>
