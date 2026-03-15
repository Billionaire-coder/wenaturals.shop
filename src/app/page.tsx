import { Suspense } from "react";
import { MarqueeSimple } from "@/components/ui/Marquee";
import { Hero } from "@/components/home/Hero";
import { Philosophy } from "@/components/home/Philosophy";
import { CategorySpotlight } from "@/components/home/CategorySpotlight";
import { RitualJournal } from "@/components/home/RitualJournal";

import { ClientRituals } from "@/components/home/ClientRituals";
// import { FeaturedCollection } from "@/components/home/FeaturedCollection";
import { AsyncFeaturedCollection } from "@/components/home/AsyncFeaturedCollection";
import { FeaturedSectionSkeleton } from "@/components/ui/AlchemicalSkeleton";
import { YoutubeShorts } from "@/components/home/YoutubeShorts";
import { getSiteConfig } from "@/lib/content-server";
import type { Metadata } from "next";

export const generateMetadata = (): Metadata => {
  return {
    title: "We Naturals | Premium Botanical Serums & Active Skincare",
    description: "Discover We Naturals' official collection of organic, high-performance botanical serums. Experience the convergence of synthetic biology and nature's finest ingredients.",
    openGraph: {
      title: "We Naturals | Official Collection",
      description: "Discover We Naturals' official collection of organic, high-performance botanical serums.",
      url: "https://wenaturals.shop",
      siteName: "We Naturals",
      images: [
        {
          url: "/we_naturals_logo.png",
          width: 1200,
          height: 630,
          alt: "We Naturals Brand Logo",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "We Naturals | Official Collection",
      description: "Discover We Naturals' official collection of organic, high-performance botanical serums.",
      images: ["/we_naturals_logo.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: '/'
    }
  };
};

// We need to refactor these components to accept 'initialContent' props
// For now, we pass the data down, assuming we will update them next.

const COMPONENTS: Record<string, React.ComponentType<{ initialContent: Record<string, unknown> }>> = {
  hero: Hero,
  philosophy: Philosophy,
  rituals: ClientRituals,
  shorts: YoutubeShorts,
  journal: RitualJournal,
  testimonials: MarqueeSimple,
  marquee_top: MarqueeSimple,
  marquee_bottom: MarqueeSimple,
  categories: CategorySpotlight,
};



export default async function Home() {
  // 1. Fetch Layout Config (Fast)
  const siteConfig = await getSiteConfig([
    'homepage_layout',
    'content_homepage', // Hero
    'content_philosophy',
    'content_testimonials', // Rituals/Testimonials
    'youtube_shorts',
    'content_featured',
    'content_journal',
    'content_categories',
    'content_marquee_top',
    'content_marquee_bottom'
  ]);


  const layout = Array.isArray(siteConfig['homepage_layout'])
    ? siteConfig['homepage_layout']
    : ['hero', 'marquee_top', 'philosophy', 'rituals', 'shorts', 'featured', 'journal', 'marquee_bottom', 'categories'];

  // Map keys to specific content objects for easier prop passing
  const contentMap: Record<string, unknown> = {
    hero: siteConfig['content_homepage'],
    philosophy: siteConfig['content_philosophy'],
    rituals: siteConfig['content_testimonials'],
    shorts: siteConfig['youtube_shorts'],
    featured: siteConfig['content_featured'],
    journal: siteConfig['content_journal'],
    testimonials: siteConfig['content_testimonials'], // Legacy fallback
    categories: siteConfig['content_categories'],
    marquee_top: siteConfig['content_marquee_top'],
    marquee_bottom: siteConfig['content_marquee_bottom']
  };

  return (
    <main className="min-h-[100dvh]">
      <Suspense fallback={<div className="min-h-screen bg-black animate-pulse" />}>

        {layout.map((sectionKey: string) => {
          const sectionData = contentMap[sectionKey];

          // Special handling for Featured to allow streaming
          if (sectionKey === 'featured') {
            return (
              <Suspense key={sectionKey} fallback={<FeaturedSectionSkeleton />}>
                <AsyncFeaturedCollection initialContent={sectionData as Record<string, unknown>} />
              </Suspense>
            );
          }

          const Component = COMPONENTS[sectionKey];
          if (!Component) return null;

          return <Component key={sectionKey} initialContent={sectionData as Record<string, unknown>} />;
        })}

      </Suspense>
    </main>
  );
}
