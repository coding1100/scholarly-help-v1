import React, {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useState,
} from "react";
// import "./index.css";
// import StepCounter from "./StepCounter";
import "react-datetime/css/react-datetime.css";
import Datetime from "react-datetime";
// import {
//   formatDateWithTime,
//   getTomorrowDate,
//   momentToReadableDate,
// } from "../PriceCalculator/helper";
import { ApiPayload } from "./GetFreeQuote";
import dayjs from "dayjs";
import { formattedDate } from "@/app/utilities/utilities";

type Step3Props = {
  setActiveStep: Dispatch<SetStateAction<number>>;
  apiPayload: ApiPayload;
  setApiPayload: Dispatch<SetStateAction<ApiPayload>>;
};

const Step3: FC<Step3Props> = ({
  setActiveStep,
  apiPayload,
  setApiPayload,
}) => {
  const [date, setDate] = useState(
    formattedDate(dayjs().add(2, "days"), "MM/DD/YYYY hh:mm A")
  );
  const [week, setWeek] = useState<string>("");

  const isValidDate = (current: any) => {
    const today = new Date().setHours(0, 0, 0, 0); // Get today's date without time
    const selectedDate = current.startOf("day").valueOf(); // Get selected date without time

    return selectedDate >= today; // Only allow dates equal to or greater than today
  };

  //   useEffect(() => {
  //     if (!date) return;
  //     setApiPayload({
  //       ...apiPayload,
  //       course_deadline: momentToReadableDate(date),
  //     });
  //   }, [date]);

  useEffect(() => {
    if (apiPayload.course_name === "Take My Online Class") {
      setWeek(week);
      //   setApiPayload({ ...apiPayload, course_weeks: week });
    }
  }, [apiPayload.course_name, week]);

  const getDeadlineBtnId = (courseName: string) => {
    let id = "";
    if (courseName === "Do My Assignment/Homework") {
      id = "doMyAssignmentWorkDeadline";
    } else if (courseName === "Write My Paper/Essay") {
      id = "writeMyPaperEssayDeadline";
    } else if (courseName === "Do My Exam") {
      id = "doMyExamDeadline";
    }
    return id;
  };

  return (
    <div className="bg-white py-8 lg:max-w-[90%] mx-auto mt-10 shadow-xl relative  lg:top-8">
      {apiPayload.course_name === "Take My Online Class" && (
        <h4 className="text-center font-semibold text-2xl">
          How Many Weeks Remaining in the Course?
        </h4>
      )}
      {apiPayload.course_name === "Do My Assignment/Homework" && (
        <h4 className="text-center font-semibold text-2xl">
          When is the Assignment deadline?
        </h4>
      )}

      {apiPayload.course_name === "Write My Paper/Essay" && (
        <h4 className="text-center font-semibold text-2xl">
          When is the Paper/Essay deadline?
        </h4>
      )}
      {apiPayload.course_name === "Do My Exam" && (
        <>
          {apiPayload.course_level === "Quiz" ? (
            <h4 className="text-center font-semibold text-2xl">
              When is the quiz deadline?
            </h4>
          ) : (
            <h4 className="text-center font-semibold text-2xl">
              When is the exam deadline?
            </h4>
          )}
        </>
      )}

      {apiPayload.course_name === "Take My Online Class" && (
        <div className="flex align-center justify-center">
          <select
            className="weeks-dropdown min-w-[300px] text-center border-2 border-black rounded-full h-[40px] cursor-pointer mt-8"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setApiPayload({ ...apiPayload, course_weeks: e.target.value });
              setWeek(e.target.value);
              setActiveStep(4);
            }}
            value={week}
            style={{ background: "transparent" }}
          >
            {Array(20)
              .fill(null)
              .map((_, index) => (
                <option
                  id={`week${index + 1}`}
                  value={`week${index + 1}`}
                  key={index}
                >
                  {index + 1} {index + 1 > 9 ? "Weeks" : "Week"}
                </option>
              ))}
          </select>
        </div>
      )}
      {(apiPayload.course_name === "Do My Assignment/Homework" ||
        apiPayload.course_name === "Write My Paper/Essay" ||
        apiPayload.course_name === "Do My Exam") && (
        <div className="flex flex-col sm:flex-row max-w-[400px] mx-auto items-center justify-center gap-4 mt-8">
          <div className="p date-input hidden text-left">Deadline</div>
          <div>
            <Datetime
              className="date-time-picker border-2 border-black focus:outline-none rounded p-1"
              isValidDate={isValidDate}
              initialValue={formattedDate(dayjs(), "MM/DD/YYYY hh:mm A")}
              inputProps={{
                placeholder: "Select a date and time",
                value: date + " EST",
                className: "focus:outline-none rounded",
              }}
              onChange={(v) => {
                setDate(dayjs(v.toLocaleString()).format("MM/DD/YYYY hh:mm A"));
              }}
              // onClose={() => setActiveStep(4)}
            />
          </div>
          <button
            id={getDeadlineBtnId(apiPayload.course_name)}
            className="next-step-btn max-w-[80px] max-h-[36px] bg-[#ff641a] text-white p-4 rounded flex items-center"
            style={{ height: "38px", maxWidth: "80px" }}
            onClick={() => setActiveStep(4)}
          >
            Next
          </button>
        </div>
      )}
      {/* <StepCounter activeStep={activeStep} onClick={() => setActiveStep(4)} /> */}
    </div>
  );
};

export default Step3;
