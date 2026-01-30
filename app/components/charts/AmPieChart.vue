<script setup lang="ts">
/**
 * Composant de graphique en camembert avec amCharts 5
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
  innerRadius?: number
}

const props = withDefaults(defineProps<Props>(), {
  categoryField: 'category',
  valueField: 'value',
  height: '400px',
  animated: true,
  innerRadius: 0
})

const chartId = `pie-chart-${useId()}`
const { am5, am5percent, createRoot } = useAmCharts({ animated: props.animated })

let root: ReturnType<typeof createRoot> = null

onMounted(() => {
  if (!am5) return

  root = createRoot(chartId)
  if (!root) return

  // Créer le graphique en camembert
  const chart = root.container.children.push(
    am5percent.PieChart.new(root, {
      layout: root.verticalLayout,
      innerRadius: am5.percent(props.innerRadius)
    })
  )

  // Créer la série
  const series = chart.series.push(
    am5percent.PieSeries.new(root, {
      valueField: props.valueField,
      categoryField: props.categoryField,
      legendLabelText: '{category}',
      legendValueText: '{value}'
    })
  )

  // Configurer les labels
  series.labels.template.setAll({
    fontSize: 12,
    text: '{category}: {valuePercentTotal.formatNumber(\'0.0\')}%'
  })

  // Configurer les slices
  series.slices.template.setAll({
    strokeWidth: 2,
    stroke: am5.color(0xffffff)
  })

  // Effet de survol
  series.slices.template.states.create('hover', {
    scale: 1.05
  })

  series.data.setAll(props.data)

  // Ajouter la légende
  const legend = chart.children.push(
    am5.Legend.new(root, {
      centerX: am5.percent(50),
      x: am5.percent(50),
      marginTop: 15,
      marginBottom: 15
    })
  )
  legend.data.setAll(series.dataItems)

  // Animation d'apparition
  series.appear(1000, 100)
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
        <span class="text-gray-500">Chargement du graphique...</span>
      </div>
    </template>
  </ClientOnly>
</template>
