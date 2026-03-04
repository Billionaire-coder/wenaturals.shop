export interface CMSMediaItem {
    url: string;
    type: 'image' | 'video';
    alt?: string;
}

export interface NavItem {
    label: string;
    href: string;
    visible?: boolean;
}

export interface FaqItem {
    question: string;
    answer: string;
    visible?: boolean;
}

export interface FaqSection {
    visible?: boolean;
    header_visible?: boolean;
    title?: string;
    description?: string;
    items?: FaqItem[];
}


export interface TestimonialItem {
    id?: string;
    name?: string;
    author?: string;
    content?: string;
    role?: string;
    image?: string;
    rating?: number;
    visible?: boolean;
    [key: string]: unknown;
}


export interface PhilosophyPoint {
    title: string;
    description: string;
    visible?: boolean;
}

export interface PhilosophySection {
    visible?: boolean;
    header_visible?: boolean;
    description_visible?: boolean;
    stat_visible?: boolean;
    title_top?: string;
    title_highlight?: string;
    title_bottom?: string;
    description?: string;
    stat_number?: string;
    stat_text_highlight?: string;
    stat_text?: string;
    media?: CMSMediaItem[];
    points?: PhilosophyPoint[];
}

export interface FeaturedSection {
    visible?: boolean;
    header_visible?: boolean;
    cta_visible?: boolean;
    categories_visible?: boolean;
    subheading?: string;
    cta_text?: string;
    heading_start?: string;
    heading_highlight?: string;
    media?: CMSMediaItem[];
}

export interface JournalSection {
    visible?: boolean;
    header_visible?: boolean;
    subheading_visible?: boolean;
    cta_visible?: boolean;
    tag_visible?: boolean;
    heading_start?: string;
    heading_highlight?: string;
    subheading?: string;
    cta_text?: string;
    tag_label?: string;
    media?: CMSMediaItem[];
}

export interface CategorySection {
    visible?: boolean;
    header_visible?: boolean;
    title_start?: string;
    title_highlight?: string;
    media?: CMSMediaItem[];
}

export interface MarqueeSection {
    visible?: boolean;
    text?: string;
    duration?: number;
}

export interface BlockContent {
    heading?: string;
    subheading?: string;
    text?: string;
    image?: string;
    html?: string;
    direction?: "left" | "right";
    productId?: string;
}

export interface Block {
    id: string;
    type: string;
    content: BlockContent;
}

export interface PageContent {
    title: string;
    description: string;
    heading?: string;
    media?: CMSMediaItem[];
    blocks?: Block[];
    items?: FaqItem[]; // For FAQ pages
    [key: string]: unknown;
}

export interface ContactContent extends PageContent {
    email?: string;
    phone?: string;
    address?: string;
    hours_weekdays?: string;
    hours_saturday?: string;
    hours_sunday?: string;
    channels_visible?: boolean;
    hours_visible?: boolean;
}

export interface PageBlock {
    id: string;
    type: string;
    content: BlockContent;
}


export interface TestimonialsSection {
    items: TestimonialItem[];
    visible?: boolean;
    header_visible?: boolean;
    heading?: string;
    title?: string;
    subheading?: string;
    media?: CMSMediaItem[];
    [key: string]: unknown;
}



export interface NavigationSection {
    header?: NavItem[];
    footer?: NavItem[];
}

export interface YoutubeShortsSection {
    items?: unknown[];
    visible?: boolean;
    header_visible?: boolean;
    marquee_visible?: boolean;
    title?: string;
    media?: unknown[];
    [key: string]: unknown;
}

export interface HeroSection {
    heading?: string;
    subheading?: string;
    image?: string;
    cta_text?: string;
    cta_link?: string;
    visible?: boolean;
    title_part_1?: string;
    title_part_2?: string;
    subtext?: string;
    media?: CMSMediaItem[];
}

export interface HomepageContent {
    visible: boolean;
    hero: HeroSection;
    marquee: MarqueeSection;
}

export interface AnnouncementBarContent {
    enabled: boolean;
    text: string;
    link: string;
    color: string;
    dismissible: boolean;
}

export interface MarketingContent {
    announcement_bar: AnnouncementBarContent;
    seo: {
        titleTemplate: string;
        defaultDescription: string;
        defaultImage: string;
        favicon?: string;
        appleTouchIcon?: string;
        jsonLd: Record<string, unknown>;
    };
}

export interface DesignSystemContent {
    primary_color?: string;
    secondary_color?: string;
    border_radius?: string;
    glass_opacity?: number;
    glass_blur?: string;
    font_heading?: string;
    font_body?: string;
    heading_font?: string;
    [key: string]: unknown;
}

export interface LegalContent {

    privacy_policy?: string;
    terms_of_service?: string;
}

export interface LayoutSpacingContent {
    section_padding_y?: number;
    grid_gap?: number;
    container_width?: string;
    content_alignment?: "left" | "center" | "right";
}

export interface AscensionContent {
    vibe?: "mystic" | "clinical" | "minimal" | "organic";
    glass_border_width?: number;
    viscosity?: number;
    reflection_intensity?: number;
    surface_finish?: "matte" | "gloss" | "satin";
    manual_chrono_mode?: string | null;
    particle_density?: number;
    wind_velocity?: number;
    shader_intensity?: number;
    shader_speed?: number;
    glow_intensity?: number;
    recursive_depth?: number;
    recursive_speed?: number;
    animation_intensity?: number;
}

export interface PerformanceContent {
    eco_mode?: boolean;
    particles_enabled?: boolean;
    recursive_geometry_enabled?: boolean;
    smooth_scroll_enabled?: boolean;
    parallax_enabled?: boolean;
    custom_cursor_enabled?: boolean;
    tilt_enabled?: boolean;
    marquee_enabled?: boolean;
    [key: string]: unknown;
}

export interface SystemContent {
    maintenance_mode: boolean;
}

export interface GlobalContent {
    logo_url?: string;
    navbar?: {
        logo_url?: string;
        links?: NavItem[];
    };
    footer?: {
        logo_url?: string;
        newsletter_visible?: boolean;
        newsletter_title?: string;
        newsletter_text?: string;
        copyright_text?: string;
    };
}

export interface CMSData {
    content_homepage?: HomepageContent;
    content_global?: GlobalContent;
    content_philosophy?: PhilosophySection;
    content_featured?: FeaturedSection;
    content_journal?: JournalSection;
    content_testimonials?: TestimonialsSection;
    content_pages?: {
        contact?: ContactContent;
        faq?: FaqSection;
        legal?: LegalContent;
        [key: string]: PageContent | FaqSection | ContactContent | LegalContent | undefined;
    };
    youtube_shorts?: YoutubeShortsSection;
    content_categories?: CategorySection;
    content_design_system?: DesignSystemContent;
    content_navigation?: NavigationSection;
    content_marketing?: MarketingContent;
    homepage_layout?: string[];
    content_system?: SystemContent;
    content_ascension?: AscensionContent;
    content_layout_spacing?: LayoutSpacingContent;
    content_performance?: PerformanceContent;
    content_marquee_top?: MarqueeSection;
    content_marquee_bottom?: MarqueeSection;
    [key: string]: unknown;
}

