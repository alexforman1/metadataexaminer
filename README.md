# Client‑Side EXIF / Hash Inspector (Next.js)

**Demo goals**
- Upload images, parse EXIF/IPTC/XMP, compute SHA‑256, peek JPEG header (SOI/marker), compare two images, and export a PDF report — all **in the browser**.

**Why client‑only?**
- Zero backend, zero cost on Vercel free tier. Using `exifr` instead of ExifTool keeps it all browser‑side while meeting core learning outcomes.

**Disclaimers**
- This demo does not store or retain files; all processing occurs in the browser.
- EXIF timestamps can be inaccurate due to device clock changes or failures; corroborate with other artifacts (location, lighting/sun position, etc.).
- Hashes are provided for integrity of the files as uploaded to this tool (educational use).

## Run locally
```bash
npm i
npm run dev
```

## Deploy

* Push to GitHub and import into Vercel → New Project → framework: Next.js → Deploy.
