"use client";

import { useState } from "react";

import {
    useParams,
    useRouter,
    useSearchParams,
} from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function AddSegmentPage() {
    const router =
        useRouter();

    const params =
        useParams();

    const searchParams =
        useSearchParams();

    const tripId =
        params.id as string;

    const [
        segmentType,
        setSegmentType,
    ] = useState(
        searchParams.get(
            "type"
        ) || "Flight"
    );

    const [
        sourceName,
        setSourceName,
    ] = useState(
        searchParams.get(
            "from"
        ) || ""
    );

    const [
        destinationName,
        setDestinationName,
    ] = useState(
        searchParams.get(
            "to"
        ) || ""
    );

    const [
        departureDate,
        setDepartureDate,
    ] = useState(
        searchParams.get(
            "date"
        ) || ""
    );

    const [
        arrivalDate,
        setArrivalDate,
    ] = useState(
        searchParams.get(
            "date"
        ) || ""
    );

    const [
        departureTime,
        setDepartureTime,
    ] = useState(
        searchParams
            .get("departure")
            ?.split(" ")[1]
            ?.substring(0, 5) || ""
    );

    const [
        arrivalTime,
        setArrivalTime,
    ] = useState(
        searchParams
            .get("arrival")
            ?.split(" ")[1]
            ?.substring(0, 5) || ""
    );

    const [notes, setNotes] =
        useState("");

    const [
        flightNumber,
        setFlightNumber,
    ] = useState(
        searchParams.get(
            "flight"
        ) || ""
    );

    const [airline, setAirline] =
        useState(
            searchParams.get(
                "airline"
            ) || ""
        );

    const [loading, setLoading] =
        useState(false);

    const addSegment =
        async (
            e: React.FormEvent
        ) => {
            e.preventDefault();

            try {
                setLoading(true);

                const {
                    error,
                } =
                    await supabase
                        .from(
                            "segments"
                        )
                        .insert({
                            trip_id:
                                tripId,

                            segment_type:
                                segmentType,

                            source_name:
                                sourceName,

                            destination_name:
                                destinationName,

                            departure_date:
                                departureDate,

                            arrival_date:
                                arrivalDate,

                            departure_time:
                                departureTime,

                            arrival_time:
                                arrivalTime,

                            notes,

                            flight_number:
                                flightNumber,

                            airline,
                        });

                if (error) {
                    console.error(
                        JSON.stringify(error, null, 2)
                    );

                    return;
                }

                router.push(
                    `/trips/${tripId}`
                );
            } catch (error) {
                console.error(
                    JSON.stringify(error, null, 2)
                );
            } finally {
                setLoading(false);
            }
        };

    return (
        <div className="max-w-3xl mx-auto px-6 py-8">
            <div className="card p-6">
                <h1 className="section-title mb-8">
                    Add Segment
                </h1>

                <form
                    onSubmit={
                        addSegment
                    }
                    className="space-y-4"
                >
                    <select
                        value={
                            segmentType
                        }
                        onChange={(
                            e
                        ) =>
                            setSegmentType(
                                e
                                    .target
                                    .value
                            )
                        }
                        className="input"
                    >
                        <option value="Flight">
                            Flight
                        </option>

                        <option value="Train">
                            Train
                        </option>

                        <option value="Road">
                            Road
                        </option>
                    </select>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="From"
                            value={
                                sourceName
                            }
                            onChange={(
                                e
                            ) =>
                                setSourceName(
                                    e
                                        .target
                                        .value
                                )
                            }
                            className="input"
                            required
                        />

                        <input
                            type="text"
                            placeholder="To"
                            value={
                                destinationName
                            }
                            onChange={(
                                e
                            ) =>
                                setDestinationName(
                                    e
                                        .target
                                        .value
                                )
                            }
                            className="input"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="date"
                            value={
                                departureDate
                            }
                            onChange={(
                                e
                            ) =>
                                setDepartureDate(
                                    e
                                        .target
                                        .value
                                )
                            }
                            className="input"
                            required
                        />

                        <input
                            type="date"
                            value={
                                arrivalDate
                            }
                            onChange={(
                                e
                            ) =>
                                setArrivalDate(
                                    e
                                        .target
                                        .value
                                )
                            }
                            className="input"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="time"
                            value={
                                departureTime
                            }
                            onChange={(
                                e
                            ) =>
                                setDepartureTime(
                                    e
                                        .target
                                        .value
                                )
                            }
                            className="input"
                        />

                        <input
                            type="time"
                            value={
                                arrivalTime
                            }
                            onChange={(
                                e
                            ) =>
                                setArrivalTime(
                                    e
                                        .target
                                        .value
                                )
                            }
                            className="input"
                        />
                    </div>

                    {segmentType ===
                        "Flight" && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Flight Number"
                                    value={
                                        flightNumber
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setFlightNumber(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    className="input"
                                />

                                <input
                                    type="text"
                                    placeholder="Airline"
                                    value={
                                        airline
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setAirline(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    className="input"
                                />
                            </>
                        )}

                    <textarea
                        placeholder="Notes"
                        value={notes}
                        onChange={(e) =>
                            setNotes(
                                e.target.value
                            )
                        }
                        className="input min-h-[120px]"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="button-primary w-full"
                    >
                        {loading
                            ? "Saving..."
                            : "Save Segment"}
                    </button>
                </form>
            </div>
        </div>
    );
}