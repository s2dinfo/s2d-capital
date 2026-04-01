import { MetadataRoute } from 'next';
import { articles } from '@/lib/articles';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://s2d.info';

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/markets`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/research`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/newsletter`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/impressum`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.2 },
    { url: `${baseUrl}/datenschutz`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.2 },
  ];

  const marketPages = [
    'crypto', 'macro', 'commodities', 'fx', 'geopolitics', 'structure',
  ].map((slug) => ({
    url: `${baseUrl}/markets/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const articlePages = articles
    .filter((a) => a.published)
    .map((a) => ({
      url: `${baseUrl}/research/${a.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));

  return [...staticPages, ...marketPages, ...articlePages];
}
