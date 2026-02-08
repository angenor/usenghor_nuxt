/**
 * Composable API - Équipes Campus (Public)
 * =========================================
 *
 * Accès public (sans authentification) aux membres d'équipe des campus.
 * Utilisé par la page /a-propos/equipe pour afficher l'équipe.
 */

// ============================================================================
// Types (compatibles avec team/Section.vue)
// ============================================================================

export interface PublicCampusTeamUser {
  id: string
  first_name: string
  last_name: string
  email: string | null
  photo_url: string | null
  salutation?: string | null
}

export interface PublicCampusTeamMember {
  id: string
  user: PublicCampusTeamUser
  position: string
  display_order: number
  active: boolean
  campus_id: string
  campus_name: string
  campus_code: string
}

export interface PublicCampusForSelect {
  id: string
  name: string
  code: string
  is_headquarters: boolean
}

// Type de la réponse API
interface AllCampusTeamResponse {
  members: Array<{
    id: string
    user_id: string
    first_name: string
    last_name: string
    salutation: string | null
    position: string
    photo_url: string | null
    email: string | null
    display_order: number
    campus_id: string
    campus_name: string
    campus_code: string
  }>
  campuses: Array<{
    id: string
    name: string
    code: string
    is_headquarters: boolean
  }>
}

// ============================================================================
// Composable
// ============================================================================

export function usePublicCampusTeamApi() {
  const baseUrl = useApiBase()

  /**
   * Récupère tous les membres d'équipe et campus depuis l'endpoint public.
   */
  async function fetchAllTeamData(): Promise<{
    members: PublicCampusTeamMember[]
    campuses: PublicCampusForSelect[]
  }> {
    const response = await $fetch<AllCampusTeamResponse>(
      `${baseUrl}/api/public/campuses/team/all`,
    )

    const members: PublicCampusTeamMember[] = response.members.map(m => ({
      id: m.id,
      user: {
        id: m.user_id,
        first_name: m.first_name,
        last_name: m.last_name,
        email: m.email,
        photo_url: m.photo_url,
        salutation: m.salutation,
      },
      position: m.position,
      display_order: m.display_order,
      active: true,
      campus_id: m.campus_id,
      campus_name: m.campus_name,
      campus_code: m.campus_code,
    }))

    return {
      members,
      campuses: response.campuses,
    }
  }

  /**
   * Retourne le nom complet d'un utilisateur.
   */
  function getFullName(user: PublicCampusTeamUser): string {
    if (user.salutation) {
      return `${user.salutation} ${user.first_name} ${user.last_name}`
    }
    return `${user.first_name} ${user.last_name}`
  }

  /**
   * Génère l'emoji du drapeau à partir du code pays ISO.
   */
  function getFlagEmoji(countryCode: string): string {
    if (!countryCode || countryCode.length !== 2) return ''
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  return {
    fetchAllTeamData,
    getFullName,
    getFlagEmoji,
  }
}
