import type { Metadata } from "next";

// The thank-you page is only reached after a quote request, so it is kept
// out of the index.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
