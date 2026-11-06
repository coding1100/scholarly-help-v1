import type { Metadata } from "next";

// Kept out of the index until the extension has a public store listing to link to.
export const metadata: Metadata = {
  title: "MCQ Practice Scanner",
  description:
    "A Chrome extension that reads the multiple-choice practice questions on your screen and explains the answers.",
  robots: { index: false, follow: true },
};

export default function McqPracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
