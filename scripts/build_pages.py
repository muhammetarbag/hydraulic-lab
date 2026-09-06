"""Build and validate the static GitHub Pages artifact, without a server runtime."""
from __future__ import annotations
import os
from pathlib import Path
import shutil
import subprocess

ROOT: Path = Path(__file__).resolve().parents[1]
PUBLIC: Path = ROOT / "dist" / "client" / "hydraulic-lab"

def main() -> None:
    build_env: dict[str, str] = {**os.environ, "HYDRAULIC_PAGES": "true"}
    subprocess.run(["npm", "run", "build"], cwd=ROOT, env=build_env, check=True)
    for name in ("index.html", "index.txt", "favicon.svg"):
        if not (PUBLIC / name).is_file():
            raise RuntimeError(f"Missing Pages artifact: {name}")
    if not (PUBLIC / "_next" / "static").is_dir():
        raise RuntimeError("Missing static assets")
    (PUBLIC / ".nojekyll").write_text("", encoding="utf-8")
    not_found: Path = ROOT / "dist" / "client" / "404.html"
    if not_found.is_file():
        shutil.copyfile(not_found, PUBLIC / "404.html")
    if any(PUBLIC.rglob("*.map")):
        raise RuntimeError("Do not publish source maps in the Pages artifact")
    html: str = (PUBLIC / "index.html").read_text(encoding="utf-8")
    if "/hydraulic-lab/_next/" not in html or "Hidrolik güç" not in html:
        raise RuntimeError("Static HTML or repository base path validation failed")
    print("GitHub Pages artifact ready: dist/client/hydraulic-lab")

if __name__ == "__main__":
    main()
