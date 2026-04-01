interface ArticleJsonLdProps {
  title: string;
  description: string;
  publishDate: string;
  author: string;
  url: string;
  imageUrl?: string;
}

export default function ArticleJsonLd({
  title,
  description,
  publishDate,
  author,
  url,
  imageUrl,
}: ArticleJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "datePublished": publishDate,
    "author": { "@type": "Person", "name": author },
    "publisher": {
      "@type": "Organization",
      "name": "S2D Capital Insights",
      "url": "https://s2d.info",
      "logo": { "@type": "ImageObject", "url": "https://s2d.info/og-image.png" }
    },
    "mainEntityOfPage": url,
    "image": imageUrl || "https://s2d.info/og-image.png"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
