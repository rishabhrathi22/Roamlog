"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type Trip = {
    id: string;
    source_name: string;
    destination_name: string;
    departure_date: string;
    trip_type: string;
    flight_number: string;
    train_number: string;
};

export default function TimelinePage() {
    const [trips, setTrips] = useState<
        Trip[]
    >([]);

    useEffect(() => {
        const fetchTrips = async () => {
            const { data, error } =
                await supabase
                    .from("segments")
                    .select("*")
                    .order("departure_date", {
                        ascending: false,
                    });

            if (error) {
                console.error(error);
                return;
            }

            setTrips(data || []);
        };

        fetchTrips();
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            <h1 className="text-4xl tracking-tight font-bold mb-6">
                Timeline
            </h1>

            <div className="space-y-4">
                {trips.map((trip) => (
                    <div
                        key={trip.id}
                        className="border-l-4 border-blue-500 pl-4 py-2"
                    >
                        <p className="font-semibold">
                            {trip.source_name} →{" "}
                            {trip.destination_name}
                        </p>

                        <p className="text-gray-500">
                            {trip.trip_type}
                        </p>

                        {trip.flight_number && (
                            <p className="text-sm text-blue-400">
                                ✈ {trip.flight_number}
                            </p>
                        )}

                        {trip.train_number && (
                            <p className="text-sm text-green-400">
                                🚆 {trip.train_number}
                            </p>
                        )}

                        <p className="text-sm text-gray-400">
                            {trip.departure_date}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}