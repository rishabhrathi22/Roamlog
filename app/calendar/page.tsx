import { supabase } from "@/lib/supabase";

import TravelCalendar from "@/components/TravelCalendar";

export default async function CalendarPage() {
    const { data: segments } =
        await supabase
            .from("segments")
            .select(
                `
        *,
        trips (
          id,
          title
        )
      `
            );

    const { data: places } =
        await supabase
            .from("places")
            .select(
                `
        *,
        trips (
          id,
          title
        )
      `
            );

    const timelineItems = [
        ...(segments || []).map(
            (segment) => ({
                type: "segment",

                date:
                    segment.departure_date,

                title: `${segment.source_name} → ${segment.destination_name}`,

                subtitle:
                    segment.airline,

                tripId:
                    segment.trips?.id,
            })
        ),

        ...(places || []).map(
            (place) => ({
                type: "place",

                date:
                    place.visit_date,

                title:
                    place.place_name,

                subtitle: `${place.city || ""}${place.country ? `, ${place.country}` : ""}`,

                tripId:
                    place.trips?.id,
            })
        ),
    ];

    return (
        <div className="page-container space-y-8">
            <div>
                <h1 className="section-title">
                    Travel Calendar
                </h1>

                <p className="text-slate-400 mt-2">
                    Browse your
                    journeys by
                    date
                </p>
            </div>

            <TravelCalendar
                items={
                    timelineItems
                }
            />
        </div>
    );
}