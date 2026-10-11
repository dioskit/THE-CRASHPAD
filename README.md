# THE CRASHPAD

Website for The Crashpad — an outdoor collective in Suru Valley, Ladakh and Zoom Rock Garden, Sikkim.

A static site: `index.html`, `assets/css/style.css`, `assets/js/main.js`, and web-sized photos in `assets/img/`.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Adding photos

Put web-sized images (max ~1800px wide, JPG) in the matching `assets/img/<Section>_images/` folder and reference them from `index.html`.

## Contact form

The form posts to Formspree. Replace `YOUR_FORM_ID` in `index.html` with your form's ID from formspree.io.
