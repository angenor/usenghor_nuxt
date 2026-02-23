/**
 * Composable API publique - Candidatures spontanées
 *
 * Upload de documents et soumission de candidatures sans authentification.
 */

interface DocumentUploadResponse {
  id: string
  url: string
}

interface SpontaneousApplicationResponse {
  id: string
  reference_number: string
  message: string
}

interface SpontaneousApplicationPayload {
  salutation?: string
  last_name: string
  first_name: string
  email: string
  phone?: string
  country_external_id?: string
  employer_name?: string
  job_title?: string
  current_job?: string
  motivation_text?: string
  has_work_experience?: boolean
  employment_status?: string
  documents?: Array<{
    document_name: string
    media_external_id: string
  }>
}

export function usePublicApplicationsApi() {
  const apiBase = useApiBase()

  /**
   * Upload un document PDF (CV) — retourne un media_id
   */
  async function uploadDocument(file: File): Promise<DocumentUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    return await $fetch<DocumentUploadResponse>(
      `${apiBase}/api/public/applications/upload-document`,
      {
        method: 'POST',
        body: formData,
      },
    )
  }

  /**
   * Soumet une candidature spontanée
   */
  async function submitSpontaneous(
    data: SpontaneousApplicationPayload,
  ): Promise<SpontaneousApplicationResponse> {
    return await $fetch<SpontaneousApplicationResponse>(
      `${apiBase}/api/public/applications/spontaneous`,
      {
        method: 'POST',
        body: {
          ...data,
          call_id: null,
        },
      },
    )
  }

  return { uploadDocument, submitSpontaneous }
}
