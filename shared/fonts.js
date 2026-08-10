/**
 * DateBG shared font manifest.
 *
 * This is the single source of truth for every font family supported by the app.
 * Both the browser UI and the canvas renderer resolve fonts through this file,
 * so the frontend preview and the backend render can never disagree about which
 * family to use.
 *
 * Frontend usage:
 *   - label: shown in the font dropdown
 *   - group: dropdown grouping
 *   - family: used to build the CSS `font-family` stack
 *   - weights: used to build the Google Fonts request URL
 *
 * Backend usage:
 *   - id: the stable `?font=` query parameter value
 *   - family: the name registered with skia-canvas via @fontsource
 *   - packageName: the @fontsource npm package to load
 */

export const FONTS = [
  // Serif (Display)
  {
    id: 'dm-serif-display',
    family: 'DM Serif Display',
    label: 'DM Serif Display',
    group: 'Serif',
    weights: [400],
    packageName: '@fontsource/dm-serif-display'
  },
  {
    id: 'playfair-display',
    family: 'Playfair Display',
    label: 'Playfair Display',
    group: 'Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/playfair-display'
  },
  {
    id: 'merriweather',
    family: 'Merriweather',
    label: 'Merriweather',
    group: 'Serif',
    weights: [400, 700],
    packageName: '@fontsource/merriweather'
  },

  // Sans-Serif
  {
    id: 'dm-sans',
    family: 'DM Sans',
    label: 'DM Sans',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/dm-sans'
  },
  {
    id: 'inter',
    family: 'Inter',
    label: 'Inter',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/inter'
  },
  {
    id: 'poppins',
    family: 'Poppins',
    label: 'Poppins',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/poppins'
  },
  {
    id: 'sora',
    family: 'Sora',
    label: 'Sora',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/sora'
  },
  {
    id: 'outfit',
    family: 'Outfit',
    label: 'Outfit',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/outfit'
  },
  {
    id: 'plus-jakarta-sans',
    family: 'Plus Jakarta Sans',
    label: 'Plus Jakarta Sans',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/plus-jakarta-sans'
  },
  {
    id: 'space-grotesk',
    family: 'Space Grotesk',
    label: 'Space Grotesk',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/space-grotesk'
  },
  {
    id: 'work-sans',
    family: 'Work Sans',
    label: 'Work Sans',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/work-sans'
  },
  {
    id: 'nunito',
    family: 'Nunito',
    label: 'Nunito',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/nunito'
  },
  {
    id: 'quicksand',
    family: 'Quicksand',
    label: 'Quicksand',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/quicksand'
  },
  {
    id: 'raleway',
    family: 'Raleway',
    label: 'Raleway',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/raleway'
  },
  {
    id: 'manrope',
    family: 'Manrope',
    label: 'Manrope',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/manrope'
  },
  {
    id: 'urbanist',
    family: 'Urbanist',
    label: 'Urbanist',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/urbanist'
  },
  {
    id: 'lexend',
    family: 'Lexend',
    label: 'Lexend',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/lexend'
  },
  {
    id: 'montserrat',
    family: 'Montserrat',
    label: 'Montserrat',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/montserrat'
  },
  {
    id: 'open-sans',
    family: 'Open Sans',
    label: 'Open Sans',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/open-sans'
  },
  {
    id: 'roboto',
    family: 'Roboto',
    label: 'Roboto',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/roboto'
  },
  {
    id: 'lato',
    family: 'Lato',
    label: 'Lato',
    group: 'Sans-Serif',
    weights: [400, 700],
    packageName: '@fontsource/lato'
  },
  {
    id: 'source-sans-3',
    family: 'Source Sans 3',
    label: 'Source Sans 3',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/source-sans-3'
  },
  {
    id: 'ibm-plex-sans',
    family: 'IBM Plex Sans',
    label: 'IBM Plex Sans',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/ibm-plex-sans'
  },
  {
    id: 'fira-sans',
    family: 'Fira Sans',
    label: 'Fira Sans',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/fira-sans'
  },
  {
    id: 'cabin',
    family: 'Cabin',
    label: 'Cabin',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/cabin'
  },
  {
    id: 'rubik',
    family: 'Rubik',
    label: 'Rubik',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/rubik'
  },
  {
    id: 'exo-2',
    family: 'Exo 2',
    label: 'Exo 2',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/exo-2'
  },
  {
    id: 'josefin-sans',
    family: 'Josefin Sans',
    label: 'Josefin Sans',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/josefin-sans'
  },
  {
    id: 'onest',
    family: 'Onest',
    label: 'Onest',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/onest'
  },
  {
    id: 'tajawal',
    family: 'Tajawal',
    label: 'Tajawal',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/tajawal'
  },
  {
    id: 'el-messiri',
    family: 'El Messiri',
    label: 'El Messiri',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/el-messiri'
  },
  {
    id: 'chakra-petch',
    family: 'Chakra Petch',
    label: 'Chakra Petch',
    group: 'Sans-Serif',
    weights: [400, 500, 700],
    packageName: '@fontsource/chakra-petch'
  },

  // Monospace
  {
    id: 'jetbrains-mono',
    family: 'JetBrains Mono',
    label: 'JetBrains Mono',
    group: 'Monospace',
    weights: [400, 500, 700],
    packageName: '@fontsource/jetbrains-mono'
  },
  {
    id: 'fira-code',
    family: 'Fira Code',
    label: 'Fira Code',
    group: 'Monospace',
    weights: [400, 500, 700],
    packageName: '@fontsource/fira-code'
  },
  {
    id: 'ibm-plex-mono',
    family: 'IBM Plex Mono',
    label: 'IBM Plex Mono',
    group: 'Monospace',
    weights: [400, 500, 700],
    packageName: '@fontsource/ibm-plex-mono'
  }
]

export const FONT_GROUPS = ['Serif', 'Sans-Serif', 'Monospace']

export const DEFAULT_FONT_ID = 'dm-serif-display'

const FALLBACKS_BY_GROUP = {
  Serif: 'serif',
  'Sans-Serif': 'sans-serif',
  Monospace: 'monospace'
}

/**
 * Build a CSS `font-family` value from a manifest entry.
 */
export function getFontFamilyValue(fontId) {
  const font = FONTS.find((f) => f.id === fontId)
  if (!font) return `'Inter', sans-serif`
  const fallback = FALLBACKS_BY_GROUP[font.group] || 'sans-serif'
  return `'${font.family}', ${fallback}`
}

/**
 * Resolve a font ID to the exact family name used by skia-canvas / @fontsource.
 * Returns null if the ID is unknown so callers can decide how to handle it.
 */
export function getFontFamilyName(fontId) {
  return FONTS.find((f) => f.id === fontId)?.family || null
}

/**
 * Build a Google Fonts CSS URL that loads every family in the manifest.
 */
export function getGoogleFontsUrl() {
  const families = FONTS.map((font) => {
    const name = font.family.replace(/\s+/g, '+')
    if (font.weights.length === 1 && font.weights[0] === 400) {
      return `family=${name}`
    }
    return `family=${name}:wght@${font.weights.join(';')}`
  })
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`
}
