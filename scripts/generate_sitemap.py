from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, ElementTree, indent

BASE_URL = "https://trailnerror.at"
OUTPUT_DIR = Path("output")
SITEMAP_PATH = OUTPUT_DIR / "sitemap.xml"

EXCLUDED_FILES = {
    "archives.html",
    "authors.html",
    "categories.html",
    "tags.html",
}

urls = set()

for html_file in OUTPUT_DIR.rglob("*.html"):
    relative_path = html_file.relative_to(OUTPUT_DIR).as_posix()

    # Drafts niemals in die Sitemap aufnehmen
    if "/drafts/" in f"/{relative_path}":
        continue

    # Autoren-Seiten nicht indexieren
    if relative_path.startswith("author/") or relative_path.startswith("en/author/"):
        continue

    # Archiv-, Autoren-, Kategorie-Übersicht und Tag-Übersicht auslassen
    if relative_path in EXCLUDED_FILES:
        continue

    if relative_path.startswith("en/") and relative_path[3:] in EXCLUDED_FILES:
        continue

    # Pagination wie index2.html, index3.html usw. auslassen
    filename = html_file.name
    if filename.startswith("index") and filename != "index.html":
        suffix = filename.removeprefix("index").removesuffix(".html")
        if suffix.isdigit():
            continue

    if relative_path == "index.html":
        url = f"{BASE_URL}/"
    elif relative_path == "en/index.html":
        url = f"{BASE_URL}/en/"
    elif relative_path.endswith("/index.html"):
        url = f"{BASE_URL}/{relative_path[:-10]}"
    else:
        url = f"{BASE_URL}/{relative_path}"

    urls.add(url)

urlset = Element(
    "urlset",
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9",
)

for url in sorted(urls):
    url_element = SubElement(urlset, "url")
    loc = SubElement(url_element, "loc")
    loc.text = url

tree = ElementTree(urlset)

# Nur zur besseren Lesbarkeit der XML-Datei
indent(tree, space="  ")

tree.write(
    SITEMAP_PATH,
    encoding="utf-8",
    xml_declaration=True,
)

print(f"Generated {SITEMAP_PATH} with {len(urls)} URLs.")