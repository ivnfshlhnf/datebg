import { getFontFamilyName, DEFAULT_FONT_ID, FONTS } from '../shared/fonts.js'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]


function resolveFontFamily(fontFamily) {
  // server/index.js already validates the font ID and passes the human-readable
  // family name (e.g. "Inter"). If that string matches a manifest family, use
  // it directly; otherwise fall back to the default family.
  const matched = FONTS.find((f) => f.family === fontFamily || f.id === fontFamily)
  return matched ? matched.family : getFontFamilyName(DEFAULT_FONT_ID)
}

function luminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

function getSamplePixel(ctx, x, y, width, height) {
  try {
    const data = ctx.getImageData(
      Math.max(0, Math.min(width - 1, Math.round(x))),
      Math.max(0, Math.min(height - 1, Math.round(y))),
      1,
      1
    ).data
    return { r: data[0], g: data[1], b: data[2], a: data[3] }
  } catch {
    return { r: 0, g: 0, b: 0, a: 255 }
  }
}

function getOutlineColor(ctx, x, y, width, height, autoContrast, outlineColor = '#000000') {
  if (!autoContrast) return hexToRgba(outlineColor, 0.9)
  const sample = getSamplePixel(ctx, x, y, width, height)
  const bgLum = luminance(sample.r, sample.g, sample.b)
  return bgLum > 0.5 ? hexToRgba(outlineColor, 0.9) : 'rgba(255, 255, 255, 0.9)'
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace('#', '')
  const bigint = parseInt(clean, 16)
  if (clean.length !== 6 || Number.isNaN(bigint)) {
    return `rgba(0, 0, 0, ${alpha})`
  }
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function drawOutlinedText(ctx, text, x, y, options = {}) {
  const {
    font,
    fillStyle = '#ffffff',
    textAlign = 'center',
    textBaseline = 'middle',
    outlineWidth = 2,
    outlineColor = 'rgba(0, 0, 0, 0.9)'
  } = options

  ctx.save()
  ctx.font = font
  ctx.textAlign = textAlign
  ctx.textBaseline = textBaseline
  ctx.lineJoin = 'round'
  ctx.lineWidth = outlineWidth
  ctx.strokeStyle = outlineColor
  ctx.strokeText(text, x, y)
  ctx.fillStyle = fillStyle
  ctx.fillText(text, x, y)
  ctx.restore()
}

export default function renderCalendar(ctx, width, height, options) {
  const {
    year,
    month,
    fontFamily,
    fontScale,
    fontColor = '#ffffff',
    holidays,
    today,
    calendarWidth = 92,
    calendarHeight = 33,
    calendarY = 33,
    framePadding = 6,
    showFrame = true,
    frameOpacity = 55,
    frameColor = '#000000',
    frameBorder = true,
    frameBorderColor = '#ffffff',
    textOutline = true,
    textOutlineColor = '#000000',
    textOutlineAutoContrast = false,
    showHolidayList = true
  } = options

  const frameFill = hexToRgba(frameColor, frameOpacity / 100)

  const primaryFont = resolveFontFamily(fontFamily)

  const scaleFactor = fontScale / 100
  const overlayWidth = Math.round(width * (calendarWidth / 100))
  const overlayHeight = Math.round(height * (calendarHeight / 100))
  const x = Math.round((width - overlayWidth) / 2)
  const y = Math.round(height * (calendarY / 100))

  const padding = overlayWidth * (framePadding / 100)

  if (showFrame) {
    ctx.save()
    ctx.fillStyle = frameFill
    ctx.fillRect(x, y, overlayWidth, overlayHeight)
    if (frameBorder) {
      ctx.strokeStyle = hexToRgba(frameBorderColor, 0.4)
      ctx.lineWidth = Math.max(1, Math.round(overlayWidth / 300))
      ctx.strokeRect(x, y, overlayWidth, overlayHeight)
    }
    ctx.restore()
  }

  ctx.save()
  const headerHeight = overlayHeight * 0.16
  const titleSize = overlayHeight * 0.1 * scaleFactor

  const headerText = `${MONTH_NAMES[month]} ${year}`
  const headerX = width / 2
  const headerY = y + headerHeight / 2
  if (textOutline) {
    drawOutlinedText(ctx, headerText, headerX, headerY, {
      font: `bold ${titleSize}px "${primaryFont}", sans-serif`,
      fillStyle: fontColor,
      outlineWidth: Math.max(1, titleSize * 0.06),
      outlineColor: getOutlineColor(ctx, headerX, headerY, width, height, textOutlineAutoContrast, textOutlineColor)
    })
  } else {
    ctx.fillStyle = fontColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `bold ${titleSize}px "${primaryFont}", sans-serif`
    ctx.fillText(headerText, headerX, headerY)
  }

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

  dayLabels.forEach((label, i) => {
    const labelX = gridX + cellW * i + cellW / 2
    const labelY = gridTop + cellH * 0.35
    if (textOutline) {
      drawOutlinedText(ctx, label, labelX, labelY, {
        font: `bold ${labelSize}px "${primaryFont}", sans-serif`,
        fillStyle: fontColor,
        outlineWidth: Math.max(1, labelSize * 0.05),
        outlineColor: getOutlineColor(ctx, labelX, labelY, width, height, textOutlineAutoContrast, textOutlineColor)
      })
    } else {
      ctx.font = `bold ${labelSize}px "${primaryFont}", sans-serif`
      ctx.fillStyle = fontColor
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, labelX, labelY)
    }
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

      const scaledRadius = radius * scaleFactor

      if (day === todayDate) {
        ctx.beginPath()
        ctx.arc(cx, cy, scaledRadius * 0.85, 0, Math.PI * 2)
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = Math.max(2, Math.round(overlayWidth / 200))
        ctx.stroke()
      }

      const dayFont = `bold ${cellH * 0.48 * scaleFactor}px "${primaryFont}", sans-serif`
      const dayColor = holidaySet.has(day) ? '#ef4444' : fontColor
      if (textOutline) {
        drawOutlinedText(ctx, String(day), cx, cy, {
          font: dayFont,
          fillStyle: dayColor,
          outlineWidth: Math.max(1, cellH * 0.48 * scaleFactor * 0.05),
          outlineColor: getOutlineColor(ctx, cx, cy, width, height, textOutlineAutoContrast, textOutlineColor)
        })
      } else {
        ctx.fillStyle = dayColor
        ctx.font = dayFont
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(day), cx, cy)
      }

      day++
    }
  }

  ctx.restore()

  if (showHolidayList && holidays.length > 0) {
    const sortedHolidays = holidays
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    const gap = overlayHeight * 0.04
    const panelX = x
    const panelWidth = overlayWidth
    const panelY = y + overlayHeight + gap
    const bottomPadding = height * 0.03
    const maxPanelHeight = Math.max(0, height - panelY - bottomPadding)

    const panelPadding = padding * 0.8
    const usableHeight = Math.max(0, maxPanelHeight - panelPadding)
    const desiredFont = overlayWidth * 0.035 * scaleFactor
    const minFont = overlayWidth * 0.02
    const lineHeightRatio = 1.5

    const textPaddingRight = panelPadding * 1.5
    const maxTextWidth = panelWidth - panelPadding - textPaddingRight

    // Function to wrap text into multiple lines
    function wrapText(text, maxWidth) {
      const words = text.split(' ')
      const lines = []
      let currentLine = ''

      for (let i = 0; i < words.length; i++) {
        const word = words[i]
        const testLine = currentLine ? currentLine + ' ' + word : word
        const testWidth = ctx.measureText(testLine).width

        if (testWidth > maxWidth && currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = testLine
        }
      }

      if (currentLine) {
        lines.push(currentLine)
      }

      return lines
    }

    // Measure wrapping using the desired font size
    const initialFontSize = Math.max(minFont, desiredFont)
    ctx.font = `500 ${initialFontSize}px "${primaryFont}", sans-serif`

    let totalLines = 0
    const wrappedHolidays = sortedHolidays.map((h) => {
      const d = new Date(h.date)
      const fullLabel = `${d.getDate()}. ${h.localName || h.name}`
      const wrappedLines = wrapText(fullLabel, maxTextWidth)
      totalLines += wrappedLines.length
      return { holiday: h, wrappedLines }
    })

    const listFontSize = Math.max(
      minFont,
      Math.min(desiredFont, usableHeight / (totalLines * lineHeightRatio))
    )
    const listLineHeight = listFontSize * lineHeightRatio
    const panelHeight = Math.min(
      totalLines * listLineHeight + panelPadding,
      maxPanelHeight
    )

    ctx.save()

    if (showFrame) {
      ctx.fillStyle = frameFill
      ctx.fillRect(panelX, panelY, panelWidth, panelHeight)
      if (frameBorder) {
        ctx.strokeStyle = hexToRgba(frameBorderColor, 0.4)
        ctx.lineWidth = Math.max(1, Math.round(overlayWidth / 300))
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight)
      }
    }

    ctx.fillStyle = fontColor
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    let textY = panelY + panelPadding / 2
    wrappedHolidays.forEach(({ wrappedLines }) => {
      wrappedLines.forEach((line) => {
        ctx.font = `500 ${listFontSize}px "${primaryFont}", sans-serif`
        ctx.fillText(line, panelX + panelPadding / 2, textY)
        textY += listLineHeight
      })
    })

    ctx.restore()
  }
}
