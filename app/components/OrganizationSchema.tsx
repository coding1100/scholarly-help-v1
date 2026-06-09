export default function OrganizationSchema() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Scholarly Help",
    alternateName: "scholarlyhelp",
    url: "https://scholarlyhelp.com/",
    logo: "https://scholarlyhelp.com/blog/wp-content/uploads/2025/12/scholarly-help-logo.png",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1 646 480 6092",
      contactType: "customer service",
      areaServed: "US",
      availableLanguage: "en",
    },
    sameAs: [
      "https://www.facebook.com/Scholarly.help",
      "https://www.instagram.com/scholarlyhelp/",
      "https://www.youtube.com/@ScholarlyHelp/",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
