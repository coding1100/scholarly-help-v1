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

export default function SubjectsSection({
  defaultSubjects,
}: {
  defaultSubjects: SubjectType[];
}) {
  const data = usePageData();
  const subjectsData = data?.subjects;
  const currentPage = usePathname();
  const normalizedPath = (currentPage || "").replace(/\/+$/, "");
  const rawBasePath = currentPage.split("/").slice(0, 2).join("/");
  const basePath = rawBasePath === "/" ? "" : rawBasePath;
  // Show detailed subject cards only on subpages like /online-class/english, not on /online-class or /online-class/
  const isOnlineClassSubpage =
    currentPage.startsWith("/online-class/") &&
    currentPage.length > "/online-class/".length;
  const isAssignmentSubpage =
    currentPage.startsWith("/assignment/") &&
    currentPage.length > "/assignment/".length;
  const isHomeworkSubpage =
    currentPage.startsWith("/homework/") &&
    currentPage.length > "/homework/".length;
  const isEssayWritingSubpage =
    currentPage.startsWith("/essay-writing/") &&
    currentPage.length > "/essay-writing/".length;
  const isExamSubPages =
    (currentPage.startsWith("/exams/") &&
      currentPage.length > "/exams/".length) ||
    (currentPage.startsWith("/exam/") && currentPage.length > "/exam/".length);
  const isTakeMyClass2Page = normalizedPath === "/take-my-class-2";
  const showDetailedSubjectCards =
    isOnlineClassSubpage ||
    isAssignmentSubpage ||
    isHomeworkSubpage ||
    isExamSubPages ||
    isEssayWritingSubpage ||
    isTakeMyClass2Page;

  const scrollToQuote = () => {
    const quoteForm = document.getElementById("quote-form");
    if (quoteForm) {
      quoteForm.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isHomePage = currentPage === "/";

  // Use admin-configured subjects if available, otherwise use defaults.
  // Admin can override icon, label, and link; if any field is missing,
  // we fall back to the original default values so nothing breaks.
  const subjects = useMemo(() => {
    let subjectsList: SubjectType[] = [];

    if (
      subjectsData?.subjectsContent &&
      Array.isArray(subjectsData.subjectsContent) &&
      subjectsData.subjectsContent.length > 0
    ) {
      subjectsList = subjectsData.subjectsContent
        .map((item: any, index: number) => {
          const fallback = defaultSubjects[index] as SubjectType | undefined;

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
        })
        .filter((s: SubjectType) => s.label); // Filter out items without labels
    } else {
      subjectsList = defaultSubjects;
    }

    // Filter out the current page's subject only when we have
    // more than enough cards to still fill the grid on subpages.
    // If admin configured exactly 4 cards, keep all 4 visible.
    if (subjectsList.length > 4) {
      return subjectsList.filter(
        (subject: SubjectType) => subject.url !== currentPage,
      );
    }

    return subjectsList;
  }, [subjectsData, basePath, currentPage, defaultSubjects]);

  return (
    <section className="pt-[86px] pb-16 bg-[#ECECFC] text-[#2B1C51]">
      <div className="max-w-7xl mx-auto max-[1320px]:px-4 text-center">
        <h2 className="text-[42px] text-[#000] font-bold mb-3">
          {subjectsData?.mainHeading || "Subjects & Majors We Cover"}
        </h2>
        <p className="sm:text-base text-sm text-gray-600 max-w-3xl mx-auto mb-12">
          {subjectsData?.description ||
            "Beyond the subjects listed below, we excel at handling diverse topics effectively. Our expertise knows no bounds, ensuring we're ready for any challenge that comes our way."}
        </p>
        {showDetailedSubjectCards ? (
          <div className="grid md:grid-cols-2 grid-cols-1 md:gap-8 gap-4">
            {subjects.slice(0, 4).map((subject: SubjectType, index: number) => (
              <div
                key={index}
                className="col-span-1 bg-[#FFFFFFad] px-8 py-[34px] flex items-start justify-start gap-7 rounded-lg"
              >
                <div className="hidden md:relative md:block min-w-[65px] w-[65px] h-[65px]">
                  <Image
                    src={subject.src}
                    alt={subject.label}
                    fill
                    className="object-contain"
                    sizes="65px"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="md:hidden relative min-w-[48px] w-[48px] h-[48px] sm:min-w-[56px] sm:w-[56px] sm:h-[56px] md:min-w-[65px] md:w-[65px] md:h-[65px] flex-shrink-0">
                      <Image
                        src={subject.src}
                        alt={subject.label}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, 65px"
                      />
                    </div>
                    <p className="text-xl md:text-2xl text-start font-semibold text-black">
                      {subject.label}
                    </p>
                  </div>
                  {(() => {
                    const description =
                      subject.description ||
                      (subject.label === "Chemistry"
                        ? "Chemistry for Nursing & Allied Health is a specialized course designed to provide targeted chemistry support for students pursuing careers in nursing and allied health fields. The course focuses on essential chemical principles and real-world applications relevant to healthcare, helping students build a strong foundation for understanding topics."
                        : "");
                    return description ? (
                      <p className="text-base md:text-[17px] text-start text-[#263238]">
                        {description}
                      </p>
                    ) : null;
                  })()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-12 max-h-[580px] overflow-y-auto custom-scrollbar">
            {subjects.map((subject: SubjectType, index: number) =>
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
                  className="bg-[#F2F2FD]  rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-center cursor-pointer"
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
            {subjectsData?.ctaText || "Secure My 'A' or 'B' Grades"}
          </button>
        </div>
      </div>
    </section>
  );
}
