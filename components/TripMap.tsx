"use client";

import {
    useEffect,
    useRef,
} from "react";

import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
    process.env
        .NEXT_PUBLIC_MAPBOX_TOKEN!;

interface TripMapProps {
    segments: any[];

    places: any[];
}

export default function TripMap({
    segments,
    places,
}: TripMapProps) {
    const mapRef =
        useRef<mapboxgl.Map | null>(
            null
        );

    const mapContainerRef =
        useRef<HTMLDivElement | null>(
            null
        );

    useEffect(() => {
        if (
            !mapContainerRef.current ||
            mapRef.current
        ) {
            return;
        }

        const map = new mapboxgl.Map({
            container:
                mapContainerRef.current,

            style:
                "mapbox://styles/mapbox/dark-v11",

            center: [0, 20],

            zoom: 1.5,
        });

        mapRef.current = map;

        map.on("load", () => {
            const bounds =
                new mapboxgl.LngLatBounds();

            segments.forEach(
                (segment, index) => {
                    if (
                        segment.source_lng &&
                        segment.source_lat &&
                        segment.destination_lng &&
                        segment.destination_lat
                    ) {
                        bounds.extend([
                            segment.source_lng,
                            segment.source_lat,
                        ]);

                        bounds.extend([
                            segment.destination_lng,
                            segment.destination_lat,
                        ]);

                        new mapboxgl.Marker({
                            color: "#3b82f6",
                        })
                            .setLngLat([
                                segment.source_lng,
                                segment.source_lat,
                            ])
                            .addTo(map);

                        new mapboxgl.Marker({
                            color: "#8b5cf6",
                        })
                            .setLngLat([
                                segment.destination_lng,
                                segment.destination_lat,
                            ])
                            .addTo(map);

                        map.addSource(
                            `route-${index}`,
                            {
                                type: "geojson",

                                lineMetrics: true,

                                data: {
                                    type: "Feature",

                                    geometry: {
                                        type: "LineString",

                                        coordinates: [
                                            [
                                                segment.source_lng,
                                                segment.source_lat,
                                            ],

                                            [
                                                segment.destination_lng,
                                                segment.destination_lat,
                                            ],
                                        ],
                                    },

                                    properties: {},
                                },
                            }
                        );

                        map.addLayer({
                            id: `route-${index}`,

                            type: "line",

                            source:
                                `route-${index}`,

                            layout: {
                                "line-cap":
                                    "round",

                                "line-join":
                                    "round",
                            },

                            paint: {
                                "line-width": 4,

                                "line-opacity": 0.8,

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
                    }
                }
            );

            places.forEach((place) => {
                if (
                    place.lat &&
                    place.lng
                ) {
                    bounds.extend([
                        place.lng,
                        place.lat,
                    ]);

                    new mapboxgl.Marker({
                        color: "#f59e0b",
                    })
                        .setLngLat([
                            place.lng,
                            place.lat,
                        ])
                        .setPopup(
                            new mapboxgl.Popup({
                                offset: 25,
                            }).setHTML(`
                <div style="color:black">
                  <h3 style="font-weight:bold">
                    ${place.place_name}
                  </h3>

                  <p>
                    ${place.city || ""}
                  </p>
                </div>
              `)
                        )
                        .addTo(map);
                }
            });

            if (!bounds.isEmpty()) {
                map.fitBounds(bounds, {
                    padding: 80,
                });
            }
        });

        return () => {
            map.remove();
        };
    }, [segments, places]);

    return (
        <div
            ref={mapContainerRef}
            className="w-full h-[500px] rounded-2xl overflow-hidden border border-slate-800"
        />
    );
}