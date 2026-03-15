"use client";

import { GlassCard } from "../ui/GlassCard";
import Image from "next/image";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";

interface LoginViewProps {
    title?: string;
    message?: string;
    redirectTo?: string;
}

export function LoginView({
    title = "Sanctuary Access",
    message = "To preserve the sanctity of your ritual history, please sign in to continue.",
    redirectTo = "/"
}: LoginViewProps) {
    const supabase = createClient();

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}${redirectTo}`,
            },
        });
    };

    return (
        <main className="min-h-[70dvh] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <GlassCard className="p-8 w-full text-center space-y-6">
                    <h1 className="text-3xl font-bold">{title}</h1>
                    <p className="text-zinc-500">
                        {message}
                    </p>

                    <button
                        onClick={handleLogin}
                        className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-3"
                    >
                        <div className="relative w-5 h-5">
                            <Image
                                src="https://www.svgrepo.com/show/475656/google-color.svg"
                                fill
                                className="object-contain"
                                alt="Google"
                            />
                        </div>
                        Continue with Google
                    </button>

                    <p className="text-xs text-zinc-600 uppercase tracking-widest pt-4">
                        We honor your privacy.
                    </p>
                </GlassCard>
            </motion.div>
        </main>
    );
}
