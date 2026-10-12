#!/bin/bash
# Export brochure/learning-brochure.html to assets/docs/crashpad-learning-brochure.pdf
# using Google Chrome in headless mode (macOS). Photos are downsized for the PDF only,
# so the download stays small.
#
# Usage (from the website folder):  ./scripts/build-brochure.sh
set -euo pipefail
cd "$(dirname "$0")/.."

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SRC="brochure/learning-brochure.html"
OUT="assets/docs/crashpad-learning-brochure.pdf"
TMP="brochure/.print"
rm -rf "$TMP"; mkdir -p "$TMP/img" "$(dirname "$OUT")"

# Copy every referenced photo at print-friendly size (1100px, quality 62)
cp "$SRC" "$TMP/page.html"
grep -oE '\.\./assets/img/[^"]+\.(jpg|png)' "$SRC" | sort -u | while read -r ref; do
  file="${ref#../}"
  flat=$(echo "$file" | tr '/' '_')
  if [[ "$file" == *.png ]]; then cp "$file" "$TMP/img/$flat"
  else sips -s format jpeg -s formatOptions 62 -Z 1100 "$file" --out "$TMP/img/$flat" >/dev/null; fi
  sed -i '' "s#${ref}#img/${flat}#g" "$TMP/page.html"
done
sed -i '' "s#\.\./assets/fonts/#../../assets/fonts/#g" "$TMP/page.html"

"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer --allow-file-access-from-files \
  --virtual-time-budget=15000 --print-to-pdf="$OUT" "file://$PWD/$TMP/page.html" 2>/dev/null
rm -rf "$TMP"

echo "Saved $OUT ($(du -h "$OUT" | cut -f1))"
