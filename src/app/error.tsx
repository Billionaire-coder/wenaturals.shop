"use client";

import { useEffect } from "react";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Hydration or Runtime Error:", error);
    }, [error]);

    return (
        <main className="min-h-screen bg-mesh flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full" />

            <div className="relative z-10 max-w-xl w-full text-center">
                <div className="mb-8 inline-flex p-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
                    <AlertTriangle className="w-12 h-12" />
                </div>

                <h1 className="text-3xl font-bold mb-4 tracking-tight text-white">
                    An Alchemical Instability Occurred
                </h1>

                <p className="text-zinc-500 mb-12 max-w-md mx-auto">
                    A surge in the molecular flow has caused a temporary disruption. We are working to stabilize the environment.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => reset()}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-zinc-200 transition-all active:scale-95"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Re-Stabilize
                    </button>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-3 px-8 py-4 glass border border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white/10 transition-all active:scale-95"
                    >
                        <Home className="w-4 h-4" />
                        Safe Haven
                    </Link>
                </div>

                {error.digest && (
                    <p className="mt-8 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                        Reference: {error.digest}
                    </p>
                )}
            </div>
        </main>
    );
}
