import ArchivePage, { archiveMetadata } from "@/app/components/Blog/ArchivePage";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return archiveMetadata("categories", (await params).slug);
}

export default async function Page({ params }: Props) {
  return <ArchivePage kind="categories" slug={(await params).slug} />;
}
