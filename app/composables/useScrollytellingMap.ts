/**
 * Composable pour la carte scrollytelling avec Leaflet et Scrollama
 */
import type { Map as LeafletMap, Polyline, GeoJSON } from 'leaflet'
import type { PaysBailleur } from '@bank/mock-data/pays-bailleurs'

interface UseScrollytellingMapOptions {
  countries: ComputedRef<PaysBailleur[]>
  getFlagEmoji: (code: string) => string
}

export function useScrollytellingMap(options: UseScrollytellingMapOptions) {
  const { countries, getFlagEmoji } = options

  const mapRef = ref<HTMLElement | null>(null)
  const mapInstance = shallowRef<LeafletMap | null>(null)
  const activeStep = ref(0)
  const polylineRef = shallowRef<Polyline | null>(null)
  const countryLayers = ref<Map<string, GeoJSON>>(new Map())

  // Mapping ISO 2-lettres → 3-lettres pour les URLs GeoJSON
  const iso2to3: Record<string, string> = {
    MA: 'MAR', TN: 'TUN', BJ: 'BEN', BF: 'BFA',
    TD: 'TCD', CG: 'COG', MG: 'MDG', NE: 'NER', TG: 'TGO'
  }

  const initMap = async () => {
    if (!import.meta.client) return

    // Attendre que le DOM soit prêt
    await nextTick()

    if (!mapRef.value) return

    // Import dynamique de Leaflet (client-side only)
    const L = await import('leaflet')
    await import('leaflet/dist/leaflet.css')

    // Import scrollama
    const scrollama = (await import('scrollama')).default

    // Créer la carte
    const map = L.map(mapRef.value, { zoomControl: false })
      .setView([15, 10], 5)

    mapInstance.value = map

    // Tiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    // Charger les frontières des pays en parallèle
    const loadPromises = countries.value.map(async (pays) => {
      const iso3 = iso2to3[pays.code]
      if (!iso3) return

      try {
        const response = await fetch(
          `https://raw.githubusercontent.com/johan/world.geo.json/master/countries/${iso3}.geo.json`
        )
        if (!response.ok) return

        const geojson = await response.json()
        const layer = L.geoJSON(geojson, {
          style: {
            fillColor: 'transparent',
            fillOpacity: 0,
            color: 'transparent',
            weight: 0
          }
        }).addTo(map)
        countryLayers.value.set(pays.code, layer)
      }
      catch (error) {
        console.warn(`Impossible de charger les frontières de ${pays.name_fr}:`, error)
      }
    })

    await Promise.all(loadPromises)

    // Polyline VIDE au départ
    polylineRef.value = L.polyline([], {
      color: '#f59e0b',
      dashArray: '12 12',
      weight: 3
    }).addTo(map)

    // Marqueurs numérotés
    countries.value.forEach((pays, index) => {
      if (!pays.location) return

      const numberIcon = L.divIcon({
        className: 'number-icon',
        html: `<div>${index + 1}</div>`,
        iconSize: [28, 28]
      })

      L.marker([pays.location.lat, pays.location.lng], { icon: numberIcon })
        .bindPopup(`<strong>${getFlagEmoji(pays.code)} ${pays.name_fr}</strong><br>${pays.capital}`)
        .addTo(map)
    })

    // Initialiser scrollama
    const scroller = scrollama()
    scroller
      .setup({
        step: '.step-card',
        offset: 0.5
      })
      .onStepEnter((response: { element: Element }) => {
        const stepIndex = parseInt(response.element.getAttribute('data-step') || '1') - 1
        activeStep.value = stepIndex

        // Mettre à jour la polyline progressivement
        const latlngs = countries.value
          .slice(0, stepIndex + 1)
          .filter(p => p.location)
          .map(p => [p.location!.lat, p.location!.lng] as [number, number])

        if (polylineRef.value) {
          polylineRef.value.setLatLngs(latlngs)
        }

        // Colorer progressivement les pays visités
        countries.value.forEach((p, idx) => {
          const layer = countryLayers.value.get(p.code)
          if (layer) {
            if (idx <= stepIndex) {
              layer.setStyle({
                fillColor: '#f59e0b',
                fillOpacity: 0.4,
                color: '#d97706',
                weight: 2
              })
            }
            else {
              layer.setStyle({
                fillColor: 'transparent',
                fillOpacity: 0,
                color: 'transparent',
                weight: 0
              })
            }
          }
        })

        // FlyTo vers le pays actuel avec zoom
        const pays = countries.value[stepIndex]
        if (pays?.location && mapInstance.value) {
          mapInstance.value.flyTo([pays.location.lat, pays.location.lng], 6, {
            animate: true,
            duration: 1.5
          })
        }
      })
  }

  onMounted(() => {
    initMap()
  })

  return {
    mapRef,
    mapInstance,
    activeStep
  }
}
