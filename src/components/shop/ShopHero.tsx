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
            description={description}
            media={media as unknown as MediaItem[]}
        />
    );
}
