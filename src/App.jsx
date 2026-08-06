import { useEffect, useRef, useState } from 'react'
import './styles/base.css'
import './styles/components.css'

const API_BASE = ''

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Curated font options — distinctive, non-generic pairings (frontend + server compatible)
const FONT_OPTIONS = [
  // Serif (Display)
  { value: "'DM Serif Display', serif", label: 'DM Serif Display' },
  { value: "'Playfair Display', serif", label: 'Playfair Display' },
  { value: "'Merriweather', serif", label: 'Merriweather' },
  // Sans-Serif (Body)
  { value: "'DM Sans', sans-serif", label: 'DM Sans' },
  { value: "'Inter', sans-serif", label: 'Inter' },
  { value: "'Poppins', sans-serif", label: 'Poppins' },
  { value: "'Sora', sans-serif", label: 'Sora' },
  { value: "'Outfit', sans-serif", label: 'Outfit' },
  { value: "'Plus Jakarta Sans', sans-serif", label: 'Plus Jakarta Sans' },
  { value: "'Space Grotesk', sans-serif", label: 'Space Grotesk' },
  { value: "'Geist Sans', sans-serif", label: 'Geist Sans' },
  { value: "'Work Sans', sans-serif", label: 'Work Sans' },
  { value: "'Nunito', sans-serif", label: 'Nunito' },
  { value: "'Quicksand', sans-serif", label: 'Quicksand' },
  { value: "'Raleway', sans-serif", label: 'Raleway' },
  { value: "'Manrope', sans-serif", label: 'Manrope' },
  { value: "'Urbanist', sans-serif", label: 'Urbanist' },
  { value: "'Lexend', sans-serif", label: 'Lexend' },
  { value: "'Montserrat', sans-serif", label: 'Montserrat' },
  { value: "'Open Sans', sans-serif", label: 'Open Sans' },
  { value: "'Roboto', sans-serif", label: 'Roboto' },
  { value: "'Lato', sans-serif", label: 'Lato' },
  { value: "'Source Sans 3', sans-serif", label: 'Source Sans 3' },
  { value: "'IBM Plex Sans', sans-serif", label: 'IBM Plex Sans' },
  { value: "'Fira Sans', sans-serif", label: 'Fira Sans' },
  { value: "'Cabin', sans-serif", label: 'Cabin' },
  { value: "'Rubik', sans-serif", label: 'Rubik' },
  { value: "'Exo 2', sans-serif", label: 'Exo 2' },
  { value: "'Josefin Sans', sans-serif", label: 'Josefin Sans' },
  { value: "'Onest', sans-serif", label: 'Onest' },
  { value: "'Tajawal', sans-serif", label: 'Tajawal' },
  { value: "'El Messiri', sans-serif", label: 'El Messiri' },
  { value: "'Chakra Petch', sans-serif", label: 'Chakra Petch' },
  // Monospace
  { value: "'JetBrains Mono', monospace", label: 'JetBrains Mono' },
  { value: "'Fira Code', monospace", label: 'Fira Code' },
  { value: "'IBM Plex Mono', monospace", label: 'IBM Plex Mono' },
  { value: "'Geist Mono', monospace", label: 'Geist Mono' }
]

const DEFAULTS = {
  fontFamily: FONT_OPTIONS[0].value,
  fontScale: 100,
  calendarWidth: 92,
  calendarHeight: 33,
  calendarY: 33,
  framePadding: 6,
  showFrame: true,
  frameOpacity: 55,
  frameColor: '#000000',
  frameBorder: true,
  textOutline: true,
  textOutlineAutoContrast: false,
  country: 'ID'
}

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

function Section({ title, children, reset, open, onToggle }) {
  return (
    <div className={`section ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="section-header"
        onClick={onToggle}
        aria-expanded={open}
      >
        <h3 className="section-header-title">{title}</h3>
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
      </button>

      {open && (
        <div className="section-body">
          {children}
          {reset && (
            <button type="button" className="section-reset" onClick={reset}>
              Reset to defaults
            </button>
          )}
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

function App() {
  const [countries, setCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [holidays, setHolidays] = useState([])
  const [status, setStatus] = useState('')
  const [fontFamily, setFontFamily] = useState(DEFAULTS.fontFamily)
  const [fontScale, setFontScale] = useState(DEFAULTS.fontScale)
  const [calendarWidth, setCalendarWidth] = useState(DEFAULTS.calendarWidth)
  const [calendarHeight, setCalendarHeight] = useState(DEFAULTS.calendarHeight)
  const [calendarY, setCalendarY] = useState(DEFAULTS.calendarY)
  const [framePadding, setFramePadding] = useState(DEFAULTS.framePadding)
  const [showFrame, setShowFrame] = useState(DEFAULTS.showFrame)
  const [frameOpacity, setFrameOpacity] = useState(DEFAULTS.frameOpacity)
  const [frameColor, setFrameColor] = useState(DEFAULTS.frameColor)
  const [frameBorder, setFrameBorder] = useState(DEFAULTS.frameBorder)
  const [textOutline, setTextOutline] = useState(DEFAULTS.textOutline)
  const [textOutlineAutoContrast, setTextOutlineAutoContrast] = useState(DEFAULTS.textOutlineAutoContrast)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [resolution, setResolution] = useState({ width: 0, height: 0 })
  const [copied, setCopied] = useState(false)
  const [fontOpen, setFontOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('Background')
  const [today, setToday] = useState(() => new Date())

  const previewRef = useRef(null)
  const fontSelectRef = useRef(null)

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
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [fontOpen])

  const buildParams = () => {
    const params = new URLSearchParams()
    if (selectedCountry) params.append('country', selectedCountry)
    params.append('font', fontFamily)
    params.append('fontScale', String(fontScale))
    params.append('calendarWidth', String(calendarWidth))
    params.append('calendarHeight', String(calendarHeight))
    params.append('calendarY', String(calendarY))
    params.append('framePadding', String(framePadding))
    params.append('showFrame', String(showFrame))
    params.append('frameOpacity', String(frameOpacity))
    params.append('frameColor', frameColor)
    params.append('frameBorder', String(frameBorder))
    params.append('textOutline', String(textOutline))
    params.append('textOutlineAutoContrast', String(textOutlineAutoContrast))
    params.append('timeZone', Intl.DateTimeFormat().resolvedOptions().timeZone)
    return params
  }

  const renderPreview = async () => {
    if (!imageFile) return

    setStatus('Rendering preview…')

    const params = buildParams()

    try {
      const imageBuffer = await imageFile.arrayBuffer()
      const response = await fetch(`${API_BASE}/api/render?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': imageFile.type || 'application/octet-stream'
        },
        body: imageBuffer
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Render failed')
      }

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
      setStatus('Render failed. Check image format.')
    }
  }

  const handleDownload = async () => {
    if (!previewUrl) return

    const a = document.createElement('a')
    a.href = previewUrl
    a.download = `datebg-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleFileChange = (e) => {
    setImageFile(e.target.files?.[0] || null)
  }

  const clearImage = () => {
    setImageFile(null)
  }

  const renderSlider = (label, value, min, max, onChange, unit = '%') => (
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
      />
    </div>
  )

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">DateBG</h1>
        <p className="app-subtitle">Overlay this month's calendar onto your phone background.</p>
      </header>

      <section className="card">
        <div className="card-header">
          <h2 className="card-title">Customize</h2>
        </div>

        <Section
          title="Background"
          open={activeSection === 'Background'}
          onToggle={() => setActiveSection('Background')}
        >
          <div className="control-row">
            <label className="control-label" htmlFor="bg-image">Upload wallpaper</label>
            <div className={`file-input ${imageFile ? 'has-file' : ''}`}>
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
                  <span>Drop image or click to upload</span>
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
        </Section>

        <Section
          title="Style"
          open={activeSection === 'Style'}
          onToggle={() => setActiveSection('Style')}
          reset={() => {
            setFontFamily(DEFAULTS.fontFamily)
            setFontScale(DEFAULTS.fontScale)
            setTextOutline(DEFAULTS.textOutline)
            setTextOutlineAutoContrast(DEFAULTS.textOutlineAutoContrast)
          }}
        >
          <div className="control-row" ref={fontSelectRef}>
            <label className="control-label">Font</label>
            <div className={`custom-select ${fontOpen ? 'open' : ''}`}>
              <button
                type="button"
                className="custom-select-trigger"
                onClick={() => setFontOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={fontOpen}
              >
                <span style={{ fontFamily: fontFamily.split(',')[0] }}>
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
                <div className="custom-select-dropdown" role="listbox">
                  {FONT_OPTIONS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      className={`custom-select-option ${fontFamily === f.value ? 'selected' : ''}`}
                      style={{ fontFamily: f.value.split(',')[0] }}
                      onClick={() => {
                        setFontFamily(f.value)
                        setFontOpen(false)
                      }}
                      role="option"
                      aria-selected={fontFamily === f.value}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {renderSlider('Font size', fontScale, 50, 150, setFontScale)}

          <Toggle
            checked={textOutline}
            onChange={setTextOutline}
            label="Text outline"
          />

          <Toggle
            checked={textOutline && textOutlineAutoContrast}
            onChange={setTextOutlineAutoContrast}
            label="Auto-contrast outline"
            disabled={!textOutline}
          />
        </Section>

        <Section
          title="Layout"
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
          open={activeSection === 'Frame'}
          onToggle={() => setActiveSection('Frame')}
          reset={() => {
            setShowFrame(DEFAULTS.showFrame)
            setFramePadding(DEFAULTS.framePadding)
            setFrameOpacity(DEFAULTS.frameOpacity)
            setFrameColor(DEFAULTS.frameColor)
            setFrameBorder(DEFAULTS.frameBorder)
          }}
        >
          <Toggle
            checked={showFrame}
            onChange={setShowFrame}
            label="Show calendar frame"
          />

          <div className={showFrame ? '' : 'disabled-wrapper'}>
            {renderSlider('Frame spacing', framePadding, 0, 15, setFramePadding)}

            <div className="control-row">
              <label className="control-label" htmlFor="frame-color">Background color</label>
              <div className="color-field">
                <div className="color-swatch">
                  <input
                    id="frame-color"
                    type="color"
                    value={frameColor}
                    disabled={!showFrame}
                    onChange={(e) => setFrameColor(e.target.value)}
                  />
                </div>
                <input
                  type="text"
                  className="input color-input"
                  value={frameColor}
                  disabled={!showFrame}
                  onChange={(e) => setFrameColor(e.target.value)}
                  aria-label="Frame background color hex"
                />
              </div>
            </div>

            {renderSlider('Opacity', frameOpacity, 0, 100, setFrameOpacity)}

            <Toggle
              checked={frameBorder}
              onChange={setFrameBorder}
              label="Show frame border"
              disabled={!showFrame}
            />
          </div>
        </Section>

        <Section
          title="API Link"
          open={activeSection === 'API Link'}
          onToggle={() => setActiveSection('API Link')}
        >
          <div className="control-row params-row">
            <div className="file-input" style={{ borderStyle: 'solid' }}>
              <div className="file-info">
                <span className="file-name" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                  ?{buildParams().toString()}
                </span>
                <button
                  type="button"
                  className="btn btn-text"
                  onClick={() => {
                    navigator.clipboard.writeText(`?${buildParams().toString()}`)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                  }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </Section>

        <div className="actions">
          <button
            className="btn btn-primary"
            onClick={renderPreview}
            disabled={!imageFile}
          >
            Render Preview
          </button>

          <button
            className="btn btn-success"
            onClick={handleDownload}
            disabled={!previewUrl}
          >
            Download Wallpaper
          </button>
        </div>
      </section>

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

      {status && <p className="status">{status}</p>}
    </div>
  )
}

export default App