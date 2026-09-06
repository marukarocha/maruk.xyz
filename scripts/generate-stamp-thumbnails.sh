#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAMP_DIR="${ROOT_DIR}/src/playground/experiments/tshirt-lab/3d/textures/stamps"
THUMB_DIR="${STAMP_DIR}/thumbs"
THUMB_SIZE="${THUMB_SIZE:-320}"
PNG_COMPRESSION="${PNG_COMPRESSION:-9}"

if ! command -v convert >/dev/null 2>&1; then
  echo "Erro: ImageMagick (convert) não encontrado no PATH."
  echo "Instale o ImageMagick e execute novamente."
  exit 1
fi

mkdir -p "${THUMB_DIR}"

generated=0
skipped=0

shopt -s nullglob
for src in "${STAMP_DIR}"/*; do
  [[ -f "${src}" ]] || continue

  file_name="$(basename "${src}")"
  lower_name="${file_name,,}"
  case "${lower_name}" in
    *.png|*.jpg|*.jpeg|*.webp)
      ;;
    *)
      skipped=$((skipped + 1))
      continue
      ;;
  esac

  base_name="${file_name%.*}"
  out="${THUMB_DIR}/${base_name}.png"

  convert "${src}" \
    -auto-orient \
    -alpha on \
    -background none \
    -thumbnail "${THUMB_SIZE}x${THUMB_SIZE}" \
    -gravity center \
    -extent "${THUMB_SIZE}x${THUMB_SIZE}" \
    -strip \
    -define "png:compression-level=${PNG_COMPRESSION}" \
    "${out}"

  generated=$((generated + 1))
  echo "thumb: ${file_name} -> thumbs/${base_name}.png"
done

echo ""
echo "Miniaturas geradas: ${generated}"
echo "Arquivos ignorados: ${skipped}"
echo "Destino: ${THUMB_DIR}"
