import type { Metadata, Viewport } from "next";
import { Outfit, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { createStaticClient } from "@/lib/supabase-static";
import { RootTransition } from "@/components/layout/RootTransition";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { ParallaxBackground } from "@/components/layout/ParallaxBackground";
// import dynamic from "next/dynamic";
import { Preloader } from "@/components/ui/Preloader";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { DesignProvider } from "@/components/providers/DesignProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { EnvironmentalProvider } from "@/components/providers/EnvironmentalProvider";
// import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
// import { SiteNavbar } from "@/components/layout/SiteNavbar";
import { MaintenanceMode } from "@/components/layout/MaintenanceMode";
// import { Footer } from "@/components/layout/Footer";
// import { CartSidebar } from "@/components/cart/CartSidebar";
import { ClientShell } from "@/components/layout/ClientShell";
import { AscensionSettings, PerformanceSettings } from "@/store/useEnvironmentStore";



const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

import { getSiteConfig } from "@/lib/content-server";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig(['content_marketing']);
  const marketingData = (config['content_marketing'] as { seo?: Record<string, string> }) || {};
  const seo = marketingData.seo || {};

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://wenaturals.shop'),
    title: {
      template: seo.titleTemplate || "%s | We Naturals",
      default: "We Naturals | Premium E-Commerce",
    },
    description: seo.defaultDescription || "Experience the next generation of natural products with glassmorphism design.",
    openGraph: {
      title: "We Naturals | Premium E-Commerce",
      description: seo.defaultDescription || "Experience the next generation of natural products with glassmorphism design.",
      images: [
        {
          url: seo.defaultImage || "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "We Naturals Premium E-Commerce",
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "We Naturals | Premium E-Commerce",
      description: seo.defaultDescription || "Experience the next generation of natural products with glassmorphism design.",
      images: [seo.defaultImage || "/og-image.jpg"],
    },
    icons: {
      icon: seo.favicon || "/favicon.ico",
      apple: seo.appleTouchIcon || "/apple-touch-icon.png",
    }
  };
}

import { Suspense } from "react";

async function LayoutDataLayer({ children }: { children: React.ReactNode }) {
  let isMaintenance = false;
  let design: Record<string, string> = {};
  let performance: Partial<PerformanceSettings> = {};
  let ascension: Partial<AscensionSettings> = {};

  try {
    const staticSupabase = await createStaticClient();
    const { data } = await staticSupabase
      .from('site_config')
      .select('key, value')
      .in('key', ['content_system', 'content_design_system', 'content_performance', 'content_ascension']);

    if (data) {
      data.forEach(item => {
        if (item.key === 'content_system') isMaintenance = item.value?.maintenance_mode || false;
        if (item.key === 'content_design_system') design = item.value || {};
        if (item.key === 'content_performance') performance = item.value || {};
        if (item.key === 'content_ascension') ascension = item.value || {};
      });
    }
  } catch (e) {
    console.error("LayoutDataLayer background fetch failed:", e);
  }

  const cssVariables = `
    :root {
      --primary: ${design.primary_color || '#3b82f6'};
      --radius: ${design.border_radius || '0.75rem'};
      --glass-opacity: ${design.glass_opacity || 0.1};
      --glass-blur: ${design.glass_blur || '10px'};
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      <EnvironmentalProvider initialPerformance={performance as PerformanceSettings} initialAscension={ascension as AscensionSettings}>
        <AuthProvider>
          <DesignProvider initialContent={design}>
            {isMaintenance ? (
              <MaintenanceMode />
            ) : (
              <ClientShell>
                <SmoothScroll />
                <Preloader />
                <ParallaxBackground />
                <div className="relative z-10 w-full">
                  <RootTransition>
                    {children}
                  </RootTransition>
                </div>
              </ClientShell>
            )}
          </DesignProvider>
        </AuthProvider>
      </EnvironmentalProvider>
    </>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "We Naturals",
    "url": process.env.NEXT_PUBLIC_BASE_URL || "https://wenaturals.shop",
    "logo": `${process.env.NEXT_PUBLIC_BASE_URL || "https://wenaturals.shop"}/we_naturals_logo.png`,
    "sameAs": [
      "https://facebook.com/wenaturals",
      "https://instagram.com/wenaturals",
      "https://twitter.com/wenaturals"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-800-555-5555",
      "contactType": "Contact Support"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${process.env.NEXT_PUBLIC_BASE_URL || "https://wenaturals.shop"}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Basic fallback variables for fixed shell */}
        <style dangerouslySetInnerHTML={{
          __html: `
          :root {
            --primary: #3b82f6;
            --radius: 0.75rem;
            --glass-opacity: 0.1;
            --glass-blur: 10px;
          }
        `}} />
      </head>
      <body
        className={`${outfit.variable} ${cormorant.variable} antialiased bg-background text-foreground min-h-screen font-sans transition-colors duration-300`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={
            <div className="fixed inset-0 bg-background flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <LayoutDataLayer>
              {children}
            </LayoutDataLayer>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
