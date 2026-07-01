import { useAssignmentData } from "@/app/(pages)/assignment/AssignmentDataProvider";
import { useExamData } from "@/app/(pages)/exam/ExamDataProvider";
import { useHomeworkData } from "@/app/(pages)/homework/HomeworkDataProvider";
import { useOnlineClassData } from "@/app/(pages)/online-class/OnlineClassDataProvider";
import { useEssayWritingData } from "@/app/(pages)/essay-writing/EssayWritingDataProvider";
import { useHomeData } from "@/app/(pages)/HomeDataProvider";
import { useTakeMyClassData } from "@/app/(pages)/TakeMyClassDataProvider";
import { useTakeMyExamData } from "@/app/(pages)/TakeMyExamDataProvider";
import { useTakeMyProctoredExamData } from "@/app/(pages)/TakeMyProctoredExamDataProvider";
import { useTakeMyTeasExamData } from "@/app/(pages)/TakeMyTeasExamDataProvider";
import { useTakeMyHesiExamData } from "@/app/(pages)/TakeMyHesiExamDataProvider";

/**
 * Generic hook that tries to get data from assignment, exam, homework, online-class, essay-writing, home, take-my-class, take-my-exam, take-my-proctored-exam, take-my-teas-exam, and take-my-hesi-exam contexts
 * This allows components to work with all page types
 */
export function usePageData() {
  const assignmentData = useAssignmentData();
  const examData = useExamData();
  const homeworkData = useHomeworkData();
  const onlineClassData = useOnlineClassData();
  const essayWritingData = useEssayWritingData();
  const homeData = useHomeData();
  const takeMyClassData = useTakeMyClassData();
  const takeMyExamData = useTakeMyExamData();
  const takeMyProctoredExamData = useTakeMyProctoredExamData();
  const takeMyTeasExamData = useTakeMyTeasExamData();
  const takeMyHesiExamData = useTakeMyHesiExamData();

  // Return whichever context has data, or null if none have data
  return assignmentData || examData || homeworkData || onlineClassData || essayWritingData || homeData || takeMyClassData || takeMyExamData || takeMyProctoredExamData || takeMyTeasExamData || takeMyHesiExamData;
}

