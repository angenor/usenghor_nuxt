import { defineSitemapEventHandler } from '#imports'

// Copie de slugify (app/composables/usePublicOrganizationApi.ts) — doit rester identique
function slugifyServiceName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default defineSitemapEventHandler(async () => {
  const backendUrl = process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
  const urls: Array<{ loc: string; lastmod?: string; _i18nTransform?: boolean }> = []

  // Map des types de programmes backend → slugs URL frontend
  const programTypeToUrlSlug: Record<string, string> = {
    master: 'masters',
    doctorat: 'doctorat',
    diplome_universitaire: 'diplomes-universitaires',
    certificat: 'certifiantes'
  }

  try {
    // Programmes (formations)
    const programs = await $fetch<Array<{
      slug: string
      program_type: string
      updated_at?: string
    }>>(`${backendUrl}/api/public/programs`, {
      params: { page: 1, page_size: 500 }
    }).then((res: any) => res.items || res).catch(() => [])

    for (const p of programs) {
      const typeSlug = programTypeToUrlSlug[p.program_type]
      if (typeSlug && p.slug) {
        urls.push({
          loc: `/formations/${typeSlug}/${p.slug}`,
          lastmod: p.updated_at
        })
      }
    }
  }
  catch {
    // Silently skip if programs API unavailable
  }

  try {
    // Actualites (news)
    const news = await $fetch<Array<{
      slug: string
      updated_at?: string
    }>>(`${backendUrl}/api/public/news`, {
      params: { page: 1, page_size: 500 }
    }).then((res: any) => res.items || res).catch(() => [])

    for (const n of news) {
      if (n.slug) {
        urls.push({
          loc: `/actualites/${n.slug}`,
          lastmod: n.updated_at
        })
      }
    }
  }
  catch {
    // Silently skip if news API unavailable
  }

  try {
    // Evenements
    const events = await $fetch<Array<{
      slug: string
      updated_at?: string
    }>>(`${backendUrl}/api/public/events`, {
      params: { page: 1, page_size: 500 }
    }).then((res: any) => res.items || res).catch(() => [])

    for (const e of events) {
      if (e.slug) {
        urls.push({
          loc: `/actualites/evenements/${e.slug}`,
          lastmod: e.updated_at
        })
      }
    }
  }
  catch {
    // Silently skip if events API unavailable
  }

  try {
    // Appels a candidature
    const calls = await $fetch<Array<{
      slug: string
      updated_at?: string
    }>>(`${backendUrl}/api/public/application-calls`, {
      params: { page: 1, page_size: 500 }
    }).then((res: any) => res.items || res).catch(() => [])

    for (const c of calls) {
      if (c.slug) {
        urls.push({
          loc: `/actualites/appels/${c.slug}`,
          lastmod: c.updated_at
        })
      }
    }
  }
  catch {
    // Silently skip if application-calls API unavailable
  }

  try {
    // Campus (pour partenaires)
    const campuses = await $fetch<Array<{
      code: string
      updated_at?: string
    }>>(`${backendUrl}/api/public/campuses/all`).catch(() => [])

    for (const campus of campuses) {
      if (campus.code) {
        urls.push({
          loc: `/a-propos/partenaires/campus/${campus.code.toLowerCase()}`
        })
      }
    }
  }
  catch {
    // Silently skip if campuses API unavailable
  }

  try {
    // Secteurs (organisation)
    const sectors = await $fetch<Array<{ code: string }>>(`${backendUrl}/api/public/sectors`)

    for (const sector of sectors) {
      if (sector.code) {
        urls.push({ loc: `/a-propos/organisation/secteur/${sector.code.toLowerCase()}`, _i18nTransform: true })
      }
    }
  }
  catch {
    // Silently skip if sectors API unavailable
  }

  try {
    // Services et pôles actifs (avec ou sans secteur), adresse dérivée du nom ;
    // _i18nTransform : variantes /en et /ar générées par autoI18n
    const services = await $fetch<Array<{ name: string }>>(`${backendUrl}/api/public/services`)
    const slugs = new Set<string>()

    for (const service of services) {
      const slug = service.name ? slugifyServiceName(service.name) : ''
      if (slug && !slugs.has(slug)) {
        slugs.add(slug)
        urls.push({ loc: `/a-propos/organisation/service/${slug}`, _i18nTransform: true })
      }
    }
  }
  catch {
    // Silently skip if services API unavailable
  }

  return urls
})
