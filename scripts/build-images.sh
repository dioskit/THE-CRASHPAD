#!/bin/bash
# Make web-sized copies of the original photos.
#
#   assets/images/<Folder>/<Original File>.JPG  ->  assets/img/<Folder>/<original-file>.jpg
#
# - Photos: JPEG, max 1800px on the long side.
# - Logo_images: PNG (keeps transparency), max 500px.
# - TeamProfile_images: also a 640px copy in sm/ for the team grid and a 140px copy in face/ for the hero.
# Only new or changed originals are converted. Pass --clean to rebuild everything from scratch
# (this also removes web copies whose original was deleted).
#
# Usage (from the website folder):  ./scripts/build-images.sh [--clean]
# Needs macOS (uses the built-in `sips` tool).

set -euo pipefail
cd "$(dirname "$0")/.."

SRC=assets/images
OUT=assets/img

if [[ "${1:-}" == "--clean" ]]; then
  rm -rf "$OUT"
fi

slug() {  # "IMG_1346 (1).TIFF" -> "img-1346-1"
  local base="${1%.*}"
  echo "$base" | tr 'A-Z' 'a-z' | sed -E 's/[^a-z0-9]+/-/g; s/^-|-$//g'
}

converted=0
while IFS= read -r -d '' file; do
  folder=$(basename "$(dirname "$file")")
  name=$(slug "$(basename "$file")")
  mkdir -p "$OUT/$folder"

  if [[ "$folder" == "Logo_images" ]]; then
    dest="$OUT/$folder/$name.png"
    [[ -f "$dest" && "$dest" -nt "$file" ]] && continue
    sips -s format png -Z 500 "$file" --out "$dest" >/dev/null 2>&1 || { echo "skipped (unreadable): $file"; continue; }
  else
    dest="$OUT/$folder/$name.jpg"
    [[ -f "$dest" && "$dest" -nt "$file" ]] && continue
    sips -s format jpeg -s formatOptions 72 -Z 1800 "$file" --out "$dest" >/dev/null 2>&1 || { echo "skipped (unreadable): $file"; continue; }
    if [[ "$folder" == "TeamProfile_images" ]]; then
      mkdir -p "$OUT/$folder/sm" "$OUT/$folder/face"
      sips -Z 640 "$dest" --out "$OUT/$folder/sm/$name.jpg" >/dev/null
      sips -Z 140 "$dest" --out "$OUT/$folder/face/$name.jpg" >/dev/null
    fi
  fi
  echo "  $dest"
  converted=$((converted + 1))
done < <(find "$SRC" -type f ! -name '.*' -print0 | sort -z)

echo "Done: $converted image(s) converted. Web images total: $(du -sh "$OUT" | cut -f1)"
