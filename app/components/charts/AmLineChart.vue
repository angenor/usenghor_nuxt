<script setup lang="ts">
/**
 * Composant de graphique linéaire avec amCharts 5
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
}

const props = withDefaults(defineProps<Props>(), {
  dateField: 'date',
  valueField: 'value',
  height: '300px',
  animated: true
})

const chartId = `line-chart-${useId()}`

let root: any = null

onMounted(async () => {
  // Import dynamique côté client uniquement
  const am5 = await import('@amcharts/amcharts5')
  const am5xy = await import('@amcharts/amcharts5/xy')
  const am5themes_Animated = (await import('@amcharts/amcharts5/themes/Animated')).default

  // Attendre que l'élément DOM soit disponible
  await nextTick()

  const element = document.getElementById(chartId)
  if (!element) return

  // Créer la racine
  root = am5.Root.new(chartId)

  // Appliquer le thème animé
  if (props.animated) {
    root.setThemes([am5themes_Animated.new(root)])
  }

  // Créer le graphique XY
  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: 'panX',
      wheelY: 'zoomX',
      pinchZoomX: true
    })
  )

  // Ajouter le curseur
  chart.set('cursor', am5xy.XYCursor.new(root, {
    behavior: 'none'
  }))

  // Créer l'axe X (dates)
  const xAxis = chart.xAxes.push(
    am5xy.DateAxis.new(root, {
      maxDeviation: 0.2,
      baseInterval: { timeUnit: 'day', count: 1 },
      renderer: am5xy.AxisRendererX.new(root, {}),
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
      name: 'Série',
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: props.valueField,
      valueXField: props.dateField,
      tooltip: am5.Tooltip.new(root, {
        labelText: '{valueY}'
      })
    })
  )

  // Ajouter le remplissage sous la ligne
  series.fills.template.setAll({
    fillOpacity: 0.2,
    visible: true
  })

  // Transformer les données
  const chartData = props.data.map(item => ({
    ...item,
    [props.dateField]: new Date(item[props.dateField] as string | number).getTime()
  }))

  series.data.setAll(chartData)

  // Ajouter la scrollbar
  chart.set('scrollbarX', am5.Scrollbar.new(root, {
    orientation: 'horizontal'
  }))

  // Animation d'apparition
  series.appear(1000)
  chart.appear(1000, 100)
})

onUnmounted(() => {
  if (root) {
    root.dispose()
  }
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
