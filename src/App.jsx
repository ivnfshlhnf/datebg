import { useEffect, useRef, useState } from 'react'

const API_BASE = ''

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const FONT_OPTIONS = [
  'Inter, sans-serif',
  'Poppins, sans-serif',
  'Work Sans, sans-serif',
  'Nunito, sans-serif',
  'Quicksand, sans-serif',
  'Raleway, sans-serif',
  'Manrope, sans-serif',
  'Outfit, sans-serif',
  'DM Sans, sans-serif',
  'Space Grotesk, sans-serif',
  'Sora, sans-serif',
  'Plus Jakarta Sans, sans-serif',
  'Urbanist, sans-serif',
  'Lexend, sans-serif',
  'Noto Sans, sans-serif',
  'Be Vietnam Pro, sans-serif',
  'Montserrat, sans-serif',
  'Open Sans, sans-serif',
  'Roboto, sans-serif',
  'Lato, sans-serif',
  'Source Sans 3, sans-serif',
  'IBM Plex Sans, sans-serif',
  'IBM Plex Mono, monospace',
  'Fira Sans, sans-serif',
  'Fira Code, monospace',
  'JetBrains Mono, monospace',
  'Cabin, sans-serif',
  'Rubik, sans-serif',
  'Playfair Display, serif',
  'Merriweather, serif',
  'Exo 2, sans-serif',
  'Josefin Sans, sans-serif',
  'Geist Sans, sans-serif',
  'Geist Mono, monospace',
  'Onest, sans-serif',
  'Tajawal, sans-serif',
  'El Messiri, sans-serif',
  'Chakra Petch, sans-serif',
  '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  'Arial, Helvetica, sans-serif',
  'Verdana, Geneva, sans-serif',
  'Tahoma, sans-serif'
]

function App() {
  const [countries, setCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [holidays, setHolidays] = useState([])
  const [status, setStatus] = useState('')
  const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0])
  const [fontScale, setFontScale] = useState(100)
  const [calendarWidth, setCalendarWidth] = useState(92)
  const [calendarHeight, setCalendarHeight] = useState(33)
  const [calendarY, setCalendarY] = useState(33)
  const [framePadding, setFramePadding] = useState(6)
  const [showFrame, setShowFrame] = useState(true)
  const [frameOpacity, setFrameOpacity] = useState(55)
  const [frameColor, setFrameColor] = useState('#000000')
  const [frameBorder, setFrameBorder] = useState(true)
  const [textOutline, setTextOutline] = useState(true)
  const [textOutlineAutoContrast, setTextOutlineAutoContrast] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [resolution, setResolution] = useState({ width: 0, height: 0 })
  const [copied, setCopied] = useState(false)
  const [fontOpen, setFontOpen] = useState(false)

  const previewRef = useRef(null)
  const fontSelectRef = useRef(null)

  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  useEffect(() => {
    fetch(`${API_BASE}/api/available-countries`)
      .then((res) => res.json())
      .then((data) => setCountries(data || []))
      .catch(() => setStatus('Failed to load countries.'))
  }, [])

  useEffect(() => {
    if (!selectedCountry) {
      setHolidays([])
      return
    }

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
  }, [selectedCountry, year, month])

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
      setStatus('Failed to render preview.')
    }
  }

  const handleDownload = async () => {
    if (!previewUrl) return

    const a = document.createElement('a')
    a.href = previewUrl
    a.download = `datebg-${year}-${String(month + 1).padStart(2, '0')}.png`
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

  const fontDisplayName = (font) =>
    font.split(',')[0].replace(/[\"']/g, '')

  const renderSlider = (label, value, min, max, onChange, unit = '%') => (
    <div className="control-row range-control">
      <div className="range-header">
        <label>{label}</label>
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
      <header>
        <h1>DateBG</h1>
        <p>Overlay this month's calendar onto your phone background.</p>
      </header>

      <section className="card controls-card">
        <h2>Customize</h2>

        <div className="control-section">
          <h3>Background</h3>

          <div className="control-row file-control">
            <label htmlFor="bg-image">Background image</label>
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
              ) : null}
            </div>
            <p className="hint-text">Upload a phone wallpaper to get started.</p>
          </div>

          <div className="control-row">
            <label htmlFor="country-select">Country</label>
            <select
              id="country-select"
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
            <p className="hint-text">Used to highlight national holidays.</p>
          </div>
        </div>

        <div className="control-section">
          <h3>Style</h3>

          <div className="control-row" ref={fontSelectRef}>
            <label>Font</label>
            <div className={`custom-select ${fontOpen ? 'open' : ''}`}>
              <button
                type="button"
                className="custom-select-trigger"
                onClick={() => setFontOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={fontOpen}
              >
                <span style={{ fontFamily: fontFamily }}>
                  {fontDisplayName(fontFamily)}
                </span>
                <svg
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
                <ul className="custom-select-options" role="listbox">
                  {FONT_OPTIONS.map((f) => (
                    <li key={f} role="option" aria-selected={fontFamily === f}>
                      <button
                        type="button"
                        className={fontFamily === f ? 'selected' : ''}
                        style={{ fontFamily: f }}
                        onClick={() => {
                          setFontFamily(f)
                          setFontOpen(false)
                        }}
                      >
                        {fontDisplayName(f)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {renderSlider('Font size', fontScale, 50, 150, setFontScale)}

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={textOutline}
              onChange={(e) => setTextOutline(e.target.checked)}
            />
            <span>Text outline</span>
          </label>

          <label className={`checkbox-row ${!textOutline ? 'disabled' : ''}`}>
            <input
              type="checkbox"
              checked={textOutline && textOutlineAutoContrast}
              disabled={!textOutline}
              onChange={(e) => setTextOutlineAutoContrast(e.target.checked)}
            />
            <span>Auto-contrast outline</span>
          </label>
        </div>

        <div className="control-section">
          <h3>Layout</h3>

          {renderSlider('Calendar width', calendarWidth, 50, 100, setCalendarWidth)}
          {renderSlider('Calendar height', calendarHeight, 20, 50, setCalendarHeight)}
          {renderSlider('Vertical position', calendarY, 0, 100, setCalendarY)}
          {renderSlider('Frame spacing', framePadding, 0, 15, setFramePadding)}

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={showFrame}
              onChange={(e) => setShowFrame(e.target.checked)}
            />
            <span>Show calendar frame</span>
          </label>
        </div>

        <div className="control-section">
          <h3>Frame</h3>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={frameBorder}
              onChange={(e) => setFrameBorder(e.target.checked)}
            />
            <span>Show frame border</span>
          </label>

          <div className="control-row color-control">
            <label htmlFor="frame-color">Background color</label>
            <div className="color-field">
              <input
                id="frame-color"
                type="color"
                value={frameColor}
                onChange={(e) => setFrameColor(e.target.value)}
              />
              <input
                type="text"
                value={frameColor}
                onChange={(e) => setFrameColor(e.target.value)}
                aria-label="Frame background color hex"
              />
            </div>
          </div>

          {renderSlider('Opacity', frameOpacity, 0, 100, setFrameOpacity)}
        </div>

        <div className="control-section">
          <h3>API Link</h3>
          <div className="control-row params-row">
            <div className="params-field">
              <input
                type="text"
                readOnly
                value={`?${buildParams().toString()}`}
                aria-label="Generated API parameters"
              />
              <button
                type="button"
                className="copy"
                onClick={() => {
                  navigator.clipboard.writeText(`?${buildParams().toString()}`)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1500)
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div className="actions">
          <button
            className="render"
            onClick={renderPreview}
            disabled={!imageFile}
          >
            Render Preview
          </button>

          <button
            className="download"
            onClick={handleDownload}
            disabled={!previewUrl}
          >
            Download Wallpaper
          </button>
        </div>
      </section>

      <section className="card preview-card">
        <h2>Preview</h2>
        <div className="canvas-wrapper">
          {!imageFile ? (
            <div className="hint">
              <p>Upload a phone background image, then click Render Preview.</p>
            </div>
          ) : previewUrl ? (
            <img
              src={previewUrl}
              alt="Calendar wallpaper preview"
              className="preview-image"
            />
          ) : (
            <div className="hint">
              <p>Click "Render Preview" to generate the calendar overlay.</p>
            </div>
          )}
        </div>
        {imageFile && resolution.width > 0 && (
          <p className="resolution">
            Output resolution: {resolution.width} × {resolution.height}px
          </p>
        )}
      </section>

      {imageFile && (
        <section className="card holidays-card">
          <h2>Holidays in {MONTH_NAMES[month]} {year}</h2>
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
                      {d.getDate()} {MONTH_NAMES[month]}
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