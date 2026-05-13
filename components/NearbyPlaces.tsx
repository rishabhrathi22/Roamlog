"use client";

import {
    useEffect,
    useState,
} from "react";

import { supabase } from "@/lib/supabase";

interface Props {
    lat: number;

    lng: number;

    tripId: string;
}

export default function NearbyPlaces({
    lat,
    lng,
    tripId,
}: Props) {
    const [places, setPlaces] =
        useState<any[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [savingId, setSavingId] =
        useState<
            string | null
        >(null);

    useEffect(() => {
        fetchNearby();
    }, []);

    const fetchNearby =
        async () => {
            try {
                const token =
                    process.env
                        .NEXT_PUBLIC_MAPBOX_TOKEN;

                const response =
                    await fetch(
                        `https://api.mapbox.com/search/searchbox/v1/category/attraction?proximity=${lng},${lat}&limit=10&access_token=${token}`
                    );

                const result =
                    await response.json();

                setPlaces(
                    result.features ||
                    []
                );
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

    const addPlaceToTrip =
        async (
            place: any
        ) => {
            try {
                setSavingId(
                    place.id
                );

                const {
                    properties,
                    geometry,
                } = place;

                const {
                    error,
                } =
                    await supabase
                        .from(
                            "places"
                        )
                        .insert({
                            trip_id:
                                tripId,

                            place_name:
                                properties?.name,

                            city:
                                properties
                                    ?.context
                                    ?.place
                                    ?.name ||
                                "",

                            country:
                                properties
                                    ?.context
                                    ?.country
                                    ?.name ||
                                "",

                            lat:
                                geometry
                                    ?.coordinates?.[1],

                            lng:
                                geometry
                                    ?.coordinates?.[0],

                            visit_date:
                                new Date()
                                    .toISOString()
                                    .split(
                                        "T"
                                    )[0],

                            notes:
                                "",

                            rating: 5,
                        });

                if (error) {
                    console.error(
                        error
                    );

                    return;
                }

                alert(
                    "Place added to trip!"
                );
            } catch (error) {
                console.error(
                    error
                );
            } finally {
                setSavingId(
                    null
                );
            }
        };

    return (
        <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-semibold">
                        Nearby
                        Attractions
                    </h2>

                    <p className="text-slate-400 text-sm mt-1">
                        Discover
                        places around
                        this location
                    </p>
                </div>

                {loading && (
                    <p className="text-sm text-slate-400">
                        Loading...
                    </p>
                )}
            </div>

            <div className="space-y-3">
                {places.length ===
                    0 &&
                    !loading && (
                        <p className="text-slate-400">
                            No nearby
                            places found
                        </p>
                    )}

                {places.map(
                    (place) => (
                        <div
                            key={
                                place.id
                            }
                            className="p-4 rounded-2xl bg-slate-900 border border-slate-800"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-medium">
                                            {
                                                place
                                                    .properties
                                                    ?.name
                                            }
                                        </p>

                                        {place
                                            .properties
                                            ?.poi_category?.includes(
                                                "tourist attraction"
                                            ) && (
                                                <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">
                                                    ⭐
                                                    Attraction
                                                </span>
                                            )}
                                    </div>

                                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                                        {
                                            place
                                                .properties
                                                ?.full_address
                                        }
                                    </p>
                                </div>

                                <button
                                    onClick={() =>
                                        addPlaceToTrip(
                                            place
                                        )
                                    }
                                    disabled={
                                        savingId ===
                                        place.id
                                    }
                                    className="button-secondary whitespace-nowrap"
                                >
                                    {savingId ===
                                        place.id
                                        ? "Adding..."
                                        : "Add"}
                                </button>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}