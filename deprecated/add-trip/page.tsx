"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCoordinates } from "@/lib/geocode";

export default function AddTripPage() {
    const [source, setSource] = useState("");
    const [destination, setDestination] = useState("");
    const [tripType, setTripType] = useState("Flight");
    const [departureDate, setDepartureDate] = useState("");
    const [arrivalDate, setArrivalDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [flightNumber, setFlightNumber] = useState("");
    const [flightSearchDate, setFlightSearchDate] = useState("");
    const [trainNumber, setTrainNumber] = useState("");
    const [flightError, setFlightError] = useState("");
    const [flightResults, setFlightResults] = useState<any[]>([]);
    const [flightLoading, setFlightLoading] = useState(false);
    const [airline, setAirline] = useState("");
    const [departureTime, setDepartureTime] = useState("");
    const [arrivalTime, setArrivalTime] = useState("");
    const [sourceCountry, setSourceCountry] = useState("");
    const [destinationCountry, setDestinationCountry] = useState("");
    const [companions, setCompanions] = useState("Solo");
    const [tripPurpose, setTripPurpose] = useState("Vacation");
    const [distanceKm, setDistanceKm] = useState<number | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const sourceCoords = await getCoordinates(source);
            const destinationCoords = await getCoordinates(destination);
            const { error } = await supabase.from("segments").insert([
                {
                    source_name: source,
                    destination_name: destination,
                    trip_type: tripType,
                    source_lat: sourceCoords?.lat,
                    source_lng: sourceCoords?.lng,
                    destination_lat: destinationCoords?.lat,
                    destination_lng: destinationCoords?.lng,
                    departure_date: departureDate,
                    arrival_date: arrivalDate,
                    flight_number: flightNumber,
                    train_number: trainNumber,
                    airline,
                    departure_time: departureTime,
                    arrival_time: arrivalTime,
                    source_country: sourceCountry,
                    destination_country: destinationCountry,

                    companions,

                    trip_purpose: tripPurpose,

                    distance_km: distanceKm,
                },
            ]);
            if (error) {
                console.error(error);
                alert("Failed to save trip");
                return;
            }
            alert("Trip added!");
            setSource("");
            setDestination("");
            setTripType("Flight");
            setFlightNumber("");
            setTrainNumber("");
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const lookupFlight = async () => {
        if (!flightNumber || !flightSearchDate) {
            setFlightError("Please enter flight number and date");
            return;
        }
        try {
            setFlightError("");
            setFlightLoading(true);
            const response = await fetch(
                `/api/flight-lookup?flight=${flightNumber}&date=${flightSearchDate}`,
            );
            const result = await response.json();
            const flights = Array.isArray(result) ? result : [];
            setFlightResults(flights);
            if (flights.length === 0) {
                setFlightError("No flights found");
            }
        } catch (error) {
            console.error(error);
            setFlightError("Failed to search flights");
        } finally {
            setFlightLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="max-w-xl">
                <h1 className="text-4xl tracking-tight font-bold mb-6"> Add Trip </h1>
                <div className="card p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <select
                            value={tripType}
                            onChange={(e) => setTripType(e.target.value)}
                            className="input"
                        >
                            <option>Flight</option> <option>Train</option>
                            <option>Road Trip</option> <option>Bus</option>
                        </select>
                        {tripType === "Flight" && (
                            <input
                                type="text"
                                placeholder="Flight Number (e.g. AI176)"
                                value={flightNumber}
                                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                                className="input"
                            />
                        )}
                        {tripType === "Flight" && (
                            <input
                                type="date"
                                value={flightSearchDate}
                                onChange={(e) => setFlightSearchDate(e.target.value)}
                                className="input"
                            />
                        )}
                        {flightError && (
                            <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg">
                                {flightError}
                            </div>
                        )}
                        {flightResults.length > 0 && (
                            <div className="card overflow-hidden">
                                {flightResults.map((flight, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => {
                                            setSource(flight.departure?.airport?.name || "");
                                            setDestination(flight.arrival?.airport?.name || "");
                                            setDepartureDate(
                                                flight.departure?.scheduledTime?.local?.split("T")[0] || "",
                                            );
                                            setArrivalDate(
                                                flight.arrival?.scheduledTime?.local?.split("T")[0] || "",
                                            );
                                            setFlightNumber(flight.number || "");
                                            setAirline(flight.airline?.name || "");
                                            setDepartureTime(
                                                flight.departure?.scheduledTime?.local
                                                    ?.replace(" ", "T")
                                                    ?.slice(0, 16) || "",
                                            );
                                            setArrivalTime(
                                                flight.arrival?.scheduledTime?.local
                                                    ?.replace(" ", "T")
                                                    ?.slice(0, 16) || "",
                                            );
                                            setSourceCountry(
                                                flight.departure?.airport?.countryCode || "",
                                            );

                                            setDestinationCountry(
                                                flight.arrival?.airport?.countryCode || "",
                                            );

                                            setDistanceKm(flight.greatCircleDistance?.km || null);
                                            setFlightResults([]);
                                        }}
                                        className="w-full text-left p-4 border-b hover:bg-slate-800/80 transition-all duration-200"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-lg">
                                                    {flight.airline?.name || "Unknown Airline"}
                                                </p>

                                                <p className="text-sm text-gray-400">{flight.number}</p>

                                                <p className="mt-2 font-medium">
                                                    {flight.departure?.airport?.iata} →
                                                    {flight.arrival?.airport?.iata}
                                                </p>

                                                <p className="text-sm text-gray-400">
                                                    {flight.departure?.airport?.name}
                                                </p>

                                                <p className="text-sm text-gray-400">
                                                    {flight.arrival?.airport?.name}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p
                                                    className={`font-medium ${flight.status === "Arrived"
                                                        ? "text-green-400"
                                                        : "text-yellow-400"
                                                        }`}
                                                >
                                                    {flight.status}
                                                </p>

                                                <p className="text-sm text-gray-400 mt-2">
                                                    {flight.departure?.scheduledTime?.local?.split(" ")[1]}
                                                </p>

                                                <p className="text-sm text-gray-400">→</p>

                                                <p className="text-sm text-gray-400">
                                                    {flight.arrival?.scheduledTime?.local?.split(" ")[1]}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 mt-4 text-sm text-gray-400">
                                            <p>{companions}</p>

                                            <p>•</p>

                                            <p>{tripPurpose}</p>

                                            {flight.greatCircleDistance?.km && (
                                                <>
                                                    <p>•</p>

                                                    <p>{Math.round(flight.greatCircleDistance.km)} km</p>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {tripType === "Flight" && (
                            <button
                                type="button"
                                onClick={lookupFlight}
                                disabled={flightLoading}
                                className="button-primary"
                            >
                                {flightLoading ? "Searching..." : "Search Flight"}
                            </button>
                        )}
                        <input
                            type="text"
                            placeholder="Source"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className="input"
                        />
                        <input
                            type="text"
                            placeholder="Destination"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            className="input"
                        />
                        <input
                            type="datetime-local"
                            value={departureTime}
                            onChange={(e) => setDepartureTime(e.target.value)}
                            className="input"
                        />
                        <input
                            type="datetime-local"
                            value={arrivalTime}
                            onChange={(e) => setArrivalTime(e.target.value)}
                            className="input"
                        />
                        <select
                            value={companions}
                            onChange={(e) => setCompanions(e.target.value)}
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
                            onChange={(e) => setTripPurpose(e.target.value)}
                            className="input"
                        >
                            <option>Vacation</option>
                            <option>Business</option>
                            <option>Family Visit</option>
                            <option>Education</option>
                            <option>Adventure</option>
                            <option>Pilgrimage</option>
                        </select>
                        {tripType === "Train" && (
                            <input
                                type="text"
                                placeholder="Train Number (e.g. 12951)"
                                value={trainNumber}
                                onChange={(e) => setTrainNumber(e.target.value)}
                                className="input"
                            />
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-black text-white px-6 py-3 rounded-lg"
                        >
                            {loading ? "Saving..." : "Save Trip"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
