# Docker Development Setup

This project uses Docker Compose for both development and production environments.

## Quick Start

### Development Mode (with hot-reloading)

```bash
# Start the development server
docker-compose up dev

# Or run in detached mode
docker-compose up -d dev

# View logs
docker-compose logs -f dev

# Stop the development server
docker-compose down dev
```

**Access points:**
- Vite Dev Server: http://localhost:5173
- Express API Server: http://localhost:3000
- Health Check: http://localhost:3000/api/health

### Production Mode

```bash
# Build and start production container
docker-compose up -d prod

# View logs
docker-compose logs -f prod

# Stop production server
docker-compose down prod
```

**Access point:**
- Production Server: http://localhost:3000

## Files Overview

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage production build |
| `Dockerfile.dev` | Development build with hot-reloading |
| `docker-compose.yml` | Defines both dev and prod services |
| `.dockerignore` | Excludes unnecessary files from build |

## Development Features

- **Hot-reloading**: Code changes are automatically reflected
- **Volume mounts**: Source code is mounted into the container
- **Polling enabled**: File watching works correctly in Docker
- **Nodemon**: Backend restarts on server file changes

## Common Commands

```bash
# Rebuild containers after Dockerfile changes
docker-compose build dev
docker-compose build prod

# Rebuild and restart
docker-compose up --build dev

# View running containers
docker-compose ps

# Execute commands inside the container
docker-compose exec dev npm install <package>
docker-compose exec dev node --version

# Clean up (remove containers and volumes)
docker-compose down -v
```

## Troubleshooting

### Port already in use
If port 3000 or 5173 is already in use, either:
1. Stop other services using those ports
2. Change the port mapping in `docker-compose.yml`

### File changes not detected
Ensure the volume mounts are correctly configured and that your Docker daemon has access to your project directory.

### Node modules issues
The `node_modules` directory is kept separate via a named volume to avoid conflicts between host and container dependencies.