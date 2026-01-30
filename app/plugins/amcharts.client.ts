/**
 * Plugin amCharts 5 pour Nuxt
 * Ce plugin s'exécute uniquement côté client (voir le suffixe .client.ts)
 * car amCharts 5 nécessite l'accès au DOM
 */

import * as am5 from '@amcharts/amcharts5'
import * as am5xy from '@amcharts/amcharts5/xy'
import * as am5percent from '@amcharts/amcharts5/percent'
import * as am5map from '@amcharts/amcharts5/map'
import * as am5radar from '@amcharts/amcharts5/radar'
import * as am5hierarchy from '@amcharts/amcharts5/hierarchy'
import * as am5flow from '@amcharts/amcharts5/flow'
import * as am5stock from '@amcharts/amcharts5/stock'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import am5themes_Dark from '@amcharts/amcharts5/themes/Dark'
import am5themes_Responsive from '@amcharts/amcharts5/themes/Responsive'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      am5,
      am5xy,
      am5percent,
      am5map,
      am5radar,
      am5hierarchy,
      am5flow,
      am5stock,
      am5themes: {
        Animated: am5themes_Animated,
        Dark: am5themes_Dark,
        Responsive: am5themes_Responsive
      }
    }
  }
})
