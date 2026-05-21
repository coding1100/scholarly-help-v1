"use client";

import type { ComponentType } from "react";
import TakeMyClassAdmin from "@/app/(admin)/admin/take-my-class/page";
import TakeMyClass1Admin from "@/app/(admin)/admin/take-my-class-1/page";
import TakeMyClass2Admin from "@/app/(admin)/admin/take-my-class-2/page";
import TakeMyExamAdmin from "@/app/(admin)/admin/take-my-exam/page";
import AOrBGradeGuaranteeAdmin from "@/app/(admin)/admin/a-or-b-grade-guarantee/page";
import ToolsAdmin from "@/app/(admin)/admin/tools/page";
import GuaranteeAnonymityAdmin from "@/app/(admin)/admin/guarantee-anonymity/page";
import UsBasedPhdExpertsAdmin from "@/app/(admin)/admin/us-based-phd-experts/page";
import SuccessStoriesAndReviewsAdmin from "@/app/(admin)/admin/success-stories-and-reviews/page";
import PlagiarismFreeProcessAdmin from "@/app/(admin)/admin/plagiarism-free-process/page";
import OnTimeDeliveryGuaranteeAdmin from "@/app/(admin)/admin/on-time-delivery-guarantee/page";
import FaqAdmin from "@/app/(admin)/admin/faq/page";

const DUPLICATE_EDITOR_BY_SOURCE_PATH: Record<string, ComponentType> = {
  "/admin/a-or-b-grade-guarantee": AOrBGradeGuaranteeAdmin,
  "/admin/tools": ToolsAdmin,
  "/admin/guarantee-anonymity": GuaranteeAnonymityAdmin,
  "/admin/us-based-phd-experts": UsBasedPhdExpertsAdmin,
  "/admin/success-stories-and-reviews": SuccessStoriesAndReviewsAdmin,
  "/admin/plagiarism-free-process": PlagiarismFreeProcessAdmin,
  "/admin/on-time-delivery-guarantee": OnTimeDeliveryGuaranteeAdmin,
  "/admin/take-my-class-still-doing": TakeMyClassAdmin,
  "/admin/take-my-class-professor-does-not-care": TakeMyClassAdmin,
  "/admin/take-my-class-3": TakeMyClassAdmin,
  "/admin/take-my-class-2": TakeMyClass2Admin,
  "/admin/take-my-class-1": TakeMyClass1Admin,
  "/admin/take-my-class": TakeMyClassAdmin,
  "/admin/take-my-exam": TakeMyExamAdmin,
  "/admin/take-my-proctored-exam-for-me": TakeMyExamAdmin,
  "/admin/faq": FaqAdmin,
};

export function normalizeDuplicatedFromAdminPath(path: string | null | undefined): string {
  const p = String(path || "").trim().replace(/\/+$/, "");
  return p || "/admin/take-my-class";
}

export function resolveDuplicateEditorComponent(
  duplicatedFromAdminPath: string | null | undefined,
): ComponentType {
  const key = normalizeDuplicatedFromAdminPath(duplicatedFromAdminPath);
  return DUPLICATE_EDITOR_BY_SOURCE_PATH[key] ?? TakeMyClassAdmin;
}
