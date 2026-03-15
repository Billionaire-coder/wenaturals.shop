"use client";

import { LoginView } from "@/components/auth/LoginView";

export default function AuthPage() {
    return (
        <div className="pt-20">
            <LoginView
                message="To preserve the sanctity of your ritual history, please sign in to access your curated collection."
                redirectTo="/auth/callback?next=/account"
            />
        </div>
    );
}
