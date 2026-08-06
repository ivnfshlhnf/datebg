# DateBG

DateBG is a vibe coded web application that overlays the current month's calendar onto your phone background image. It fetches national holidays for your selected country and displays them on the calendar, creating a personalized wallpaper with practical date reference.

## Features

- **Vibe Coded**: Built iteratively with AI assistance
- **Self-Hosted**: Requires a running server, designed for personal deployment
- **Custom Calendar Overlay**: Renders the current month's calendar on any background image
- **Holiday Integration**: Automatically fetches and displays national holidays via the [Nager.Date API](https://date.nager.at/api)
- **iOS Shortcuts Integration**: Designed to work with the iOS Shortcuts app for automatic daily wallpaper refresh (see [iOS Shortcuts Usage](#ios-shortcuts-usage) below)
- **Font Customization**: Choose from 40+ curated font combinations (serif, sans-serif, monospace)
- **Layout Controls**: Adjust calendar width, height, and vertical position
- **Frame Styling**: Optional semi-transparent frame with customizable color, opacity, and border
- **Text Effects**: Text outline with optional auto-contrast for better visibility
- **Timezone Aware**: Displays the correct date based on your timezone
- **Export Settings**: Share your configuration via URL parameters

## Prerequisites

- **Node.js** v18+ (recommended: v20+)
- **npm** v9+
- **Docker** (optional, for containerized development/production)

## Quick Start

### Option 1: Local Development (Recommended)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server** (runs both Vite frontend and Express backend):
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Option 2: Docker Development

```bash
docker compose up dev
```

Access the app at http://localhost:5173

### Option 3: Docker Production

```bash
# Build the production image
docker compose build prod

# Run the production container
docker compose up prod
```

Access the app at http://localhost:3000

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload (frontend + backend) |
| `npm run build` | Build production bundle |
| `npm start` | Start production server (requires build first) |
| `npm run preview` | Build and start production server |

## API Endpoints

The backend server provides the following endpoints:

### `GET /api/health`
Health check endpoint.

### `GET /api/available-countries`
Returns list of countries supported for holiday data.

### `GET /api/holidays?country={code}&year={year}`
Returns public holidays for a specific country and year.

### `POST /api/render`
Renders a calendar overlay on an uploaded image.

**Query Parameters:**
- `country` - Country code for holidays (e.g., `US`, `ID`, `GB`)
- `font` - Font family (e.g., `'Inter', sans-serif`)
- `fontScale` - Font size percentage (50-150)
- `calendarWidth` - Calendar width percentage (50-100)
- `calendarHeight` - Calendar height percentage (20-50)
- `calendarY` - Vertical position percentage (0-100)
- `framePadding` - Frame spacing (0-15)
- `showFrame` - Show/hide frame (`true`/`false`)
- `frameOpacity` - Frame opacity (0-100)
- `frameColor` - Frame color (hex)
- `frameBorder` - Show/hide frame border (`true`/`false`)
- `textOutline` - Enable text outline (`true`/`false`)
- `textOutlineAutoContrast` - Auto-contrast outline (`true`/`false`)
- `timeZone` - Timezone for current date

**Request Body:** Raw image buffer (PNG, JPEG, etc.)

**Response:** Rendered PNG image

## iOS Shortcuts Usage

DateBG was originally built to be used alongside the iOS Shortcuts app for automatic daily wallpaper updates. You can create a shortcut that:

1. Fetches a background image (from Photos, Files, or a URL)
2. Sends it to the DateBG server's `/api/render` endpoint
3. Saves the returned image to your Photos library
4. Optionally sets it as your wallpaper

This allows your lock screen or home screen to automatically display a fresh calendar wallpaper every day without manual intervention.

### Example Shortcut Flow

```
1. Get image from Photos/Files
2. Make POST request to: http://your-server:3000/api/render?country=US&font=Inter
3. Save response to Photos
4. (Optional) Set as wallpaper
```

For remote access, deploy the server to a cloud provider and use the public URL in your shortcut.

## Programmatic Usage

You can render calendar overlays programmatically:

```bash
curl -X POST "http://localhost:3000/api/render?country=US&font=Inter&fontScale=100" \
  -H "Content-Type: image/png" \
  --data-binary @background.png \
  -o calendar-wallpaper.png
```

## Project Structure

```
DateBG/
├── src/                    # Frontend React source
│   ├── App.jsx            # Main application component
│   ├── main.jsx           # React entry point
│   └── styles/            # CSS stylesheets
├── server/                # Backend Express server
│   ├── index.js          # Main server file
│   ├── renderCalendar.js # Calendar rendering logic
│   ├── registerFonts.js  # Font registration
│   └── fonts/            # Custom font files
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile            # Production Docker image
├── Dockerfile.dev        # Development Docker image
├── package.json          # Dependencies and scripts
└── vite.config.js        # Vite configuration
```

## Technology Stack

- **Frontend**: React 18, Vite
- **Backend**: Express.js, Node.js
- **Rendering**: Skia-Canvas (for image manipulation)
- **Fonts**: @fontsource packages (Google Fonts)
- **API**: Nager.Date API for holiday data
- **Containerization**: Docker, Docker Compose

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment mode |

## License

Private project (see `package.json`)