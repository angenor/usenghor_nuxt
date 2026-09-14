<script setup lang="ts">
/**
 * « Nos ressources » du mini-site PEI : médiathèque du service DDE (albums) et boîte à outils par catégorie.
 * Spec : specs/024-pei-public-alumni-resources-news (US3).
 */
import type { PublicAlbumWithMedia } from '~/types/api/media'

const { t } = useI18n()
const { localized } = useLocalizedField()
const { getServiceById } = usePublicOrganizationApi()
const { getAlbumById } = usePublicAlbumsApi()
const { listResources } = usePublicEntrepreneurshipApi()

const page = await usePeiPage({ heroPrefix: 'resources', navKey: 'resources' })

async function loadAlbums(): Promise<PublicAlbumWithMedia[]> {
  const serviceId = page.ddeServiceId.value
  if (!serviceId) return []
  const service = page.ddeService.value ?? await getServiceById(serviceId)
  const ids = service.album_ids?.length ? service.album_ids : (service.album_external_id ? [service.album_external_id] : [])
  const albums = await Promise.all(ids.map(id => getAlbumById(id).catch(() => null)))
  return albums
    .filter(album => !!album && album.media_items.length > 0)
    .map(album => ({
      id: album!.id,
      title: album!.title,
      description: album!.description,
      display_order: album!.display_order ?? 0,
      media_items: album!.media_items,
    }))
}

const [{ data: albumsData }, { data: resourcesData }] = await Promise.all([
  useAsyncData('pei-resources-albums', () => loadAlbums().catch(() => [])),
  useAsyncData('pei-resources-toolbox', () => listResources().catch(() => [])),
])

const albums = computed(() => albumsData.value ?? [])
const groups = computed(() =>
  groupResourcesByCategory(resourcesData.value ?? [], r => localized(r, 'category'), t('pei.resources.otherCategory')),
)

page.applySeo()
</script>

<template>
  <div>
    <PageHero v-bind="page.hero.value" :breadcrumb="page.breadcrumb.value" />

    <EntrepreneurshipSubNav />

    <div class="bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section v-if="albums.length" aria-labelledby="pei-media-title" class="py-16">
          <h2 id="pei-media-title" class="flex items-center gap-3 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-10">
            <font-awesome-icon icon="fa-solid fa-images" class="w-7 h-7 text-brand-blue-500" aria-hidden="true" />
            {{ t('pei.resources.mediaTitle') }}
          </h2>
          <MediaLibraryTab :albums="albums" />
        </section>

        <section
          v-if="groups.length"
          aria-labelledby="pei-toolbox-title"
          class="py-16"
          :class="{ 'border-t border-gray-200 dark:border-gray-700': albums.length }"
        >
          <h2 id="pei-toolbox-title" class="flex items-center gap-3 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-10">
            <font-awesome-icon icon="fa-solid fa-toolbox" class="w-7 h-7 text-brand-blue-500" aria-hidden="true" />
            {{ t('pei.resources.toolboxTitle') }}
          </h2>
          <div class="space-y-12">
            <div v-for="group in groups" :key="group.key || 'other'">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {{ group.label }}
              </h3>
              <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <EntrepreneurshipResourceCard
                  v-for="resource in group.items"
                  :key="resource.id"
                  :resource="resource"
                />
              </div>
            </div>
          </div>
        </section>

        <EntrepreneurshipEmptyState
          v-if="!albums.length && !groups.length"
          icon="fa-solid fa-toolbox"
          :title="t('pei.resources.empty.title')"
          :description="t('pei.resources.empty.description')"
          to="/entrepreneuriat"
          :link-label="t('pei.common.backHome')"
        />
      </div>
    </div>
  </div>
</template>
