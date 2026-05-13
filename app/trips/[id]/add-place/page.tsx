"use client";

import { useState } from "react";

import {
    useParams,
    useRouter,
} from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function AddPlacePage() {
    const router = useRouter();

    const params = useParams();

    const tripId = params.id as string;

    const [
        placeName,
        setPlaceName,
    ] = useState("");

    const [city, setCity] =
        useState("");

    const [country, setCountry] =
        useState("");

    const [visitDate, setVisitDate] =
        useState("");

    const [notes, setNotes] =
        useState("");

    const [rating, setRating] =
        useState(5);

    const [loading, setLoading] =
        useState(false);

    const [sessionToken] =
        useState(
            crypto.randomUUID()
        );

    const [
        selectedCoordinates,
        setSelectedCoordinates,
    ] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    const [
        locationResults,
        setLocationResults,
    ] = useState<any[]>([]);

    const geocodePlace =
        async () => {
            if (!placeName) return;

            try {
                const response =
                    await fetch(
                        `/api/geocode?query=${encodeURIComponent(
                            placeName
                        )}&sessionToken=${sessionToken}`
                    );

                const result =
                    await response.json();

                const suggestions =
                    result.suggestions || [];

                const normalizedQuery =
                    placeName
                        .toLowerCase()
                        .trim();

                const reranked =
                    suggestions.sort(
                        (
                            a: any,
                            b: any
                        ) => {
                            const calculateScore =
                                (
                                    item: any
                                ) => {
                                    let score = 0;

                                    const name =
                                        (
                                            item.name ||
                                            ""
                                        ).toLowerCase();

                                    const categories =
                                        item.poi_category || [];

                                    // EXACT MATCH
                                    if (
                                        name ===
                                        normalizedQuery
                                    ) {
                                        score += 1000;
                                    }

                                    // STARTS WITH
                                    if (
                                        name.startsWith(
                                            normalizedQuery
                                        )
                                    ) {
                                        score += 500;
                                    }

                                    // CONTAINS
                                    if (
                                        name.includes(
                                            normalizedQuery
                                        )
                                    ) {
                                        score += 250;
                                    }

                                    // FAMOUS LANDMARK
                                    if (
                                        item.external_ids
                                            ?.golden
                                    ) {
                                        score += 1000;
                                    }

                                    // TOURIST ATTRACTION
                                    if (
                                        categories.includes(
                                            "tourist attraction"
                                        )
                                    ) {
                                        score += 500;
                                    }

                                    // VIEWPOINT
                                    if (
                                        categories.includes(
                                            "viewpoint"
                                        )
                                    ) {
                                        score += 250;
                                    }

                                    // LANDMARK
                                    if (
                                        categories.includes(
                                            "landmark"
                                        )
                                    ) {
                                        score += 250;
                                    }

                                    // HISTORIC
                                    if (
                                        categories.includes(
                                            "historic"
                                        )
                                    ) {
                                        score += 200;
                                    }

                                    // MUSEUM
                                    if (
                                        categories.includes(
                                            "museum"
                                        )
                                    ) {
                                        score += 200;
                                    }

                                    // PENALIZE APARTMENTS
                                    if (
                                        categories.includes(
                                            "apartment or condo"
                                        )
                                    ) {
                                        score -= 800;
                                    }

                                    // PENALIZE SERVICES
                                    if (
                                        categories.includes(
                                            "services"
                                        )
                                    ) {
                                        score -= 400;
                                    }

                                    // LIGHT DISTANCE PENALTY
                                    if (
                                        item.distance
                                    ) {
                                        score -=
                                            item.distance /
                                            100000;
                                    }

                                    return score;
                                };

                            return (
                                calculateScore(
                                    b
                                ) -
                                calculateScore(
                                    a
                                )
                            );
                        }
                    );

                setLocationResults(
                    reranked
                );
            } catch (error) {
                console.error(error);
            }
        };

    const savePlace = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        try {
            setLoading(true);

            const { error } =
                await supabase
                    .from("places")
                    .insert({
                        trip_id: tripId,

                        place_name:
                            placeName,

                        city,

                        country,

                        visit_date:
                            visitDate,

                        notes,

                        rating,

                        lat:
                            selectedCoordinates?.lat,

                        lng:
                            selectedCoordinates?.lng,
                    });

            if (error) {
                console.error(error);

                return;
            }

            router.push(
                `/trips/${tripId}`
            );
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-6 py-8">
            <div className="card p-6">
                <h1 className="section-title mb-8">
                    Add Place
                </h1>

                <form
                    onSubmit={savePlace}
                    className="space-y-4"
                >
                    <input
                        type="text"
                        placeholder="Place Name"
                        value={placeName}
                        onChange={(e) =>
                            setPlaceName(
                                e.target.value
                            )
                        }
                        className="input"
                        required
                    />

                    <button
                        type="button"
                        onClick={
                            geocodePlace
                        }
                        className="button-secondary w-full"
                    >
                        Search Location
                    </button>

                    {locationResults.length >
                        0 && (
                            <div className="card overflow-hidden max-h-80 overflow-y-auto">
                                {locationResults.map(
                                    (
                                        location: any
                                    ) => (
                                        <button
                                            key={
                                                location.mapbox_id
                                            }
                                            type="button"
                                            onClick={async () => {
                                                const token =
                                                    process
                                                        .env
                                                        .NEXT_PUBLIC_MAPBOX_TOKEN;

                                                const response =
                                                    await fetch(
                                                        `https://api.mapbox.com/search/searchbox/v1/retrieve/${location.mapbox_id}?session_token=${sessionToken}&access_token=${token}`
                                                    );

                                                const result =
                                                    await response.json();

                                                const feature =
                                                    result
                                                        .features?.[0];

                                                if (
                                                    !feature
                                                )
                                                    return;

                                                setPlaceName(
                                                    feature
                                                        .properties
                                                        ?.name ||
                                                    ""
                                                );

                                                setCity(
                                                    feature
                                                        .properties
                                                        ?.context
                                                        ?.place
                                                        ?.name ||
                                                    ""
                                                );

                                                setCountry(
                                                    feature
                                                        .properties
                                                        ?.context
                                                        ?.country
                                                        ?.name ||
                                                    ""
                                                );

                                                setSelectedCoordinates(
                                                    {
                                                        lat:
                                                            feature
                                                                .geometry
                                                                .coordinates[1],

                                                        lng:
                                                            feature
                                                                .geometry
                                                                .coordinates[0],
                                                    }
                                                );

                                                setLocationResults(
                                                    []
                                                );
                                            }}
                                            className="w-full p-3 text-left hover:bg-slate-800 transition border-b border-slate-800 last:border-0"
                                        >
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="font-medium truncate">
                                                            {
                                                                location.name
                                                            }
                                                        </p>

                                                        {(() => {
                                                            const categories =
                                                                location.poi_category || [];

                                                            let badge = "";

                                                            if (
                                                                categories.includes(
                                                                    "museum"
                                                                )
                                                            ) {
                                                                badge =
                                                                    "🏛 Museum";
                                                            } else if (
                                                                categories.includes(
                                                                    "tourist attraction"
                                                                )
                                                            ) {
                                                                badge =
                                                                    "⭐ Attraction";
                                                            } else if (
                                                                categories.includes(
                                                                    "historic"
                                                                )
                                                            ) {
                                                                badge =
                                                                    "🏰 Historic";
                                                            } else if (
                                                                categories.includes(
                                                                    "viewpoint"
                                                                )
                                                            ) {
                                                                badge =
                                                                    "🌄 Viewpoint";
                                                            } else if (
                                                                location
                                                                    .external_ids
                                                                    ?.golden
                                                            ) {
                                                                badge =
                                                                    "⭐ Iconic";
                                                            }

                                                            if (!badge)
                                                                return null;

                                                            return (
                                                                <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full whitespace-nowrap">
                                                                    {badge}
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>

                                                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                                                        {
                                                            location.full_address
                                                        }
                                                    </p>

                                                    {location.poi_category
                                                        ?.length >
                                                        0 && (
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {location.poi_category
                                                                    .slice(
                                                                        0,
                                                                        3
                                                                    )
                                                                    .map(
                                                                        (
                                                                            category: string
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    category
                                                                                }
                                                                                className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-full"
                                                                            >
                                                                                {
                                                                                    category
                                                                                }
                                                                            </span>
                                                                        )
                                                                    )}
                                                            </div>
                                                        )}
                                                </div>

                                                <div className="text-xs text-slate-500 capitalize whitespace-nowrap">
                                                    {
                                                        location.feature_type
                                                    }
                                                </div>
                                            </div>
                                        </button>
                                    )
                                )}
                            </div>
                        )}

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="City"
                            value={city}
                            onChange={(e) =>
                                setCity(
                                    e.target.value
                                )
                            }
                            className="input"
                        />

                        <input
                            type="text"
                            placeholder="Country"
                            value={country}
                            onChange={(e) =>
                                setCountry(
                                    e.target.value
                                )
                            }
                            className="input"
                        />
                    </div>

                    <input
                        type="date"
                        value={visitDate}
                        onChange={(e) =>
                            setVisitDate(
                                e.target.value
                            )
                        }
                        className="input"
                    />

                    <textarea
                        placeholder="Memories / Notes"
                        value={notes}
                        onChange={(e) =>
                            setNotes(
                                e.target.value
                            )
                        }
                        className="input min-h-[120px]"
                    />

                    <select
                        value={rating}
                        onChange={(e) =>
                            setRating(
                                Number(
                                    e.target
                                        .value
                                )
                            )
                        }
                        className="input"
                    >
                        <option value={1}>
                            ⭐
                        </option>

                        <option value={2}>
                            ⭐⭐
                        </option>

                        <option value={3}>
                            ⭐⭐⭐
                        </option>

                        <option value={4}>
                            ⭐⭐⭐⭐
                        </option>

                        <option value={5}>
                            ⭐⭐⭐⭐⭐
                        </option>
                    </select>

                    <button
                        type="submit"
                        disabled={loading}
                        className="button-primary w-full"
                    >
                        {loading
                            ? "Saving..."
                            : "Save Place"}
                    </button>
                </form>
            </div>
        </div>
    );
}