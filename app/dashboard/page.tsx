"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type Trip = {
    id: string;
    source_name: string;
    destination_name: string;
    trip_type: string;
    departure_date: string;
    source_lat: number;
    source_lng: number;
    destination_lat: number;
    destination_lng: number;
    flight_number: string;
    train_number: string;
};

function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#eab308"];

export default function DashboardPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
    const [editSource, setEditSource] = useState("");
    const [editDestination, setEditDestination] = useState("");

    const totalTrips = trips.length;

    const uniqueCities = new Set(
        trips.flatMap((trip) => [trip.source_name, trip.destination_name]),
    ).size;

    const totalDistance = trips.reduce((acc, trip) => {
        if (!trip.source_lat || !trip.destination_lat) {
            return acc;
        }
        return (
            acc +
            calculateDistance(
                trip.source_lat,
                trip.source_lng,
                trip.destination_lat,
                trip.destination_lng,
            )
        );
    }, 0);

    const tripTypeCounts = trips.reduce((acc: Record<string, number>, trip) => {
        acc[trip.trip_type] = (acc[trip.trip_type] || 0) + 1;
        return acc;
    }, {});

    const chartData = Object.entries(tripTypeCounts).map(([type, count]) => ({
        type,
        count,
    }));

    const fetchTrips = async () => {
        const { data, error } = await supabase
            .from("segments")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) {
            console.error(error);
            return;
        }
        setTrips(data || []);
    };

    const deleteTrip = async (id: string) => {
        const confirmed = window.confirm("Delete this trip?");
        if (!confirmed) return;
        const { error } = await supabase.from("segments").delete().eq("id", id);
        if (error) {
            console.error(error);
            alert("Failed to delete");
            return;
        }
        setTrips((prev) => prev.filter((trip) => trip.id !== id));
    };

    const startEdit = (trip: Trip) => {
        setEditingTrip(trip);
        setEditSource(trip.source_name);
        setEditDestination(trip.destination_name);
    };

    const updateTrip = async () => {
        if (!editingTrip) return;
        const { error } = await supabase
            .from("segments")
            .update({ source_name: editSource, destination_name: editDestination })
            .eq("id", editingTrip.id);
        if (error) {
            console.error(error);
            alert("Update failed");
            return;
        }
        setTrips((prev) =>
            prev.map((trip) =>
                trip.id === editingTrip.id
                    ? {
                        ...trip,
                        source_name: editSource,
                        destination_name: editDestination,
                    }
                    : trip,
            ),
        );
        setEditingTrip(null);
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">

            <div className="space-y-8">

                <h1 className="text-4xl tracking-tight font-bold">

                    Dashboard
                </h1> {/* STATS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6">

                        <h2 className="text-gray-500"> Total Trips </h2>
                        <p className="text-4xl font-bold mt-2"> {totalTrips} </p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6">

                        <h2 className="text-gray-500"> Cities Visited </h2>
                        <p className="text-4xl font-bold mt-2"> {uniqueCities} </p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6">

                        <h2 className="text-gray-500"> Distance Travelled </h2>
                        <p className="text-4xl font-bold mt-2">

                            {Math.round(totalDistance)} km
                        </p>
                    </div>
                </div>
                {/* CHART */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6">

                    <h2 className="text-2xl font-semibold mb-6"> Trip Types </h2>
                    <div className="h-[400px]">

                        <ResponsiveContainer width="100%" height="100%">

                            <PieChart>

                                <Pie
                                    data={chartData}
                                    dataKey="count"
                                    nameKey="type"
                                    outerRadius={140}
                                >

                                    {chartData.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {/* RECENT TRIPS */}
                {editingTrip && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6 space-y-4">

                        <h2 className="text-2xl font-semibold"> Edit Trip </h2>
                        <input
                            type="text"
                            value={editSource}
                            onChange={(e) => setEditSource(e.target.value)}
                            className="input"
                        />
                        <input
                            type="text"
                            value={editDestination}
                            onChange={(e) => setEditDestination(e.target.value)}
                            className="input"
                        />
                        <div className="flex gap-2">

                            <button
                                onClick={updateTrip}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg"
                            >

                                Save Changes
                            </button>
                            <button
                                onClick={() => setEditingTrip(null)}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                            >

                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                <div className="space-y-4">

                    <h2 className="text-2xl font-semibold"> Recent Trips </h2>
                    {trips.map((trip) => (
                        <div
                            key={trip.id}
                            className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-4"
                        >

                            <p className="font-semibold">

                                {trip.source_name} → {trip.destination_name}
                            </p>
                            <p className="text-gray-500"> {trip.trip_type} </p>
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
                            <p className="text-sm text-gray-400"> {trip.departure_date} </p>
                            <button
                                onClick={() => deleteTrip(trip.id)}
                                className="mt-3 bg-red-500 text-white px-4 py-2 rounded-lg"
                            >

                                Delete
                            </button>
                            <button
                                onClick={() => startEdit(trip)}
                                className="mt-3 ml-2 button-primary text-white px-4 py-2 rounded-lg"
                            >

                                Edit
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
