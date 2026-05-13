import { supabase } from "@/lib/supabase";

import ScratchMap from "@/components/ScratchMap";

export default async function ScratchMapPage() {
    const { data: places } =
        await supabase
            .from("places")
            .select("country");

    const visitedCountries =
        [
            ...new Set(
                places
                    ?.map(
                        (
                            place
                        ) =>
                            place.country
                    )
                    .filter(Boolean)
            ),
        ];

    return (
        <div className="page-container space-y-8">
            <div>
                <h1 className="section-title">
                    Scratch Map
                </h1>

                <p className="text-slate-400 mt-2">
                    {
                        visitedCountries.length
                    }{" "}
                    countries
                    visited
                </p>
            </div>

            <ScratchMap
                visitedCountries={
                    visitedCountries as string[]
                }
            />

            <div className="card p-6">
                <h2 className="text-2xl font-semibold mb-6">
                    Visited Countries
                </h2>

                <div className="flex flex-wrap gap-3">
                    {visitedCountries.map(
                        (
                            country
                        ) => (
                            <div
                                key={
                                    country as string
                                }
                                className="px-4 py-2 rounded-full bg-blue-500/20 text-blue-300"
                            >
                                {
                                    country as string
                                }
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}