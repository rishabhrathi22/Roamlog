"use client";

import {
    ComposableMap,
    Geographies,
    Geography,
} from "react-simple-maps";

const geoUrl =
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface Props {
    visitedCountries: string[];
}

export default function ScratchMap({
    visitedCountries,
}: Props) {
    return (
        <div className="card p-4 overflow-hidden">
            <ComposableMap
                projectionConfig={{
                    scale: 160,
                }}
                className="w-full h-auto"
            >
                <Geographies
                    geography={
                        geoUrl
                    }
                >
                    {({
                        geographies,
                    }) =>
                        geographies.map(
                            (
                                geo
                            ) => {
                                const countryName =
                                    geo
                                        .properties
                                        .name;

                                const visited =
                                    visitedCountries.includes(
                                        countryName
                                    );

                                return (
                                    <Geography
                                        key={
                                            geo.rsmKey
                                        }
                                        geography={
                                            geo
                                        }
                                        style={{
                                            default:
                                            {
                                                fill: visited
                                                    ? "#3b82f6"
                                                    : "#1e293b",

                                                stroke:
                                                    "#0f172a",

                                                strokeWidth: 0.5,

                                                outline:
                                                    "none",
                                            },

                                            hover:
                                            {
                                                fill: visited
                                                    ? "#60a5fa"
                                                    : "#334155",

                                                outline:
                                                    "none",
                                            },

                                            pressed:
                                            {
                                                fill: "#2563eb",

                                                outline:
                                                    "none",
                                            },
                                        }}
                                    />
                                );
                            }
                        )
                    }
                </Geographies>
            </ComposableMap>
        </div>
    );
}