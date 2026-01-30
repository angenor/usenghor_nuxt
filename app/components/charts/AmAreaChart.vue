<script setup lang="ts">
/**
 * Composant Area Chart avec amCharts 5
 * Graphique en aires pour visualiser les tendances avec remplissage
 */

interface DataPoint {
  date: Date | number | string
  value: number
  [key: string]: unknown
}

interface Props {
  data: DataPoint[]
  dateField?: string
  valueField?: string
  height?: string
  animated?: boolean
  showBullets?: boolean
  gradientFill?: boolean
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  dateField: 'date',
  valueField: 'value',
  height: '300px',
  animated: true,
  showBullets: false,
  gradientFill: true
})

const chartId = `area-chart-${useId()}`
const { am5, am5xy, createRoot } = useAmCharts({ animated: props.animated })

let root: ReturnType<typeof createRoot> = null

onMounted(() => {
  if (!am5) return

  root = createRoot(chartId)
  if (!root) return

  // Créer le graphique XY
  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: false,
      wheelX: 'panX',
      wheelY: 'zoomX',
      pinchZoomX: true,
      paddingLeft: 0
    })
  )

  // Ajouter le curseur
  const cursor = chart.set('cursor', am5xy.XYCursor.new(root, {
    behavior: 'zoomX'
  }))
  cursor.lineY.set('visible', false)

  // Créer l'axe X (dates)
  const xAxis = chart.xAxes.push(
    am5xy.DateAxis.new(root, {
      maxDeviation: 0,
      baseInterval: { timeUnit: 'day', count: 1 },
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 60
      }),
      tooltip: am5.Tooltip.new(root, {})
    })
  )

  // Créer l'axe Y (valeurs)
  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    })
  )

  // Créer la série
  const series = chart.series.push(
    am5xy.LineSeries.new(root, {
      name: 'Valeur',
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: props.valueField,
      valueXField: props.dateField,
      tooltip: am5.Tooltip.new(root, {
        labelText: '{valueY}'
      })
    })
  )

  // Appliquer la couleur personnalisée si fournie
  if (props.color) {
    series.set('stroke', am5.color(props.color))
    series.set('fill', am5.color(props.color))
  }

  // Configurer le remplissage
  series.fills.template.setAll({
    fillOpacity: props.gradientFill ? 0.3 : 0.2,
    visible: true
  })

  // Ajouter un dégradé si demandé
  if (props.gradientFill) {
    series.fills.template.set('fillGradient', am5.LinearGradient.new(root, {
      stops: [{
        opacity: 0.4
      }, {
        opacity: 0.05
      }],
      rotation: 90
    }))
  }

  // Configurer la ligne
  series.strokes.template.setAll({
    strokeWidth: 2
  })

  // Ajouter des bullets si demandés
  if (props.showBullets) {
    series.bullets.push(() => {
      return am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 4,
          fill: series.get('fill'),
          stroke: root.interfaceColors.get('background'),
          strokeWidth: 2
        })
      })
    })
  }

  // Transformer les données
  const chartData = props.data.map(item => ({
    ...item,
    [props.dateField]: new Date(item[props.dateField] as string | number).getTime()
  }))

  series.data.setAll(chartData)

  // Animation d'apparition
  series.appear(1000)
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
        <span class="text-gray-500">Chargement...</span>
      </div>
    </template>
  </ClientOnly>
</template>
