import Link from "next/link";

import { supabase } from "@/lib/supabase";

interface Props {
    searchParams: Promise<{
        scan?: string;
    }>;
}

export default async function TripsPage({
    searchParams,
}: Props) {
    const {
        scan,
    } = await searchParams;

    const decodedScan =
        scan
            ? decodeURIComponent(
                scan
            )
            : null;

    const { data: trips } =
        await supabase
            .from("trips")
            .select("*")
            .order(
                "start_date",
                {
                    ascending: false,
                }
            );

    return (
        <div className="page-container space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="section-title">
                        Trips
                    </h1>

                    <p className="text-slate-400 mt-2">
                        Your travel
                        memories &
                        journeys
                    </p>
                </div>

                <Link
                    href="/trips/new"
                    className="button-primary"
                >
                    New Trip
                </Link>
            </div>

            {scan && (
                <div className="card p-6 border border-blue-500/30 bg-blue-500/10">
                    <h2 className="text-2xl font-semibold">
                        Boarding Pass
                        Detected
                    </h2>

                    <p className="text-slate-300 mt-2">
                        Select a trip
                        below to add
                        this flight
                        segment.
                    </p>
                </div>
            )}

            {trips?.length ===
                0 ? (
                <div className="card p-10 text-center">
                    <p className="text-slate-400">
                        No trips yet
                    </p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {trips?.map(
                        (trip) => (
                            <Link
                                key={
                                    trip.id
                                }
                                href={
                                    decodedScan
                                        ? `/trips/${trip.id}/add-segment?${decodedScan}`
                                        : `/trips/${trip.id}`
                                }
                                className="card p-6 hover:bg-slate-900 transition"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <h2 className="text-2xl font-semibold">
                                            {
                                                trip.title
                                            }
                                        </h2>

                                        <p className="text-slate-400 mt-2">
                                            {
                                                trip.trip_purpose
                                            }
                                        </p>
                                    </div>

                                    <div className="text-3xl">
                                        🧳
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-between items-center text-sm text-slate-400">
                                    <span>
                                        {
                                            trip.start_date
                                        }
                                    </span>

                                    <span>
                                        {
                                            trip.companions
                                        }
                                    </span>
                                </div>
                            </Link>
                        )
                    )}
                </div>
            )}
        </div>
    );
}