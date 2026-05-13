import { supabase } from "@/lib/supabase";

import NearbyPlaces from "@/components/NearbyPlaces";

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export default async function PlacePage({
    params,
}: Props) {
    const { id } =
        await params;

    const { data: place } =
        await supabase
            .from("places")
            .select("*")
            .eq("id", id)
            .single();

    if (!place) {
        return (
            <div className="p-8">
                Place not found
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
            <div className="card p-6">
                <div className="flex justify-between items-start gap-6">
                    <div>
                        <p className="text-5xl">
                            📍
                        </p>

                        <h1 className="text-4xl font-bold mt-4">
                            {
                                place.place_name
                            }
                        </h1>

                        <p className="text-slate-400 mt-2 text-lg">
                            {place.city}
                            {place.country &&
                                `, ${place.country}`}
                        </p>

                        {place.visit_date && (
                            <p className="text-sm text-slate-500 mt-3">
                                Visited on{" "}
                                {new Date(
                                    place.visit_date
                                ).toLocaleDateString(
                                    "en-US",
                                    {
                                        weekday:
                                            "long",

                                        month:
                                            "long",

                                        day: "numeric",

                                        year: "numeric",
                                    }
                                )}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-4">
                        {place.rating && (
                            <div className="text-yellow-400 text-xl">
                                {"⭐".repeat(
                                    place.rating
                                )}
                            </div>
                        )}

                        <a
                            href={`/places/${place.id}/edit`}
                            className="button-secondary"
                        >
                            Edit Place
                        </a>
                    </div>
                </div>

                {place.notes && (
                    <div className="mt-8 pt-8 border-t border-slate-800">
                        <h2 className="text-xl font-semibold mb-4">
                            Notes
                        </h2>

                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {
                                place.notes
                            }
                        </p>
                    </div>
                )}

                {(place.lat ||
                    place.lng) && (
                        <div className="mt-8 pt-8 border-t border-slate-800">
                            <h2 className="text-xl font-semibold mb-4">
                                Coordinates
                            </h2>

                            <div className="flex flex-wrap gap-3">
                                <div className="px-4 py-2 rounded-full bg-slate-800 text-slate-300">
                                    Lat:{" "}
                                    {Number(
                                        place.lat
                                    ).toFixed(5)}
                                </div>

                                <div className="px-4 py-2 rounded-full bg-slate-800 text-slate-300">
                                    Lng:{" "}
                                    {Number(
                                        place.lng
                                    ).toFixed(5)}
                                </div>
                            </div>
                        </div>
                    )}
            </div>

            {place.lat &&
                place.lng && (
                    <NearbyPlaces
                        lat={place.lat}
                        lng={place.lng}
                        tripId={
                            place.trip_id
                        }
                    />
                )}
        </div>
    );
}