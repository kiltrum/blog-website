from pathlib import Path
import xml.etree.ElementTree as ET

PROJECT_ROOT = Path(__file__).resolve().parent.parent
GPX_DIR = PROJECT_ROOT / "content" / "gpx"
OVERVIEW_DIR = GPX_DIR / "overview"

MAX_POINTS = 1500


def local_name(tag):
    return tag.split("}")[-1]


def simplify_segment(segment, max_points):
    points = [child for child in segment if local_name(child.tag) == "trkpt"]

    if len(points) <= max_points:
        return

    step = (len(points) - 1) / (max_points - 1)

    keep_indices = {
        round(i * step)
        for i in range(max_points)
    }

    for index, point in enumerate(points):
        if index not in keep_indices:
            segment.remove(point)


def strip_point_data(root):
    for element in root.iter():
        if local_name(element.tag) != "trkpt":
            continue

        for child in list(element):
            element.remove(child)


def simplify_gpx(source, destination):
    tree = ET.parse(source)
    root = tree.getroot()

    segments = [
        element
        for element in root.iter()
        if local_name(element.tag) == "trkseg"
    ]

    total_points = sum(
        len([
            child
            for child in segment
            if local_name(child.tag) == "trkpt"
        ])
        for segment in segments
    )

    if total_points > MAX_POINTS and segments:
        points_per_segment = max(2, MAX_POINTS // len(segments))

        for segment in segments:
            simplify_segment(segment, points_per_segment)

    strip_point_data(root)

    destination.parent.mkdir(parents=True, exist_ok=True)

    tree.write(
        destination,
        encoding="utf-8",
        xml_declaration=True,
    )


def main():
    OVERVIEW_DIR.mkdir(parents=True, exist_ok=True)

    files = sorted(GPX_DIR.glob("*.gpx"))

    if not files:
        print("Keine GPX-Dateien gefunden.")
        return

    processed = 0
    skipped = 0

    for source in files:
        destination = OVERVIEW_DIR / source.name

        # Nur bearbeiten, wenn:
        # - noch keine Overview-Datei existiert
        # - oder das Original neuer ist
        if destination.exists():
            source_modified = source.stat().st_mtime
            destination_modified = destination.stat().st_mtime

            if destination_modified >= source_modified:
                print(f"Übersprungen: {source.name}")
                skipped += 1
                continue

        simplify_gpx(source, destination)

        source_size = source.stat().st_size / 1024 / 1024
        destination_size = destination.stat().st_size / 1024

        print(
            f"Erstellt: {source.name}: "
            f"{source_size:.2f} MB -> {destination_size:.0f} KB"
        )

        processed += 1

    print()
    print(f"Fertig: {processed} bearbeitet, {skipped} übersprungen.")

if __name__ == "__main__":
    main()