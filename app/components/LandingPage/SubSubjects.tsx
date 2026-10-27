"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { usePageData } from "./usePageData";
import { useMemo } from "react";

type SubjectType = {
  src: string;
  label: string;
  url: string;
  description?: string;
};

export default function SubSubjectsSection({
  defaultSubSubjects,
}: {
  defaultSubSubjects: SubjectType[];
}) {
  const data = usePageData();
  const SubSubjectsData = (data as any)?.SubSubjects;
  const currentPage = usePathname();
  const rawBasePath = currentPage.split("/").slice(0, 2).join("/");
  const basePath = rawBasePath === "/" ? "" : rawBasePath;
  // Show detailed subject cards only on subpages like /online-class/english, not on /online-class or /online-class/

  const scrollToQuote = () => {
    const quoteForm = document.getElementById("quote-form");
    if (quoteForm) {
      quoteForm.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Use admin-configured SubSubjects if available, otherwise use defaults.
  // Admin can override icon, label, and link; if any field is missing,
  // we fall back to the original default values so nothing breaks.
  const SubSubjects = useMemo(() => {
    let SubSubjectsList: SubjectType[] = [];

    if (
      SubSubjectsData?.SubSubjectsContent &&
      Array.isArray(SubSubjectsData.SubSubjectsContent) &&
      SubSubjectsData.SubSubjectsContent.length > 0
    ) {
      SubSubjectsList = SubSubjectsData.SubSubjectsContent.map(
        (item: any, index: number) => {
          const fallback = defaultSubSubjects[index] as SubjectType | undefined;

          const label =
            (item.title && String(item.title)) || fallback?.label || "";

          const src =
            (item.icon && String(item.icon)) ||
            fallback?.src ||
            "/assets/Icon/english.png";

          let url = (item.url && String(item.url)) || fallback?.url || "";

          const description =
            (item.description && String(item.description)) ||
            fallback?.description ||
            "";

          // If admin hasn't provided a URL and no default URL exists,
          // generate a slug-based path so links still work.
          if (!url && label) {
            const slug = label.toLowerCase().replace(/\s+/g, "-");
            url = `${basePath}/${slug}`;
          }

          return {
            src,
            label,
            url,
            description,
          };
        },
      ).filter((s: SubjectType) => s.label); // Filter out items without labels
    } else {
      SubSubjectsList = defaultSubSubjects;
    }

    // Filter out the current page's subject only when we have
    // more than enough cards to still fill the grid on subpages.
    // If admin configured exactly 4 cards, keep all 4 visible.
    if (SubSubjectsList.length > 4) {
      return SubSubjectsList.filter(
        (subject: SubjectType) => subject.url !== currentPage,
      );
    }

    return SubSubjectsList;
  }, [SubSubjectsData, basePath, currentPage, defaultSubSubjects]);

  return (
    <section className="pt-[86px] pb-16 bg-[#ECECFC] text-[#2B1C51]">
      <div className="max-w-7xl mx-auto max-[1320px]:px-4 text-center">
        <h2 className="text-[42px] max-[768px]:text-[28px] text-[#000] font-bold mb-3">
          {SubSubjectsData?.mainHeading || "SubSubjects & Majors We Cover"}
        </h2>
        <p className="sm:text-base text-sm text-gray-600 max-w-3xl mx-auto mb-12">
          {SubSubjectsData?.description ||
            "Beyond the SubSubjects listed below, we excel at handling diverse topics effectively. Our expertise knows no bounds, ensuring we're ready for any challenge that comes our way."}
        </p>

        {currentPage === "/" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-12">
            {SubSubjects.slice(0, 5).map(
              (subject: SubjectType, index: number) =>
                subject.url ? (
                  <Link key={index} href={subject.url}>
                    <div className="bg-[#F2F2FD] rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-center cursor-pointer">
                      <div className="w-12 h-12 mb-3 relative">
                        <Image
                          src={subject.src}
                          alt={subject.label}
                          fill
                          className="object-contain"
                          sizes="48px"
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-800 text-center sm:text-[23px]">
                        {subject.label}
                      </span>
                      {(() => {
                        const description =
                          subject.description ||
                          (subject.label === "Chemistry"
                            ? "Chemistry for Nursing & Allied Health is a specialized course designed to provide targeted chemistry support for students pursuing careers in nursing and allied health fields."
                            : "");
                        return description ? (
                          <p className="text-[17px] mt-3 text-[#263238] text-center">
                            {description}
                          </p>
                        ) : null;
                      })()}
                    </div>
                  </Link>
                ) : (
                  <div
                    key={index}
                    className="bg-[#F2F2FD] rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-center cursor-pointer"
                  >
                    <div className="w-12 h-12 mb-3 relative">
                      <Image
                        src={subject.src}
                        alt={subject.label}
                        fill
                        className="object-contain"
                        sizes="48px"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-800 text-center sm:text-[23px]">
                      {subject.label}
                    </span>
                    {(() => {
                      const description =
                        subject.description ||
                        (subject.label === "Chemistry"
                          ? "Chemistry for Nursing & Allied Health is a specialized course designed to provide targeted chemistry support for students pursuing careers in nursing and allied health fields."
                          : "");
                      return description ? (
                        <p className="text-[17px] text-start text-[#263238]">
                          {description}
                        </p>
                      ) : null;
                    })()}
                  </div>
                ),
            )}
          </div>
        ) : (
          <div
            className={`grid gap-6 mb-12 ${
              currentPage?.startsWith("/essay-writing/")
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                : "grid-cols-2 sm:grid-cols-3"
            }`}
          >
            {SubSubjects.slice(0, 6).map(
              (subject: SubjectType, index: number) =>
                subject.url ? (
                  <Link key={index} href={subject.url}>
                    <div className="bg-[#F2F2FD] rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-center cursor-pointer">
                      <div className="w-12 h-12 mb-3 relative">
                        <Image
                          src={subject.src}
                          alt={subject.label}
                          fill
                          className="object-contain"
                          sizes="48px"
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-800 text-center sm:text-[23px]">
                        {subject.label}
                      </span>
                      {(() => {
                        const description =
                          subject.description ||
                          (subject.label === "Chemistry"
                            ? "Chemistry for Nursing & Allied Health is a specialized course designed to provide targeted chemistry support for students pursuing careers in nursing and allied health fields."
                            : "");
                        return description ? (
                          <p className="text-[17px] mt-3 text-[#263238] text-center">
                            {description}
                          </p>
                        ) : null;
                      })()}
                    </div>
                  </Link>
                ) : (
                  <div
                    key={index}
                    className="bg-[#F2F2FD] rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-center cursor-pointer"
                  >
                    <div className="w-12 h-12 mb-3 relative">
                      <Image
                        src={subject.src}
                        alt={subject.label}
                        fill
                        className="object-contain"
                        sizes="48px"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-800 text-center sm:text-[23px]">
                      {subject.label}
                    </span>
                    {(() => {
                      const description =
                        subject.description ||
                        (subject.label === "Chemistry"
                          ? "Chemistry for Nursing & Allied Health is a specialized course designed to provide targeted chemistry support for students pursuing careers in nursing and allied health fields."
                          : "");
                      return description ? (
                        <p className="text-[17px] text-start text-[#263238]">
                          {description}
                        </p>
                      ) : null;
                    })()}
                  </div>
                ),
            )}
          </div>
        )}

        <div className="flex justify-center mt-[60px]">
          <button
            type="button"
            onClick={scrollToQuote}
            className="rounded-md px-6 cursor-pointer bg-[#ff641a] text-white border border-transparent transition duration-300 text-[15px] max-[768px]:w-full font-medium flex items-center justify-center hover:bg-white hover:text-[#ff641a] hover:border-[#ff641a] h-[54px]"
          >
            {SubSubjectsData?.ctaText || "Secure My 'A' or 'B' Grades"}
          </button>
        </div>
      </div>
    </section>
  );
}
