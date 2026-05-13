import TravelMap from "../TravelMap";

export default function MapPage() {
    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            <h1 className="text-4xl tracking-tight font-bold mb-6">
                Travel Map
            </h1>

            <div className="flex gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 button-primary rounded-full" />
                    Flights
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full" />
                    Trains
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full" />
                    Road Trips
                </div>
            </div>

            <TravelMap />
        </div>
    );
}