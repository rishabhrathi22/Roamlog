"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function NewTripPage() {
    const router = useRouter();

    const [title, setTitle] =
        useState("");

    const [startDate, setStartDate] =
        useState("");

    const [endDate, setEndDate] =
        useState("");

    const [companions, setCompanions] =
        useState("Solo");

    const [tripPurpose, setTripPurpose] =
        useState("Vacation");

    const [notes, setNotes] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const createTrip = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        try {
            setLoading(true);

            const { data, error } =
                await supabase
                    .from("trips")
                    .insert({
                        title,

                        start_date: startDate,

                        end_date: endDate,

                        companions,

                        trip_purpose:
                            tripPurpose,

                        notes,
                    })
                    .select()
                    .single();

            if (error) {
                console.error(error);

                return;
            }

            router.push(
                `/trips/${data.id}`
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
                <h1 className="text-4xl tracking-tight font-bold mb-8">
                    Create Trip
                </h1>

                <form
                    onSubmit={createTrip}
                    className="space-y-4"
                >
                    <input
                        type="text"
                        placeholder="Trip Title"
                        value={title}
                        onChange={(e) =>
                            setTitle(e.target.value)
                        }
                        className="input"
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) =>
                                setStartDate(
                                    e.target.value
                                )
                            }
                            className="input"
                        />

                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) =>
                                setEndDate(
                                    e.target.value
                                )
                            }
                            className="input"
                        />
                    </div>

                    <select
                        value={companions}
                        onChange={(e) =>
                            setCompanions(
                                e.target.value
                            )
                        }
                        className="input"
                    >
                        <option>Solo</option>
                        <option>Family</option>
                        <option>Friends</option>
                        <option>Partner</option>
                        <option>Work</option>
                    </select>

                    <select
                        value={tripPurpose}
                        onChange={(e) =>
                            setTripPurpose(
                                e.target.value
                            )
                        }
                        className="input"
                    >
                        <option>Vacation</option>
                        <option>Business</option>
                        <option>Family Visit</option>
                        <option>Education</option>
                        <option>Adventure</option>
                        <option>Pilgrimage</option>
                    </select>

                    <textarea
                        placeholder="Trip Notes"
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
                            ? "Creating..."
                            : "Create Trip"}
                    </button>
                </form>
            </div>
        </div>
    );
}