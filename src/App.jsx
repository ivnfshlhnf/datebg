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
  const [previewUrl, setPreviewUrl] = useState(null)
  const [resolution, setResolution] = useState({ width: 0, height: 0 })

  const previewRef = useRef(null)

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

  const renderPreview = async () => {
    if (!imageFile) return

    setStatus('Rendering preview…')

    const params = new URLSearchParams()
    if (selectedCountry) params.append('country', selectedCountry)
    params.append('font', fontFamily)
    params.append('fontScale', String(fontScale))

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

  return (
    <div className="app">
      <header>
        <h1>DateBG</h1>
        <p>Overlay this month's calendar onto your phone background.</p>
      </header>

      <section className="card controls-card">
        <h2>Customize</h2>
        <div className="controls">
          <label>
            <span>Background image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </label>

          <label>
            <span>Country</span>
            <select
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
          </label>

          <label>
            <span>Font</span>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f.split(',')[0].replace(/["']/g, '')}
                </option>
              ))}
            </select>
          </label>

          <label className="range-label">
            <span>Font size: {fontScale}%</span>
            <input
              type="range"
              min="50"
              max="150"
              value={fontScale}
              onChange={(e) => setFontScale(Number(e.target.value))}
            />
          </label>
        </div>

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