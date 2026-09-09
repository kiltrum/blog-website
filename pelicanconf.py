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
        'AUTHOR': 'Vanessa and Kilian',
        'CURRENT_LANG': 'en'
    }
}

# Centralized UI translations for German and English
UI_TRANSLATIONS = {
    'de': {
        'nav_bergsteigen': 'Bergsteigen',
        'nav_bikepacking': 'Bikepacking',
        'nav_berglaufen': 'Berglaufen',
        'nav_tour_map': 'Tourenkarte',
        'nav_about': 'Über uns',
        'nav_menu_open': 'Menü öffnen',
        'nav_menu_close': 'Menü schließen',

        'search_placeholder': 'Touren durchsuchen...',
        'search_no_results': 'Keine Treffer',

        'filter_all': 'Alle',

        'category_label': 'Kategorie',
        'category_intro': 'Entdecke Abenteuer und Berichte aus {category} – von Bergpässen bis zu langen Touren im Gelände.',
        'category_empty_state': 'Noch keine Einträge in dieser Kategorie.',
        'related_articles_title': 'Das könnte dich auch interessieren',

        'home_hero_eyebrow': 'Berg & Rad Abenteuer',
        'home_title': 'TrailnError',
        'home_about_label': 'Über uns',
        'home_about_title': 'Große und kleine Abenteuer',
        'home_about_text': 'Wir sind Kilian und Vanessa. Willkommen bei unseren Abenteuern! Egal wie hoch der Berg oder wie lang die Tour, wir möchten hier unsere Erlebnisse und Erfahrungen mit dir teilen.',
        'home_about_link': 'Mehr über uns →',
        'home_tours_label': 'Routenübersicht',
        'home_tours_title': 'Unsere Touren',
        'home_latest_label': 'Neueste Einträge',
        'home_latest_title': 'Aktuelle Abenteuer',
        'home_empty_state': 'Mehr Abenteuer folgen bald.',

        'map_title': 'Unsere Touren',
        'map_reset': 'Zurücksetzen',
        'map_expand': 'Karte vergrößern',
        'map_collapse': 'Karte verkleinern',
        'all_tours': 'Alle Touren',
        'all_tours_show': 'Alle Touren anzeigen',
        'tour_open': 'Tour öffnen',
        'tour_count': 'Touren',

        'gpx_download': 'GPX herunterladen',
        'gpx_no_track_points': 'Keine Trackpunkte im GPX-Datei gefunden.',
        'route_load_error': 'Die Route konnte nicht geladen werden.',
        'gpx_error_no_points': 'Keine Trackpunkte in der GPX-Datei gefunden',
        'gpx_error_load_failed': 'Die Route konnte nicht geladen werden',

        'lightbox_title': 'Bildansicht',
        'lightbox_close': 'Bildansicht schließen',
        'elevation_profile': 'Höhenprofil',

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
        'nav_tour_map': 'Tour Map',
        'nav_about': 'About',
        'nav_menu_open': 'Open menu',
        'nav_menu_close': 'Close menu',

        'search_placeholder': 'Search tours...',
        'search_no_results': 'No results',

        'filter_all': 'All',

        'category_label': 'Category',
        'category_intro': 'Discover adventures and stories from {category} – from mountain passes to long tours in the backcountry.',
        'category_empty_state': 'No entries in this category yet.',
        'related_articles_title': 'You might also be interested in',

        'home_hero_eyebrow': 'Mountain & Bike Adventures',
        'home_title': 'TrailnError',
        'home_about_label': 'About us',
        'home_about_title': 'Big and small adventures',
        'home_about_text': 'We are Kilian and Vanessa. Welcome to our adventures! No matter how high the mountain or how long the tour, we want to share our experiences and stories with you.',
        'home_about_link': 'More about us →',
        'home_tours_label': 'Route overview',
        'home_tours_title': 'All Tour Map',
        'home_latest_label': 'Latest entries',
        'home_latest_title': 'Current adventures',
        'home_empty_state': 'More adventures coming soon.',

        'map_title': 'Our Tours',
        'map_reset': 'Reset',
        'map_expand': 'Zoom in',
        'map_collapse': 'Zoom out',
        'all_tours': 'All Tours',
        'all_tours_show': 'Show all tours',
        'tour_open': 'Open tour',
        'tour_count': 'Tours',

        'gpx_download': 'Download GPX',
        'gpx_no_track_points': 'No track points found in the GPX file.',
        'route_load_error': 'The route could not be loaded.',
        'gpx_error_no_points': 'No track points found in the GPX file',
        'gpx_error_load_failed': 'The route could not be loaded',

        'lightbox_title': 'Image viewer',
        'lightbox_close': 'Close image viewer',
        'elevation_profile': 'Elevation profile',

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

TOURTYPE_TRANSLATIONS = {
    'Gravel': {'de': 'Gravel', 'en': 'Gravel'},
    'Hochtour': {'de': 'Hochtour', 'en': 'Alpine Tour'},
    'Skitour': {'de': 'Skitour', 'en': 'Ski Tour'}
}

FEATURED_CATEGORIES = [
    {
        'name': 'Bergsteigen',
        'slug': 'bergsteigen',
        'label': {'de': 'Bergsteigen', 'en': 'Mountaineering'},
        'image': '/images/categories/bergsteigen.jpg',
        'hero_image': '/images/categories/bergsteigen-hero.jpg',
        'mobile_position': '70% center',
        'description': 'Hochtouren, Grate und Skitouren – unsere Touren und Erfahrungen aus den Bergen.',
        'description_i18n': {
            'de': 'Hochtouren, Grate und Skitouren – unsere Touren und Erfahrungen aus den Bergen.',
            'en': 'Alpine tours, ridges and ski tours – our mountain adventures and experiences.'
        }
    },
    {
        'name': 'Bikepacking',
        'slug': 'bikepacking',
        'label': {'de': 'Bikepacking', 'en': 'Bikepacking'},
        'image': '/images/categories/bikepacking.jpg',
        'hero_image': '/images/categories/bikepacking-hero.jpg',
        'mobile_position': '75% center',
        'description': 'Mehrtagestouren auf zwei Rädern – von kurzen Trips bis zu langen Reisen mit vollgepackten Taschen.',
        'description_i18n': {
            'de': 'Mehrtagestouren auf zwei Rädern – von kurzen Trips bis zu langen Reisen mit vollgepackten Taschen.',
            'en': 'Multi-day tours on two wheels – from short trips to long journeys with fully loaded bags.'
        }
    },
    {
        'name': 'Berglaufen',
        'slug': 'berglaufen',
        'label': {'de': 'Berglaufen', 'en': 'Trail Running'},
        'image': '/images/categories/berglaufen.jpg',
        'hero_image': '/images/categories/berglaufen-hero.jpg',
        'mobile_position': '42% center',
        'description': 'Lange Anstiege, technische Trails und schnelle Runden durch die Berge.',
        'description_i18n': {
            'de': 'Lange Anstiege, technische Trails und schnelle Runden durch die Berge.',
            'en': 'Long climbs, technical trails and fast loops through the mountains.'
        }
    }
]
