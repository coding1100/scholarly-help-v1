import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_60rem_at_20%_-10%,rgba(99,102,241,0.20),transparent_55%),radial-gradient(50rem_50rem_at_90%_10%,rgba(99,102,241,0.14),transparent_55%)] dark:bg-[radial-gradient(60rem_60rem_at_20%_-10%,rgba(99,102,241,0.28),transparent_55%),radial-gradient(50rem_50rem_at_90%_10%,rgba(99,102,241,0.18),transparent_55%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8 lg:pb-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/70 px-3 py-1 text-sm font-medium text-[#432dd7] shadow-sm backdrop-blur dark:border-indigo-400/20 dark:bg-gray-900/40 dark:text-indigo-200">
              {/* <FiSparkles className="h-4 w-4" /> */}
              <span>ScholarlyHelp AI Workspace</span>
            </div>

            <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              AI Tools to Simplify Your Academic Work
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-base leading-7 text-gray-600 dark:text-gray-300 sm:text-lg">
              Write faster, study smarter, and polish assignments with
              student-first tools designed for clarity, speed, and better
              grades—without the overwhelm.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/tools/main-tool?start=1"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4f39f6] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#432dd7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f39f6] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 sm:w-auto"
              >
                Start Writing <FiArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#tools"
                className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f39f6] focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-750 dark:focus-visible:ring-offset-gray-900 sm:w-auto"
              >
                Explore Tools
              </a>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:items-center sm:gap-6">
              <Stat label="Students supported" value="10,000+" />
              <Stat label="Avg. time saved" value="2–4 hrs/week" />
              <Stat label="Tools included" value="12+" />
              <Stat label="Built for" value="Assignments & exams" />
            </div>
          </div>

          <div className="lg:w-[26rem]">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-850">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Quick starts
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Jump into your most-used tools in one click.
                  </p>
                </div>
                <div className="rounded-xl bg-indigo-50 px-3 py-1 text-xs font-semibold text-[#432dd7] dark:bg-indigo-500/10 dark:text-indigo-200">
                  New
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <QuickLink
                  title="Academic Research Assistant"
                  description="Draft, rewrite, and improve in one editor."
                  href="/tools/main-tool"
                />
                <QuickLink
                  title="Paraphraser"
                  description="Rephrase for clarity while keeping meaning."
                  href="/tools/paraphraser-tool"
                />
                <QuickLink
                  title="Summarizer"
                  description="Condense articles and notes instantly."
                  href="/tools/summarizer-tool"
                />
              </div>

              <div className="mt-5 rounded-xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-800/70 dark:text-gray-200">
                <p className="font-semibold">Tip</p>
                <p className="mt-1 text-gray-600 dark:text-gray-300">
                  Start with your topic, then use tools to outline, generate,
                  and refine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/40">
      <div className="text-lg font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-300">
        {label}
      </div>
    </div>
  );
}

function QuickLink({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-[1px] hover:border-indigo-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f39f6] focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-400/30 dark:focus-visible:ring-offset-gray-900"
    >
      <div>
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </div>
        <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
          {description}
        </div>
      </div>
      <FiArrowRight className="h-4 w-4 text-gray-400 transition group-hover:text-[#4f39f6] dark:group-hover:text-indigo-300" />
    </Link>
  );
}
