import { peiHomePreview, pickPreviewCoverIds } from '@bank/mock-data/pei-home-preview'

/**
 * Réserve d'images d'exemple du mode aperçu PEI (`usePeiPreview`), partagée par toutes
 * les pages du mini-site : couvertures des actualités puis des événements publiés, lues À
 * L'EXÉCUTION via l'API publique (aucun identifiant de média en dur : ils diffèrent entre
 * local et production). Rien n'est chargé hors aperçu.
 *
 * `image(slot)` renvoie l'image n° `slot` de la réserve (en boucle si elle est plus courte),
 * pour que chaque emplacement photo d'une page reçoive une image stable et distincte.
 */
export async function usePeiPreviewImages() {
  const { preview } = usePeiPreview()
  const { listPublishedNews } = usePublicNewsApi()
  const { listPublishedEvents } = usePublicEventsApi()
  const { getMediaUrl } = useMediaApi()

  const { data } = await useAsyncData('pei-preview-images', async () => {
    if (!preview.value) return [] as string[]
    const [news, events] = await Promise.all([
      listPublishedNews({ limit: peiHomePreview.newsFetchLimit }).then(r => r.items).catch(() => []),
      listPublishedEvents({ limit: peiHomePreview.eventsFetchLimit }).then(r => r.items).catch(() => []),
    ])
    return pickPreviewCoverIds([...news, ...events])
  }, { watch: [preview] })

  const ids = computed(() => (preview.value ? data.value ?? [] : []))

  function image(slot: number, variant: 'low' | 'medium' | 'original' = 'medium'): string | null {
    const list = ids.value
    if (!list.length) return null
    return getMediaUrl(list[((slot % list.length) + list.length) % list.length] ?? null, variant)
  }

  return { preview, ids, image }
}
