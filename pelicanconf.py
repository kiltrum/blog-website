#!/usr/bin/env python
# -*- coding: utf-8 -*- #

AUTHOR = 'Vanessa und Kilian'
SITENAME = 'TrailnError'
SITEURL = ''

PATH = 'content'

TIMEZONE = 'Europe/Vienna'

DEFAULT_LANG = 'de'

DEFAULT_PAGINATION = 10

STATIC_PATHS = ['images', 'gpx']

THEME = 'theme'

RELATIVE_URLS = True

# Multilingual support via i18n_subsites plugin
PLUGINS = ['i18n_subsites']

JINJA_ENVIRONMENT = {
    'extensions': ['jinja2.ext.i18n'],
}

LANGUAGES = {
    'de': {},
    'en': {}
}

I18N_SUBSITES = {
    'en': {
        'SITENAME': 'TrailnError',
        'AUTHOR': 'Vanessa and Kilian'
    }
}

# Centralized UI translations for German and English
UI_TRANSLATIONS = {
    'de': {
        'nav_bergsteigen': 'Bergsteigen',
        'nav_bikepacking': 'Bikepacking',
        'nav_berglaufen': 'Berglaufen',
        'nav_about': 'Über uns',
        'nav_menu_open': 'Menü öffnen',
        'nav_menu_close': 'Menü schließen',

        'search_placeholder': 'Touren durchsuchen...',
        'search_no_results': 'Keine Treffer',

        'filter_all': 'Alle',

        'map_title': 'Unsere Touren',
        'map_reset': 'Zurücksetzen',
        'map_expand': 'Karte vergrößern',
        'map_collapse': 'Karte verkleinern',
        'all_tours': 'Alle Touren',

        'gpx_download': 'GPX herunterladen',
        'gpx_error_no_points': 'Keine Trackpunkte in der GPX-Datei gefunden',
        'gpx_error_load_failed': 'Die Route konnte nicht geladen werden',

        'lightbox_title': 'Bildansicht',
        'lightbox_close': 'Bildansicht schließen',

        'elevation_profile_aria': 'Höhenprofil über {distance} Kilometer',

        'distance': 'Distanz',
        'ascent': 'HM bergauf',
        'descent': 'HM bergab',
        'highest_point': 'Höchster Punkt',
        'duration': 'Dauer',
        'difficulty': 'Schwierigkeit',
        'location': 'Ort',

        'language_de': 'Deutsch',
        'language_en': 'English'
    },

    'en': {
        'nav_bergsteigen': 'Mountaineering',
        'nav_bikepacking': 'Bikepacking',
        'nav_berglaufen': 'Trail Running',
        'nav_about': 'About',
        'nav_menu_open': 'Open menu',
        'nav_menu_close': 'Close menu',

        'search_placeholder': 'Search tours...',
        'search_no_results': 'No results',

        'filter_all': 'All',

        'map_title': 'Our Tours',
        'map_reset': 'Reset',
        'map_expand': 'Expand map',
        'map_collapse': 'Collapse map',
        'all_tours': 'All tours',

        'gpx_download': 'Download GPX',
        'gpx_error_no_points': 'No track points found in the GPX file',
        'gpx_error_load_failed': 'The route could not be loaded',

        'lightbox_title': 'Image viewer',
        'lightbox_close': 'Close image viewer',

        'elevation_profile_aria': 'Elevation profile over {distance} kilometers',

        'distance': 'Distance',
        'ascent': 'Elevation gain',
        'descent': 'Elevation loss',
        'highest_point': 'Highest point',
        'duration': 'Duration',
        'difficulty': 'Difficulty',
        'location': 'Location',

        'language_de': 'Deutsch',
        'language_en': 'English'
    }
}

FEATURED_CATEGORIES = [
    {
        'name': 'Bergsteigen',
        'slug': 'bergsteigen',
        'image': '/images/categories/bergsteigen.jpg',
        'hero_image': '/images/categories/bergsteigen-hero.jpg',
        'mobile_position': '70% center',
        'description': 'Hochtouren, Grate und Skitouren – unsere Touren und Erfahrungen aus den Bergen.'
    },
    {
        'name': 'Bikepacking',
        'slug': 'bikepacking',
        'image': '/images/categories/bikepacking.jpg',
        'hero_image': '/images/categories/bikepacking-hero.jpg',
        'mobile_position': '75% center',
        'description': 'Mehrtagestouren auf zwei Rädern – von kurzen Trips bis zu langen Reisen mit vollgepackten Taschen.'
    },
    {
        'name': 'Berglaufen',
        'slug': 'berglaufen',
        'image': '/images/categories/berglaufen.jpg',
        'hero_image': '/images/categories/berglaufen-hero.jpg',
        'mobile_position': '42% center',
        'description': 'Lange Anstiege, technische Trails und schnelle Runden durch die Berge.'
    }
]
