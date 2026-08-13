"""Download real Wikimedia photos for GreenPath lesson covers."""
from __future__ import annotations

import io
import urllib.request
from pathlib import Path

from PIL import Image

OUT = Path(__file__).resolve().parents[1] / "assets" / "lessons"
OUT.mkdir(parents=True, exist_ok=True)

UA = "GreenPathGhana/1.0 (climate education app; lesson covers)"

COVERS: dict[str, list[str]] = {
    "climate-accra.jpg": [
        "https://commons.wikimedia.org/wiki/Special:FilePath/Accra_Skyline.jpg?width=1400",
        "https://commons.wikimedia.org/wiki/Special:FilePath/Accra_Skyline_3.jpg?width=1400",
        "https://commons.wikimedia.org/wiki/Special:FilePath/Accra_Skyline_-_Ghana.jpg?width=1400",
    ],
    "waste-agbogbloshie.jpg": [
        "https://commons.wikimedia.org/wiki/Special:FilePath/Electronic_waste_at_Agbogbloshie,_Ghana.jpg?width=1400",
        "https://commons.wikimedia.org/wiki/Special:FilePath/Agbogbloshie_Ghana.jpg?width=1400",
    ],
    "solar-panels.jpg": [
        "https://commons.wikimedia.org/wiki/Special:FilePath/Solar_panels.jpg?width=1400",
        "https://commons.wikimedia.org/wiki/Special:FilePath/Solar_panel_array.jpg?width=1400",
        "https://commons.wikimedia.org/wiki/Special:FilePath/Photovoltaic_system.jpg?width=1400",
        "https://commons.wikimedia.org/wiki/Special:FilePath/Solar_panels_on_roof.jpg?width=1400",
    ],
    "plastic-accra-beach.jpg": [
        "https://commons.wikimedia.org/wiki/Special:FilePath/Plastic_Pollution_in_Ghana.jpg?width=1400",
        "https://commons.wikimedia.org/wiki/Special:FilePath/Plastic_pollution.jpg?width=1400",
    ],
    "water-ghana.jpg": [
        "https://commons.wikimedia.org/wiki/Special:FilePath/Fetching_water.jpg?width=1400",
        "https://commons.wikimedia.org/wiki/Special:FilePath/Women_fetching_water.jpg?width=1400",
        "https://commons.wikimedia.org/wiki/Special:FilePath/Carrying_water.jpg?width=1400",
        "https://commons.wikimedia.org/wiki/Special:FilePath/Girl_carrying_water.jpg?width=1400",
        "https://commons.wikimedia.org/wiki/Special:FilePath/Water_well_in_Ghana.jpg?width=1400",
    ],
    "cocoa-ghana.jpg": [
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cocoa_Pods.JPG?width=1400",
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cocoa_pods.jpg?width=1400",
        "https://commons.wikimedia.org/wiki/Special:FilePath/Theobroma_cacao_fruits.jpg?width=1400",
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cocoa_tree.jpg?width=1400",
    ],
}


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "image/*"})
    with urllib.request.urlopen(req, timeout=45) as res:
        if res.status >= 400:
            raise RuntimeError(f"HTTP {res.status}")
        return res.read()


def save_cover(name: str, urls: list[str]) -> bool:
    dest = OUT / name
    last_err: Exception | None = None
    for url in urls:
        try:
            raw = fetch(url)
            img = Image.open(io.BytesIO(raw)).convert("RGB")
            img.thumbnail((1400, 900), Image.Resampling.LANCZOS)
            img.save(dest, "JPEG", quality=86, optimize=True)
            print(f"OK  {name}  {dest.stat().st_size} bytes  from {url}")
            return True
        except Exception as exc:  # noqa: BLE001
            last_err = exc
            print(f"skip {name}: {exc}")
    print(f"FAIL {name}: {last_err}")
    return False


def main() -> None:
    ok = 0
    for name, urls in COVERS.items():
        if save_cover(name, urls):
            ok += 1
    print(f"\n{ok}/{len(COVERS)} covers saved to {OUT}")


if __name__ == "__main__":
    main()
