<script setup lang="ts">
/**
 * Composant World Map Chart avec amCharts 5
 * Affiche une carte du monde avec des données par pays
 */

interface CountryData {
  id: string // Code ISO du pays (ex: "FR", "EG", "SN")
  value: number
  name?: string
  [key: string]: unknown
}

interface Props {
  data: CountryData[]
  height?: string
  animated?: boolean
  showLegend?: boolean
  minColor?: string
  maxColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px',
  animated: true,
  showLegend: true,
  minColor: '#E3F2FD',
  maxColor: '#1565C0'
})

const chartId = `map-chart-${useId()}`
const { am5, am5map, createRoot } = useAmCharts({ animated: props.animated })

let root: ReturnType<typeof createRoot> = null

onMounted(async () => {
  if (!am5 || !am5map) return

  root = createRoot(chartId)
  if (!root) return

  // Importer les géodonnées du monde
  const am5geodata_worldLow = await import('@amcharts/amcharts5-geodata/worldLow').then(m => m.default)

  // Créer le graphique carte
  const chart = root.container.children.push(
    am5map.MapChart.new(root, {
      panX: 'rotateX',
      panY: 'rotateY',
      projection: am5map.geoNaturalEarth1(),
      homeZoomLevel: 1.2,
      homeGeoPoint: { longitude: 10, latitude: 10 }
    })
  )

  // Créer la série de polygones pour les pays
  const polygonSeries = chart.series.push(
    am5map.MapPolygonSeries.new(root, {
      geoJSON: am5geodata_worldLow,
      valueField: 'value',
      calculateAggregates: true
    })
  )

  // Configurer les polygones
  polygonSeries.mapPolygons.template.setAll({
    tooltipText: '{name}: {value}',
    interactive: true,
    fill: am5.color(0xDDDDDD),
    strokeWidth: 0.5,
    stroke: am5.color(0xFFFFFF)
  })

  // Effet de survol
  polygonSeries.mapPolygons.template.states.create('hover', {
    fill: am5.color(0x677935)
  })

  // Appliquer un dégradé de couleur basé sur les valeurs
  polygonSeries.set('heatRules', [{
    target: polygonSeries.mapPolygons.template,
    dataField: 'value',
    min: am5.color(props.minColor),
    max: am5.color(props.maxColor),
    key: 'fill'
  }])

  // Transformer les données pour amCharts (code ISO vers id amCharts)
  const chartData = props.data.map(item => ({
    id: item.id.length === 2 ? item.id.toUpperCase() : item.id,
    value: item.value,
    name: item.name
  }))

  polygonSeries.data.setAll(chartData)

  // Ajouter la légende de chaleur si demandée
  if (props.showLegend) {
    const heatLegend = chart.children.push(
      am5.HeatLegend.new(root, {
        orientation: 'horizontal',
        startColor: am5.color(props.minColor),
        endColor: am5.color(props.maxColor),
        startText: 'Min',
        endText: 'Max',
        stepCount: 5
      })
    )

    heatLegend.startLabel.setAll({
      fontSize: 12,
      fill: am5.color(0x666666)
    })

    heatLegend.endLabel.setAll({
      fontSize: 12,
      fill: am5.color(0x666666)
    })

    // Mettre à jour les valeurs de la légende quand les données sont prêtes
    polygonSeries.events.on('datavalidated', () => {
      const values = chartData.map(d => d.value).filter(v => v > 0)
      if (values.length > 0) {
        heatLegend.set('startValue', Math.min(...values))
        heatLegend.set('endValue', Math.max(...values))
      }
    })
  }

  // Ajouter les contrôles de zoom
  chart.set('zoomControl', am5map.ZoomControl.new(root, {}))

  // Bouton de reset de la vue
  const homeButton = chart.children.push(
    am5.Button.new(root, {
      paddingTop: 10,
      paddingBottom: 10,
      x: am5.percent(100),
      centerX: am5.percent(100),
      opacity: 0.5,
      interactiveChildren: false,
      icon: am5.Graphics.new(root, {
        svgPath: 'M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8',
        fill: am5.color(0x000000)
      })
    })
  )

  homeButton.events.on('click', () => {
    chart.goHome()
  })

  // Animation d'apparition
  chart.appear(1000, 100)
})
</script>

<template>
  <ClientOnly>
    <div
      :id="chartId"
      :style="{ width: '100%', height: height }"
    />
    <template #fallback>
      <div
        class="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg"
        :style="{ width: '100%', height: height }"
      >
        <span class="text-gray-500">Chargement de la carte...</span>
      </div>
    </template>
  </ClientOnly>
</template>
