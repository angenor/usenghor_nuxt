/**
 * Données structurées (JSON-LD) du mini-site PEI : Organization, WebPage / CollectionPage, BreadcrumbList.
 * Specs : specs/023-pei-public-home-activities (research R11, FR-026), specs/024-pei-public-alumni-resources-news (R13).
 * Les @id `${siteUrl}/#organization` et `${siteUrl}/#website` sont déclarés dans app.vue.
 */

export interface PeiBreadcrumbItem {
  label: string
  to?: string
}

export function usePeiJsonLd() {
  const { public: { siteUrl } } = useRuntimeConfig()
  const localePath = useLocalePath()
  const { locale } = useI18n()

  const organizationId = `${siteUrl}/entrepreneuriat#organization`

  function buildPeiOrganization(params: { name: string, email?: string | null }) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': organizationId,
      'name': params.name,
      'url': `${siteUrl}${localePath('/entrepreneuriat')}`,
      ...(params.email ? { email: params.email } : {}),
      'parentOrganization': { '@id': `${siteUrl}/#organization` },
    }
  }

  function buildWebPage(params: { path: string, name: string, description?: string | null, type?: 'WebPage' | 'CollectionPage' }) {
    return {
      '@context': 'https://schema.org',
      '@type': params.type ?? 'WebPage',
      '@id': `${siteUrl}${params.path}#webpage`,
      'url': `${siteUrl}${params.path}`,
      'name': params.name,
      ...(params.description ? { description: params.description } : {}),
      'inLanguage': locale.value,
      'isPartOf': { '@id': `${siteUrl}/#website` },
      'about': { '@id': organizationId },
    }
  }

  function buildBreadcrumbList(items: PeiBreadcrumbItem[]) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.label,
        ...(item.to && index < items.length - 1 ? { item: `${siteUrl}${localePath(item.to)}` } : {}),
      })),
    }
  }

  return { buildPeiOrganization, buildWebPage, buildBreadcrumbList }
}
