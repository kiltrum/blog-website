# Berg & Rad Abenteuer

Starter-Setup für einen persönlichen Cycling- und Mountain-Tour-Blog mit Pelican.

## Conda-Umgebung erstellen

```bash
conda env create -f environment.yml
conda activate blog
```

## Website lokal bauen

```bash
pelican content
pelican content -r -l
```
dann auf browser öffnen: http://localhost:8000

## Preview-Server starten

```bash
pelican --listen
```
## gpx verkleinern

Originale gpx datei in gpx ordner laden und dann folgendes ausführen:

```bash
cd ~/Dokumente/TrailError/blog-website
python scripts/simplify_gpx.py
```

## Bilder verkleinern

```bash
cd ~/Dokumente/TrailError/blog-website/content/images/articles/ORDNERNAME

magick mogrify -resize "2000x2000>" -strip -quality 82 *.jpg
```

## Production Build and sitemap creation


Optional noch kompakter als kompletter Ablauf:

```bash
pelican content -s publishconf.py
python scripts/generate_sitemap.py