/**
 * Composable API - Sondages Publics
 * ===================================
 *
 * Accès aux formulaires de sondage pour le front-office (endpoints publics).
 */

export function usePublicSurveyApi() {
  const apiBase = useApiBase()

  async function getSurveyBySlug(slug: string) {
    return await $fetch<any>(`${apiBase}/api/public/surveys/${slug}`)
  }

  async function submitResponse(slug: string, responseData: Record<string, any>, sessionId: string) {
    return await $fetch<{ message: string }>(`${apiBase}/api/public/surveys/${slug}/submit`, {
      method: 'POST',
      body: {
        response_data: responseData,
        honeypot: '',
      },
      headers: {
        'X-Session-Id': sessionId,
      },
    })
  }

  async function getCampaignsByEntity(entityType: string, entityId: string) {
    return await $fetch<any[]>(`${apiBase}/api/public/surveys/by-entity/${entityType}/${entityId}`)
  }

  async function uploadFile(slug: string, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return await $fetch<{ url: string; name: string; size: number }>(
      `${apiBase}/api/public/surveys/${slug}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )
  }

  return {
    getSurveyBySlug,
    submitResponse,
    getCampaignsByEntity,
    uploadFile,
  }
}
