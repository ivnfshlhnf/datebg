# iPhone Shortcuts Automation

The server exposes `POST /api/render` which accepts a background image and returns a calendar-overlay wallpaper as a binary PNG. This makes it usable directly from iOS Shortcuts.

## API

```text
POST /api/render
Content-Type: multipart/form-data
```

### Form fields

| Field       | Required | Description                                              |
|-------------|----------|----------------------------------------------------------|
| `image`     | Yes      | The background image file (JPG/PNG/HEIC/etc.)            |
| `country`   | No       | ISO-3166-1 alpha-2 country code for holidays, e.g. `ID`  |
| `font`      | No       | Font family, e.g. `Inter, sans-serif`                    |
| `fontScale` | No       | Calendar font size percentage, default `100`               |

### Response

- `200 OK` with `Content-Type: image/png` — the rendered wallpaper.
- `400/500` with `Content-Type: application/json` — error details.

### Example curl

```bash
curl -s -X POST \
  -F 'image=@your-wallpaper.jpg' \
  -F 'country=ID' \
  -F 'font=Inter, sans-serif' \
  -F 'fontScale=100' \
  -o rendered-wallpaper.png \
  http://your-server:3000/api/render
```

## iPhone Shortcut setup

1. Open the **Shortcuts** app and create a new Personal Automation (or a regular shortcut).
2. Choose a trigger, e.g. **Time of Day** → sunrise, for a daily wallpaper.
3. Add actions in this order:

   1. **Find Photos** (optional)
      - Filter by album or date to pick the background image of the day.
   2. **Get Contents of URL**
      - URL: `http://your-server:3000/api/render`
      - Method: `POST`
      - Headers: leave empty
      - Request Body: `Form`
        - Add field `image` → Magic Variable: the photo from step 1
        - Add text field `country` → `ID` (or your country code)
        - Add text field `font` → `Inter, sans-serif`
        - Add number field `fontScale` → `100`
   3. **Set Wallpaper**
      - Use the output of `Get Contents of URL` as the image.
      - Choose Lock Screen, Home Screen, or both.
   4. **Show Notification** (optional)
      - Title: "Daily calendar wallpaper updated"

## Notes

- The server must be reachable from your phone. If running locally, use a tunnel like [ngrok](https://ngrok.com/) or expose it through your home network.
- For a completely hands-off flow, pair the shortcut with an album that has a new photo each day, or add a step that fetches an image from a URL first.
