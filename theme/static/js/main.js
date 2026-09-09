const uiTranslations = (function () {
    const element = document.getElementById('ui-translations');

    if (!element) {
        return {};
    }

    try {
        return JSON.parse(element.textContent);
    } catch (error) {
        return {};
    }
})();

function translateUi(key, fallback) {
    return uiTranslations[key] || fallback;
}

function buildBasemapLayers() {
    const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    });

    const openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; OpenStreetMap contributors; tiles: &copy; OpenTopoMap (CC-BY-SA)'
    });
    const alpenkarte = L.tileLayer(
    'https://cdn.schneidergeo.com/tiles/{z}/{x}/{y}.png',
    {
        maxZoom: 16,
        attribution: 'Alpenkarte: © Alpenkarte.eu, Kartendaten: © OpenStreetMap-Mitwirkende'
    }
);

    return {
        openStreetMap: openStreetMap,
        openTopoMap: openTopoMap,
        alpenkarte: alpenkarte,
    };
}

function addBasemapControl(map, defaultBasemapName) {
    const basemaps = buildBasemapLayers();
    const selectedBasemap = defaultBasemapName === 'openTopoMap' ? basemaps.openTopoMap : basemaps.openStreetMap;

    selectedBasemap.addTo(map);

    L.control.layers({
        'Alpenkarte': basemaps.alpenkarte,
        'OpenStreetMap': basemaps.openStreetMap,
        'OpenTopoMap': basemaps.openTopoMap
    }, null, {
        position: 'bottomleft',
        collapsed: true
    }).addTo(map);
}

document.addEventListener('DOMContentLoaded', function () {
    initializeNavigation();
    initializeArticleLightbox();
    initializeTourTypeFilters();
    initializeSiteSearch();
    const mapContainers = document.querySelectorAll('[data-gpx-map]');

    if (typeof L === 'undefined') {
        return;
    }

    if (mapContainers.length) {
        mapContainers.forEach(function (container) {
        const gpxUrl = container.dataset.gpxUrl;
        const title = container.dataset.gpxTitle || 'Route';

        if (!gpxUrl) {
            return;
        }

        const map = L.map(container, {
            scrollWheelZoom: true,
            zoomControl: true
        });

        const gpxDownloadControl = L.Control.extend({
            options: {
                position: 'bottomright'
            },
            onAdd: function () {
                const controlContainer = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-custom-gpx-control');
                const button = L.DomUtil.create('button', 'leaflet-custom-gpx-control__button', controlContainer);
                const fileName = gpxUrl.split('/').pop() || 'route.gpx';

                button.type = 'button';
                button.title = translateUi('gpx_download', 'GPX herunterladen');
                button.setAttribute('aria-label', translateUi('gpx_download', 'GPX herunterladen'));
                button.innerHTML = '<span aria-hidden="true">↓</span><span>GPX</span>';

                L.DomEvent.disableClickPropagation(controlContainer);
                L.DomEvent.on(button, 'click', function (event) {
                    L.DomEvent.stopPropagation(event);
                    L.DomEvent.preventDefault(event);

                    const link = document.createElement('a');
                    link.href = gpxUrl;
                    link.download = fileName;
                    link.rel = 'noopener';
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                });

                return controlContainer;
            }
        });

        const expandMapControl = L.Control.extend({
            options: {
                position: 'bottomleft'
            },
            onAdd: function () {
                const controlContainer = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-expand-map-control');
                const button = L.DomUtil.create('button', 'leaflet-expand-map-control__button', controlContainer);

                button.type = 'button';
                button.title = translateUi('map_expand', 'Karte vergrößern');
                button.setAttribute('aria-label', translateUi('map_expand', 'Karte vergrößern'));
                button.setAttribute('data-expanded', 'false');
                button.innerHTML = '<span aria-hidden="true">⛶</span>';

                L.DomEvent.disableClickPropagation(controlContainer);
                L.DomEvent.on(button, 'click', function (event) {
                    L.DomEvent.stopPropagation(event);
                    L.DomEvent.preventDefault(event);

                    const isExpanded = button.getAttribute('data-expanded') === 'true';
                    if (isExpanded) {
                        collapseMap();
                    } else {
                        expandMap();
                    }
                });

                return controlContainer;
            }
        });

        function expandMap() {
            container.classList.add('article-gpx__map--expanded');
            document.body.classList.add('map-expanded');
            const expandButton = document.querySelector('.leaflet-expand-map-control__button');
            expandButton.setAttribute('data-expanded', 'true');
            expandButton.title = translateUi('map_collapse', 'Karte verkleinern');
            expandButton.setAttribute('aria-label', translateUi('map_collapse', 'Karte verkleinern'));
            expandButton.innerHTML = '<span aria-hidden="true">⊗</span>';

            requestAnimationFrame(function () {
                map.invalidateSize();
            });
        }

        function collapseMap() {
            container.classList.remove('article-gpx__map--expanded');
            document.body.classList.remove('map-expanded');
            const expandButton = document.querySelector('.leaflet-expand-map-control__button');
            expandButton.setAttribute('data-expanded', 'false');
            expandButton.title = translateUi('map_expand', 'Karte vergrößern');
            expandButton.setAttribute('aria-label', translateUi('map_expand', 'Karte vergrößern'));
            expandButton.innerHTML = '<span aria-hidden="true">⛶</span>';

            requestAnimationFrame(function () {
                map.invalidateSize();
            });
        }

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && container.classList.contains('article-gpx__map--expanded')) {
                collapseMap();
            }
        });

        map.addControl(new gpxDownloadControl());
        map.addControl(new expandMapControl());
        addBasemapControl(map, 'openTopoMap');

        fetch(gpxUrl)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('GPX file not found');
                }
                return response.text();
            })
            .then(function (gpxText) {
                const parser = new DOMParser();
                const xml = parser.parseFromString(gpxText, 'application/xml');
                const points = Array.from(xml.querySelectorAll('trkpt'));

                if (!points.length) {
                    const fallback = document.createElement('p');
                    fallback.textContent = translateUi('gpx_no_track_points', 'Keine Trackpunkte im GPX-Datei gefunden.');
                    container.appendChild(fallback);
                    return;
                }

                const coords = points.map(function (point) {
                    return [
                        parseFloat(point.getAttribute('lat')),
                        parseFloat(point.getAttribute('lon'))
                    ];
                }).filter(function (coord) {
                    return !Number.isNaN(coord[0]) && !Number.isNaN(coord[1]);
                });

                if (!coords.length) {
                    return;
                }

                const polyline = L.polyline(coords, {
                    color: '#ff5a00',
                    weight: 4,
                    opacity: 0.9
                }).addTo(map);

                map.fitBounds(polyline.getBounds(), { padding: [20, 20] });

                const startMarker = L.marker(coords[0]).addTo(map);
                startMarker.bindPopup('<strong>' + title + '</strong><br>Start');

                const profileContainer = container.parentElement.querySelector('[data-gpx-profile]');
                const elevationData = buildElevationData(points);
                const trackStats = calculateTrackStats(points);

                if (profileContainer && elevationData.length > 1) {
                    renderElevationProfile(profileContainer, elevationData, map);
                }

                updateTourStatistics(trackStats);
            })
            .catch(function () {
                const error = document.createElement('p');
                error.textContent = translateUi('route_load_error', 'Die Route konnte nicht geladen werden.');
                container.appendChild(error);
            });
        });
    }

    initializeAllToursMap();
});

function initializeSiteSearch() {
    const toggle = document.querySelector('.search-toggle');
    const panel = document.querySelector('#site-search');
    const input = document.querySelector('#site-search-input');
    const results = document.querySelector('#site-search-results');
    const dataElement = document.querySelector('#article-search-data');

    if (!toggle || !panel || !input || !results || !dataElement) {
        return;
    }

    let articles;

    try {
        articles = JSON.parse(dataElement.textContent);
    } catch (error) {
        console.error('Unable to parse article search data.', error);
        return;
    }

    function closeSearch() {
        panel.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        input.value = '';
        results.innerHTML = '';
    }

    function renderResults() {
        const query = input.value.trim().toLocaleLowerCase();
        results.innerHTML = '';

        if (!query) {
            return;
        }

        const matches = articles.filter(function (article) {
            return [article.title, article.summary, article.category, article.tourType, article.location, article.url]
                .some(function (value) {
                    return String(value || '').toLocaleLowerCase().includes(query);
                });
        });

        if (!matches.length) {
            results.innerHTML = '<p class="site-search__empty">' + translateUi('search_no_results', 'Keine Treffer') + '</p>';
            return;
        }

        matches.forEach(function (article) {
            const link = document.createElement('a');
            link.className = 'site-search__result';
            link.href = article.url;
            link.innerHTML = '<strong>' + escapeHtml(article.title) + '</strong>'
                + '<small>' + [article.category, article.tourType, article.location]
                    .filter(Boolean).map(escapeHtml).join(' · ') + '</small>';
            results.appendChild(link);
        });
    }

    toggle.addEventListener('click', function () {
        const isOpen = !panel.hidden;
        panel.hidden = isOpen;
        toggle.setAttribute('aria-expanded', String(!isOpen));

        if (isOpen) {
            closeSearch();
        } else {
            input.focus();
        }
    });

    input.addEventListener('input', renderResults);
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !panel.hidden) {
            closeSearch();
            toggle.focus();
        }
    });
    document.addEventListener('click', function (event) {
        if (!panel.hidden && !panel.contains(event.target) && !toggle.contains(event.target)) {
            closeSearch();
        }
    });
}

function initializeTourTypeFilters() {
    const filterNavigation = document.querySelector('[data-tour-type-filters]');

    if (!filterNavigation) {
        return;
    }

    const cards = document.querySelectorAll('.category-post-card[data-tour-type]');
    const filters = filterNavigation.querySelectorAll('[data-tour-type]');

    filters.forEach(function (filter) {
        filter.addEventListener('click', function () {
            const selectedType = filter.dataset.tourType;

            filters.forEach(function (item) {
                const isActive = item === filter;
                item.classList.toggle('is-active', isActive);
                item.setAttribute('aria-pressed', String(isActive));
            });

            cards.forEach(function (card) {
                const cardType = card.dataset.tourType;
                card.hidden = selectedType !== 'all' && cardType !== selectedType;
            });
        });
    });
}

function initializeArticleLightbox() {
    const articleImages = document.querySelectorAll('.article-body img');

    if (!articleImages.length) {
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Bildansicht');
    overlay.innerHTML = '<button class="lightbox__close" type="button" aria-label="Bildansicht schließen">&times;</button>'
        + '<figure class="lightbox__figure">'
        + '<img class="lightbox__image" alt="">'
        + '<figcaption class="lightbox__caption"></figcaption>'
        + '</figure>';
    document.body.appendChild(overlay);

    const closeButton = overlay.querySelector('.lightbox__close');
    const lightboxImage = overlay.querySelector('.lightbox__image');
    const caption = overlay.querySelector('.lightbox__caption');
    const figure = overlay.querySelector('.lightbox__figure');
    let previouslyFocusedImage = null;
    let currentImageIndex = -1;

    function getFigureCaptionText(image) {
        const fig = image.closest('figure');

        if (!fig) {
            return '';
        }

        const figureCaption = fig.querySelector('figcaption');

        if (!figureCaption) {
            return '';
        }

        return figureCaption.textContent.trim();
    }

    function closeLightbox() {
        overlay.classList.remove('is-open');
        document.body.classList.remove('lightbox-open');
        lightboxImage.removeAttribute('src');
        caption.textContent = '';
        caption.hidden = true;
        currentImageIndex = -1;

        if (previouslyFocusedImage) {
            previouslyFocusedImage.focus();
        }
    }

    function showImageByIndex(index) {
        if (index < 0 || index >= articleImages.length) {
            return;
        }

        currentImageIndex = index;
        const image = articleImages[index];
        lightboxImage.src = image.currentSrc || image.src;
        lightboxImage.alt = image.alt || '';

        const captionText = getFigureCaptionText(image);
        caption.textContent = captionText;
        caption.hidden = !captionText;
    }

    function openLightbox(image) {
        previouslyFocusedImage = image;
        currentImageIndex = Array.from(articleImages).indexOf(image);
        showImageByIndex(currentImageIndex);

        overlay.classList.add('is-open');
        document.body.classList.add('lightbox-open');
        closeButton.focus();
    }

    function navigateLightbox(direction) {
        if (!overlay.classList.contains('is-open') || currentImageIndex === -1) {
            return;
        }

        let nextIndex = currentImageIndex + direction;

        if (nextIndex < 0) {
            nextIndex = articleImages.length - 1;
        } else if (nextIndex >= articleImages.length) {
            nextIndex = 0;
        }

        showImageByIndex(nextIndex);
    }

    articleImages.forEach(function (image) {
        image.setAttribute('tabindex', '0');
        image.setAttribute('role', 'button');
        image.classList.add('article-lightbox-trigger');
        image.addEventListener('click', function () {
            openLightbox(image);
        });
        image.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openLightbox(image);
            }
        });
    });

    closeButton.addEventListener('click', closeLightbox);
    lightboxImage.addEventListener('click', closeLightbox);
    caption.addEventListener('click', closeLightbox);
    figure.addEventListener('click', function (event) {
        if (event.target === figure) {
            closeLightbox();
        }
    });
    overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
            closeLightbox();
        }
    });
    document.addEventListener('keydown', function (event) {
        if (!overlay.classList.contains('is-open')) {
            return;
        }

        if (event.key === 'Escape') {
            closeLightbox();
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            navigateLightbox(1);
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            navigateLightbox(-1);
        }
    });
}

function initializeNavigation() {
    const toggle = document.querySelector('.nav-toggle');
    const navigation = document.querySelector('.site-nav');

    if (!toggle || !navigation) {
        return;
    }

    toggle.addEventListener('click', function () {
        const isOpen = navigation.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
    });

    navigation.addEventListener('click', function (event) {
        if (event.target.matches('a')) {
            navigation.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Menü öffnen');
        }
    });

    toggle.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            navigation.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Menü öffnen');
        }
    });
}

function initializeAllToursMap() {
    const mapContainer = document.querySelector('[data-all-tours-map]');
    const dataElement = document.getElementById('all-tours-data');
    const filterContainer = document.querySelector('[data-category-filters]');

    if (!mapContainer || !dataElement) {
        return;
    }

    let tours;

    try {
        tours = JSON.parse(dataElement.textContent);
    } catch (error) {
        console.error('Unable to parse homepage GPX tour data.', error);
        return;
    }

    const map = L.map(mapContainer, {
        scrollWheelZoom: false,
        zoomControl: true
    });

    addBasemapControl(map, 'openStreetMap');

    const routeBounds = L.latLngBounds([]);
    const layers = [];
    const overviewMarkers = L.layerGroup().addTo(map);
    const trackLayer = L.layerGroup().addTo(map);
    const overviewZoom = 6;
    let selectedTour = null;
    let overviewInitialized = false;
    let completedTours = 0;
    let selectedCategorySlug = 'all';

    function getVisibleLayers() {
        return layers.filter(function (layer) {
            if (selectedCategorySlug === 'all') {
                return true;
            }
            return layer.tour.categorySlug === selectedCategorySlug;
        });
    }

    function fitVisibleTours() {
        const bounds = L.latLngBounds([]);

        getVisibleLayers().forEach(function (layer) {
            bounds.extend(layer.route.getBounds());
        });

        if (bounds.isValid()) {
            map.fitBounds(bounds, {
                padding: [24, 24],
                maxZoom: overviewZoom - 1
            });
        }
    }

    function updateCategoryFilter(slug) {
        selectedCategorySlug = slug;
        if (filterContainer) {
            Array.from(filterContainer.querySelectorAll('.category-filter')).forEach(function (btn) {
                const isActive = btn.getAttribute('data-category-slug') === slug;
                btn.classList.toggle('is-active', isActive);
                btn.setAttribute('aria-pressed', String(isActive));
            });
        }
        selectedTour = null;
        //overviewInitialized = false;
        fitVisibleTours();
        refreshMapMode();
    }

    if (filterContainer) {
        filterContainer.addEventListener('click', function (event) {
            if (event.target.classList.contains('category-filter')) {
                const slug = event.target.getAttribute('data-category-slug');
                updateCategoryFilter(slug);
            }
        });
    }

    const resetControl = L.control({ position: 'topright' });
    resetControl.onAdd = function () {
        const element = L.DomUtil.create('button', 'all-tours__reset-control');
        element.type = 'button';
        element.textContent = translateUi('all_tours', 'Alle Touren');
        element.title = translateUi('all_tours_show', 'Alle Touren anzeigen');
        L.DomEvent.disableClickPropagation(element);
        L.DomEvent.on(element, 'click', showOverview);
        return element;
    };
    resetControl.addTo(map);

    tours.forEach(function (tour) {
        fetch(tour.gpx)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('GPX file not found');
                }
                return response.text();
            })
            .then(function (gpxText) {
                const xml = new DOMParser().parseFromString(gpxText, 'application/xml');
                const coordinates = Array.from(xml.querySelectorAll('trkpt')).map(function (point) {
                    return [parseFloat(point.getAttribute('lat')), parseFloat(point.getAttribute('lon'))];
                }).filter(function (coordinate) {
                    return !Number.isNaN(coordinate[0]) && !Number.isNaN(coordinate[1]);
                });

                if (!coordinates.length) {
                    throw new Error('GPX file contains no valid track points');
                }

                const route = L.polyline(coordinates, {
                    color: '#ff5a00',
                    weight: 3,
                    opacity: 0.55
                });
                const hitArea = L.polyline(coordinates, {
                    color: '#ff5a00',
                    weight: 14,
                    opacity: 0.01,
                    interactive: true
                });
                const layer = { route: route, hitArea: hitArea };
                layers.push(layer);
                routeBounds.extend(route.getBounds());

                layer.markerLocation = coordinates[0];
                layer.tour = tour;
                completedTours += 1;

                function highlight() {
                    layers.forEach(function (item) {
                        item.route.setStyle({ opacity: item === layer ? 1 : 0.18 });
                    });
                    route.setStyle({ weight: 5 });
                }

                function resetHighlight() {
                    layers.forEach(function (item) {
                        item.route.setStyle({ opacity: 0.55, weight: 3 });
                    });
                }

                hitArea.bindTooltip(
                    '<strong>' + escapeHtml(tour.title) + '</strong>'
                    + (tour.category ? '<br><small>' + escapeHtml(tour.category) + '</small>' : ''),
                    { sticky: true }
                );
                hitArea.on('mouseover', function () {
                    highlight();
                });
                hitArea.on('mouseout', function () {
                    resetHighlight();
                });
                hitArea.on('click', function () {
                    highlight();
                    map.fitBounds(route.getBounds(), { padding: [24, 24], maxZoom: 14 });
                    hitArea.bindPopup(
                        '<strong>' + escapeHtml(tour.title) + '</strong>'
                        + '<br><a href="' + encodeURI(tour.url) + '">' + translateUi('tour_open', 'Tour öffnen') + '</a>'
                    ).openPopup();
                });

                refreshMapMode();
            })
            .catch(function (error) {
                completedTours += 1;
                console.error('Unable to load GPX route for "' + tour.title + '" (' + tour.gpx + ').', error);
                if (completedTours === tours.length) {
                    showOverview();
                }
            });
    });

    map.on('zoomend', refreshMapMode);

    function refreshMapMode() {
        if (!overviewInitialized && completedTours === tours.length && routeBounds.isValid()) {
            overviewInitialized = true;
            map.fitBounds(routeBounds, { padding: [24, 24], maxZoom: overviewZoom - 1 });
        }

        if (map.getZoom() < overviewZoom) {
            trackLayer.clearLayers();
            renderOverviewMarkers();
            return;
        }

        overviewMarkers.clearLayers();
        trackLayer.clearLayers();

        getVisibleLayers().forEach(function (layer) {
            trackLayer.addLayer(layer.route);
            trackLayer.addLayer(layer.hitArea);
        });
        updateTrackStyles();
    }

    function updateTrackStyles() {
        getVisibleLayers().forEach(function (layer) {
            layer.route.setStyle({
                opacity: selectedTour && selectedTour !== layer ? 0.18 : (selectedTour === layer ? 1 : 0.75),
                weight: selectedTour === layer ? 5 : 3
            });
        });
    }

    function renderOverviewMarkers() {
        overviewMarkers.clearLayers();
        const groups = [];
        const clusterDistance = 50;
        const zoom = Math.max(map.getZoom(), 1);

        getVisibleLayers().forEach(function (layer) {
            const point = map.project(layer.markerLocation, zoom);
            let group = groups.find(function (candidate) {
                return point.distanceTo(candidate.point) <= clusterDistance;
            });

            if (!group) {
                group = { point: point, layers: [] };
                groups.push(group);
            }
            group.layers.push(layer);
        });

        groups.forEach(function (group) {
            const centerCoordinates = group.layers.reduce(function (sum, layer) {
                sum.latitude += layer.markerLocation[0];
                sum.longitude += layer.markerLocation[1];
                return sum;
            }, { latitude: 0, longitude: 0 });
            const center = L.latLng(
                centerCoordinates.latitude / group.layers.length,
                centerCoordinates.longitude / group.layers.length
            );
            const marker = L.marker(center, {
                icon: L.divIcon({
                    className: group.layers.length > 1 ? 'all-tours__cluster' : 'all-tours__marker',
                    html: group.layers.length > 1 ? String(group.layers.length) : '1',
                    iconSize: [34, 34],
                    iconAnchor: [17, 17]
                })
            }).addTo(overviewMarkers);

            if (group.layers.length > 1) {
                marker.bindTooltip(group.layers.length + ' ' + translateUi('tour_count', 'Touren'));
                marker.on('click', function () {
                    map.setView(center, Math.min(map.getZoom() + 3, 12));
                });
            } else {
                const layer = group.layers[0];
                marker.bindTooltip(escapeHtml(layer.tour.title), { direction: 'top' });
                marker.on('click', function () {
                    selectedTour = layer;
                    map.fitBounds(layer.route.getBounds(), { padding: [24, 24], maxZoom: 14 });
                    showTourPopup(layer);
                });
            }
        });
    }

    function showTourPopup(layer) {
        layer.route.bindPopup(
            '<strong>' + escapeHtml(layer.tour.title) + '</strong>'
            + '<br><a href="' + encodeURI(layer.tour.url) + '">' + translateUi('tour_open', 'Tour öffnen') + '</a>'
        ).openPopup();
    }

    function showOverview() {
        selectedTour = null;
        if (routeBounds.isValid()) {
            map.fitBounds(routeBounds, { padding: [24, 24], maxZoom: overviewZoom - 1 });
        }
        refreshMapMode();
    }
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        return {
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[character];
    });
}

function buildElevationData(points) {
    let cumulativeDistance = 0;
    const data = [];

    points.forEach(function (point, index) {
        const latitude = parseFloat(point.getAttribute('lat'));
        const longitude = parseFloat(point.getAttribute('lon'));
        const elevationElement = point.querySelector('ele');
        const elevation = elevationElement ? parseFloat(elevationElement.textContent) : NaN;

        if (index > 0) {
            const previousPoint = points[index - 1];
            cumulativeDistance += distanceBetweenPoints(
                parseFloat(previousPoint.getAttribute('lat')),
                parseFloat(previousPoint.getAttribute('lon')),
                latitude,
                longitude
            );
        }

        if (!Number.isNaN(latitude) && !Number.isNaN(longitude) && !Number.isNaN(elevation)) {
            data.push({
                distance: cumulativeDistance,
                elevation: elevation,
                latitude: latitude,
                longitude: longitude
            });
        }
    });

    return data;
}

function distanceBetweenPoints(latitudeOne, longitudeOne, latitudeTwo, longitudeTwo) {
    const earthRadius = 6371;
    const latitudeDelta = (latitudeTwo - latitudeOne) * Math.PI / 180;
    const longitudeDelta = (longitudeTwo - longitudeOne) * Math.PI / 180;
    const latitudeOneRadians = latitudeOne * Math.PI / 180;
    const latitudeTwoRadians = latitudeTwo * Math.PI / 180;
    const haversine = Math.sin(latitudeDelta / 2) ** 2
        + Math.sin(longitudeDelta / 2) ** 2
        * Math.cos(latitudeOneRadians) * Math.cos(latitudeTwoRadians);

    return earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function renderElevationProfile(container, data, map) {
    const width = 900;
    const height = 180;
    const padding = { top: 18, right: 18, bottom: 30, left: 46 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const elevations = data.map(function (point) { return point.elevation; });
    const minimumElevation = Math.min(...elevations);
    const maximumElevation = Math.max(...elevations);
    const maximumDistance = data[data.length - 1].distance || 1;
    const elevationRange = maximumElevation - minimumElevation || 1;
    const points = data.map(function (point) {
        const x = padding.left + point.distance / maximumDistance * chartWidth;
        const y = padding.top + (maximumElevation - point.elevation) / elevationRange * chartHeight;
        return x.toFixed(2) + ',' + y.toFixed(2);
    }).join(' ');

    const horizontalGrid = [0, 0.25, 0.5, 0.75, 1].map(function (ratio) {
        const y = padding.top + ratio * chartHeight;
        return '<line class="elevation-profile__grid-line" x1="' + padding.left + '" y1="' + y.toFixed(2) + '" x2="' + (width - padding.right) + '" y2="' + y.toFixed(2) + '"></line>';
    }).join('');
    const verticalGrid = [0, 0.2, 0.4, 0.6, 0.8, 1].map(function (ratio) {
        const x = padding.left + ratio * chartWidth;
        return '<line class="elevation-profile__grid-line" x1="' + x.toFixed(2) + '" y1="' + padding.top + '" x2="' + x.toFixed(2) + '" y2="' + (height - padding.bottom) + '"></line>';
    }).join('');

    container.innerHTML = ''
        + '<div class="article-gpx__profile-heading">'
        + '<h3>' + translateUi('elevation_profile', 'Höhenprofil') + '</h3>'
        + '<span>' + minimumElevation.toFixed(0) + ' m - ' + maximumElevation.toFixed(0) + ' m</span>'
        + '</div>'
        + '<div class="elevation-profile__chart">'
        + '<svg class="elevation-profile" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="Höhenprofil über ' + maximumDistance.toFixed(1) + ' Kilometer">'
        + horizontalGrid
        + verticalGrid
        + '<line class="elevation-profile__axis" x1="' + padding.left + '" y1="' + (height - padding.bottom) + '" x2="' + (width - padding.right) + '" y2="' + (height - padding.bottom) + '"></line>'
        + '<polyline class="elevation-profile__line" points="' + points + '"></polyline>'
        + '<line class="elevation-profile__hover-line" data-elevation-hover-line x1="0" y1="' + padding.top + '" x2="0" y2="' + (height - padding.bottom) + '"></line>'
        + '<text class="elevation-profile__label" x="' + padding.left + '" y="' + (height - 12) + '">0 km</text>'
        + '<text class="elevation-profile__label elevation-profile__label--end" x="' + (width - padding.right) + '" y="' + (height - 12) + '">' + maximumDistance.toFixed(1) + ' km</text>'
        + '<text class="elevation-profile__label" x="8" y="' + (padding.top + 4) + '">' + maximumElevation.toFixed(0) + ' m</text>'
        + '<text class="elevation-profile__label" x="8" y="' + (height - padding.bottom) + '">' + minimumElevation.toFixed(0) + ' m</text>'
        + '</svg>'
        + '<div class="elevation-profile__tooltip" data-elevation-tooltip></div>'
        + '</div>';

    const svg = container.querySelector('.elevation-profile');
    const hoverLine = container.querySelector('[data-elevation-hover-line]');
    const tooltip = container.querySelector('[data-elevation-tooltip]');
    let hoverMarker = null;

    function hideHoverState() {
        hoverLine.style.display = 'none';
        tooltip.style.display = 'none';

        if (hoverMarker) {
            map.removeLayer(hoverMarker);
            hoverMarker = null;
        }
    }

    function updateHoverState(event) {
        const pointer = event.touches ? event.touches[0] : event;

        if (!pointer) {
            return;
        }

        const bounds = svg.getBoundingClientRect();
        const svgX = (pointer.clientX - bounds.left) / bounds.width * width;
        const chartX = Math.max(padding.left, Math.min(width - padding.right, svgX));
        const distance = (chartX - padding.left) / chartWidth * maximumDistance;
        const nearestPoint = data.reduce(function (closest, point) {
            return Math.abs(point.distance - distance) < Math.abs(closest.distance - distance) ? point : closest;
        }, data[0]);
        const hoverX = padding.left + nearestPoint.distance / maximumDistance * chartWidth;

        hoverLine.setAttribute('x1', hoverX.toFixed(2));
        hoverLine.setAttribute('x2', hoverX.toFixed(2));
        hoverLine.style.display = 'block';
        tooltip.textContent = nearestPoint.distance.toFixed(1) + ' km · ' + nearestPoint.elevation.toFixed(0) + ' m';
        tooltip.style.left = (hoverX / width * 100) + '%';
        tooltip.style.display = 'block';

        if (hoverMarker) {
            hoverMarker.setLatLng([nearestPoint.latitude, nearestPoint.longitude]);
        } else {
            hoverMarker = L.circleMarker([nearestPoint.latitude, nearestPoint.longitude], {
                radius: 6,
                color: '#fffdf9',
                weight: 2,
                fillColor: '#ff5a00',
                fillOpacity: 1
            }).addTo(map);
        }
    }

    svg.addEventListener('mousemove', updateHoverState);
    svg.addEventListener('mouseleave', hideHoverState);
    svg.addEventListener('touchstart', updateHoverState, { passive: true });
    svg.addEventListener('touchmove', updateHoverState, { passive: true });
    svg.addEventListener('touchend', hideHoverState, { passive: true });
}

function calculateTrackStats(points) {
    const trackPoints = points.map(function (point) {
        const elevationElement = point.querySelector('ele');

        return {
            latitude: parseFloat(point.getAttribute('lat')),
            longitude: parseFloat(point.getAttribute('lon')),
            elevation: elevationElement ? parseFloat(elevationElement.textContent) : NaN
        };
    }).filter(function (point) {
        return !Number.isNaN(point.latitude) && !Number.isNaN(point.longitude);
    });

    if (trackPoints.length < 2) {
        return null;
    }

    let totalDistance = 0;
    let elevationGain = 0;
    let elevationLoss = 0;
    const elevations = [];
    const elevationSamples = [];

    trackPoints.forEach(function (point, index) {
        if (!Number.isNaN(point.elevation)) {
            elevations.push(point.elevation);
            elevationSamples.push(point.elevation);
        }

        if (index === 0) {
            return;
        }

        const previousPoint = trackPoints[index - 1];
        const segmentDistance = distanceBetweenPoints(
            previousPoint.latitude,
            previousPoint.longitude,
            point.latitude,
            point.longitude
        );
        totalDistance += segmentDistance;

    });

    const smoothedElevations = smoothElevations(elevationSamples, 5);

    // Sum the changes in the smoothed series so gradual climbs remain visible
    // without allowing single-point GPS spikes to inflate ascent or descent.
    smoothedElevations.forEach(function (elevation, index) {
        if (index === 0) {
            return;
        }

        const elevationChange = elevation - smoothedElevations[index - 1];

        if (elevationChange > 0) {
            elevationGain += elevationChange;
        } else {
            elevationLoss += Math.abs(elevationChange);
        }
    });

    const statistics = {
        distance: totalDistance,
        elevationGain: elevationGain,
        elevationLoss: elevationLoss,
        minimumElevation: elevations.length ? Math.min(...elevations) : null,
        maximumElevation: elevations.length ? Math.max(...elevations) : null
    };

    return statistics;
}

function smoothElevations(elevations, windowSize) {
    return elevations.map(function (_, index) {
        const start = Math.max(0, index - Math.floor(windowSize / 2));
        const end = Math.min(elevations.length, index + Math.ceil(windowSize / 2));
        const window = elevations.slice(start, end);

        return window.reduce(function (sum, elevation) {
            return sum + elevation;
        }, 0) / window.length;
    });
}

function updateTourStatistics(statistics) {
    if (!statistics) {
        document.querySelectorAll('[data-gpx-stat-container]').forEach(function (container) {
            const valueElement = container.querySelector('[data-gpx-stat]');

            if (valueElement && !valueElement.textContent.trim()) {
                container.hidden = true;
            }
        });
        return;
    }

    const values = {
        distance: statistics.distance.toFixed(1) + ' km',
        elevationGain: Math.round(statistics.elevationGain) + ' m',
        elevationLoss: Math.round(statistics.elevationLoss) + ' m',
        minimumElevation: statistics.minimumElevation === null ? null : Math.round(statistics.minimumElevation) + ' m',
        maximumElevation: statistics.maximumElevation === null ? null : Math.round(statistics.maximumElevation) + ' m'
    };

    Object.keys(values).forEach(function (name) {
        if (values[name] === null) {
            return;
        }

        const valueElement = document.querySelector('[data-gpx-stat="' + name + '"]');
        const container = document.querySelector('[data-gpx-stat-container="' + name + '"]');

        if (valueElement && container) {
            valueElement.textContent = values[name];
            container.hidden = false;
        }
    });
}
