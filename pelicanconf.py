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

FEATURED_CATEGORIES = [
    {
        'name': 'Bergsteigen',
        'slug': 'bergsteigen',
        'image': '/images/categories/bergsteigen.jpg',
        'hero_image': '/images/categories/bergsteigen-hero.jpg'
    },
    {
        'name': 'Bikepacking',
        'slug': 'bikepacking',
        'image': '/images/categories/bikepacking.jpg',
        'hero_image': '/images/categories/bikepacking-hero.jpg'
    },
    {
        'name': 'Berglaufen',
        'slug': 'berglaufen',
        'image': '/images/categories/berglaufen.jpg',
        'hero_image': '/images/categories/berglaufen-hero.jpg'
    }
]
