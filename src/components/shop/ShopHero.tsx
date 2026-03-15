import { PageHero } from "@/components/layout/PageHero";
import { MediaItem } from "@/components/ui/MediaSlider";

interface ShopHeroProps {
    title?: string;
    description?: string;
    heading?: string;
    media?: (string | Record<string, unknown>)[];
}

export function ShopHero({ title, description, media = [] }: ShopHeroProps) {
    return (
        <PageHero
            title={title || "The Collections"}
            description={description || "A sanctuary of bio-active elixirs where clinical precision meets the raw intelligence of nature. Discover the formulas designed to resonate with your skin's unique frequency."}
            tag="Alchemical Curations"
            media={media as unknown as MediaItem[]}
            className="!pt-4 md:!pt-6"
        />
    );
}
