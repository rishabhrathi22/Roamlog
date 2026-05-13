"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    useParams,
    useRouter,
} from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function EditPlacePage() {
    const params = useParams();

    const router = useRouter();

    const id =
        params.id as string;

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

    useEffect(() => {
        fetchPlace();
    }, []);

    const fetchPlace =
        async () => {
            const { data } =
                await supabase
                    .from("places")
                    .select("*")
                    .eq("id", id)
                    .single();

            if (!data) return;

            setPlaceName(
                data.place_name
            );

            setCity(data.city || "");

            setCountry(
                data.country || ""
            );

            setVisitDate(
                data.visit_date || ""
            );

            setNotes(
                data.notes || ""
            );

            setRating(
                data.rating || 5
            );
        };

    const updatePlace =
        async (
            e: React.FormEvent
        ) => {
            e.preventDefault();

            try {
                setLoading(true);

                const { error } =
                    await supabase
                        .from("places")
                        .update({
                            place_name:
                                placeName,

                            city,

                            country,

                            visit_date:
                                visitDate,

                            notes,

                            rating,
                        })
                        .eq("id", id);

                if (error) {
                    console.error(error);

                    return;
                }

                router.back();
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
                    Edit Place
                </h1>

                <form
                    onSubmit={
                        updatePlace
                    }
                    className="space-y-4"
                >
                    <input
                        type="text"
                        value={placeName}
                        onChange={(e) =>
                            setPlaceName(
                                e.target.value
                            )
                        }
                        className="input"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
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
                                    e.target.value
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
                            : "Save Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
}