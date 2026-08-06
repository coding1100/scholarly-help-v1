"use client";

import { usePathname } from "next/navigation";

type ServiceVideo = {
  videoId: string;
  title: string;
};

const SERVICE_VIDEOS: Record<string, ServiceVideo> = {
  "/exams": {
    videoId: "J5wy3PDPNfA",
    title: "How We Take Your Online Exam (Guaranteed A or B)",
  },
  "/online-class": {
    videoId: "AUBPsI2M2cc",
    title: "How We Take Your Online Class with Safe IP Protection",
  },
  "/take-my-proctored-exam-for-me": {
    videoId: "iarYLszUcP8",
    title: "How We Handle Proctored Exams using Undetectable Tech",
  },
  "/assignment": {
    videoId: "JE1m4liYPi0",
    title: "How We Complete Your Assignments with Zero Plagiarism",
  },
  "/homework": {
    videoId: "UcbZg4YLd6M",
    title: "How We Handle Your Homework with 100% Accurate Answers",
  },
  "/essay-writing": {
    videoId: "Fm7zC5SUty8",
    title:
      "How We Deliver 100% Plagiarism-Free Essays with Guaranteed Grades",
  },
  "/take-my-hesi-exam": {
    videoId: "xlQNxuDnoUE",
    title: "How We Help Nursing Students Pass Their HESI Exams with Confidence",
  },
  "/take-my-teas-exam": {
    videoId: "T2vn5fPNkhI",
    title:
      "How We Help Healthcare Applicants Master the TEAS Exam Stress-Free",
  },
};

function normalizePathname(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, "");
  return normalized || "/";
}

export default function ServiceVideoSection() {
  const pathname = usePathname();
  const video = SERVICE_VIDEOS[normalizePathname(pathname || "/")];

  if (!video) return null;

  const headingId = `service-video-${video.videoId}`;

  return (
    <section
      className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      aria-labelledby={headingId}
    >
      <div className="mx-auto max-w-[1240px]">
        <div className="text-center">
          <span className="inline-flex h-11 min-w-[144px] items-center justify-center rounded-full bg-white px-6 text-[13px] font-medium uppercase leading-none tracking-normal text-black shadow-[0_8px_22px_rgba(31,35,48,0.14)] sm:h-12 sm:min-w-[152px]">
            Watch video
          </span>
          <h2
            id={headingId}
            className="mx-auto mt-5 max-w-5xl text-balance text-[28px] font-bold leading-[1.15] text-[#17172B] sm:text-[34px] lg:text-[42px]"
          >
            {video.title}
          </h2>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl bg-black shadow-[0_24px_50px_-20px_rgba(43,28,80,0.35)] sm:mt-10 lg:mt-12 lg:rounded-3xl">
          <iframe
            className="aspect-video w-full border-0"
            src={`https://www.youtube-nocookie.com/embed/${video.videoId}`}
            title={video.title}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
