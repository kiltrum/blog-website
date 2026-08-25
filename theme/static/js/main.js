document.addEventListener('DOMContentLoaded', function () {
    const mapContainers = document.querySelectorAll('[data-gpx-map]');

    if (!mapContainers.length || typeof L === 'undefined') {
        return;
    }

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
                }).addTo(map);

                map.fitBounds(polyline.getBounds(), { padding: [20, 20] });

                const startMarker = L.marker(coords[0]).addTo(map);
                startMarker.bindPopup('<strong>' + title + '</strong><br>Start');
            })
            .catch(function () {
                const error = document.createElement('p');
                error.textContent = 'Die Route konnte nicht geladen werden.';
                container.appendChild(error);
            });
    });
});
