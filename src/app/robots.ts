import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin', '/auth', '/account'],
        },
        sitemap: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://wenaturals.shop'}/sitemap.xml`,
    };
}
