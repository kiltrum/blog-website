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
