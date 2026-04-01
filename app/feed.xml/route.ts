import { articles } from '@/lib/articles';

export async function GET() {
  const baseUrl = 'https://s2d.info';
  const published = articles.filter(a => a.published);

  const rssItems = published.map(a => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${baseUrl}/research/${a.slug}</link>
      <description><![CDATA[${a.excerpt}]]></description>
      <pubDate>${new Date(a.date === 'March 2026' ? '2026-03-01' : a.date).toUTCString()}</pubDate>
      <guid isPermaLink="true">${baseUrl}/research/${a.slug}</guid>
      <category>${a.tags.join(', ')}</category>
    </item>
  `).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>S2D Capital Insights</title>
    <link>${baseUrl}</link>
    <description>Independent financial intelligence. Crypto. Macro. Commodities. FX. Geopolitics. Market Structure.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/og-image.png</url>
      <title>S2D Capital Insights</title>
      <link>${baseUrl}</link>
    </image>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
