import { revalidatePath } from "next/cache";

import { supabase } from "@/lib/supabase";

import TripMap from "@/components/TripMap";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

async function deleteSegment(
    formData: FormData
) {
    "use server";

    const id =
        formData.get("id");

    if (!id) return;

    await supabase
        .from("segments")
        .delete()
        .eq("id", id);

    revalidatePath("/trips");
}

async function deletePlace(
    formData: FormData
) {
    "use server";

    const id =
        formData.get("id");

    if (!id) return;

    await supabase
        .from("places")
        .delete()
        .eq("id", id);

    revalidatePath("/trips");
}

export default async function TripPage({
    params,
}: PageProps) {
    const { id: tripId } =
        await params;

    const { data: trip } =
        await supabase
            .from("trips")
            .select("*")
            .eq("id", tripId)
            .single();

    const { data: segments } =
        await supabase
            .from("segments")
            .select("*")
            .eq("trip_id", tripId)
            .order(
                "departure_date",
                {
                    ascending: true,
                }
            );

    const { data: places } =
        await supabase
            .from("places")
            .select("*")
            .eq("trip_id", tripId)
            .order(
                "visit_date",
                {
                    ascending: true,
                }
            );

    if (!trip) {
        return (
            <div className="p-8">
                Trip not found
            </div>
        );
    }

    const timelineItems = [
        ...(segments || []).map(
            (segment) => ({
                type: "segment",

                date:
                    segment.departure_date,

                data: segment,
            })
        ),

        ...(places || []).map(
            (place) => ({
                type: "place",

                date:
                    place.visit_date,

                data: place,
            })
        ),
    ].sort(
        (a, b) =>
            new Date(
                a.date
            ).getTime() -
            new Date(
                b.date
            ).getTime()
    );

    const groupedTimeline =
        timelineItems.reduce(
            (
                groups: Record<
                    string,
                    any[]
                >,
                item
            ) => {
                const date =
                    item.date ||
                    "Unknown Date";

                if (
                    !groups[date]
                ) {
                    groups[date] =
                        [];
                }

                groups[date].push(
                    item
                );

                return groups;
            },
            {}
        );

    return (
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
            <div>
                <h1 className="text-4xl tracking-tight font-bold">
                    {trip.title}
                </h1>

                <p className="text-slate-400 mt-2">
                    {
                        trip.trip_purpose
                    }{" "}
                    •{" "}
                    {
                        trip.companions
                    }
                </p>
            </div>

            <TripMap
                segments={
                    segments || []
                }
                places={
                    places || []
                }
            />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">
                        Journey
                        Timeline
                    </h2>

                    <div className="flex gap-3">
                        <a
                            href={`/trips/${tripId}/add-segment`}
                            className="button-secondary"
                        >
                            Add Segment
                        </a>

                        <a
                            href={`/trips/${tripId}/add-place`}
                            className="button-primary"
                        >
                            Add Place
                        </a>
                    </div>
                </div>

                <div className="space-y-8">
                    {Object.entries(
                        groupedTimeline
                    ).map(
                        (
                            [
                                date,
                                items,
                            ],
                            dayIndex
                        ) => (
                            <div
                                key={
                                    date
                                }
                                className="space-y-4"
                            >
                                <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur py-2">
                                    <div className="flex items-center gap-4">
                                        <div className="h-px flex-1 bg-slate-800" />

                                        <div className="text-center">
                                            <p className="text-sm text-slate-400">
                                                Day{" "}
                                                {dayIndex +
                                                    1}
                                            </p>

                                            <p className="font-semibold">
                                                {new Date(
                                                    date
                                                ).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        weekday:
                                                            "long",

                                                        month:
                                                            "short",

                                                        day: "numeric",
                                                    }
                                                )}
                                            </p>
                                        </div>

                                        <div className="h-px flex-1 bg-slate-800" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {items.map(
                                        (
                                            item: any,
                                            index: number
                                        ) => (
                                            <div
                                                key={
                                                    index
                                                }
                                                className="card p-5"
                                            >
                                                {item.type ===
                                                    "segment" ? (
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="text-2xl">
                                                                {item
                                                                    .data
                                                                    .segment_type ===
                                                                    "Flight"
                                                                    ? "✈"
                                                                    : item
                                                                        .data
                                                                        .segment_type ===
                                                                        "Train"
                                                                        ? "🚆"
                                                                        : "🛣"}
                                                            </p>

                                                            <p className="font-semibold mt-2">
                                                                {
                                                                    item
                                                                        .data
                                                                        .source_name
                                                                }{" "}
                                                                →
                                                                {" "}
                                                                {
                                                                    item
                                                                        .data
                                                                        .destination_name
                                                                }
                                                            </p>

                                                            <p className="text-slate-400 text-sm">
                                                                {
                                                                    item
                                                                        .data
                                                                        .airline
                                                                }
                                                            </p>
                                                        </div>

                                                        <div className="text-right">
                                                            {item
                                                                .data
                                                                .flight_number && (
                                                                    <p className="text-blue-400 text-sm">
                                                                        ✈{" "}
                                                                        {
                                                                            item
                                                                                .data
                                                                                .flight_number
                                                                        }
                                                                    </p>
                                                                )}

                                                            <div className="flex gap-2 mt-4 justify-end">
                                                                <a
                                                                    href={`/segments/${item.data.id}/edit`}
                                                                    className="text-sm text-blue-400 hover:text-blue-300"
                                                                >
                                                                    Edit
                                                                </a>

                                                                <form
                                                                    action={
                                                                        deleteSegment
                                                                    }
                                                                >
                                                                    <input
                                                                        type="hidden"
                                                                        name="id"
                                                                        value={
                                                                            item
                                                                                .data
                                                                                .id
                                                                        }
                                                                    />

                                                                    <button
                                                                        type="submit"
                                                                        className="text-sm text-red-400 hover:text-red-300"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </form>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="text-2xl">
                                                                📍
                                                            </p>

                                                            <p className="font-semibold mt-2">
                                                                {
                                                                    item
                                                                        .data
                                                                        .place_name
                                                                }
                                                            </p>

                                                            <p className="text-slate-400 text-sm">
                                                                {
                                                                    item
                                                                        .data
                                                                        .city
                                                                }

                                                                {item
                                                                    .data
                                                                    .country &&
                                                                    `, ${item.data.country}`}
                                                            </p>

                                                            {item
                                                                .data
                                                                .notes && (
                                                                    <p className="mt-3 text-slate-300">
                                                                        {
                                                                            item
                                                                                .data
                                                                                .notes
                                                                        }
                                                                    </p>
                                                                )}
                                                        </div>

                                                        <div className="text-right">
                                                            {item
                                                                .data
                                                                .rating && (
                                                                    <p className="text-yellow-400">
                                                                        {"⭐".repeat(
                                                                            item
                                                                                .data
                                                                                .rating
                                                                        )}
                                                                    </p>
                                                                )}

                                                            <div className="flex gap-2 mt-4 justify-end">
                                                                <a
                                                                    href={`/places/${item.data.id}/edit`}
                                                                    className="text-sm text-blue-400 hover:text-blue-300"
                                                                >
                                                                    Edit
                                                                </a>

                                                                <form
                                                                    action={
                                                                        deletePlace
                                                                    }
                                                                >
                                                                    <input
                                                                        type="hidden"
                                                                        name="id"
                                                                        value={
                                                                            item
                                                                                .data
                                                                                .id
                                                                        }
                                                                    />

                                                                    <button
                                                                        type="submit"
                                                                        className="text-sm text-red-400 hover:text-red-300"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </form>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}