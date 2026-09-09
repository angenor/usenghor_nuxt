<script setup lang="ts">
// Page « attrape-tout » des URL inconnues.
// Un lien partagé du type /<slug-de-programme> (sans préfixe /formations/<type>/)
// est redirigé en 301 vers l'URL canonique du programme. Toute autre URL
// inconnue renvoie la page 404 habituelle.
const route = useRoute()
const localePath = useLocalePath()
const { getProgramBySlug, programTypeToUrlSlug } = usePublicProgramsApi()

const segments = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]
const candidate = segments.length === 1 ? String(segments[0] ?? '') : ''

let redirected = false
if (candidate && /^[a-z0-9-]+$/.test(candidate)) {
  const program = await getProgramBySlug(candidate).catch(() => null)
  if (program) {
    redirected = true
    await navigateTo(
      localePath(`/formations/${programTypeToUrlSlug[program.type]}/${program.slug}`),
      { redirectCode: 301, replace: true },
    )
  }
}

if (!redirected) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page non trouvée',
  })
}
</script>

<template>
  <div />
</template>
