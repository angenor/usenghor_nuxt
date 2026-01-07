<script setup lang="ts">
interface Props {
  campusId: string
}

const props = defineProps<Props>()
const { t } = useI18n()
const { getCampusNews } = useMockData()

const news = computed(() => getCampusNews(props.campusId))
</script>

<template>
  <div class="py-8">
    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
      {{ t('partners.campus.news.title') }}
    </h3>

    <div v-if="news.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CardNews
        v-for="item in news"
        :key="item.id"
        :news="item"
      />
    </div>

    <div v-else class="text-center py-12">
      <font-awesome-icon icon="fa-solid fa-newspaper" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
      <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.noNews') }}</p>
    </div>
  </div>
</template>
