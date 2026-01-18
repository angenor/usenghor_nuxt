/**
 * Composable pour les données des pays bailleurs
 * Fournit les données structurées pour la page gouvernance
 */
export function usePaysBailleursData() {
  const { paysBailleurs, getFlagEmoji } = useMockData()

  // Codes des pays du Nord (non-africains)
  const northernCodes = ['FR', 'CA', 'QC', 'CH', 'BE']

  // Égypte (pays hôte - hero card)
  const egypte = computed(() =>
    paysBailleurs.value.find(p => p.code === 'EG')
  )

  // Pays du Nord fondateurs (France, Canada, Québec, Suisse, Wallonie-Bruxelles)
  const northernFounders = computed(() =>
    paysBailleurs.value.filter(p => p.member_since === 1989 && northernCodes.includes(p.code))
  )

  // Pays africains fondateurs 1989 (Sénégal, Cameroun, CI, Gabon)
  const africanFounders = computed(() =>
    paysBailleurs.value.filter(p => p.member_since === 1989 && !northernCodes.includes(p.code) && p.code !== 'EG')
  )

  // Tous les autres fondateurs 1989 (pour compatibilité)
  const otherFounders = computed(() =>
    paysBailleurs.value.filter(p => p.member_since === 1989 && p.code !== 'EG')
  )

  // Pays non-fondateurs (1990-1996) pour la timeline
  const laterMembers = computed(() =>
    paysBailleurs.value.filter(p => p.member_since > 1989)
  )

  // Années uniques pour timeline (excluant 1989)
  const timelineYears = computed(() =>
    [...new Set(laterMembers.value.map(p => p.member_since))].sort()
  )

  // Récupérer les pays d'une année donnée
  const getPaysByYear = (year: number) =>
    paysBailleurs.value.filter(p => p.member_since === year)

  return {
    paysBailleurs,
    egypte,
    northernFounders,
    africanFounders,
    otherFounders,
    laterMembers,
    timelineYears,
    getPaysByYear,
    getFlagEmoji
  }
}
