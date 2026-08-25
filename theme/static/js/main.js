document.addEventListener('DOMContentLoaded', function () {
    initializeNavigation();
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
            scrollWheelZoom: false,
            zoomControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

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
                    fallback.textContent = 'Keine Trackpunkte im GPX-Datei gefunden.';
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
                    color: '#b67a46',
                    weight: 4,
                    opacity: 0.9
                });

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
                error.textContent = 'Die Route konnte nicht geladen werden.';
                container.appendChild(error);
            });
        });
    }

    initializeAllToursMap();
});

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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const routeBounds = L.latLngBounds([]);
    const layers = [];
    const overviewMarkers = L.layerGroup().addTo(map);
    const trackLayer = L.layerGroup().addTo(map);
    const overviewZoom = 6;
    let selectedTour = null;
    let overviewInitialized = false;
    let completedTours = 0;

    const resetControl = L.control({ position: 'topright' });
    resetControl.onAdd = function () {
        const element = L.DomUtil.create('button', 'all-tours__reset-control');
        element.type = 'button';
        element.textContent = 'Alle Touren';
        element.title = 'Alle Touren anzeigen';
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
                    color: '#b67a46',
                    weight: 3,
                    opacity: 0.55
                });
                const hitArea = L.polyline(coordinates, {
                    color: '#b67a46',
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
                        + '<br><a href="' + encodeURI(tour.url) + '">Tour öffnen</a>'
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
        layers.forEach(function (layer) {
            trackLayer.addLayer(layer.route);
            trackLayer.addLayer(layer.hitArea);
        });
        updateTrackStyles();
    }

    function updateTrackStyles() {
        layers.forEach(function (layer) {
            layer.route.setStyle({
                opacity: selectedTour && selectedTour !== layer ? 0.18 : (selectedTour === layer ? 1 : 0.75),
                weight: selectedTour === layer ? 5 : 3
            });
        });
    }

    function renderOverviewMarkers() {
        overviewMarkers.clearLayers();
        const groups = [];
        const clusterDistance = 55;
        const zoom = Math.max(map.getZoom(), 1);

        layers.forEach(function (layer) {
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
                    html: group.layers.length > 1 ? String(group.layers.length) : '•',
                    iconSize: group.layers.length > 1 ? [34, 34] : [22, 22],
                    iconAnchor: group.layers.length > 1 ? [17, 17] : [11, 11]
                })
            }).addTo(overviewMarkers);

            if (group.layers.length > 1) {
                marker.bindTooltip(group.layers.length + ' Touren');
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
            + '<br><a href="' + encodeURI(layer.tour.url) + '">Tour öffnen</a>'
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
    const height = 240;
    const padding = { top: 28, right: 20, bottom: 42, left: 54 };
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
        + '<h3>Höhenprofil</h3>'
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
                fillColor: '#b67a46',
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
