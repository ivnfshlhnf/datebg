import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { FontLibrary } from 'skia-canvas'
import { FONTS } from '../shared/fonts.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function readMetadata(pkgPath) {
  const metaPath = path.join(pkgPath, 'metadata.json')
  if (!fs.existsSync(metaPath)) return null
  try {
    return JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
  } catch {
    return null
  }
}

function registerFontPackage(pkgName) {
  const pkgPath = path.join(__dirname, '..', 'node_modules', pkgName)
  const filesDir = path.join(pkgPath, 'files')
  const meta = readMetadata(pkgPath)
  if (!meta || !fs.existsSync(filesDir)) {
    console.warn(`[fonts] Skipping ${pkgName}: metadata or files not found`)
    return
  }

  const family = meta.family
  const id = meta.id

  const fontFiles = []
  // skia-canvas resolves families correctly only when each family is registered
  // with a small, non-conflicting set of static files. Registering multiple
  // subsets (latin, latin-ext, cyrillic, etc.) for the same family makes the
  // entire family fall back to DejaVu in this version. The renderer only uses
  // latin / normal weights, so that is all we need.
  const subsets = ['latin']
  const styles = ['normal']

  for (const weight of meta.weights) {
    for (const style of styles) {
      for (const subset of subsets) {
        const fileName = `${id}-${subset}-${weight}-${style}.woff2`
        const filePath = path.join(filesDir, fileName)
        if (fs.existsSync(filePath)) {
          fontFiles.push(filePath)
        }
      }
    }
  }

  if (fontFiles.length === 0) {
    console.warn(`[fonts] No font files found for ${family}`)
    return
  }

  try {
    FontLibrary.use(family, fontFiles)
  } catch (err) {
    console.warn(`[fonts] Failed to register ${family}:`, err.message)
  }
}

export function registerAllFonts() {
  console.log('[startup] Registering bundled fonts...')
  for (const font of FONTS) {
    registerFontPackage(font.packageName)
  }
  console.log(`[startup] Registered ${FontLibrary.families.length} font families`)
}

export const FONT_FAMILIES = FONTS.map((font) => {
  const meta = readMetadata(path.join(__dirname, '..', 'node_modules', font.packageName))
  return meta?.family || font.family
})
