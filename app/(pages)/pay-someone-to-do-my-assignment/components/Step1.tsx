import { Dispatch, FC, SetStateAction } from "react";
import { ApiPayload } from "./GetFreeQuote";

interface StepProps {
  apiPayload: ApiPayload;
  setApiPayload: Dispatch<SetStateAction<ApiPayload>>;
  setActiveStep: Dispatch<SetStateAction<number>>;
}
const Step1: FC<StepProps> = ({ apiPayload, setApiPayload, setActiveStep }) => {
  const handleClick = (selection: string) => {
    setApiPayload({
      ...apiPayload,
      course_name: selection,
    });
    setActiveStep(2);
  };

  const serviceBtn =
    "border-2 border-black rounded-full px-6 py-2 min-w-[180px]";

  return (
    <div className="bg-white py-8 lg:max-w-[90%] mx-auto mt-10 shadow-xl relative lg:top-8">
      <h4 className="text-center font-semibold text-2xl">
        What do you need help with?
      </h4>

      <div className="flex justify-center gap-4 mt-8 flex-wrap">
        <button
          id="takeMyOnlineClass"
          className={`${serviceBtn}`}
          onClick={() => handleClick("Take My Online Class")}
        >
          Take My Online Class
        </button>
        <button
          id="DoMyAssignmentHomework"
          className={`${serviceBtn}`}
          onClick={() => handleClick("Do My Assignment/Homework")}
        >
          Do My Assignment/Homework
        </button>
        <button
          id="writeMyPaperEssay"
          className={`${serviceBtn}`}
          onClick={() => handleClick("Write My Paper/Essay")}
        >
          Write My Paper/Essay
        </button>
        <button
          className={`${serviceBtn}`}
          onClick={() => handleClick("Do My Exam")}
        >
          Do My Exam
        </button>
      </div>
      {/* <StepCounter
    activeStep={activeStep}
    onClick={() => setActiveStep(2)}
    isDisabled={!apiPayload.course_name}
  /> */}
    </div>
  );
};

export default Step1;
