import type { Metadata } from "next";

const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com"
).replace(/\/$/, "");

export const metadata: Metadata = {
  title: "CGPA Calculator Online: Free Tool | ScholarlyHelp",
  description:
    "Calculate semester GPA and cumulative CGPA with a free CGPA calculator. Enter courses, grades, and credit hours, then see your academic results. Try it.",
  alternates: {
    canonical: `${baseUrl}/tools/cgpa-calculator`,
  },
};

export default function CgpaCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
