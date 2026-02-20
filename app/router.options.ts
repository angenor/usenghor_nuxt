import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  scrollBehavior(to, _from, savedPosition) {
    // Position sauvegardée (bouton retour/avancer du navigateur)
    if (savedPosition) {
      return savedPosition
    }

    // Ancre dans l'URL : Lenis gère le scroll hash dans app.vue
    if (to.hash) {
      // Navigation cross-page : d'abord scroll en haut, puis Lenis scrollera vers l'ancre
      if (to.path !== _from.path) {
        return { top: 0 }
      }
      // Navigation same-page : ne pas interférer, Lenis gère
      return false
    }

    // Toujours remonter en haut pour une nouvelle page
    return { top: 0 }
  },
}
