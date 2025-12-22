interface ScrollAnimationOptions {
  animation?: string
  threshold?: number
  delay?: string
  once?: boolean
}

/**
 * Composable for scroll-triggered animations using Intersection Observer
 * Works with animate.css classes
 */
export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const {
    animation = 'fadeInUp',
    threshold = 0.1,
    delay = '',
    once = true
  } = options

  const elementRef = ref<HTMLElement | null>(null)
  const isVisible = ref(false)
  let observer: IntersectionObserver | null = null

  const startAnimation = (element: HTMLElement) => {
    isVisible.value = true
    element.classList.add('animate__animated', `animate__${animation}`)
    if (delay) {
      element.classList.add(delay)
    }
    element.style.opacity = '1'
    element.style.visibility = 'visible'
  }

  const resetAnimation = (element: HTMLElement) => {
    isVisible.value = false
    element.classList.remove('animate__animated', `animate__${animation}`)
    if (delay) {
      element.classList.remove(delay)
    }
    element.style.opacity = '0'
    element.style.visibility = 'hidden'
  }

  onMounted(() => {
    if (!elementRef.value) return

    // Initial hidden state
    elementRef.value.style.opacity = '0'
    elementRef.value.style.visibility = 'hidden'

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAnimation(entry.target as HTMLElement)
            if (once && observer) {
              observer.unobserve(entry.target)
            }
          } else if (!once) {
            resetAnimation(entry.target as HTMLElement)
          }
        })
      },
      { threshold }
    )

    observer.observe(elementRef.value)
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    elementRef,
    isVisible
  }
}

interface ScrollAnimationGroupOptions {
  animation?: string
  threshold?: number
  staggerDelay?: number
  once?: boolean
  childSelector?: string
}

/**
 * Composable for animating multiple elements with staggered delays
 */
export function useScrollAnimationGroup(options: ScrollAnimationGroupOptions = {}) {
  const {
    animation = 'fadeInUp',
    threshold = 0.1,
    staggerDelay = 100,
    once = true,
    childSelector = '[data-animate]'
  } = options

  const containerRef = ref<HTMLElement | null>(null)
  const isVisible = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!containerRef.value) return

    const children = containerRef.value.querySelectorAll<HTMLElement>(childSelector)

    // Initial hidden state for all children
    children.forEach((child) => {
      child.style.opacity = '0'
      child.style.visibility = 'hidden'
    })

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible.value = true
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add('animate__animated', `animate__${animation}`)
                child.style.opacity = '1'
                child.style.visibility = 'visible'
              }, index * staggerDelay)
            })
            if (once && observer) {
              observer.unobserve(entry.target)
            }
          } else if (!once) {
            isVisible.value = false
            children.forEach((child) => {
              child.classList.remove('animate__animated', `animate__${animation}`)
              child.style.opacity = '0'
              child.style.visibility = 'hidden'
            })
          }
        })
      },
      { threshold }
    )

    observer.observe(containerRef.value)
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    containerRef,
    isVisible
  }
}

export default useScrollAnimation
