"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import clsx from "clsx";

const links = [
    {
        href: "/stats",
        label: "Stats",
    },
    {
        href: "/trips",
        label: "Trips",
    },
    {
        href: "/scratch-map",
        label: "Scratch Map",
    },
    {
        href: "/calendar",
        label: "Calendar",
    },
    {
        href: "/scan",
        label: "Scan",
    },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link
                    href="/stats"
                    className="text-xl font-bold tracking-tight"
                >
                    TravelTracker
                </Link>

                <div className="flex gap-2">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={clsx(
                                "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                                pathname === link.href
                                    ? "bg-blue-500 text-white"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}