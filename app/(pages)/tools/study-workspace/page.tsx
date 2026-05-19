import { Suspense } from "react";
import StudyWorkspacePageContent from "./StudyWorkspacePageContent";

export default function StudyWorkspacePage() {
  return (
    <Suspense fallback={<div className="h-72 animate-pulse bg-gray-200" />}>
      <StudyWorkspacePageContent />
    </Suspense>
  );
}
