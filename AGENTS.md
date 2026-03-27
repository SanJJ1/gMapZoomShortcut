# Chrome Extension SDLC — Agent Guide

This document describes the end-to-end process for developing and publishing this Chrome extension. Use it to onboard a new agent or resume work mid-cycle.

---

## Project Structure

```
manifest.json   — extension metadata (name, version, description, icons)
content.js      — all extension logic; injected into google.com/maps pages
logo.png        — store icon (128x128) and manifest icon
banner.jpg      — store screenshot (1280x800), NOT included in the ZIP
README.md       — GitHub readme + copy-pasteable Chrome Web Store field values
AGENTS.md       — this file
```

---

## Development

### Making changes
- All logic lives in `content.js`. No build step, no dependencies.
- After any functional change, bump the version in `manifest.json` (semver: `1.x` for features/fixes).
- Bump the `console.log` version string at the top of `content.js` to match, so you can confirm the new version loaded in DevTools.

### Testing locally
1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `C:\all\code\gMapZoomShortcut`
4. Open Google Maps and verify shortcuts work
5. After any code change, click the refresh icon on the extension card and reload Maps

### Key behaviors to verify
- `+` / `=` / `i` → zoom in
- `-` / `_` / `o` → zoom out
- `h` / `j` / `k` / `l` → pan (hold for acceleration, two keys for diagonal)
- Shortcuts must do nothing when a text input is focused
- Browser shortcuts (e.g. Ctrl+L) must still work

---

## Publishing to Chrome Web Store

### Store listing
- **URL:** https://chromewebstore.google.com/detail/google-maps-keyboard-nav/ehfkgkjppaamcbigkancpjcijnkhlajp
- All copy-pasteable field values are in `README.md` under "Chrome Web Store Fields"
- `banner.jpg` is uploaded manually as a screenshot in the store dashboard

### Building the ZIP
Only these three files go in the ZIP — nothing else:

```
powershell -Command "Compress-Archive -Path 'manifest.json','content.js','logo.png' -DestinationPath '..\gMapZoomShortcut.zip' -Force"
```

Run from `C:\all\code\gMapZoomShortcut`, output lands at `C:\all\code\gMapZoomShortcut.zip`.

### Upload steps
1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Select the extension → **Package** → **Upload new package** → upload the ZIP
3. Update any store listing fields if copy changed (see `README.md`)
4. Submit for review

---

## Git

Repository: https://github.com/SanJJ1/gMapZoomShortcut

Commit and push after any change to `content.js`, `manifest.json`, `README.md`, or `AGENTS.md`.
The store **Homepage URL** points to this repo — keep it tidy.
