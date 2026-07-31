import { useEffect, useRef, useState } from 'react'

const NAGER_API = 'https://date.nager.at/api/v3'

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
  const canvasRef = useRef(null)
  const [countries, setCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [holidays, setHolidays] = useState([])
  const [status, setStatus] = useState('')
  const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0])
  const [fontScale, setFontScale] = useState(100)

  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  useEffect(() => {
    fetch(`${NAGER_API}/AvailableCountries`)
      .then((res) => res.json())
      .then((data) => {
        setCountries(data || [])
      })
      .catch(() => setStatus('Failed to load countries.'))
  }, [])

  useEffect(() => {
    if (!selectedCountry) {
      setHolidays([])
      return
    }

    setStatus('Loading holidays…')
    fetch(`${NAGER_API}/PublicHolidays/${year}/${selectedCountry}`)
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
    const canvas = canvasRef.current
    if (!canvas || !imageFile) return

    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = async () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight

      ctx.drawImage(img, 0, 0)

      await document.fonts.ready
      await document.fonts.load(`bold 16px ${fontFamily}`).catch(() => {})

      renderCalendar(ctx, canvas.width, canvas.height)
    }

    img.src = URL.createObjectURL(imageFile)

    return () => {
      URL.revokeObjectURL(img.src)
    }
  }, [imageFile, holidays, fontFamily, fontScale])

  const renderCalendar = (ctx, width, height) => {
    const scaleFactor = fontScale / 100
    const overlayHeight = Math.round(height / 3)
    const overlayWidth = Math.round(width - width * 0.08)
    const x = Math.round((width - overlayWidth) / 2)
    const y = Math.round((height - overlayHeight) / 2)

    ctx.save()
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
    ctx.fillRect(x, y, overlayWidth, overlayHeight)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.lineWidth = Math.max(1, Math.round(overlayWidth / 300))
    ctx.strokeRect(x, y, overlayWidth, overlayHeight)

    const padding = overlayWidth * 0.06
    const headerHeight = overlayHeight * 0.16
    const titleSize = overlayHeight * 0.1 * scaleFactor
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `bold ${titleSize}px ${fontFamily}`
    ctx.fillText(
      `${MONTH_NAMES[month]} ${year}`,
      width / 2,
      y + headerHeight / 2
    )

    const rows = 7
    const cols = 7
    const gridTop = y + headerHeight
    const gridHeight = overlayHeight - headerHeight - padding / 2
    const gridWidth = overlayWidth - padding * 2
    const cellW = gridWidth / cols
    const cellH = gridHeight / rows
    const gridX = x + padding

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    const labelSize = cellH * 0.32 * scaleFactor
    ctx.font = `bold ${labelSize}px ${fontFamily}`
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'

    dayLabels.forEach((label, i) => {
      ctx.fillText(label, gridX + cellW * i + cellW / 2, gridTop + cellH * 0.35)
    })

    const holidaySet = new Set(holidays.map((h) => new Date(h.date).getDate()))
    const todayDate = today.getDate()

    let day = 1
    const startRow = 1

    for (let row = 0; row < 6 && day <= daysInMonth; row++) {
      for (let col = 0; col < cols && day <= daysInMonth; col++) {
        if (row === 0 && col < firstDay) continue

        const cx = gridX + col * cellW + cellW / 2
        const cy = gridTop + (startRow + row) * cellH + cellH / 2
        const radius = Math.min(cellW, cellH) * 0.35

        if (holidaySet.has(day)) {
          ctx.beginPath()
          ctx.arc(cx, cy, radius, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(239, 68, 68, 0.85)'
          ctx.fill()
        }

        if (day === todayDate) {
          ctx.beginPath()
          ctx.arc(cx, cy, radius * 0.85, 0, Math.PI * 2)
          ctx.strokeStyle = '#3b82f6'
          ctx.lineWidth = Math.max(2, Math.round(overlayWidth / 200))
          ctx.stroke()
        }

        ctx.fillStyle = '#ffffff'
        ctx.font = `bold ${cellH * 0.48 * scaleFactor}px ${fontFamily}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(day), cx, cy)

        day++
      }
    }

    ctx.restore()

    // Render holiday list panel outside (below) the calendar overlay
    if (holidays.length > 0) {
      const sortedHolidays = holidays
        .slice()
        .sort((a, b) => new Date(a.date) - new Date(b.date))

      const gap = overlayHeight * 0.04
      const panelX = x
      const panelWidth = overlayWidth
      const panelY = y + overlayHeight + gap
      const bottomPadding = height * 0.03
      const availableHeight = Math.max(0, height - panelY - bottomPadding)

      const panelPadding = padding * 0.8
      const usableHeight = Math.max(0, availableHeight - panelPadding)
      const desiredFont = overlayWidth * 0.035 * scaleFactor
      const minFont = overlayWidth * 0.02
      const lineHeightRatio = 1.45
      const listFontSize = Math.max(
        minFont,
        Math.min(desiredFont, usableHeight / (sortedHolidays.length * lineHeightRatio))
      )
      const listLineHeight = listFontSize * lineHeightRatio
      const panelHeight = sortedHolidays.length * listLineHeight + panelPadding

      ctx.save()
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(panelX, panelY, panelWidth, panelHeight)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = Math.max(1, Math.round(overlayWidth / 300))
      ctx.strokeRect(panelX, panelY, panelWidth, panelHeight)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
      ctx.font = `500 ${listFontSize}px ${fontFamily}`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'

      sortedHolidays.forEach((h, i) => {
        const d = new Date(h.date)
        const label = `${d.getDate()}. ${h.localName || h.name}`
        ctx.fillText(
          label,
          panelX + panelPadding,
          panelY + panelPadding / 2 + (i + 0.5) * listLineHeight
        )
      })

      ctx.restore()
    }
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `datebg-${year}-${String(month + 1).padStart(2, '0')}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 'image/png')
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
          className="download"
          onClick={handleDownload}
          disabled={!imageFile}
        >
          Download Wallpaper
        </button>
      </section>

      <section className="card preview-card">
        <h2>Preview</h2>
        <div className="canvas-wrapper">
          {!imageFile ? (
            <div className="hint">
              <p>Upload a phone background image to preview the calendar.</p>
            </div>
          ) : (
            <canvas ref={canvasRef} />
          )}
        </div>
        {imageFile && (
          <p className="resolution">
            Original resolution: {canvasRef.current?.width ?? 0} ×{' '}
            {canvasRef.current?.height ?? 0}px
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