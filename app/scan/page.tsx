"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
    BrowserMultiFormatReader,
} from "@zxing/browser";

import {
    BarcodeFormat,
    DecodeHintType,
} from "@zxing/library";

export default function ScanPage() {
    const router =
        useRouter();

    const [result, setResult] =
        useState("");

    const [parsed, setParsed] =
        useState<any>(null);

    const [flightData, setFlightData] =
        useState<any>(null);

    const [loading, setLoading] =
        useState(false);

    const parseBoardingPass =
        (text: string) => {
            try {
                const passenger =
                    text
                        .substring(
                            2,
                            22
                        )
                        .trim();

                const pnr =
                    text
                        .substring(
                            23,
                            29
                        )
                        .trim();

                const from =
                    text
                        .substring(
                            30,
                            33
                        )
                        .trim();

                const to =
                    text
                        .substring(
                            33,
                            36
                        )
                        .trim();

                const airline =
                    text
                        .substring(
                            36,
                            38
                        )
                        .trim();

                const flightNumber =
                    text
                        .substring(
                            39,
                            43
                        )
                        .trim();

                const seat =
                    text
                        .substring(
                            48,
                            52
                        )
                        .trim();


                const julianDate =
                    text
                        .substring(44, 47)
                        .trim();

                const year =
                    new Date().getFullYear();

                const flightDate =
                    new Date(year, 0);

                flightDate.setDate(
                    Number(julianDate)
                );

                return {
                    passenger, pnr, from, to, airline, flightNumber, seat,
                    flightDate:
                        `${flightDate.getFullYear()}-${String(
                            flightDate.getMonth() + 1
                        ).padStart(2, "0")}-${String(
                            flightDate.getDate()
                        ).padStart(2, "0")}`,
                };
            } catch (error) {
                console.error(
                    error
                );

                return null;
            }
        };

    const fetchFlightDetails =
        async (
            airline: string,
            flightNumber: string,
            flightDate: string
        ) => {
            console.log({
                airline,
                flightNumber,
                flightDate,
            });

            try {
                const fullFlight =
                    `${airline}${flightNumber}`;

                const response =
                    await fetch(
                        `/api/flight-lookup?flight=${fullFlight}&date=${flightDate}`
                    );

                const data =
                    await response.json();

                if (
                    Array.isArray(
                        data
                    ) &&
                    data.length > 0
                ) {
                    setFlightData(
                        data[0]
                    );
                }
            } catch (error) {
                console.error(
                    error
                );
            }
        };

    const scanFile = async (
        file: File
    ) => {
        try {
            setLoading(true);

            const hints = new Map();

            hints.set(
                DecodeHintType.POSSIBLE_FORMATS,
                [
                    BarcodeFormat.QR_CODE,

                    BarcodeFormat.AZTEC,

                    BarcodeFormat.PDF_417,

                    BarcodeFormat.DATA_MATRIX,
                ]
            );

            const reader =
                new BrowserMultiFormatReader(
                    hints
                );

            const imageUrl =
                URL.createObjectURL(
                    file
                );

            const img =
                new Image();

            img.src = imageUrl;

            img.onload = async () => {
                try {
                    const canvas =
                        document.createElement(
                            "canvas"
                        );

                    const ctx =
                        canvas.getContext(
                            "2d"
                        );

                    if (!ctx) {
                        throw new Error(
                            "Canvas not supported"
                        );
                    }

                    // upscale image
                    const scale = 2;

                    canvas.width =
                        img.width * scale;

                    canvas.height =
                        img.height * scale;

                    ctx.drawImage(
                        img,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );

                    // image preprocessing
                    const imageData =
                        ctx.getImageData(
                            0,
                            0,
                            canvas.width,
                            canvas.height
                        );

                    const data =
                        imageData.data;

                    for (
                        let i = 0;
                        i < data.length;
                        i += 4
                    ) {
                        const avg =
                            (data[i] +
                                data[i + 1] +
                                data[i + 2]) /
                            3;

                        // stronger contrast
                        const value =
                            avg > 140
                                ? 255
                                : 0;

                        data[i] = value;
                        data[i + 1] =
                            value;
                        data[i + 2] =
                            value;
                    }

                    ctx.putImageData(
                        imageData,
                        0,
                        0
                    );

                    const result =
                        await reader.decodeFromCanvas(
                            canvas
                        );

                    const text =
                        result.getText();

                    setResult(text);

                    const parsedData =
                        parseBoardingPass(
                            text
                        );

                    setParsed(parsedData);

                    if (parsedData) {
                        fetchFlightDetails(
                            parsedData.airline,
                            parsedData.flightNumber,
                            parsedData.flightDate
                        );
                    }
                } catch (error) {
                    console.error(
                        error
                    );

                    alert(
                        "No barcode/QR found"
                    );
                } finally {
                    setLoading(false);
                }
            };
        } catch (error) {
            console.error(error);

            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
            <div>
                <h1 className="section-title">
                    Scan Boarding
                    Pass
                </h1>

                <p className="text-slate-400 mt-2">
                    Upload a boarding
                    pass image to
                    extract flight
                    details
                </p>
            </div>

            <div className="card p-6 space-y-6">
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const file =
                            e.target
                                .files?.[0];

                        if (
                            !file
                        )
                            return;

                        scanFile(
                            file
                        );
                    }}
                    className="input"
                />

                {loading && (
                    <p className="text-slate-400">
                        Scanning...
                    </p>
                )}

                {result && (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-semibold">
                                Raw Barcode
                                Data
                            </h2>

                            <p className="text-slate-400 text-sm mt-1">
                                Decoded from
                                boarding pass
                            </p>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-auto">
                            <pre className="text-sm whitespace-pre-wrap break-all text-slate-300">
                                {result}
                            </pre>
                        </div>
                    </div>
                )}

                {parsed && (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-semibold">
                                Parsed Flight
                                Details
                            </h2>

                            <p className="text-slate-400 text-sm mt-1">
                                Extracted from
                                boarding pass
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="card p-4">
                                <p className="text-sm text-slate-400">
                                    Passenger
                                </p>

                                <p className="font-semibold mt-2">
                                    {
                                        parsed.passenger
                                    }
                                </p>
                            </div>

                            <div className="card p-4">
                                <p className="text-sm text-slate-400">
                                    PNR
                                </p>

                                <p className="font-semibold mt-2">
                                    {parsed.pnr}
                                </p>
                            </div>

                            <div className="card p-4">
                                <p className="text-sm text-slate-400">
                                    Route
                                </p>

                                <p className="font-semibold mt-2">
                                    {
                                        parsed.from
                                    }{" "}
                                    →{" "}
                                    {parsed.to}
                                </p>
                            </div>

                            <div className="card p-4">
                                <p className="text-sm text-slate-400">
                                    Airline
                                </p>

                                <p className="font-semibold mt-2">
                                    {
                                        parsed.airline
                                    }
                                </p>
                            </div>

                            <div className="card p-4">
                                <p className="text-sm text-slate-400">
                                    Flight
                                </p>

                                <p className="font-semibold mt-2">
                                    {
                                        parsed.flightNumber
                                    }
                                </p>
                            </div>

                            <div className="card p-4">
                                <p className="text-sm text-slate-400">
                                    Seat
                                </p>

                                <p className="font-semibold mt-2">
                                    {
                                        parsed.seat
                                    }
                                </p>
                            </div>

                            <div className="card p-4">
                                <p className="text-sm text-slate-400">
                                    Flight Date
                                </p>

                                <p className="font-semibold mt-2">
                                    {parsed.flightDate}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {flightData && (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-semibold">
                                Flight Details
                            </h2>

                            <p className="text-slate-400 text-sm mt-1">
                                Retrieved from
                                flight database
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="card p-4">
                                <p className="text-sm text-slate-400">
                                    Route
                                </p>

                                <p className="font-semibold mt-2">
                                    {
                                        flightData
                                            ?.departure
                                            ?.airport
                                            ?.iata
                                    }{" "}
                                    →
                                    {" "}
                                    {
                                        flightData
                                            ?.arrival
                                            ?.airport
                                            ?.iata
                                    }
                                </p>
                            </div>

                            <div className="card p-4">
                                <p className="text-sm text-slate-400">
                                    Airline
                                </p>

                                <p className="font-semibold mt-2">
                                    {
                                        flightData
                                            ?.airline
                                            ?.name
                                    }
                                </p>
                            </div>

                            <div className="card p-4">
                                <p className="text-sm text-slate-400">
                                    Departure
                                </p>

                                <p className="font-semibold mt-2">
                                    {
                                        flightData
                                            ?.departure
                                            ?.scheduledTime
                                            ?.local
                                    }
                                </p>
                            </div>

                            <div className="card p-4">
                                <p className="text-sm text-slate-400">
                                    Arrival
                                </p>

                                <p className="font-semibold mt-2">
                                    {
                                        flightData
                                            ?.arrival
                                            ?.scheduledTime
                                            ?.local
                                    }
                                </p>
                            </div>

                            <div className="card p-4">
                                <p className="text-sm text-slate-400">
                                    Terminal
                                </p>

                                <p className="font-semibold mt-2">
                                    T
                                    {
                                        flightData
                                            ?.departure
                                            ?.terminal
                                    }
                                </p>
                            </div>

                            <div className="card p-4">
                                <p className="text-sm text-slate-400">
                                    Aircraft
                                </p>

                                <p className="font-semibold mt-2">
                                    {
                                        flightData
                                            ?.aircraft
                                            ?.model
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {parsed &&
                    flightData && (
                        <button
                            onClick={() => {
                                const params =
                                    new URLSearchParams();

                                params.set(
                                    "type",
                                    "Flight"
                                );

                                params.set(
                                    "flight",
                                    `${parsed.airline}${parsed.flightNumber}`
                                );

                                params.set(
                                    "from",
                                    parsed.from
                                );

                                params.set(
                                    "to",
                                    parsed.to
                                );

                                params.set(
                                    "date",
                                    parsed.flightDate
                                );

                                params.set(
                                    "airline",
                                    flightData?.airline
                                        ?.name ||
                                    parsed.airline
                                );

                                if (
                                    flightData?.departure
                                        ?.scheduledTime
                                        ?.local
                                ) {
                                    params.set(
                                        "departure",
                                        flightData.departure.scheduledTime.local
                                    );
                                }

                                if (
                                    flightData?.arrival
                                        ?.scheduledTime
                                        ?.local
                                ) {
                                    params.set(
                                        "arrival",
                                        flightData.arrival.scheduledTime.local
                                    );
                                }

                                router.push(
                                    `/trips?scan=${encodeURIComponent(
                                        params.toString()
                                    )}`
                                );
                            }}
                            className="button-primary w-full"
                        >
                            Add Flight To
                            Trip
                        </button>
                    )}
            </div>
        </div>
    );
}