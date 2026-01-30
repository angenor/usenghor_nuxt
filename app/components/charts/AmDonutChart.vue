<script setup lang="ts">
/**
 * Composant Donut Chart avec amCharts 5
 * Variante de PieChart avec un trou central pour afficher une valeur
 */

interface DataPoint {
  category: string
  value: number
  color?: string
  [key: string]: unknown
}

interface Props {
  data: DataPoint[]
  categoryField?: string
  valueField?: string
  height?: string
  animated?: boolean
  innerRadius?: number
  centerLabel?: string
  centerValue?: string | number
  showLegend?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  categoryField: 'category',
  valueField: 'value',
  height: '300px',
  animated: true,
  innerRadius: 60,
  showLegend: true
})

const chartId = `donut-chart-${useId()}`

let root: any = null

onMounted(async () => {
  // Import dynamique côté client uniquement
  const am5 = await import('@amcharts/amcharts5')
  const am5percent = await import('@amcharts/amcharts5/percent')
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

  // Créer le conteneur principal
  const container = root.container.children.push(
    am5.Container.new(root, {
      width: am5.percent(100),
      height: am5.percent(100),
      layout: root.verticalLayout
    })
  )

  // Créer le graphique en donut
  const chart = container.children.push(
    am5percent.PieChart.new(root, {
      innerRadius: am5.percent(props.innerRadius),
      layout: root.verticalLayout
    })
  )

  // Créer la série
  const series = chart.series.push(
    am5percent.PieSeries.new(root, {
      valueField: props.valueField,
      categoryField: props.categoryField,
      alignLabels: false
    })
  )

  // Configurer les slices
  series.slices.template.setAll({
    strokeWidth: 2,
    stroke: am5.color(0xffffff),
    cornerRadius: 4
  })

  // Couleurs personnalisées si fournies
  series.slices.template.adapters.add('fill', (fill: any, target: any) => {
    const dataItem = target.dataItem
    if (dataItem) {
      const data = dataItem.dataContext as DataPoint
      if (data.color) {
        return am5.color(data.color)
      }
    }
    return fill
  })

  // Configurer les labels sur les slices
  series.labels.template.setAll({
    fontSize: 11,
    text: '{category}',
    radius: 10,
    inside: true
  })

  // Effet de survol
  series.slices.template.states.create('hover', {
    scale: 1.05,
    shadowOpacity: 0.3,
    shadowBlur: 10
  })

  // Ajouter le label central si spécifié
  if (props.centerLabel || props.centerValue) {
    const centerContainer = chart.seriesContainer.children.push(
      am5.Container.new(root, {
        centerX: am5.percent(50),
        centerY: am5.percent(50),
        x: am5.percent(50),
        y: am5.percent(50),
        layout: root.verticalLayout
      })
    )

    if (props.centerValue) {
      centerContainer.children.push(
        am5.Label.new(root, {
          text: String(props.centerValue),
          fontSize: 28,
          fontWeight: 'bold',
          centerX: am5.percent(50),
          x: am5.percent(50)
        })
      )
    }

    if (props.centerLabel) {
      centerContainer.children.push(
        am5.Label.new(root, {
          text: props.centerLabel,
          fontSize: 12,
          opacity: 0.6,
          centerX: am5.percent(50),
          x: am5.percent(50)
        })
      )
    }
  }

  series.data.setAll(props.data)

  // Ajouter la légende si demandée
  if (props.showLegend) {
    const legend = container.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        marginTop: 10
      })
    )
    legend.data.setAll(series.dataItems)
  }

  // Animation d'apparition
  series.appear(1000, 100)
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
