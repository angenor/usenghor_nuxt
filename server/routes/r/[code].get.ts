/**
 * Server route pour la redirection des liens courts.
 * GET /r/{code} → HTTP 302 vers l'URL de destination.
 */
export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')
  if (!code) {
    throw createError({ statusCode: 404, message: 'Lien court non trouvé' })
  }

  try {
    const data = await $fetch<{ target_url: string }>(
      `http://backend:8000/api/public/short-links/${code}`,
    )
    return sendRedirect(event, data.target_url, 302)
  }
  catch {
    throw createError({ statusCode: 404, message: 'Lien court non trouvé' })
  }
})
