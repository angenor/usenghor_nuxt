/**
 * Composable API - Profil public utilisateur
 * ============================================
 *
 * Récupération du profil public d'un membre de l'équipe.
 */

// ============================================================================
// Types
// ============================================================================

export interface UserCampusAffiliation {
  campus_id: string
  campus_name: string
  campus_code: string
  position: string
  active: boolean
}

export interface UserServiceAffiliation {
  service_id: string
  service_name: string
  position: string
  active: boolean
}

export interface UserPublicProfile {
  id: string
  first_name: string
  last_name: string
  salutation: string | null
  biography: string | null
  photo_url: string | null
  email: string | null
  phone: string | null
  city: string | null
  linkedin: string | null
  facebook: string | null
  nationality_country_name_fr: string | null
  nationality_country_iso_code: string | null
  campus_affiliations: UserCampusAffiliation[]
  service_affiliations: UserServiceAffiliation[]
}

// ============================================================================
// Composable
// ============================================================================

export function usePublicUserApi() {
  const baseUrl = useApiBase()

  /**
   * Récupère le profil public d'un utilisateur par son ID.
   */
  async function getUserProfile(userId: string): Promise<UserPublicProfile> {
    return await $fetch<UserPublicProfile>(`${baseUrl}/api/public/users/${userId}/profile`)
  }

  /**
   * Retourne le nom complet avec salutation.
   */
  function getFullName(profile: UserPublicProfile): string {
    if (profile.salutation) {
      return `${profile.salutation} ${profile.first_name} ${profile.last_name}`
    }
    return `${profile.first_name} ${profile.last_name}`
  }

  /**
   * Génère l'URL de la page profil.
   */
  function getProfileUrl(userId: string): string {
    return `/a-propos/equipe/${userId}`
  }

  return {
    getUserProfile,
    getFullName,
    getProfileUrl,
  }
}
