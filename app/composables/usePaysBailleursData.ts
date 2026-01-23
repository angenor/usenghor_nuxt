/**
 * Composable pour les données des pays bailleurs
 * Fournit les données structurées pour la page gouvernance
 *
 * Liste exhaustive des pays bailleurs :
 * - France, Canada, Wallonie-Bruxelles, Suisse, Québec, Égypte
 */
export function usePaysBailleursData() {
  const { paysBailleurs, getFlagEmoji } = useMockData()

  // Égypte (pays hôte - hero card)
  const egypte = computed(() =>
    paysBailleurs.value.find(p => p.code === 'EG')
  )

  // Pays bailleurs fondateurs (hors Égypte)
  // France, Canada, Wallonie-Bruxelles, Suisse, Québec
  const founders = computed(() =>
    paysBailleurs.value.filter(p => p.code !== 'EG')
  )

  // Alias pour compatibilité avec les composants existants
  const northernFounders = founders
  const africanFounders = computed(() => [] as typeof paysBailleurs.value)
  const otherFounders = founders
  const laterMembers = computed(() => [] as typeof paysBailleurs.value)
  const timelineYears = computed(() => [] as number[])

  // Récupérer les pays d'une année donnée
  const getPaysByYear = (year: number) =>
    paysBailleurs.value.filter(p => p.member_since === year)

  return {
    paysBailleurs,
    egypte,
    founders,
    northernFounders,
    africanFounders,
    otherFounders,
    laterMembers,
    timelineYears,
    getPaysByYear,
    getFlagEmoji
  }
}
