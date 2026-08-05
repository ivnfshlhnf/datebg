import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { Canvas, loadImage } from 'skia-canvas'
import renderCalendar from './renderCalendar.js'
import { registerAllFonts } from './registerFonts.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000
const NODE_ENV = process.env.NODE_ENV || 'development'

app.use(cors())

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`${new Date().toISOString()} ${req.method} ${req.path} ${res.statusCode} ${duration}ms`)
  })
  next()
})

registerAllFonts()

app.use(express.json())
app.use('/api/render', express.raw({ type: '*/*', limit: '50mb' }))
app.use(express.static(path.join(__dirname, '../dist')))

const NAGER_API = 'https://date.nager.at/api/v3'
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/echo', (req, res) => {
  res.json({ type: typeof req.body, length: Buffer.isBuffer(req.body) ? req.body.length : null })
})

app.get('/api/available-countries', async (_req, res) => {
  try {
    const response = await fetch(`${NAGER_API}/AvailableCountries`)
    const data = await response.json()
    res.json(data || [])
  } catch (err) {
    res.status(502).json({ error: 'Failed to load countries' })
  }
})

app.get('/api/holidays', async (req, res) => {
  const { country, year } = req.query
  if (!country || !year) {
    return res.status(400).json({ error: 'country and year are required' })
  }

  try {
    const response = await fetch(`${NAGER_API}/PublicHolidays/${year}/${country}`)
    const data = await response.json()
    res.json(data || [])
  } catch (err) {
    res.status(502).json({ error: 'Failed to load holidays' })
  }
})

app.post('/api/render', async (req, res) => {
  const start = Date.now()
  console.log(`[render] Received request: body=${Buffer.isBuffer(req.body) ? req.body.length : typeof req.body} bytes, content-type=${req.headers['content-type']}`)
  try {
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).json({ error: 'Raw image body is required' })
    }

    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()

    const countryCode = req.query.country || ''
    const fontFamily = req.query.font || 'Inter, sans-serif'
    const fontScale = Math.max(50, Math.min(150, Number(req.query.fontScale) || 100))
    const calendarWidth = Math.max(50, Math.min(100, Number(req.query.calendarWidth) || 92))
    const calendarHeight = Math.max(20, Math.min(50, Number(req.query.calendarHeight) || 33))
    const calendarY = Math.max(0, Math.min(100, Number(req.query.calendarY) || 33))
    const framePadding = Math.max(0, Math.min(15, Number(req.query.framePadding) || 6))
    const showFrame = String(req.query.showFrame || 'true').toLowerCase() !== 'false'
    const frameOpacity = Math.max(0, Math.min(100, Number(req.query.frameOpacity) || 55))
    const frameColor = req.query.frameColor || '#000000'
    const frameBorder = String(req.query.frameBorder || 'true').toLowerCase() !== 'false'
    const textOutline = String(req.query.textOutline || 'true').toLowerCase() !== 'false'
    const textOutlineAutoContrast = String(req.query.textOutlineAutoContrast || 'false').toLowerCase() === 'true'

    let holidays = []
    if (countryCode) {
      try {
        const response = await fetch(`${NAGER_API}/PublicHolidays/${year}/${countryCode}`)
        const data = await response.json()
        holidays = (data || []).filter((h) => {
          const d = new Date(h.date)
          return d.getFullYear() === year && d.getMonth() === month
        })
        console.log(`[render] Fetched ${holidays.length} holidays for ${countryCode} ${year}-${month + 1}`)
      } catch (err) {
        console.warn(`[render] Failed to load holidays for ${countryCode}:`, err.message)
      }
    }

    const image = await loadImage(req.body)
    console.log(`[render] Input ${req.body.length} bytes: ${image.width}x${image.height}, country=${countryCode || 'none'}, font=${fontFamily}, scale=${fontScale}%, cal=${calendarWidth}%x${calendarHeight}% @ y=${calendarY}%, pad=${framePadding}%, frame=${showFrame}, opacity=${frameOpacity}, color=${frameColor}, border=${frameBorder}, outline=${textOutline}, autoContrast=${textOutlineAutoContrast}`)

    const canvas = new Canvas(image.width, image.height)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(image, 0, 0)

    renderCalendar(ctx, canvas.width, canvas.height, {
      year,
      month,
      fontFamily,
      fontScale,
      holidays,
      today,
      calendarWidth,
      calendarHeight,
      calendarY,
      framePadding,
      showFrame,
      frameOpacity,
      frameColor,
      frameBorder,
      textOutline,
      textOutlineAutoContrast
    })

    const pngBuffer = await canvas.png

    res.set('Content-Type', 'image/png')
    res.set('Content-Disposition', 'inline')
    res.send(pngBuffer)
    console.log(`[render] Output ${pngBuffer.length} bytes in ${Date.now() - start}ms`)
  } catch (err) {
    console.error('Render error:', err)
    res.status(500).json({ error: 'Failed to render image' })
  }
})

app.use((err, _req, res, _next) => {
  console.error('[error]', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`[startup] DateBG server listening on port ${PORT} in ${NODE_ENV} mode (Node ${process.version})`)
  console.log(`[startup] Health check available at http://localhost:${PORT}/api/health`)
})
