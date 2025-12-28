import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

export default defineNuxtPlugin(() => {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger)

  // Initialize Lenis smooth scroll
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true
  })

  // Connect Lenis to GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update)

  // GSAP ticker for Lenis
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })

  // Disable GSAP's internal lag smoothing to work better with Lenis
  gsap.ticker.lagSmoothing(0)

  return {
    provide: {
      gsap,
      ScrollTrigger,
      lenis
    }
  }
})
