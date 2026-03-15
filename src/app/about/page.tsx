import { AboutClient } from "@/components/pages/AboutClient";
import { getSiteConfig } from "@/lib/content-server";
import { Metadata } from "next";


// revalidate removed for PPR/cacheComponents compatibility

export async function generateMetadata(): Promise<Metadata> {
    const config = await getSiteConfig(['content_pages']);
    const contentPages = (config.content_pages || {}) as Record<string, unknown>;
    const aboutContent = (contentPages.about as Record<string, unknown>) || {
        title: "Behind the Glass",
        description: "Merging ancient biological wisdom with modern molecular science."
    };

    return {
        title: (aboutContent.title as string) || "Behind the Glass",
        description: (aboutContent.description as string) || "Merging ancient biological wisdom with modern molecular science.",
        alternates: {
            canonical: '/about'
        }
    };
}

export default async function AboutPage() {
    const config = await getSiteConfig(['content_pages']);

    return (
        <AboutClient initialContent={config.content_pages as Record<string, unknown>} />
    );
}
