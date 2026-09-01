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
