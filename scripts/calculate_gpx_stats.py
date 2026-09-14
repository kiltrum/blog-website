#!/usr/bin/env python3

import math
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


def local_name(tag):
    """Return an XML tag name without its namespace."""
    return tag.rsplit("}", 1)[-1]


def distance_between_points(lat1, lon1, lat2, lon2):
    """Same Haversine calculation as distanceBetweenPoints() in main.js."""
    earth_radius = 6371  # km

    latitude_delta = math.radians(lat2 - lat1)
    longitude_delta = math.radians(lon2 - lon1)
    latitude_one_radians = math.radians(lat1)
    latitude_two_radians = math.radians(lat2)

    haversine = (
        math.sin(latitude_delta / 2) ** 2
        + math.sin(longitude_delta / 2) ** 2
        * math.cos(latitude_one_radians)
        * math.cos(latitude_two_radians)
    )

    return earth_radius * 2 * math.atan2(
        math.sqrt(haversine),
        math.sqrt(1 - haversine),
    )


def smooth_elevations(elevations, window_size):
    """Same moving-average smoothing as smoothElevations(..., 5) in main.js."""
    smoothed = []

    for index in range(len(elevations)):
        start = max(0, index - math.floor(window_size / 2))
        end = min(len(elevations), index + math.ceil(window_size / 2))
        window = elevations[start:end]
        smoothed.append(sum(window) / len(window))

    return smoothed


def js_round(value):
    """Match JavaScript Math.round() for the values used here."""
    return math.floor(value + 0.5)


def parse_gpx(path):
    tree = ET.parse(path)
    root = tree.getroot()

    track_points = []

    # Equivalent to querySelectorAll('trkpt'): use every GPX track point
    # in document order, regardless of XML namespace.
    for element in root.iter():
        if local_name(element.tag) != "trkpt":
            continue

        try:
            latitude = float(element.attrib["lat"])
            longitude = float(element.attrib["lon"])
        except (KeyError, ValueError):
            continue

        elevation = math.nan

        for child in element:
            if local_name(child.tag) == "ele":
                try:
                    elevation = float(child.text)
                except (TypeError, ValueError):
                    elevation = math.nan
                break

        track_points.append(
            {
                "latitude": latitude,
                "longitude": longitude,
                "elevation": elevation,
            }
        )

    return track_points


def calculate_track_stats(track_points):
    """Port of calculateTrackStats() from TrailnError main.js."""
    if len(track_points) < 2:
        return None

    total_distance = 0.0
    elevation_gain = 0.0
    elevation_loss = 0.0
    elevations = []
    elevation_samples = []

    for index, point in enumerate(track_points):
        if not math.isnan(point["elevation"]):
            elevations.append(point["elevation"])
            elevation_samples.append(point["elevation"])

        if index == 0:
            continue

        previous = track_points[index - 1]

        total_distance += distance_between_points(
            previous["latitude"],
            previous["longitude"],
            point["latitude"],
            point["longitude"],
        )

    smoothed_elevations = smooth_elevations(elevation_samples, 5)

    for index, elevation in enumerate(smoothed_elevations):
        if index == 0:
            continue

        elevation_change = elevation - smoothed_elevations[index - 1]

        if elevation_change > 0:
            elevation_gain += elevation_change
        else:
            elevation_loss += abs(elevation_change)

    return {
        "distance": total_distance,
        "elevation_gain": elevation_gain,
        "elevation_loss": elevation_loss,
        "minimum_elevation": min(elevations) if elevations else None,
        "maximum_elevation": max(elevations) if elevations else None,
    }


def main():
    if len(sys.argv) != 2:
        print("Usage:")
        print("  python calculate_gpx_stats.py path/to/track.gpx")
        sys.exit(1)

    gpx_path = Path(sys.argv[1])

    if not gpx_path.is_file():
        print(f"Error: file not found: {gpx_path}")
        sys.exit(1)

    try:
        points = parse_gpx(gpx_path)
        stats = calculate_track_stats(points)
    except ET.ParseError as error:
        print(f"Error: invalid GPX/XML file: {error}")
        sys.exit(1)

    if stats is None:
        print("Error: GPX contains fewer than two valid track points.")
        sys.exit(1)

    print(f"\n{gpx_path}")
    print(f"Track points: {len(points)}")
    print()
    print("Values as displayed by main.js:")
    print(f"Distance: {stats['distance']:.1f} km")
    print(f"ElevationGain: {js_round(stats['elevation_gain'])} m")
    print(f"ElevationLoss: {js_round(stats['elevation_loss'])} m")

    if stats["maximum_elevation"] is not None:
        print(f"HighestPoint: {js_round(stats['maximum_elevation'])} m")

    if stats["minimum_elevation"] is not None:
        print(f"MinimumElevation: {js_round(stats['minimum_elevation'])} m")


if __name__ == "__main__":
    main()
