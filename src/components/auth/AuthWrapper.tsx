"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { LoginView } from "./LoginView";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<unknown>(null);
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setIsLoading(false);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-mesh flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <LoginView
                message="To preserve the sanctity of your ritual history, please sign in to complete your purchase."
                redirectTo="/auth/callback?next=/checkout"
            />
        );
    }

    return <>{children}</>;
}
