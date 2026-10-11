# THE CRASHPAD

Website for The Crashpad — an outdoor collective in Suru Valley, Ladakh and Zoom Rock Garden, Sikkim.

A static site: `index.html`, `assets/css/style.css`, `assets/js/main.js`, and web-sized photos in `assets/img/`.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Adding photos

1. Put the original photos in the matching folder in `assets/images/` (e.g. `assets/images/AQI_images/`).
   Originals stay on your computer only; they are not uploaded to GitHub.
2. Make the web-sized copies (macOS):

   ```bash
   ./scripts/build-images.sh
   ```

   This writes JPGs (max 1800px) to `assets/img/<same folder>/`, with lowercase names
   (`IMG_1346.TIFF` becomes `img-1346.jpg`). Team portraits also get small copies in `sm/` and `face/`.
   Use `--clean` to rebuild everything.
3. Reference the new file from `index.html`, then commit and push. Render redeploys automatically.

## Fonts

Glacial Indifference is self-hosted in `assets/fonts/` (SIL Open Font License).

## Contact form

The form posts to Formspree. Replace `YOUR_FORM_ID` in `index.html` with your form's ID from formspree.io.
