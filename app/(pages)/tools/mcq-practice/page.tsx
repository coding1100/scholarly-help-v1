"use client";

import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
import ProductSchema from "@/app/components/ProductSchema";
import { getSiteBaseUrl } from "@/app/lib/dynamicLandingUrls";

const headingClass =
  "mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100";
const stepsClass =
  "mb-8 list-decimal space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-300";
const codeClass = "rounded bg-gray-100 px-1 dark:bg-gray-800";

export default function McqPracticePage() {
  const [flag, setFlag] = useState<boolean>(false);

  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      <ProductSchema
        productTitle="MCQ Practice Scanner - Scholarly Help"
        metaDescription="A Chrome extension that reads the multiple-choice practice questions on your screen and explains the answers."
        pageUrl={`${getSiteBaseUrl()}/tools/mcq-practice`}
      />
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ToolWithExplore>
          <div className="container mx-auto max-w-[840px] px-3 py-4 sm:px-4 md:px-8 md:pt-8">
            <p className="mb-6 text-sm text-gray-700 dark:text-gray-300">
              A Chrome extension for practice quizzes. Click once and it reads
              the multiple-choice questions on your screen, then shows the
              answer and an explanation beside your quiz, so you don&apos;t have
              to copy and paste each question.
            </p>

            <a
              href="/downloads/mcq-practice-scanner.zip"
              download
              className="mb-8 inline-block rounded-md bg-[#565add] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#656aff]"
            >
              Download the extension
            </a>

            <h2 className={headingClass}>Add it to your Chrome profile</h2>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              Use Chrome on a computer, in the profile where you want the
              extension.
            </p>
            <ol className={stepsClass}>
              <li>Download the file above and unzip it.</li>
              <li>
                Move the unzipped folder somewhere you&apos;ll keep it, such as
                Documents. Chrome loads the extension from this folder, so it
                stops working if the folder is moved or deleted.
              </li>
              <li>
                Open Chrome&apos;s three-dot menu, click Settings, then click
                Extensions in the left sidebar.
              </li>
              <li>Turn on Developer mode at the top right.</li>
              <li>Click Load unpacked at the top left.</li>
              <li>
                Select the unzipped folder, the one that directly contains{" "}
                <code className={codeClass}>manifest.json</code>.
              </li>
              <li>
                Click the puzzle icon in Chrome&apos;s toolbar, then pin MCQ
                Practice Scanner so it&apos;s easy to reach.
              </li>
            </ol>

            <h2 className={headingClass}>Use it</h2>
            <ol className={stepsClass}>
              <li>
                Open your practice quiz and click the extension&apos;s icon.
              </li>
              <li>Click Connect your account and sign in.</li>
              <li>
                Click Scan this screen and allow access when Chrome asks. Scroll
                or move on, then scan again.
              </li>
            </ol>

            <h2 className={headingClass}>Good to know</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-300">
              <li>It only looks at your screen when you click Scan.</li>
              <li>
                The AI can be wrong, so use the explanations and check anything
                marked low confidence.
              </li>
              <li>
                It is for practice. Follow your school&apos;s rules and
                don&apos;t use it on graded work.
              </li>
              <li>On the free plan, each run covers 25 answered questions.</li>
              <li>
                It doesn&apos;t update itself. To get a new version, download it
                again, replace the folder, and click the reload icon on the
                extension&apos;s card under Settings &gt; Extensions.
              </li>
            </ul>
          </div>
        </ToolWithExplore>
      </ToolsLayout>
    </Suspense>
  );
}
