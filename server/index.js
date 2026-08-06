import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { Canvas, loadImage } from 'skia-canvas'
import rateLimit from 'express-rate-limit'
import renderCalendar from './renderCalendar.js'
import { registerAllFonts } from './registerFonts.js'
import helmet from 'helmet'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000
const NODE_ENV = process.env.NODE_ENV || 'development'
const API_KEY = process.env.API_KEY || ''

// CORS configuration - restrict to specific origins
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:3000']
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, iOS Shortcuts)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
app.use(helmet())

// Rate limiter for failed API key attempts
const failedAttemptsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 failed attempts per window
  standardHeaders: 'draft-6',
  legacyHeaders: false,
  message: { error: 'Too many failed authentication attempts, try again after 15 minutes' },
  skip: (req) => {
    // Skip rate limiting for successful authentications
    const apiKey = req.get('X-API-Key')
    return apiKey && apiKey === API_KEY
  }
})

// General rate limiter for all API requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: 'draft-6',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' }
})

app.use(generalLimiter)

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

// API Key validation middleware for /api/render endpoint
const validateApiKey = (req, res, next) => {
  // Skip validation if no API key is configured (backward compatibility)
  if (!API_KEY) return next()
  
  const apiKey = req.get('X-API-Key')
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required. Please provide X-API-Key header.' })
  }
  
  if (apiKey !== API_KEY) {
    // Apply rate limiting for failed attempts
    failedAttemptsLimiter(req, res, () => {})
    console.warn(`[security] Invalid API key attempt from ${req.ip}`)
    return res.status(401).json({ error: 'Invalid API key' })
  }
  
  next()
}

app.use(express.json())
app.use('/api/render', express.raw({ type: '*/*', limit: '50mb' }))
app.use('/api/render', validateApiKey)
app.use(express.static(path.join(__dirname, '../dist')))

function getPngDimensions(buffer) {
  if (buffer.length < 24) return null
  const sig = buffer.toString('hex', 0, 8)
  if (sig !== '89504e470d0a1a0a') return null
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  }
}

const MAX_IMAGE_DIMENSION = 5000

const NAGER_API = 'https://date.nager.at/api/v3'
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function getDateInTimeZone(timeZone) {
  if (!timeZone) return new Date()
  try {
    const now = new Date()
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    }).formatToParts(now)
    const get = (type) => Number(parts.find((p) => p.type === type)?.value)
    return new Date(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'))
  } catch {
    return new Date()
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, authEnabled: !!API_KEY })
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

    const dims = getPngDimensions(req.body)
    if (dims && (dims.width > MAX_IMAGE_DIMENSION || dims.height > MAX_IMAGE_DIMENSION)) {
      return res.status(400).json({ error: `Image too large: ${dims.width}x${dims.height}` })
    }

    const timeZone = req.query.timeZone || ''
    const today = getDateInTimeZone(timeZone)
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
    console.log(`[render] Input ${req.body.length} bytes: ${image.width}x${image.height}, country=${countryCode || 'none'}, font=${fontFamily}, scale=${fontScale}%, cal=${calendarWidth}%x${calendarHeight}% @ y=${calendarY}%, pad=${framePadding}%, frame=${showFrame}, opacity=${frameOpacity}, color=${frameColor}, border=${frameBorder}, outline=${textOutline}, autoContrast=${textOutlineAutoContrast}, timeZone=${timeZone || 'server'}`)

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
