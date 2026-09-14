<script setup lang="ts">
/**
 * « Actualités » du mini-site PEI : actualités de la DDE (lots de 12) et événements à venir / passés (lots de 10).
 * Spec : specs/024-pei-public-alumni-resources-news (US4).
 */
import type { EventPublic } from '~/composables/usePublicEventsApi'
import type { NewsDisplay } from '~/types/news'

const NEWS_PAGE_SIZE = 12
const EVENTS_PAGE_SIZE = 10

const { t } = useI18n()
const { listPublishedNews } = usePublicNewsApi()
const { listPublishedEvents } = usePublicEventsApi()

const page = await usePeiPage({ heroPrefix: 'news', navKey: 'news' })

function emptyPage<T>() {
  return { items: [] as T[], page: 1, pages: 0 }
}

/** Événements passés : la borne `to_date` du premier lot est conservée (payload SSR) pour une pagination stable. */
async function loadPastEvents(serviceId: string) {
  const until = new Date().toISOString()
  const response = await listPublishedEvents({ service_id: serviceId, to_date: until, order: 'desc', page: 1, limit: EVENTS_PAGE_SIZE })
    .catch(() => emptyPage<EventPublic>())
  return { items: response.items, page: response.page, pages: response.pages, until }
}

const [{ data: newsData }, { data: upcomingData }, { data: pastData }] = await Promise.all([
  useAsyncData('pei-news-list', () => (page.ddeServiceId.value
    ? listPublishedNews({ service_id: page.ddeServiceId.value, page: 1, limit: NEWS_PAGE_SIZE }).catch(() => emptyPage<NewsDisplay>())
    : Promise.resolve(emptyPage<NewsDisplay>()))),
  useAsyncData('pei-news-upcoming', () => (page.ddeServiceId.value
    ? listPublishedEvents({ service_id: page.ddeServiceId.value, upcoming: true, order: 'asc', page: 1, limit: EVENTS_PAGE_SIZE }).catch(() => emptyPage<EventPublic>())
    : Promise.resolve(emptyPage<EventPublic>()))),
  useAsyncData('pei-news-past', () => (page.ddeServiceId.value
    ? loadPastEvents(page.ddeServiceId.value)
    : Promise.resolve({ ...emptyPage<EventPublic>(), until: '' }))),
])

const newsItems = ref<NewsDisplay[]>(newsData.value?.items ?? [])
const newsPage = ref(newsData.value?.page ?? 1)
const newsPages = ref(newsData.value?.pages ?? 0)
const upcomingItems = ref<EventPublic[]>(upcomingData.value?.items ?? [])
const upcomingPage = ref(upcomingData.value?.page ?? 1)
const upcomingPages = ref(upcomingData.value?.pages ?? 0)
const pastItems = ref<EventPublic[]>(pastData.value?.items ?? [])
const pastPage = ref(pastData.value?.page ?? 1)
const pastPages = ref(pastData.value?.pages ?? 0)
const pastUntil = pastData.value?.until || new Date().toISOString()
const loadingMore = ref(false)

async function loadMoreNews() {
  const serviceId = page.ddeServiceId.value
  if (!serviceId || loadingMore.value) return
  loadingMore.value = true
  try {
    const response = await listPublishedNews({ service_id: serviceId, page: newsPage.value + 1, limit: NEWS_PAGE_SIZE })
    newsItems.value = [...newsItems.value, ...response.items]
    newsPage.value = response.page
    newsPages.value = response.pages
  }
  catch {
    // Lot indisponible : le bouton reste proposé
  }
  finally {
    loadingMore.value = false
  }
}

async function loadMoreEvents(kind: 'upcoming' | 'past') {
  const serviceId = page.ddeServiceId.value
  if (!serviceId || loadingMore.value) return
  const items = kind === 'upcoming' ? upcomingItems : pastItems
  const current = kind === 'upcoming' ? upcomingPage : pastPage
  const total = kind === 'upcoming' ? upcomingPages : pastPages
  loadingMore.value = true
  try {
    const response = await listPublishedEvents(kind === 'upcoming'
      ? { service_id: serviceId, upcoming: true, order: 'asc', page: current.value + 1, limit: EVENTS_PAGE_SIZE }
      : { service_id: serviceId, to_date: pastUntil, order: 'desc', page: current.value + 1, limit: EVENTS_PAGE_SIZE })
    items.value = [...items.value, ...response.items]
    current.value = response.page
    total.value = response.pages
  }
  catch {
    // Lot indisponible : le bouton reste proposé
  }
  finally {
    loadingMore.value = false
  }
}

const hasEvents = computed(() => upcomingItems.value.length > 0 || pastItems.value.length > 0)
const hasContent = computed(() => newsItems.value.length > 0 || hasEvents.value)

const moreButtonClass = 'inline-flex items-center gap-2 rounded-full border-2 border-brand-blue-500 text-brand-blue-600 dark:text-brand-blue-300 px-8 py-3 font-semibold hover:bg-brand-blue-50 dark:hover:bg-brand-blue-900/30 transition-colors disabled:opacity-60 disabled:cursor-wait'

page.applySeo()
</script>

<template>
  <div>
    <PageHero v-bind="page.hero.value" :breadcrumb="page.breadcrumb.value" />

    <EntrepreneurshipSubNav />

    <div class="bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section v-if="newsItems.length" aria-labelledby="pei-news-title" class="py-16">
          <h2 id="pei-news-title" class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-10">
            {{ t('pei.news.newsTitle') }}
          </h2>
          <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <ActualitesNewsCard
              v-for="item in newsItems"
              :key="item.id"
              :item="item"
              :show-associations="false"
            />
          </div>
          <div v-if="newsPage < newsPages" class="mt-10 text-center">
            <button type="button" :class="moreButtonClass" :disabled="loadingMore" @click="loadMoreNews">
              {{ t('pei.common.viewMore') }}
            </button>
          </div>
        </section>

        <section
          v-if="hasEvents"
          aria-labelledby="pei-events-title"
          class="py-16"
          :class="{ 'border-t border-gray-200 dark:border-gray-700': newsItems.length }"
        >
          <h2 id="pei-events-title" class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-10">
            {{ t('pei.news.eventsTitle') }}
          </h2>
          <div class="max-w-4xl space-y-12">
            <div v-if="upcomingItems.length">
              <EntrepreneurshipEventList :title="t('pei.news.upcoming')" :events="upcomingItems" />
              <div v-if="upcomingPage < upcomingPages" class="mt-6 text-center">
                <button type="button" :class="moreButtonClass" :disabled="loadingMore" @click="loadMoreEvents('upcoming')">
                  {{ t('pei.common.viewMore') }}
                </button>
              </div>
            </div>
            <div v-if="pastItems.length">
              <EntrepreneurshipEventList :title="t('pei.news.past')" :events="pastItems" />
              <div v-if="pastPage < pastPages" class="mt-6 text-center">
                <button type="button" :class="moreButtonClass" :disabled="loadingMore" @click="loadMoreEvents('past')">
                  {{ t('pei.common.viewMore') }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <EntrepreneurshipEmptyState
          v-if="!hasContent"
          icon="fa-solid fa-newspaper"
          :title="t('pei.news.empty.title')"
          :description="t('pei.news.empty.description')"
          to="/entrepreneuriat"
          :link-label="t('pei.common.backHome')"
        />
      </div>
    </div>
  </div>
</template>
