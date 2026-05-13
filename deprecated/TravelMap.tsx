"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";

import { supabase } from "@/lib/supabase";

mapboxgl.accessToken =
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type Trip = {
    id: string;

    source_name: string;
    destination_name: string;

    source_lat: number;
    source_lng: number;

    destination_lat: number;
    destination_lng: number;

    trip_type: string;
    departure_date: string;

    flight_number: string;
    train_number: string;
};

function createArc(
    start: [number, number],
    end: [number, number],
    numPoints = 100
) {
    const points = [];

    const midLng =
        (start[0] + end[0]) / 2;

    const midLat =
        (start[1] + end[1]) / 2 + 10;

    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;

        const lng =
            (1 - t) * (1 - t) * start[0] +
            2 *
            (1 - t) *
            t *
            midLng +
            t * t * end[0];

        const lat =
            (1 - t) * (1 - t) * start[1] +
            2 *
            (1 - t) *
            t *
            midLat +
            t * t * end[1];

        points.push([lng, lat]);
    }

    return points;
}

export default function TravelMap() {
    const mapContainer =
        useRef<HTMLDivElement | null>(null);

    const [trips, setTrips] = useState<
        Trip[]
    >([]);

    const [selectedYear, setSelectedYear] =
        useState("All");

    const years = [
        "All",
        ...new Set(
            trips
                .filter(
                    (trip) => trip.departure_date
                )
                .map((trip) =>
                    new Date(
                        trip.departure_date
                    ).getFullYear()
                )
        ),
    ];

    const filteredTrips =
        selectedYear === "All"
            ? trips
            : trips.filter((trip) => {
                const year = new Date(
                    trip.departure_date
                ).getFullYear();

                return (
                    year.toString() ===
                    selectedYear
                );
            });

    useEffect(() => {
        const fetchTrips = async () => {
            const { data, error } =
                await supabase
                    .from("segments")
                    .select("*");

            if (error) {
                console.error(error);
                return;
            }

            setTrips(data || []);
        };

        fetchTrips();
    }, []);

    useEffect(() => {
        if (!mapContainer.current) return;

        const map = new mapboxgl.Map({
            container: mapContainer.current,

            style:
                "mapbox://styles/mapbox/dark-v11",

            center: [78.9629, 20.5937],

            zoom: 3,
        });

        map.on("load", () => {
            const bounds =
                new mapboxgl.LngLatBounds();

            filteredTrips.forEach((trip) => {
                if (
                    !trip.source_lat ||
                    !trip.source_lng ||
                    !trip.destination_lat ||
                    !trip.destination_lng
                ) {
                    return;
                }

                // SOURCE MARKER
                new mapboxgl.Marker({
                    color:
                        trip.trip_type === "Flight"
                            ? "#3b82f6"
                            : trip.trip_type === "Train"
                                ? "#22c55e"
                                : trip.trip_type ===
                                    "Road Trip"
                                    ? "#f97316"
                                    : "#eab308",
                })
                    .setLngLat([
                        trip.source_lng,
                        trip.source_lat,
                    ])
                    .setPopup(
                        new mapboxgl.Popup({
                            offset: 25,
                        }).setHTML(`
                            <div style="color:black">
                            <h3 style="font-weight:bold">
                                ${trip.source_name}
                            </h3>

                            <p>${trip.trip_type}</p>

                            ${trip.flight_number
                                ? `<p>✈ ${trip.flight_number}</p>`
                                : ""
                            }

${trip.train_number
                                ? `<p>🚆 ${trip.train_number}</p>`
                                : ""
                            }

                            <p>${trip.departure_date}</p>
                            </div>
                        `)
                    )
                    .addTo(map);

                // DESTINATION MARKER
                new mapboxgl.Marker({
                    color:
                        trip.trip_type === "Flight"
                            ? "#3b82f6"
                            : trip.trip_type === "Train"
                                ? "#22c55e"
                                : trip.trip_type ===
                                    "Road Trip"
                                    ? "#f97316"
                                    : "#eab308",
                })
                    .setLngLat([
                        trip.destination_lng,
                        trip.destination_lat,
                    ])
                    .setPopup(
                        new mapboxgl.Popup({
                            offset: 25,
                        }).setHTML(`
                            <div style="color:black">
                            <h3 style="font-weight:bold">
                                ${trip.destination_name}
                            </h3>

                            <p>${trip.trip_type}</p>

                            <p>${trip.departure_date}</p>
                            </div>
                        `)
                    )
                    .addTo(map);

                // EXTEND MAP BOUNDS
                bounds.extend([
                    trip.source_lng,
                    trip.source_lat,
                ]);

                bounds.extend([
                    trip.destination_lng,
                    trip.destination_lat,
                ]);

                // ROUTE LINE
                const routeId = `route-${trip.id}`;

                map.addSource(routeId, {
                    type: "geojson",
                    lineMetrics: true,
                    data: {
                        type: "Feature",

                        geometry: {
                            type: "LineString",
                            coordinates: createArc(
                                [
                                    trip.source_lng,
                                    trip.source_lat,
                                ],
                                [
                                    trip.destination_lng,
                                    trip.destination_lat,
                                ]
                            ),
                        },

                        properties: {},
                    },
                });

                map.addLayer({
                    id: routeId,

                    type: "line",

                    source: routeId,

                    layout: {
                        "line-join": "round",
                        "line-cap": "round",
                    },

                    paint: {
                        "line-color":
                            trip.trip_type ===
                                "Flight"
                                ? "#3b82f6"
                                : trip.trip_type ===
                                    "Train"
                                    ? "#22c55e"
                                    : trip.trip_type ===
                                        "Road Trip"
                                        ? "#f97316"
                                        : "#eab308",

                        "line-width": 3,
                        "line-opacity": 0.8,
                        "line-blur": 1,
                        "line-gradient": [
                            "interpolate",
                            ["linear"],
                            ["line-progress"],
                            0,
                            "#3b82f6",
                            1,
                            "#8b5cf6",
                        ],
                    },
                });
            });

            // AUTO FIT MAP TO TRIPS
            if (!bounds.isEmpty()) {
                map.fitBounds(bounds, {
                    padding: 80,
                });
            }
        });

        return () => map.remove();
    }, [filteredTrips]);

    return (
        <div className="space-y-4">
            <div className="flex gap-4 items-center">
                <label className="font-medium">
                    Filter by Year:
                </label>

                <select
                    value={selectedYear}
                    onChange={(e) =>
                        setSelectedYear(e.target.value)
                    }
                    className="border p-2 rounded-lg bg-black text-white"
                >
                    {years.map((year) => (
                        <option
                            key={year}
                            value={year}
                        >
                            {year}
                        </option>
                    ))}
                </select>
            </div>

            <div
                ref={mapContainer}
                className="w-full h-[600px] rounded-xl overflow-hidden"
            />
        </div>
    );
}