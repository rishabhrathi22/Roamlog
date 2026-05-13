import { NextResponse } from "next/server";

export async function GET(
    request: Request
) {
    try {
        const { searchParams } =
            new URL(request.url);

        const flightNumber =
            searchParams.get("flight");

        const date =
            searchParams.get("date");

        console.log(searchParams, flightNumber, date);

        if (!flightNumber || !date) {
            return NextResponse.json(
                {
                    error:
                        "Flight number and date required",
                },
                { status: 400 }
            );
        }

        const response = await fetch(
            `https://aerodatabox.p.rapidapi.com/flights/number/${flightNumber}/${date}`,

            {
                headers: {
                    "X-RapidAPI-Key":
                        process.env.RAPIDAPI_KEY!,

                    "X-RapidAPI-Host":
                        "aerodatabox.p.rapidapi.com",
                },
            }
        );

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: "Flight lookup failed",
            },
            { status: 500 }
        );
    }
}