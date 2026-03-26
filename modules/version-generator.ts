import { defineNuxtModule } from '@nuxt/kit'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { randomBytes } from 'node:crypto'

/**
 * Module Nuxt qui génère un fichier version.json dans public/
 * à chaque build avec un hash unique, permettant la détection
 * de nouvelles versions côté client.
 */
export default defineNuxtModule({
  meta: {
    name: 'version-generator',
    configKey: 'versionGenerator'
  },
  setup(_options, nuxt) {
    const generateVersion = () => {
      const versionData = {
        hash: randomBytes(8).toString('hex'),
        buildTime: new Date().toISOString()
      }
      // En Nuxt 4, public/ est à la racine (rootDir), pas dans app/ (srcDir)
      const publicDir = resolve(nuxt.options.rootDir, 'public')
      if (!existsSync(publicDir)) {
        mkdirSync(publicDir, { recursive: true })
      }
      const outputPath = resolve(publicDir, 'version.json')
      writeFileSync(outputPath, JSON.stringify(versionData, null, 2))
      console.log(`[version-generator] version.json généré : ${versionData.hash}`)
    }

    // Générer à chaque build
    nuxt.hook('build:before', generateVersion)
  }
})
