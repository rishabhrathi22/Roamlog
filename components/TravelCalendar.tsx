"use client";

import { useState } from "react";

import Calendar from "react-calendar";

import "react-calendar/dist/Calendar.css";

interface TimelineItem {
    type: string;

    date: string;

    title: string;

    subtitle?: string;

    tripId?: string;
}

interface Props {
    items: TimelineItem[];
}

export default function TravelCalendar({
    items,
}: Props) {
    const [selectedDate, setSelectedDate] =
        useState<Date | null>(
            new Date()
        );

    const selectedItems =
        items.filter(
            (item) => {
                if (
                    !selectedDate
                )
                    return false;

                return (
                    new Date(
                        item.date
                    ).toDateString() ===
                    selectedDate.toDateString()
                );
            }
        );

    return (
        <div className="grid lg:grid-cols-[400px_1fr] gap-6">
            <div className="card p-4 overflow-hidden">
                <Calendar
                    onChange={(
                        value
                    ) =>
                        setSelectedDate(
                            value as Date
                        )
                    }
                    value={
                        selectedDate
                    }
                    tileContent={({
                        date,
                        view,
                    }) => {
                        if (
                            view !==
                            "month"
                        )
                            return null;

                        const hasTravel =
                            items.some(
                                (
                                    item
                                ) =>
                                    new Date(
                                        item.date
                                    ).toDateString() ===
                                    date.toDateString()
                            );

                        if (
                            !hasTravel
                        )
                            return null;

                        return (
                            <div className="flex justify-center mt-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                            </div>
                        );
                    }}
                    className="!bg-transparent !border-0 w-full"
                />
            </div>

            <div className="card p-6">
                <h2 className="text-2xl font-semibold mb-6">
                    {selectedDate?.toLocaleDateString(
                        "en-US",
                        {
                            weekday:
                                "long",

                            month:
                                "long",

                            day: "numeric",

                            year: "numeric",
                        }
                    )}
                </h2>

                {selectedItems.length ===
                    0 ? (
                    <p className="text-slate-400">
                        No travel
                        activity
                    </p>
                ) : (
                    <div className="space-y-4">
                        {selectedItems.map(
                            (
                                item,
                                index
                            ) => (
                                <a
                                    key={
                                        index
                                    }
                                    href={`/trips/${item.tripId}`}
                                    className="block card p-4 hover:bg-slate-900 transition"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">
                                                {
                                                    item.title
                                                }
                                            </p>

                                            {item.subtitle && (
                                                <p className="text-sm text-slate-400 mt-1">
                                                    {
                                                        item.subtitle
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-2xl">
                                            {item.type ===
                                                "segment"
                                                ? "✈"
                                                : "📍"}
                                        </div>
                                    </div>
                                </a>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}