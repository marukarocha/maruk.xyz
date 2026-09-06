#!/usr/bin/env python3
from ftplib import FTP, error_perm
from io import BytesIO
from pathlib import Path


ROOT = Path("dist")
ENV_FILE = Path(".env")
CONTENT_COMPARE_EXTENSIONS = {".css", ".html", ".js", ".json", ".mjs", ".svg", ".txt", ".webmanifest", ".xml"}


def read_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        value = value.strip()
        if (value.startswith("'") and value.endswith("'")) or (
            value.startswith('"') and value.endswith('"')
        ):
            value = value[1:-1]
        env[key.strip()] = value
    return env


def ensure_remote_dir(ftp: FTP, rel_parent: Path, made_dirs: set[str]) -> None:
    if rel_parent.as_posix() in ("", "."):
        return

    current = Path(".")
    for part in rel_parent.parts:
        current = current / part
        key = current.as_posix()
        if key in made_dirs:
            continue

        try:
            ftp.mkd(key)
        except error_perm as exc:
            if not str(exc).startswith("550"):
                raise
        made_dirs.add(key)


def list_remote_sizes(ftp: FTP, local_files: list[Path]) -> dict[str, int]:
    remote_sizes: dict[str, int] = {}
    local_dirs = sorted(
        {path.relative_to(ROOT).parent.as_posix() for path in local_files},
        key=lambda item: (item.count("/"), item),
    )

    for rel_dir in local_dirs:
        remote_dir = "." if rel_dir in ("", ".") else rel_dir
        try:
            entries = list(ftp.mlsd(remote_dir))
        except error_perm:
            continue

        for name, facts in entries:
            if name in (".", "..") or facts.get("type") != "file":
                continue
            size = facts.get("size")
            if size is None:
                continue
            rel_path = name if remote_dir == "." else f"{remote_dir}/{name}"
            remote_sizes[rel_path] = int(size)

    return remote_sizes


def remote_file_matches(ftp: FTP, rel_remote: str, local_path: Path, remote_size: int | None) -> bool:
    local_size = local_path.stat().st_size
    if remote_size != local_size:
        return False

    if local_path.suffix.lower() not in CONTENT_COMPARE_EXTENSIONS:
        return True

    buffer = BytesIO()
    try:
        ftp.retrbinary(f"RETR {rel_remote}", buffer.write)
    except error_perm:
        return False

    return buffer.getvalue() == local_path.read_bytes()


def main() -> None:
    if not ROOT.is_dir():
        raise SystemExit("dist/ nao encontrado. Rode npm run build antes do deploy.")

    env = read_env(ENV_FILE)
    files = sorted(
        [path for path in ROOT.rglob("*") if path.is_file()],
        key=lambda path: path.relative_to(ROOT).as_posix(),
    )

    ftp = FTP(timeout=60)
    ftp.connect(env["FTP_HOST"], int(env.get("FTP_PORT", "21")))
    ftp.login(env["FTP_USERNAME"], env["FTP_PASSWORD"])
    ftp.set_pasv(True)
    ftp.sock.settimeout(60)
    ftp.voidcmd("TYPE I")

    upload_dir = env.get("FTP_UPLOAD_DIR", ".").strip()
    if upload_dir and upload_dir != ".":
        for part in upload_dir.strip("/").split("/"):
            if not part:
                continue
            try:
                ftp.cwd(part)
            except error_perm:
                ftp.mkd(part)
                ftp.cwd(part)

    print(f"Destino remoto: {ftp.pwd()}")
    print(f"Comparando {len(files)} arquivos...")
    remote_sizes = list_remote_sizes(ftp, files)

    made_dirs = {"."}
    uploaded = 0
    skipped = 0

    for path in files:
        rel = path.relative_to(ROOT)
        rel_remote = rel.as_posix()
        local_size = path.stat().st_size

        if remote_file_matches(ftp, rel_remote, path, remote_sizes.get(rel_remote)):
            skipped += 1
            continue

        ensure_remote_dir(ftp, rel.parent, made_dirs)
        print(f"Enviando {rel_remote} ({local_size} bytes)", flush=True)
        with path.open("rb") as handle:
            ftp.storbinary(f"STOR {rel_remote}", handle, blocksize=262144)
        uploaded += 1

    ftp.quit()
    print(f"Deploy concluido: {uploaded} enviados, {skipped} sem alteracao.")


if __name__ == "__main__":
    main()
