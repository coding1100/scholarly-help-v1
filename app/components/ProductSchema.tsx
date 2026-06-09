interface ProductSchemaProps {
  productTitle: string;
  metaDescription: string;
  pageUrl: string;
}

export default function ProductSchema({
  productTitle,
  metaDescription,
  pageUrl,
}: ProductSchemaProps) {
  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: productTitle,
    description: metaDescription,
    image:
      "https://scholarlyhelp.com/_next/image/?url=%2F_next%2Fstatic%2Fmedia%2FHero-Group-195.1c97f823.webp&w=828&q=75",
    brand: {
      "@type": "Brand",
      name: "Scholarly Help",
    },
    sku: "sh1-200",
    offers: {
      "@type": "AggregateOffer",
      url: pageUrl,
      priceCurrency: "USD",
      lowPrice: "1",
      highPrice: "100",
      offerCount: "202605",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      bestRating: "5",
      worstRating: "1",
      ratingCount: "16026",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
