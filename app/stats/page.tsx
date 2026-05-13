import { supabase } from "@/lib/supabase";

export default async function StatsPage() {
    const { data: trips } =
        await supabase
            .from("trips")
            .select("*");

    const { data: segments } =
        await supabase
            .from("segments")
            .select("*");

    const { data: places } =
        await supabase
            .from("places")
            .select("*");

    const countries =
        new Set(
            places
                ?.map(
                    (place) =>
                        place.country
                )
                .filter(Boolean)
        );

    const cities =
        new Set(
            places
                ?.map(
                    (place) =>
                        place.city
                )
                .filter(Boolean)
        );

    const flights =
        segments?.filter(
            (segment) =>
                segment.segment_type ===
                "Flight"
        ) || [];

    const trains =
        segments?.filter(
            (segment) =>
                segment.segment_type ===
                "Train"
        ) || [];

    const totalDistance =
        segments?.reduce(
            (
                total,
                segment
            ) =>
                total +
                (segment.distance_km ||
                    0),
            0
        ) || 0;

    const airlineCounts =
        flights.reduce(
            (
                acc: Record<
                    string,
                    number
                >,
                flight
            ) => {
                if (
                    !flight.airline
                )
                    return acc;

                acc[
                    flight.airline
                ] =
                    (acc[
                        flight
                            .airline
                    ] || 0) + 1;

                return acc;
            },
            {}
        );

    const favoriteAirline =
        Object.entries(
            airlineCounts
        ).sort(
            (a, b) =>
                b[1] - a[1]
        )[0]?.[0];

    const statCards = [
        {
            label:
                "Trips Completed",

            value:
                trips?.length || 0,

            icon: "🧳",
        },

        {
            label:
                "Countries Visited",

            value:
                countries.size,

            icon: "🌍",
        },

        {
            label:
                "Cities Visited",

            value:
                cities.size,

            icon: "🏙",
        },

        {
            label:
                "Places Visited",

            value:
                places?.length || 0,

            icon: "📍",
        },

        {
            label:
                "Flights Taken",

            value:
                flights.length,

            icon: "✈",
        },

        {
            label:
                "Train Journeys",

            value:
                trains.length,

            icon: "🚆",
        },

        {
            label:
                "Distance Traveled",

            value: `${Math.round(
                totalDistance
            ).toLocaleString()} km`,

            icon: "🛣",
        },

        {
            label:
                "Favorite Airline",

            value:
                favoriteAirline ||
                "-",

            icon: "🏆",
        },
    ];

    return (
        <div className="page-container space-y-10">
            <div>
                <h1 className="section-title">
                    Travel Stats
                </h1>

                <p className="text-slate-400 mt-2">
                    Your travel
                    footprint
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(
                    (stat) => (
                        <div
                            key={
                                stat.label
                            }
                            className="card p-6"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-slate-400 text-sm">
                                        {
                                            stat.label
                                        }
                                    </p>

                                    <p className="text-3xl font-bold mt-3">
                                        {
                                            stat.value
                                        }
                                    </p>
                                </div>

                                <div className="text-3xl">
                                    {
                                        stat.icon
                                    }
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="card p-6">
                    <h2 className="text-2xl font-semibold mb-6">
                        Countries
                    </h2>

                    <div className="flex flex-wrap gap-2">
                        {Array.from(
                            countries
                        ).map(
                            (
                                country
                            ) => (
                                <span
                                    key={
                                        country as string
                                    }
                                    className="px-3 py-2 rounded-full bg-slate-800 text-slate-300"
                                >
                                    {
                                        country as string
                                    }
                                </span>
                            )
                        )}
                    </div>
                </div>

                <div className="card p-6">
                    <h2 className="text-2xl font-semibold mb-6">
                        Recent Trips
                    </h2>

                    <div className="space-y-4">
                        {trips
                            ?.slice(0, 5)
                            .map(
                                (
                                    trip
                                ) => (
                                    <div
                                        key={
                                            trip.id
                                        }
                                        className="flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {
                                                    trip.title
                                                }
                                            </p>

                                            <p className="text-sm text-slate-400">
                                                {
                                                    trip.trip_purpose
                                                }
                                            </p>
                                        </div>

                                        <p className="text-sm text-slate-400">
                                            {
                                                trip.start_date
                                            }
                                        </p>
                                    </div>
                                )
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
}