/**
 * Composable pour l'API des liens courts (admin).
 */

export interface ShortLinkRead {
  id: string
  code: string
  target_url: string
  full_short_url: string
  created_by_name: string | null
  created_at: string
  updated_at: string
}

export interface AllowedDomainRead {
  id: string
  domain: string
  created_at: string
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

interface IdResponse {
  id: string
  message: string
}

interface MessageResponse {
  message: string
}

export function useShortLinksApi() {
  const { apiFetch } = useApi()

  async function listShortLinks(params: {
    page?: number
    limit?: number
    search?: string
  } = {}): Promise<PaginatedResponse<ShortLinkRead>> {
    return await apiFetch<PaginatedResponse<ShortLinkRead>>(
      '/api/admin/short-links',
      { query: params },
    )
  }

  async function createShortLink(targetUrl: string): Promise<IdResponse> {
    return await apiFetch<IdResponse>('/api/admin/short-links', {
      method: 'POST',
      body: { target_url: targetUrl },
    })
  }

  async function deleteShortLink(id: string): Promise<MessageResponse> {
    return await apiFetch<MessageResponse>(`/api/admin/short-links/${id}`, {
      method: 'DELETE',
    })
  }

  async function listAllowedDomains(): Promise<{ items: AllowedDomainRead[] }> {
    return await apiFetch<{ items: AllowedDomainRead[] }>(
      '/api/admin/short-links/allowed-domains',
    )
  }

  async function addAllowedDomain(domain: string): Promise<IdResponse> {
    return await apiFetch<IdResponse>(
      '/api/admin/short-links/allowed-domains',
      {
        method: 'POST',
        body: { domain },
      },
    )
  }

  async function removeAllowedDomain(id: string): Promise<MessageResponse> {
    return await apiFetch<MessageResponse>(
      `/api/admin/short-links/allowed-domains/${id}`,
      { method: 'DELETE' },
    )
  }

  return {
    listShortLinks,
    createShortLink,
    deleteShortLink,
    listAllowedDomains,
    addAllowedDomain,
    removeAllowedDomain,
  }
}
