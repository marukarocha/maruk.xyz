#!/usr/bin/env python3
from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import quote

from PIL import Image, ImageOps


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
TEXT_EXTENSIONS = {".css", ".html", ".js", ".json", ".mjs", ".svg", ".txt", ".xml"}
LANCZOS = getattr(getattr(Image, "Resampling", Image), "LANCZOS")


@dataclass
class OptimizedImage:
    source: Path
    webp: Path
    original_size: int
    webp_size: int


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Converte imagens do build para WebP e atualiza referencias em dist/."
    )
    parser.add_argument("--root", default="dist", help="Pasta do build gerado pelo Vite.")
    parser.add_argument(
        "--quality",
        type=int,
        default=82,
        help="Qualidade WebP, de 1 a 100. Padrao: 82.",
    )
    parser.add_argument(
        "--max-width",
        type=int,
        default=1920,
        help="Largura maxima antes da conversao. Use 0 para nao redimensionar.",
    )
    parser.add_argument(
        "--min-savings",
        type=float,
        default=0.08,
        help="Economia minima para manter o WebP. Padrao: 0.08 = 8%%.",
    )
    parser.add_argument(
        "--remove-originals",
        action="store_true",
        help="Remove jpg/png/jpeg convertidos de dist/ depois de atualizar referencias.",
    )
    parser.add_argument(
        "--only",
        action="append",
        default=[],
        help=(
            "Otimiza apenas caminhos dentro dessa pasta relativa a dist/. "
            "Pode ser usado varias vezes. Ex.: --only port/3d"
        ),
    )
    return parser.parse_args()


def should_process(path: Path, root: Path, only_dirs: list[str]) -> bool:
    if path.suffix.lower() not in IMAGE_EXTENSIONS:
        return False
    if not only_dirs:
        return True

    rel = path.relative_to(root).as_posix()
    return any(rel == directory or rel.startswith(f"{directory.rstrip('/')}/") for directory in only_dirs)


def resize_if_needed(image: Image.Image, max_width: int) -> Image.Image:
    if max_width <= 0 or image.width <= max_width:
        return image

    ratio = max_width / image.width
    new_size = (max_width, max(1, round(image.height * ratio)))
    return image.resize(new_size, LANCZOS)


def convert_to_webp(path: Path, quality: int, max_width: int, min_savings: float) -> OptimizedImage | None:
    webp_path = path.with_suffix(".webp")
    temp_path = path.with_suffix(f"{path.suffix}.tmp.webp")
    original_size = path.stat().st_size

    with Image.open(path) as raw_image:
        image = ImageOps.exif_transpose(raw_image)
        image = resize_if_needed(image, max_width)

        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA" if "A" in image.getbands() else "RGB")

        image.save(temp_path, "WEBP", quality=quality, method=6)

    webp_size = temp_path.stat().st_size
    if webp_size >= original_size * (1 - min_savings):
        temp_path.unlink(missing_ok=True)
        return None

    temp_path.replace(webp_path)
    return OptimizedImage(path, webp_path, original_size, webp_size)


def replacement_pairs(root: Path, optimized: list[OptimizedImage]) -> list[tuple[str, str]]:
    pairs: list[tuple[str, str]] = []

    for item in optimized:
        source_rel = item.source.relative_to(root).as_posix()
        webp_rel = item.webp.relative_to(root).as_posix()
        variants = {
            (source_rel, webp_rel),
            (f"/{source_rel}", f"/{webp_rel}"),
            (quote(source_rel, safe="/"), quote(webp_rel, safe="/")),
            (quote(f"/{source_rel}", safe="/"), quote(f"/{webp_rel}", safe="/")),
        }
        pairs.extend(sorted(variants, key=lambda pair: len(pair[0]), reverse=True))

    return pairs


def update_text_references(root: Path, optimized: list[OptimizedImage]) -> int:
    pairs = replacement_pairs(root, optimized)
    if not pairs:
        return 0

    changed = 0
    for path in root.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in TEXT_EXTENSIONS:
            continue

        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue

        updated = text
        for source, webp in pairs:
            updated = updated.replace(source, webp)

        if updated != text:
            path.write_text(updated, encoding="utf-8")
            changed += 1

    return changed


def human_size(size: int) -> str:
    units = ("B", "KB", "MB", "GB")
    value = float(size)
    for unit in units:
        if value < 1024 or unit == units[-1]:
            return f"{value:.1f} {unit}" if unit != "B" else f"{size} B"
        value /= 1024
    return f"{size} B"


def main() -> None:
    args = parse_args()
    root = Path(args.root)
    if not root.is_dir():
        raise SystemExit(f"{root}/ nao encontrado. Rode npm run build antes.")

    only_dirs = [directory.strip("/") for directory in args.only if directory.strip("/")]
    candidates = sorted(path for path in root.rglob("*") if path.is_file() and should_process(path, root, only_dirs))

    optimized: list[OptimizedImage] = []
    skipped = 0

    for path in candidates:
        try:
            result = convert_to_webp(path, args.quality, args.max_width, args.min_savings)
        except Exception as exc:
            print(f"Falha ao otimizar {path}: {exc}")
            skipped += 1
            continue

        if result is None:
            skipped += 1
            continue

        optimized.append(result)

    changed_files = update_text_references(root, optimized)

    if args.remove_originals:
        for item in optimized:
            item.source.unlink(missing_ok=True)

    original_total = sum(item.original_size for item in optimized)
    webp_total = sum(item.webp_size for item in optimized)
    saved = original_total - webp_total

    print(
        "Otimizacao concluida: "
        f"{len(optimized)} convertidas, {skipped} ignoradas, "
        f"{changed_files} arquivos de referencia atualizados."
    )
    if optimized:
        print(f"Economia no build: {human_size(saved)} ({human_size(original_total)} -> {human_size(webp_total)}).")


if __name__ == "__main__":
    main()
