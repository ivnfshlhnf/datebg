import { useEffect, useRef, useState } from 'react'

const NAGER_API = 'https://date.nager.at/api/v3'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const FONT_OPTIONS = [
  '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  'Georgia, "Times New Roman", serif',
  '"Courier New", "Lucida Console", monospace',
  '"Times New Roman", serif',
  'Verdana, Geneva, sans-serif',
  'Arial, Helvetica, sans-serif',
  'Tahoma, sans-serif',
  'Trebuchet MS, sans-serif',
  'Impact, sans-serif',
  'Palatino, "Palatino Linotype", serif',
  'Garamond, Baskerville, serif',
  '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
  '"Comic Sans MS", "Comic Sans", cursive',
  'Papyrus, fantasy',
  '"Roboto", sans-serif',
  '"Open Sans", sans-serif',
  '"Lato", sans-serif',
  '"Montserrat", sans-serif',
  '"Oswald", sans-serif',
  '"Merriweather", serif',
  '"Playfair Display", serif',
  '"Ubuntu", sans-serif',
  '"PT Sans", sans-serif',
  '"Source Sans Pro", sans-serif'
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

    img.onload = () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight

      ctx.drawImage(img, 0, 0)

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
    const headerHeight = overlayHeight * 0.2
    const titleSize = overlayHeight * 0.12 * scaleFactor
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
    const gridHeight = overlayHeight - headerHeight - padding
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
        ctx.font = `bold ${cellH * 0.36 * scaleFactor}px ${fontFamily}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(day), cx, cy)

        day++
      }
    }

    ctx.restore()
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

      <div className="controls">
        <label>
          Background image
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </label>

        <label>
          Country
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
          Font
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

        <label>
          Size (%)
          <input
            type="range"
            min="50"
            max="150"
            value={fontScale}
            onChange={(e) => setFontScale(Number(e.target.value))}
          />
        </label>

        <button
          className="download"
          onClick={handleDownload}
          disabled={!imageFile}
        >
          Download Wallpaper
        </button>
      </div>

      <div className="canvas-wrapper">
        {!imageFile ? (
          <p className="hint">Upload an image to see the calendar overlay.</p>
        ) : (
          <canvas ref={canvasRef} />
        )}
      </div>

      {status && <p className="status">{status}</p>}
    </div>
  )
}

export default App