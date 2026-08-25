# Project overview

This is a personal travel and bikepacking website built with Pelican.

The website contains:
- travel reports
- bikepacking tours
- GPX tracks
- images
- static pages

## Tech stack

Use:
- Python
- Pelican
- Markdown
- Jinja2 templates
- HTML
- CSS
- vanilla JavaScript

Do not introduce frameworks such as:
- React
- Vue
- Angular
- Bootstrap
- Tailwind

unless explicitly requested.

## Project structure

- Blog content is stored in `content/`
- GPX files are stored in `content/gpx/`
- Images are stored in `content/images/`
- Static pages are stored in `content/pages/`
- Jinja templates are stored in `theme/templates/`
- CSS is stored in `theme/static/css/`
- JavaScript is stored in `theme/static/js/`

## Development guidelines

- Keep the website lightweight and fast.
- Prefer semantic HTML.
- Use responsive design and mobile-first CSS.
- Avoid unnecessary JavaScript.
- Keep styling separate from content.
- Reuse existing templates and CSS instead of duplicating code.
- Preserve Pelican and Jinja2 functionality.
- Keep the code simple enough for a beginner to understand.

## Copilot behavior

When making changes:
- First inspect the existing project structure.
- Modify existing files whenever possible.
- Do not create unnecessary files or dependencies.
- Explain important architectural changes.
- Avoid rewriting large parts of the project unless necessary.
- Keep changes small and easy to test.