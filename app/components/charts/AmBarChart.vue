<script setup lang="ts">
/**
 * Composant de graphique à barres avec amCharts 5
 */

interface DataPoint {
  category: string
  value: number
  [key: string]: unknown
}

interface Props {
  data: DataPoint[]
  categoryField?: string
  valueField?: string
  height?: string
  animated?: boolean
  horizontal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  categoryField: 'category',
  valueField: 'value',
  height: '300px',
  animated: true,
  horizontal: false
})

const chartId = `bar-chart-${useId()}`

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
      panX: false,
      panY: false,
      wheelX: 'none',
      wheelY: 'none',
      layout: root.verticalLayout
    })
  )

  let xAxis: any, yAxis: any

  if (props.horizontal) {
    // Barres horizontales
    xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {
          strokeOpacity: 0.1
        })
      })
    )

    yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: props.categoryField,
        renderer: am5xy.AxisRendererY.new(root, {
          cellStartLocation: 0.1,
          cellEndLocation: 0.9
        })
      })
    )
    yAxis.data.setAll(props.data)
  } else {
    // Barres verticales
    xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: props.categoryField,
        renderer: am5xy.AxisRendererX.new(root, {
          cellStartLocation: 0.1,
          cellEndLocation: 0.9,
          minGridDistance: 30
        })
      })
    )
    xAxis.data.setAll(props.data)

    yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {
          strokeOpacity: 0.1
        })
      })
    )
  }

  // Créer la série
  const series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      name: 'Série',
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: props.horizontal ? undefined : props.valueField,
      valueXField: props.horizontal ? props.valueField : undefined,
      categoryYField: props.horizontal ? props.categoryField : undefined,
      categoryXField: props.horizontal ? undefined : props.categoryField,
      tooltip: am5.Tooltip.new(root, {
        labelText: '{valueY}'
      })
    })
  )

  // Configurer les colonnes
  series.columns.template.setAll({
    cornerRadiusTL: 5,
    cornerRadiusTR: 5,
    strokeOpacity: 0
  })

  // Effet de survol
  series.columns.template.states.create('hover', {
    fillOpacity: 0.8
  })

  series.data.setAll(props.data)

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
