import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  scrollBehavior(to, _from, savedPosition) {
    // Position sauvegardée (bouton retour/avancer du navigateur)
    if (savedPosition) {
      return savedPosition
    }

    // Ancre dans l'URL
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }

    // Toujours remonter en haut pour une nouvelle page
    return { top: 0 }
  },
}
