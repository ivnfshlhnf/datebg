import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { FontLibrary } from 'skia-canvas'

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
  const subsets = meta.subsets || ['latin']

  for (const weight of meta.weights) {
    for (const style of meta.styles || ['normal']) {
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

// Keep in sync with FONT_OPTIONS in src/App.jsx and the Google Fonts link in index.html
const FONT_PACKAGES = [
  // Serif (Display)
  '@fontsource/dm-serif-display',
  '@fontsource/playfair-display',
  '@fontsource/merriweather',
  // Sans-Serif
  '@fontsource/dm-sans',
  '@fontsource/inter',
  '@fontsource/poppins',
  '@fontsource/sora',
  '@fontsource/outfit',
  '@fontsource/plus-jakarta-sans',
  '@fontsource/space-grotesk',
  '@fontsource/work-sans',
  '@fontsource/nunito',
  '@fontsource/quicksand',
  '@fontsource/raleway',
  '@fontsource/manrope',
  '@fontsource/urbanist',
  '@fontsource/lexend',
  '@fontsource/montserrat',
  '@fontsource/open-sans',
  '@fontsource/roboto',
  '@fontsource/lato',
  '@fontsource/source-sans-3',
  '@fontsource/ibm-plex-sans',
  '@fontsource/fira-sans',
  '@fontsource/cabin',
  '@fontsource/rubik',
  '@fontsource/exo-2',
  '@fontsource/josefin-sans',
  '@fontsource/onest',
  '@fontsource/tajawal',
  '@fontsource/el-messiri',
  '@fontsource/chakra-petch',
  // Monospace
  '@fontsource/jetbrains-mono',
  '@fontsource/fira-code',
  '@fontsource/ibm-plex-mono'
]

export function registerAllFonts() {
  console.log('[startup] Registering bundled fonts...')
  for (const pkg of FONT_PACKAGES) {
    registerFontPackage(pkg)
  }
  console.log(`[startup] Registered ${FontLibrary.families.length} font families`)
}

export const FONT_FAMILIES = FONT_PACKAGES.map((pkg) => {
  const meta = readMetadata(path.join(__dirname, '..', 'node_modules', pkg))
  return meta?.family || pkg.replace('@fontsource/', '').replace(/-/g, ' ')
})