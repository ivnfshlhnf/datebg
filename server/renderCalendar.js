const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function getFirstFontFamily(fontFamily) {
  return fontFamily.split(',')[0].trim().replace(/["']/g, '')
}

export default function renderCalendar(ctx, width, height, options) {
  const {
    year,
    month,
    fontFamily,
    fontScale,
    holidays,
    today,
    calendarWidth = 92,
    calendarHeight = 33,
    calendarY = 33,
    framePadding = 6,
    showFrame = true
  } = options

  const primaryFont = getFirstFontFamily(fontFamily)

  const scaleFactor = fontScale / 100
  const overlayWidth = Math.round(width * (calendarWidth / 100))
  const overlayHeight = Math.round(height * (calendarHeight / 100))
  const x = Math.round((width - overlayWidth) / 2)
  const y = Math.round(height * (calendarY / 100))

  const padding = overlayWidth * (framePadding / 100)

  if (showFrame) {
    ctx.save()
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
    ctx.fillRect(x, y, overlayWidth, overlayHeight)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.lineWidth = Math.max(1, Math.round(overlayWidth / 300))
    ctx.strokeRect(x, y, overlayWidth, overlayHeight)
    ctx.restore()
  }

  ctx.save()
  const headerHeight = overlayHeight * 0.16
  const titleSize = overlayHeight * 0.1 * scaleFactor

  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `bold ${titleSize}px "${primaryFont}", sans-serif`
  ctx.fillText(
    `${MONTH_NAMES[month]} ${year}`,
    width / 2,
    y + headerHeight / 2
  )

  const rows = 7
  const cols = 7
  const gridTop = y + headerHeight
  const gridHeight = overlayHeight - headerHeight
  const gridWidth = overlayWidth - padding * 2
  const cellW = gridWidth / cols
  const cellH = gridHeight / rows
  const gridX = x + padding

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const labelSize = cellH * 0.32 * scaleFactor
  ctx.font = `bold ${labelSize}px "${primaryFont}", sans-serif`
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
      ctx.font = `bold ${cellH * 0.48 * scaleFactor}px "${primaryFont}", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(day), cx, cy)

      day++
    }
  }

  ctx.restore()

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
    ctx.font = `500 ${listFontSize}px "${primaryFont}", sans-serif`
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