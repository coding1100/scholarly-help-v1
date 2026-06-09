import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPageData } from '@/app/lib/mongodb';
import ProductSchema from '@/app/components/ProductSchema';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps { 
  params: { category: string; slug: string; }; 
}

async function fetchPageData(category: string, slug: string) {
  try {
    // Query for page by id (slug) in pages collection
    // The slug should match the id in the pages collection
    const query = { 
      id: slug
    };

    const content = await getPageData('pages', query);

    if (!content) {
      console.log(`No content found for slug: ${slug} in pages collection`);
    } else {
      console.log(`Successfully fetched data for slug: ${slug} from MongoDB`);
    }

    return content as any;
  } catch (error) {
    console.error('Error fetching page data:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const pageData = await fetchPageData(params.category, params.slug);
  
  if (!pageData) {
    return {
      title: 'Page Not Found',
      description: 'The page you are looking for does not exist.',
    };
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}${params.category}/${params.slug}`;
  
  return {
    title: pageData.meta?.title || pageData.meta_title || pageData.title || 'Page',
    description: pageData.meta?.description || pageData.meta_description || '',
    alternates: {
      canonical: pageData.meta?.canonicalUrl || canonicalUrl,
    },
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const pageData = await fetchPageData(params.category, params.slug);

  // Only return 404 if explicitly set to not published, otherwise show the page
  if (!pageData) {
    notFound();
  }

  // If status is explicitly 'draft', return 404
  if (pageData.status === 'draft') {
    notFound();
  }

  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const pageTitle = pageData.meta?.title || pageData.meta_title || pageData.title || 'Page';
  const metaDescription = pageData.meta?.description || pageData.meta_description || '';
  const pageUrl = pageData.meta?.canonicalUrl || `${baseUrl}/${params.category}/${params.slug}`;

  return (
    <div>
      <ProductSchema
        productTitle={pageTitle}
        metaDescription={metaDescription}
        pageUrl={pageUrl}
      />
      <h1>{pageData.title || pageData.heroSection?.mainHeading || 'Page'}</h1>
      {pageData.content && (
        <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
      )}
      {!pageData.content && pageData.heroSection?.description && (
        <div dangerouslySetInnerHTML={{ __html: pageData.heroSection.description }} />
      )}
    </div>
  );
}