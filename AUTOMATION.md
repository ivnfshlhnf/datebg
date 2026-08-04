# iPhone Shortcuts Automation

The server exposes `POST /api/render` which accepts a raw background image body and returns a calendar-overlay wallpaper as a binary PNG. This makes it usable directly from iOS Shortcuts without the overhead of multipart form encoding.

## API

```text
POST /api/render?country=ID&font=Inter,%20sans-serif&fontScale=100
Content-Type: image/jpeg
```

### Query parameters

| Parameter | Required | Description                                              |
|-----------|----------|----------------------------------------------------------|
| `country` | No       | ISO-3166-1 alpha-2 country code for holidays, e.g. `ID`  |
| `font`    | No       | Font family, e.g. `Inter, sans-serif`                    |
| `fontScale` | No     | Calendar font size percentage, default `100`             |

### Request body

The request body must be the raw background image bytes. The server accepts common raster formats such as JPEG and PNG; HEIC/HEIF support depends on the underlying canvas library.

### Headers

- `Content-Type` — set to the actual image MIME type when possible (`image/jpeg`, `image/png`, `image/heic`, etc.). The server ignores the value for decoding; it is used only for logging and compatibility.

### Response

- `200 OK` with `Content-Type: image/png` — the rendered wallpaper.
- `400/500` with `Content-Type: application/json` — error details.

### Example curl

```bash
curl -s -X POST \
  -H 'Content-Type: image/jpeg' \
  --data-binary @your-wallpaper.jpg \
  -o rendered-wallpaper.png \
  'http://your-server:3000/api/render?country=ID&font=Inter%2C%20sans-serif&fontScale=100'
```

## iPhone Shortcut setup

1. Open the **Shortcuts** app and create a new Personal Automation (or a regular shortcut).
2. Choose a trigger, e.g. **Time of Day** → sunrise, for a daily wallpaper.
3. Add actions in this order:

   1. **Find Photos** (optional)
      - Filter by album or date to pick the background image of the day.
   2. **Get Contents of URL**
      - URL: build the request URL with query parameters, e.g.

        ```
        http://your-server:3000/api/render?country=ID&font=Inter%2C%20sans-serif&fontScale=100
        ```

      - Method: `POST`
      - Headers:
        - `Content-Type`: `image/jpeg` (use `image/png` if your source image is PNG)
      - Request Body: `File`
        - Pass the photo from step 1 as the raw request body.
   3. **Set Wallpaper**
      - Use the output of `Get Contents of URL` as the image.
      - Choose Lock Screen, Home Screen, or both.
   4. **Show Notification** (optional)
      - Title: "Daily calendar wallpaper updated"

### Troubleshooting timeout

If the shortcut times out:

1. Confirm the server is reachable from the phone by visiting `http://your-server:3000/api/health` in Safari.
2. Make sure the phone is on the same Wi-Fi as the server if you are using a local IP address.
3. Reduce the input image size. iPhone photos can be very large; use a screenshot or a compressed image for testing.
4. Check `docker logs datebg` on the server. If the request never appears, the phone did not reach the server.

## Deploying to a home server

### 1. Build and export the image

On the machine where you built the project (e.g. an ARM Mac building for an x86 home server):

```bash
# build the image for the target platform
docker buildx build --platform linux/amd64 -t datebg:latest --load .

# export the image to a tar file
docker save -o datebg-latest.tar datebg:latest
```

The tar file is created at `./datebg-latest.tar` (about 280 MB).

### 2. Copy to your home server

Use `scp`, `rsync`, a USB drive, or any method you prefer:

```bash
scp datebg-latest.tar docker-compose.yml user@your-home-server:/path/to/datebg/
```

### 3. Load and run on the home server

SSH into the server and run:

```bash
cd /path/to/datebg

# load the image
docker load -i datebg-latest.tar

# start the container
docker-compose up -d
```

The API will be available on the server at `http://your-home-server:3000/api/render`.

### 4. Update the iPhone shortcut URL

In the Shortcuts app, change the `Get Contents of URL` URL from `http://your-server:3000/api/render` to the address of your home server, e.g. `http://192.168.1.50:3000/api/render`.

## Notes

- The server must be reachable from your phone. If you want access outside your home network, set up port forwarding on your router or use a tunnel like [ngrok](https://ngrok.com/).
- For a completely hands-off flow, pair the shortcut with an album that has a new photo each day, or add a step that fetches an image from a URL first.
