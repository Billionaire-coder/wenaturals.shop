"use client";

import { usePathname } from "next/navigation";
import { SiteNavbar } from "@/components/layout/SiteNavbar";
import { Footer } from "@/components/layout/Footer";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { LazyMotion, domAnimation } from "framer-motion";
import dynamic from "next/dynamic";

// Visual Overlays moved to Client Shell for build stability in Next.js 16
const AtmosphereParticles = dynamic(() => import("@/components/ui/AtmosphereParticles"), { ssr: false });
const CustomCursor = dynamic(() => import("@/components/ui/CustomCursor"), { ssr: false });
const FlyGhostOverlay = dynamic(() => import("@/components/ui/FlyGhostOverlay"), { ssr: false });
const GrainOverlay = dynamic(() => import("@/components/ui/GrainOverlay"), { ssr: false });

export function ClientShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/admin");

    return (
        <LazyMotion features={domAnimation}>
            {!isAdmin && (
                <>
                    <AnnouncementBar />
                    <SiteNavbar />
                    <GrainOverlay />
                    <AtmosphereParticles />
                    <FlyGhostOverlay />
                    <CustomCursor />
                </>
            )}
            <main>{children}</main>
            {!isAdmin && (
                <>
                    <Footer />
                    <CartSidebar />
                </>
            )}
        </LazyMotion>
    );
}
