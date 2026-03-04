import { ContactClient } from "@/components/pages/ContactClient";
import { getSiteConfig } from "@/lib/content-server";
import { Metadata } from "next";

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata(): Promise<Metadata> {
    const config = await getSiteConfig(['content_pages']);
    const config_pages = (config.content_pages as Record<string, unknown>) || {};
    const contactContent = (config_pages.contact as Record<string, string>) || {
        title: "We're Here for You",
        description: "Whether you have a question about our ingredients, need help with an order, or just want to share your ritual, we're listening."
    };

    return {
        title: contactContent.title || "Contact Us",
        description: contactContent.description || "Get in touch with We Naturals.",
        alternates: {
            canonical: '/contact'
        }
    };
}

export default async function ContactPage() {
    const config = await getSiteConfig(['content_pages']) as Record<string, unknown>;

    return (
        <ContactClient initialContent={config.content_pages as unknown as Record<string, unknown>} />
    );
}
