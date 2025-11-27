import { ChangeEvent, Dispatch, FC, SetStateAction, useState } from "react";
import { ApiPayload } from "./GetFreeQuote";
import attachmentIcon from "@/app/assets/Images/attach-paperclip.webp";
import Image from "next/image";

const serviceBtn =
  "border-2 border-black rounded-full px-6 py-2 min-w-[180px] mt-4 lg:mt-8 ";
interface Step2Props {
  apiPayload: ApiPayload;
  setApiPayload: Dispatch<SetStateAction<ApiPayload>>;
  setActiveStep: Dispatch<SetStateAction<number>>;
}
const Step2: FC<Step2Props> = ({
  apiPayload,
  setApiPayload,
  setActiveStep,
}) => {
  const [instructions, setInstructions] = useState<string>("");
  const [noOfPages, setNoOfPages] = useState<number>(5);
  const [file, setFile] = useState<any>("");

  const handleClick = (selection: string) => {
    setApiPayload({ ...apiPayload, course_level: selection });
    setActiveStep(3);
  };

  const handleExamClick = (selection: string) => {
    setApiPayload({ ...apiPayload, course_level: selection });
    setActiveStep(3);
  };

  const handleFileInputClick = () => {
    document?.getElementById("fileInput")?.click();
  };

  return (
    <div className="bg-white py-8 lg:max-w-[90%] mx-auto mt-10 shadow-xl relative  lg:top-8">
      {apiPayload.course_name === "Take My Online Class" && (
        <h4 className="text-center font-semibold text-2xl">
          What level of education are you currently in?
        </h4>
      )}
      {apiPayload.course_name === "Do My Assignment/Homework" && (
        // <h4 className="text-center">What course(s) do you need help with?</h4>
        <h4 className="text-center font-semibold text-2xl hidden">
          Online assignment help with PhD Experts
        </h4>
      )}
      {apiPayload.course_name === "Write My Paper/Essay" && (
        <h4 className="text-center font-semibold text-2xl">
          We Can Write Your Essays / Paper
        </h4>
      )}
      {apiPayload.course_name === "Do My Exam" && (
        <h4 className="text-center font-semibold text-2xl">
          Choose the Type of Exam
        </h4>
      )}

      {apiPayload.course_name === "Take My Online Class" && (
        <div className="gap-4 flex justify-center flex-wrap">
          <button
            id="school"
            className={`${serviceBtn}`}
            onClick={() => handleClick("School")}
          >
            School
          </button>
          <button
            id="graduate"
            className={`${serviceBtn}`}
            onClick={() => handleClick("Graduate")}
          >
            Graduate
          </button>
          <button
            id="underGraduate"
            className={`${serviceBtn}`}
            onClick={() => handleClick("Under Graduate")}
          >
            Under Graduate
          </button>
          <button
            id="other"
            className={`${serviceBtn}`}
            onClick={() => handleClick("Other")}
          >
            Other
          </button>
        </div>
      )}

      {apiPayload.course_name === "Do My Assignment/Homework" && (
        <div className="max-w-[400px] mx-auto">
          <div className="flex items-end">
            <div className="additional_info-section grow border-2 border-[#c8c8c8] p-2">
              <textarea
                className="w-full focus:outline-none"
                rows={3}
                placeholder="Please provide the assignment details"
                onChange={(e) => {
                  setInstructions(e.target.value);
                  setApiPayload({
                    ...apiPayload,
                    instructions: e.target.value,
                  });
                  // setDisplayAssignmentErr(false);
                }}
                value={instructions}
              ></textarea>
              <div>
                <div
                  className="p text-start flex items-center"
                  onClick={handleFileInputClick}
                >
                  <Image
                    src={attachmentIcon}
                    alt="attachment"
                    className="w-6 h-6 mr-2 cursor-pointer"
                  />
                  File{" "}
                  <span style={{ fontSize: "12px" }}>
                    (.docx, pdf, xlsx, csv)
                  </span>
                </div>
                {/* Hidden file input */}
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: "none" }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setFile(e?.target?.files?.[0]);
                    // setDisplayAssignmentErr(false);
                    // setActiveStep(3);
                  }}
                />
                {/* <button className="primary-btn text-left mt-4"></button> */}
                {file && (
                  <div className="p py-2 filename text-start">{file?.name}</div>
                )}
                {/* <Col xs={12}>
          <div>
          <button className="next-step-btn">Next</button>
          </div>
        </Col> */}
              </div>
            </div>
            <div>
              <button
                id="doMyAssignmentWorkNext"
                className="next-step-btn max-w-[80px] max-h-[36px] ml-4 bg-[#ff641a] text-white p-4 rounded flex items-center"
                onClick={() => {
                  // if (!apiPayload.instructions && !file) {
                  //   setDisplayAssignmentErr(true);
                  //   return;
                  // }

                  setActiveStep(3);
                }}
              >
                Next
              </button>
            </div>
          </div>
          {/* {displayAssignmentErr && (
        <div className="text-danger">Please select at least one option</div>
      )} */}
        </div>
      )}

      {apiPayload.course_name === "Write My Paper/Essay" && (
        <div className="text-left flex items-center mx-auto max-w-[500px] mt-4">
          <div className="p text-left min-w-[120px]">No. of Pages</div>
          <div className="w-full flex">
            <input
              type="number"
              className="w-full grow border-2 border-black rounded-lg p-2"
              value={noOfPages}
              onChange={(e) => {
                let pages = +e.target.value < 0 ? "" : e.target.value;
                // setNoOfPages(+pages);
                // @ts-ignore
                setNoOfPages(e.target.value);
                setApiPayload({ ...apiPayload, noOfPages: pages });
              }}

              // onBlur={() => setActiveStep(3)}
            />
            <button
              id="numberOfPages"
              className="next-step-btn max-w-[80px] w-full h-full ml-4 bg-[#ff641a] text-white p-4 rounded flex items-center justify-center"
              onClick={() => setActiveStep(3)}
            >
              Next
            </button>
          </div>
        </div>
      )}
      {apiPayload.course_name === "Do My Exam" && (
        <div className="flex justify-center gap-x-4 flex-wrap">
          <button
            id="proctored"
            className={`${serviceBtn}`}
            onClick={() => handleExamClick("Proctored")}
          >
            Proctored
          </button>
          <button
            id="nonProctored"
            className={`${serviceBtn}`}
            onClick={() => handleExamClick("Non Proctored")}
          >
            Non Proctored
          </button>
          <button
            id="quiz"
            className={`${serviceBtn}`}
            onClick={() => handleExamClick("Quiz")}
          >
            Quiz
          </button>
          <button
            id="lockdownExam"
            className={`${serviceBtn}`}
            onClick={() => handleExamClick("Lockdown Exam")}
          >
            Lockdown Exam
          </button>
          <button
            id="lockdownExam"
            className={`${serviceBtn}`}
            onClick={() => handleExamClick("Other")}
          >
            Other
          </button>
          {/* <button
        className={`service-btn ${
          apiPayload.course_level === "Lockdown Exam" &&
          "selected-service-btn"
        }`}
        onClick={() => handleExamClick("Other")}
      >
        Other
      </button> */}
        </div>
      )}

      {/* <StepCounter
    activeStep={activeStep}
    onClick={() => setActiveStep(3)}
    isDisabled={
      (apiPayload.course_name === "Write My Paper/Essay" &&
        !apiPayload.noOfPages) ||
      (apiPayload.course_name === "Do My Exam" && !apiPayload.course_level)
    }
  /> */}
    </div>
  );
};

export default Step2;
