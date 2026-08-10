import { useEffect, useRef, useState, useCallback } from 'react'
import './styles/base.css'
import './styles/components.css'

const API_BASE = ''

// API Key stored in localStorage for authenticated requests
const getApiKey = () => localStorage.getItem('datebg_api_key') || ''
const setApiKey = (key) => localStorage.setItem('datebg_api_key', key)

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Curated font options — every family is loaded via Google Fonts on the frontend
// and registered via @fontsource on the server so the dropdown preview matches the render.
const FONT_OPTIONS = [
  // Serif (Display)
  { value: "'DM Serif Display', serif", label: 'DM Serif Display', group: 'Serif' },
  { value: "'Playfair Display', serif", label: 'Playfair Display', group: 'Serif' },
  { value: "'Merriweather', serif", label: 'Merriweather', group: 'Serif' },
  // Sans-Serif
  { value: "'DM Sans', sans-serif", label: 'DM Sans', group: 'Sans-Serif' },
  { value: "'Inter', sans-serif", label: 'Inter', group: 'Sans-Serif' },
  { value: "'Poppins', sans-serif", label: 'Poppins', group: 'Sans-Serif' },
  { value: "'Sora', sans-serif", label: 'Sora', group: 'Sans-Serif' },
  { value: "'Outfit', sans-serif", label: 'Outfit', group: 'Sans-Serif' },
  { value: "'Plus Jakarta Sans', sans-serif", label: 'Plus Jakarta Sans', group: 'Sans-Serif' },
  { value: "'Space Grotesk', sans-serif", label: 'Space Grotesk', group: 'Sans-Serif' },
  { value: "'Work Sans', sans-serif", label: 'Work Sans', group: 'Sans-Serif' },
  { value: "'Nunito', sans-serif", label: 'Nunito', group: 'Sans-Serif' },
  { value: "'Quicksand', sans-serif", label: 'Quicksand', group: 'Sans-Serif' },
  { value: "'Raleway', sans-serif", label: 'Raleway', group: 'Sans-Serif' },
  { value: "'Manrope', sans-serif", label: 'Manrope', group: 'Sans-Serif' },
  { value: "'Urbanist', sans-serif", label: 'Urbanist', group: 'Sans-Serif' },
  { value: "'Lexend', sans-serif", label: 'Lexend', group: 'Sans-Serif' },
  { value: "'Montserrat', sans-serif", label: 'Montserrat', group: 'Sans-Serif' },
  { value: "'Open Sans', sans-serif", label: 'Open Sans', group: 'Sans-Serif' },
  { value: "'Roboto', sans-serif", label: 'Roboto', group: 'Sans-Serif' },
  { value: "'Lato', sans-serif", label: 'Lato', group: 'Sans-Serif' },
  { value: "'Source Sans 3', sans-serif", label: 'Source Sans 3', group: 'Sans-Serif' },
  { value: "'IBM Plex Sans', sans-serif", label: 'IBM Plex Sans', group: 'Sans-Serif' },
  { value: "'Fira Sans', sans-serif", label: 'Fira Sans', group: 'Sans-Serif' },
  { value: "'Cabin', sans-serif", label: 'Cabin', group: 'Sans-Serif' },
  { value: "'Rubik', sans-serif", label: 'Rubik', group: 'Sans-Serif' },
  { value: "'Exo 2', sans-serif", label: 'Exo 2', group: 'Sans-Serif' },
  { value: "'Josefin Sans', sans-serif", label: 'Josefin Sans', group: 'Sans-Serif' },
  { value: "'Onest', sans-serif", label: 'Onest', group: 'Sans-Serif' },
  { value: "'Tajawal', sans-serif", label: 'Tajawal', group: 'Sans-Serif' },
  { value: "'El Messiri', sans-serif", label: 'El Messiri', group: 'Sans-Serif' },
  { value: "'Chakra Petch', sans-serif", label: 'Chakra Petch', group: 'Sans-Serif' },
  // Monospace
  { value: "'JetBrains Mono', monospace", label: 'JetBrains Mono', group: 'Monospace' },
  { value: "'Fira Code', monospace", label: 'Fira Code', group: 'Monospace' },
  { value: "'IBM Plex Mono', monospace", label: 'IBM Plex Mono', group: 'Monospace' }
]

const FONT_GROUPS = ['Serif', 'Sans-Serif', 'Monospace']

const PRESET_COLORS = [
  '#ffffff', '#000000', '#d97757', '#e8e6e1',
  '#a8a49e', '#6b6862', '#f56c6c', '#8ab06a'
]

// SVG icons for section headers
const SECTION_ICONS = {
  Background: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  ),
  Style: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7V4h16v3" />
      <path d="M9 20h6" />
      <path d="M12 4v16" />
    </svg>
  ),
  Layout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="7" height="18" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
    </svg>
  ),
  Frame: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </svg>
  ),
  'Export & Import': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  ),
  'API Key': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
      <path d="m21 2-9.6 9.6" />
      <circle cx="7.5" cy="15.5" r="5.5" />
    </svg>
  )
}

const ResetIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
)

function getDisplayFamily(fontValue) {
  return fontValue.split(',')[0].replace(/^["']|["']$/g, '')
}

const DEFAULTS = {
  fontFamily: FONT_OPTIONS[0].value,
  fontScale: 100,
  fontColor: '#ffffff',
  calendarWidth: 92,
  calendarHeight: 33,
  calendarY: 33,
  framePadding: 6,
  showFrame: true,
  frameOpacity: 55,
  frameColor: '#000000',
  frameBorder: true,
  frameBorderColor: '#ffffff',
  textOutline: true,
  textOutlineColor: '#000000',
  textOutlineAutoContrast: false,
  showHolidayList: true,
  country: 'ID'
}

// Validate hex color (visual-only — doesn't reject input)
const isValidHex = (hex) => /^#[0-9a-fA-F]{6}$/.test(hex)

async function detectCountryFromIP() {
  try {
    const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return data?.country_code || null
  } catch {
    return null
  }
}

function Section({ title, sectionId, children, reset, open, onToggle }) {
  const icon = SECTION_ICONS[title]
  return (
    <div className={`section ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="section-header"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`section-body-${sectionId}`}
      >
        {icon && <span className="section-header-section-icon">{icon}</span>}
        <h3 className="section-header-title">{title}</h3>
        <div className="section-header-actions">
          {reset && open && (
            <span
              className="section-reset-icon"
              onClick={(e) => {
                e.stopPropagation()
                reset()
              }}
              role="button"
              tabIndex={0}
              aria-label={`Reset ${title} to defaults`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  reset()
                }
              }}
            >
              <ResetIcon />
            </span>
          )}
          <svg
            className="section-header-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="section-body" id={`section-body-${sectionId}`} role="region">
          {children}
        </div>
      )}
    </div>
  )
}

function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <label className={`toggle ${disabled ? 'disabled' : ''}`}>
      <div className="toggle-track">
        <input
          type="checkbox"
          className="toggle-input"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-thumb" aria-hidden="true" />
      </div>
      <span className="toggle-label">{label}</span>
    </label>
  )
}

function ColorField({ id, color, onChange, disabled, label }) {
  const valid = isValidHex(color)
  return (
    <div className="control-row">
      <label className="control-label" htmlFor={id}>{label}</label>
      <div className="color-field-unified">
        <div className="color-swatch-inline">
          <input
            id={id}
            type="color"
            value={valid ? color : '#000000'}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <input
          type="text"
          className={`input color-input ${!valid ? 'invalid' : ''}`}
          value={color}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} hex value`}
          maxLength={7}
        />
      </div>
      {!disabled && (
        <div className="color-presets">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset}
              type="button"
              className={`color-preset ${color.toLowerCase() === preset.toLowerCase() ? 'active' : ''}`}
              style={{ background: preset }}
              onClick={() => onChange(preset)}
              aria-label={`Use color ${preset}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function App() {
  const [countries, setCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [holidays, setHolidays] = useState([])
  const [status, setStatus] = useState('')
  const [fontFamily, setFontFamily] = useState(DEFAULTS.fontFamily)
  const [fontScale, setFontScale] = useState(DEFAULTS.fontScale)
  const [fontColor, setFontColor] = useState(DEFAULTS.fontColor)
  const [calendarWidth, setCalendarWidth] = useState(DEFAULTS.calendarWidth)
  const [calendarHeight, setCalendarHeight] = useState(DEFAULTS.calendarHeight)
  const [calendarY, setCalendarY] = useState(DEFAULTS.calendarY)
  const [framePadding, setFramePadding] = useState(DEFAULTS.framePadding)
  const [showFrame, setShowFrame] = useState(DEFAULTS.showFrame)
  const [frameOpacity, setFrameOpacity] = useState(DEFAULTS.frameOpacity)
  const [frameColor, setFrameColor] = useState(DEFAULTS.frameColor)
  const [frameBorder, setFrameBorder] = useState(DEFAULTS.frameBorder)
  const [frameBorderColor, setFrameBorderColor] = useState(DEFAULTS.frameBorderColor)
  const [textOutline, setTextOutline] = useState(DEFAULTS.textOutline)
  const [textOutlineColor, setTextOutlineColor] = useState(DEFAULTS.textOutlineColor)
  const [textOutlineAutoContrast, setTextOutlineAutoContrast] = useState(DEFAULTS.textOutlineAutoContrast)
  const [showHolidayList, setShowHolidayList] = useState(DEFAULTS.showHolidayList)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [resolution, setResolution] = useState({ width: 0, height: 0 })
  const [copied, setCopied] = useState(false)
  const [imported, setImported] = useState(false)
  const [fontOpen, setFontOpen] = useState(false)
  const [focusedFontIndex, setFocusedFontIndex] = useState(-1)
  const [activeSection, setActiveSection] = useState('Background')
  const [today, setToday] = useState(() => new Date())
  const [fullDownloadUrl, setFullDownloadUrl] = useState('')
  const [apiKey, setApiKeyState] = useState(getApiKey())
  const [authError, setAuthError] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [authEnabled, setAuthEnabled] = useState(false)
  const [isRendering, setIsRendering] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [previewStale, setPreviewStale] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const previewRef = useRef(null)
  const fontSelectRef = useRef(null)
  const fontDropdownRef = useRef(null)

  // Keep the displayed date current when the app is left open overnight
  useEffect(() => {
    let intervalId
    const update = () => setToday(new Date())
    const scheduleNextUpdate = () => {
      const now = new Date()
      const msUntilMidnight =
        new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now
      return setTimeout(() => {
        update()
        intervalId = setInterval(update, 24 * 60 * 60 * 1000)
      }, msUntilMidnight)
    }
    const timeoutId = scheduleNextUpdate()
    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    // Check if authentication is enabled on the server
    fetch(`${API_BASE}/api/health`)
      .then((res) => res.json())
      .then((data) => {
        const enabled = data?.authEnabled || false
        setAuthEnabled(enabled)
        // Open API key section if auth is required and no key is stored
        if (enabled && !getApiKey()) {
          setShowApiKeyInput(true)
        }
      })
      .catch(() => console.warn('Failed to check auth status'))

    const pickCountry = async (list) => {
      if (!selectedCountry && list.length > 0) {
        const detected = await detectCountryFromIP()
        const availableCodes = new Set(list.map((c) => c.countryCode))
        const initial = detected && availableCodes.has(detected) ? detected : DEFAULTS.country
        setSelectedCountry(initial)
      }
    }

    fetch(`${API_BASE}/api/available-countries`)
      .then((res) => res.json())
      .then(async (data) => {
        const list = data || []
        setCountries(list)
        await pickCountry(list)
      })
      .catch(() => setStatus('Failed to load countries.'))
  }, [])

  useEffect(() => {
    if (!selectedCountry) {
      setHolidays([])
      return
    }

    const year = today.getFullYear()
    const month = today.getMonth()

    setStatus('Loading holidays…')
    fetch(`${API_BASE}/api/holidays?country=${selectedCountry}&year=${year}`)
      .then((res) => res.json())
      .then((data) => {
        const monthly = (data || []).filter((h) => {
          const d = new Date(h.date)
          return d.getFullYear() === year && d.getMonth() === month
        })
        setHolidays(monthly)
        setStatus('')
      })
      .catch(() => setStatus('Failed to load holidays.'))
  }, [selectedCountry, today])

  useEffect(() => {
    if (!imageFile) {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current)
        previewRef.current = null
      }
      setPreviewUrl(null)
      setResolution({ width: 0, height: 0 })
      setPreviewStale(false)
    }
  }, [imageFile])

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current)
        previewRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!fontOpen) return
    const handleClickOutside = (e) => {
      if (fontSelectRef.current && !fontSelectRef.current.contains(e.target)) {
        setFontOpen(false)
        setFocusedFontIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [fontOpen])

  // Keep export URL in sync with current params
  useEffect(() => {
    const queryString = `?${buildParams().toString()}`
    setFullDownloadUrl(`${window.location.origin}/api/render${queryString}`)
  }, [selectedCountry, fontFamily, fontScale, fontColor, calendarWidth, calendarHeight, calendarY, framePadding, showFrame, frameOpacity, frameColor, frameBorder, frameBorderColor, textOutline, textOutlineColor, textOutlineAutoContrast, showHolidayList])

  // Mark preview as stale when any control changes after a render
  useEffect(() => {
    if (previewUrl) {
      setPreviewStale(true)
    }
  }, [fontFamily, fontScale, fontColor, calendarWidth, calendarHeight, calendarY, framePadding, showFrame, frameOpacity, frameColor, frameBorder, frameBorderColor, textOutline, textOutlineColor, textOutlineAutoContrast, showHolidayList, selectedCountry])

  const buildParams = () => {
    const params = new URLSearchParams()
    if (selectedCountry) params.append('country', selectedCountry)
    params.append('font', fontFamily)
    params.append('fontScale', String(fontScale))
    params.append('fontColor', fontColor)
    params.append('calendarWidth', String(calendarWidth))
    params.append('calendarHeight', String(calendarHeight))
    params.append('calendarY', String(calendarY))
    params.append('framePadding', String(framePadding))
    params.append('showFrame', String(showFrame))
    params.append('frameOpacity', String(frameOpacity))
    params.append('frameColor', frameColor)
    params.append('frameBorder', String(frameBorder))
    params.append('frameBorderColor', frameBorderColor)
    params.append('textOutline', String(textOutline))
    params.append('textOutlineColor', textOutlineColor)
    params.append('textOutlineAutoContrast', String(textOutlineAutoContrast))
    params.append('showHolidayList', String(showHolidayList))
    params.append('timeZone', Intl.DateTimeFormat().resolvedOptions().timeZone)
    return params
  }

  const applyParamsFromString = useCallback((paramString) => {
    // Remove leading '?' if present
    const cleanString = paramString.startsWith('?') ? paramString.slice(1) : paramString
    const params = new URLSearchParams(cleanString)

    // Parse and apply each known parameter
    if (params.has('country')) setSelectedCountry(params.get('country'))
    if (params.has('font')) setFontFamily(params.get('font'))
    if (params.has('fontScale')) setFontScale(Number(params.get('fontScale')))
    if (params.has('fontColor')) setFontColor(params.get('fontColor'))
    if (params.has('calendarWidth')) setCalendarWidth(Number(params.get('calendarWidth')))
    if (params.has('calendarHeight')) setCalendarHeight(Number(params.get('calendarHeight')))
    if (params.has('calendarY')) setCalendarY(Number(params.get('calendarY')))
    if (params.has('framePadding')) setFramePadding(Number(params.get('framePadding')))
    if (params.has('showFrame')) setShowFrame(params.get('showFrame') === 'true')
    if (params.has('frameOpacity')) setFrameOpacity(Number(params.get('frameOpacity')))
    if (params.has('frameColor')) setFrameColor(params.get('frameColor'))
    if (params.has('frameBorder')) setFrameBorder(params.get('frameBorder') === 'true')
    if (params.has('frameBorderColor')) setFrameBorderColor(params.get('frameBorderColor'))
    if (params.has('textOutline')) setTextOutline(params.get('textOutline') === 'true')
    if (params.has('textOutlineColor')) setTextOutlineColor(params.get('textOutlineColor'))
    if (params.has('textOutlineAutoContrast')) setTextOutlineAutoContrast(params.get('textOutlineAutoContrast') === 'true')
    if (params.has('showHolidayList')) setShowHolidayList(params.get('showHolidayList') === 'true')

    // Flash "Imported ✓"
    setImported(true)
    setTimeout(() => setImported(false), 1500)
  }, [])

  const renderPreview = async () => {
    if (!imageFile || isRendering) return

    setIsRendering(true)
    setPreviewStale(false)

    const params = buildParams()

    try {
      const imageBuffer = await imageFile.arrayBuffer()
      const headers = {
        'Content-Type': imageFile.type || 'application/octet-stream'
      }
      
      // Include API key if configured
      if (apiKey) {
        headers['X-API-Key'] = apiKey
      }
      
      const response = await fetch(`${API_BASE}/api/render?${params.toString()}`, {
        method: 'POST',
        headers,
        body: imageBuffer
      })

      // Handle authentication errors
      if (response.status === 401) {
        setAuthError('Invalid or missing API key. Please enter your API key to continue.')
        setShowApiKeyInput(true)
        setActiveSection('API Key')
        throw new Error('Authentication required')
      }
      
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Render failed')
      }

      // Clear any previous auth errors on success
      setAuthError('')

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)

      const img = new Image()
      img.onload = () => {
        setResolution({ width: img.naturalWidth, height: img.naturalHeight })
      }
      img.src = objectUrl

      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current)
      }
      previewRef.current = objectUrl
      setPreviewUrl(objectUrl)
      setStatus('')
    } catch (err) {
      console.error(err)
      if (err.message !== 'Authentication required') {
        setStatus('Render failed. Check image format.')
      }
    } finally {
      setIsRendering(false)
    }
  }

  const handleApiKeyChange = (e) => {
    const newKey = e.target.value
    setApiKeyState(newKey)
    setApiKey(newKey)
    setAuthError('')
  }

  const handleDownload = async () => {
    if (!previewUrl || isDownloading) return

    setIsDownloading(true)
    try {
      const a = document.createElement('a')
      a.href = previewUrl
      a.download = `datebg-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleFileChange = (e) => {
    setImageFile(e.target.files?.[0] || null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  const clearImage = () => {
    setImageFile(null)
  }

  // Keyboard navigation for font dropdown
  const handleFontKeyDown = (e) => {
    if (!fontOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setFontOpen(true)
        setFocusedFontIndex(FONT_OPTIONS.findIndex(f => f.value === fontFamily))
      }
      return
    }

    if (e.key === 'Escape') {
      e.preventDefault()
      setFontOpen(false)
      setFocusedFontIndex(-1)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedFontIndex((prev) => {
        const next = Math.min(prev + 1, FONT_OPTIONS.length - 1)
        // Scroll into view
        requestAnimationFrame(() => {
          const opts = fontDropdownRef.current?.querySelectorAll('.custom-select-option')
          opts?.[next]?.scrollIntoView({ block: 'nearest' })
        })
        return next
      })
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedFontIndex((prev) => {
        const next = Math.max(prev - 1, 0)
        requestAnimationFrame(() => {
          const opts = fontDropdownRef.current?.querySelectorAll('.custom-select-option')
          opts?.[next]?.scrollIntoView({ block: 'nearest' })
        })
        return next
      })
      return
    }

    if (e.key === 'Enter' && focusedFontIndex >= 0) {
      e.preventDefault()
      setFontFamily(FONT_OPTIONS[focusedFontIndex].value)
      setFontOpen(false)
      setFocusedFontIndex(-1)
    }
  }

  const renderSlider = (label, value, min, max, onChange, unit = '%', showHints = false) => {
    const fillPct = ((value - min) / (max - min)) * 100
    return (
      <div className="control-row range-control">
        <div className="range-header">
          <label className="range-label">{label}</label>
          <span className="range-value">
            {value}
            {unit}
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ '--fill': `${fillPct}%` }}
        />
        {showHints && (
          <div className="range-hints">
            <span>{min}{unit}</span>
            <span>{max}{unit}</span>
          </div>
        )}
      </div>
    )
  }

  // Group fonts by category for the dropdown
  const renderFontDropdown = () => {
    return FONT_GROUPS.map((group) => {
      const groupFonts = FONT_OPTIONS.filter(f => f.group === group)
      if (groupFonts.length === 0) return null
      return (
        <div key={group}>
          <div className="custom-select-group-header">{group}</div>
          {groupFonts.map((f) => {
            const globalIndex = FONT_OPTIONS.indexOf(f)
            return (
              <button
                key={f.value}
                type="button"
                className={`custom-select-option ${fontFamily === f.value ? 'selected' : ''} ${focusedFontIndex === globalIndex ? 'focused' : ''}`}
                style={{ fontFamily: getDisplayFamily(f.value) }}
                onClick={() => {
                  setFontFamily(f.value)
                  setFontOpen(false)
                  setFocusedFontIndex(-1)
                }}
                onMouseEnter={() => setFocusedFontIndex(globalIndex)}
                role="option"
                aria-selected={fontFamily === f.value}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      )
    })
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          DateBG
          <span className="app-title-accent" aria-hidden="true">●</span>
        </h1>
        <p className="app-subtitle">Overlay this month's calendar onto your phone background.</p>
      </header>

      <div className="app-layout">
        {/* Controls column */}
        <div className="app-controls">
          {/* API Key — only show if auth is enabled OR user has opened it */}
          {(authEnabled || showApiKeyInput) && (
            <section className="card api-key-card">
              <Section
                title="API Key"
                sectionId="api-key"
                open={showApiKeyInput}
                onToggle={() => setShowApiKeyInput((v) => !v)}
              >
                <div className="control-row">
                  <label className="control-label" htmlFor="api-key-input">Server API Key</label>
                  <div className="file-input" style={{ borderStyle: 'solid' }}>
                    <div className="file-info">
                      <input
                        id="api-key-input"
                        type="password"
                        className="input"
                        value={apiKey}
                        onChange={handleApiKeyChange}
                        placeholder="Enter your API key"
                        aria-label="API Key input"
                      />
                    </div>
                  </div>
                  <p className="control-hint">
                    {authEnabled
                      ? 'Required for authenticated API requests. Your key is stored locally in your browser.'
                      : 'Optional: only needed when the server requires authentication. Your key is stored locally in your browser.'}
                  </p>
                </div>
                {authError && <p className="auth-error-message" role="alert">{authError}</p>}
              </Section>
            </section>
          )}

          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Customize</h2>
            </div>

            <Section
              title="Background"
              sectionId="background"
              open={activeSection === 'Background'}
              onToggle={() => setActiveSection('Background')}
            >
              <div className="control-row">
                <label className="control-label" htmlFor="bg-image">Upload wallpaper</label>
                <div
                  className={`file-input ${imageFile ? 'has-file' : ''} ${dragOver ? 'drag-over' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    id="bg-image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {imageFile ? (
                    <div className="file-info">
                      <span className="file-name" title={imageFile.name}>
                        {imageFile.name}
                      </span>
                      <button
                        type="button"
                        className="file-clear"
                        onClick={clearImage}
                        aria-label="Remove selected image"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="file-input-placeholder">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                        <circle cx="9" cy="9" r="2"/>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                      </svg>
                      <span>{dragOver ? 'Drop to upload' : 'Drop image or click to upload'}</span>
                    </div>
                  )}
                </div>
                <p className="control-hint">Upload a phone wallpaper to get started.</p>
              </div>

              <div className="control-row">
                <label className="control-label" htmlFor="country-select">Country</label>
                <select
                  id="country-select"
                  className="select"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  <option value="">Select a country</option>
                  {countries.map((c) => (
                    <option key={c.countryCode} value={c.countryCode}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="control-hint">Used to highlight national holidays.</p>
              </div>

              <Toggle
                checked={showHolidayList}
                onChange={setShowHolidayList}
                label="Show holiday list"
              />
            </Section>

            <Section
              title="Style"
              sectionId="style"
              open={activeSection === 'Style'}
              onToggle={() => setActiveSection('Style')}
              reset={() => {
                setFontFamily(DEFAULTS.fontFamily)
                setFontScale(DEFAULTS.fontScale)
                setFontColor(DEFAULTS.fontColor)
                setTextOutline(DEFAULTS.textOutline)
                setTextOutlineColor(DEFAULTS.textOutlineColor)
                setTextOutlineAutoContrast(DEFAULTS.textOutlineAutoContrast)
              }}
            >
              <div className="control-row" ref={fontSelectRef}>
                <label className="control-label" id="font-label">Font</label>
                <div
                  className={`custom-select ${fontOpen ? 'open' : ''}`}
                  onKeyDown={handleFontKeyDown}
                >
                  <button
                    type="button"
                    className="custom-select-trigger"
                    onClick={() => setFontOpen((v) => !v)}
                    aria-haspopup="listbox"
                    aria-expanded={fontOpen}
                    aria-labelledby="font-label"
                  >
                    <span style={{ fontFamily: getDisplayFamily(fontFamily) }}>
                      {FONT_OPTIONS.find(f => f.value === fontFamily)?.label || 'Select font'}
                    </span>
                    <svg
                      className="custom-select-icon"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  {fontOpen && (
                    <div
                      className="custom-select-dropdown"
                      role="listbox"
                      aria-labelledby="font-label"
                      ref={fontDropdownRef}
                    >
                      {renderFontDropdown()}
                    </div>
                  )}
                </div>
              </div>

              {renderSlider('Font size', fontScale, 50, 150, setFontScale, '%', true)}

              <ColorField
                id="font-color"
                color={fontColor}
                onChange={setFontColor}
                label="Font color"
              />

              <Toggle
                checked={textOutline}
                onChange={setTextOutline}
                label="Text outline"
              />

              <div className={`dependent-controls ${!textOutline || textOutlineAutoContrast ? 'disabled-wrapper' : ''}`}>
                <ColorField
                  id="outline-color"
                  color={textOutlineColor}
                  onChange={setTextOutlineColor}
                  disabled={!textOutline || textOutlineAutoContrast}
                  label="Outline color"
                />
              </div>

              <div className={textOutline ? '' : 'disabled-wrapper'}>
                <Toggle
                  checked={textOutline && textOutlineAutoContrast}
                  onChange={setTextOutlineAutoContrast}
                  label="Auto-contrast outline"
                  disabled={!textOutline}
                />
              </div>
            </Section>

            <Section
              title="Layout"
              sectionId="layout"
              open={activeSection === 'Layout'}
              onToggle={() => setActiveSection('Layout')}
              reset={() => {
                setCalendarWidth(DEFAULTS.calendarWidth)
                setCalendarHeight(DEFAULTS.calendarHeight)
                setCalendarY(DEFAULTS.calendarY)
              }}
            >
              {renderSlider('Calendar width', calendarWidth, 50, 100, setCalendarWidth)}
              {renderSlider('Calendar height', calendarHeight, 20, 50, setCalendarHeight)}
              {renderSlider('Vertical position', calendarY, 0, 100, setCalendarY)}
            </Section>

            <Section
              title="Frame"
              sectionId="frame"
              open={activeSection === 'Frame'}
              onToggle={() => setActiveSection('Frame')}
              reset={() => {
                setShowFrame(DEFAULTS.showFrame)
                setFramePadding(DEFAULTS.framePadding)
                setFrameOpacity(DEFAULTS.frameOpacity)
                setFrameColor(DEFAULTS.frameColor)
                setFrameBorder(DEFAULTS.frameBorder)
                setFrameBorderColor(DEFAULTS.frameBorderColor)
              }}
            >
              <Toggle
                checked={showFrame}
                onChange={setShowFrame}
                label="Show calendar frame"
              />

              <div className={`dependent-controls ${showFrame ? '' : 'disabled-wrapper'}`}>
                {renderSlider('Frame spacing', framePadding, 0, 15, setFramePadding)}

                <ColorField
                  id="frame-color"
                  color={frameColor}
                  onChange={setFrameColor}
                  disabled={!showFrame}
                  label="Background color"
                />

                {renderSlider('Opacity', frameOpacity, 0, 100, setFrameOpacity)}

                <div className={showFrame && frameBorder ? '' : 'disabled-wrapper'}>
                  <ColorField
                    id="frame-border-color"
                    color={frameBorderColor}
                    onChange={setFrameBorderColor}
                    disabled={!showFrame || !frameBorder}
                    label="Border color"
                  />
                </div>

                <Toggle
                  checked={frameBorder}
                  onChange={setFrameBorder}
                  label="Show frame border"
                  disabled={!showFrame}
                />
              </div>
            </Section>

            <Section
              title="Export & Import"
              sectionId="export"
              open={activeSection === 'Export & Import'}
              onToggle={() => setActiveSection('Export & Import')}
            >
              <p className="control-hint" style={{ marginBottom: '12px' }}>
                Copy this URL to share your settings, or paste a URL to import someone else's configuration.
              </p>
              <div className="control-row">
                <div className="export-field">
                  <input
                    type="text"
                    className="input"
                    value={fullDownloadUrl}
                    onChange={(e) => {
                      setFullDownloadUrl(e.target.value)
                      // Extract query string from full URL and apply params
                      try {
                        const url = new URL(e.target.value)
                        applyParamsFromString(url.search)
                      } catch {
                        applyParamsFromString(e.target.value)
                      }
                    }}
                    placeholder="Paste a DateBG URL to import settings…"
                    aria-label="Export and import URL"
                  />
                  <span className="export-hint">Paste to import →</span>
                  <button
                    type="button"
                    className={`export-copy-btn ${copied ? 'copied' : ''}`}
                    onClick={() => {
                      navigator.clipboard.writeText(fullDownloadUrl)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 1500)
                    }}
                    aria-label="Copy URL to clipboard"
                  >
                    {copied ? '✓' : 'Copy'}
                  </button>
                </div>
                {imported && (
                  <span className="imported-flash show" role="status">
                    Imported ✓
                  </span>
                )}
              </div>
            </Section>

            <div className="actions">
              <button
                className={`btn btn-primary ${previewStale ? 'stale' : ''}`}
                onClick={renderPreview}
                disabled={!imageFile || isRendering}
              >
                {isRendering && <span className="btn-spinner" aria-hidden="true" />}
                {isRendering ? 'Rendering…' : 'Render Preview'}
                {previewStale && !isRendering && (
                  <span className="stale-icon" aria-label="Preview is stale — re-render to update">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                  </span>
                )}
              </button>

              <button
                className="btn btn-success"
                onClick={handleDownload}
                disabled={!previewUrl || isDownloading}
              >
                {isDownloading && <span className="btn-spinner" aria-hidden="true" />}
                {isDownloading ? 'Preparing…' : 'Download Wallpaper'}
              </button>
            </div>
          </section>
        </div>

        {/* Sticky preview aside */}
        <div className="app-aside">
          <section className="card preview-card">
            <div className="card-header">
              <h2 className="card-title">Preview</h2>
            </div>
            <div className="canvas-wrapper">
              {!imageFile ? (
                <div className="preview-hint">
                  <p>Upload a phone background image, then click Render Preview.</p>
                </div>
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Calendar wallpaper preview"
                  className="preview-image"
                />
              ) : (
                <div className="preview-hint">
                  <p>Click "Render Preview" to generate the calendar overlay.</p>
                </div>
              )}
            </div>
            {imageFile && resolution.width > 0 && (
              <p className="resolution">
                Output: {resolution.width} × {resolution.height}px
              </p>
            )}
          </section>

          {imageFile && (
            <section className="card">
              <div className="card-header">
                <h2 className="card-title">
                  Holidays in {MONTH_NAMES[today.getMonth()]} {today.getFullYear()}
                </h2>
              </div>
              {holidays.length === 0 ? (
                <p className="holidays-empty">
                  {selectedCountry
                    ? 'No national holidays this month.'
                    : 'Select a country to see national holidays.'}
                </p>
              ) : (
                <ul className="holidays-list">
                  {holidays.map((h) => {
                    const d = new Date(h.date)
                    return (
                      <li key={h.date} className="holiday-item">
                        <span className="holiday-date">
                          {d.getDate()} {MONTH_NAMES[today.getMonth()]}
                        </span>
                        <span className="holiday-name">{h.localName || h.name}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )}
        </div>
      </div>

      {status && <p className="status" role="status" aria-live="polite">{status}</p>}
    </div>
  )
}

export default App