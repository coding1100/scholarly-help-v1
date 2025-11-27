"use client";

import DownChevron from "@/app/assets/Icons/DownChevron";
import { FC, useEffect, useState } from "react";
import { exam_types, format, subjects } from "./typesAndSubjectContent";
import ClipIcon from "@/app/assets/Images/clipIcon.svg";
import Image from "next/image";
import YellowInfo from "@/app/assets/Icons/YellowInfo";
// import moment from "moment";
import moment, { Moment } from "moment";
import {
  deadlineInHours,
  formatDateWithTime,
  getEmergencyPrice,
} from "@/app/components/PriceCalculator/helper";
interface Step1Props {
  price: number;
  setPrice: any;
}
const Step1: FC<Step1Props> = ({ price, setPrice }) => {
  const [formatValue, setFormatValue] = useState("-Select-");
  //   const [typeValue, setTypeValue] = useState("Critical Thinking");
  const [subjectValue, setSubjectValue] = useState("-Select-");
  const [desciptionValue, setDescriptionValue] = useState("");
  const [isFormatOpen, setIsFormatOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  //   const [file, setFile] = useState<File | null>(null);

  const apiPayloadString =
    typeof window !== "undefined" ? localStorage.getItem("apiPayload") : null;
  const apiPayload = apiPayloadString ? JSON.parse(apiPayloadString) : null;
  // new logics
  // const apiPayloadString = localStorage.getItem("apiPayload");
  // const apiPayload = apiPayloadString ? JSON.parse(apiPayloadString) : null;

  const [file, setFile] = useState<File | null>(null);
  //   const [file, setFile] = useState("");
  const [pageSpaced, setPageSpaced] = useState("double");
  const [type, setType] = useState("Critical Thinking");

  useEffect(() => {
    if (!apiPayload) return;
    priceCalculation();
  }, [pageSpaced]);

  const priceCalculation = () => {
    // const apiPayload = JSON.parse(localStorage.getItem("apiPayload"));
    const apiPayloadString = localStorage.getItem("apiPayload");
    const apiPayload = apiPayloadString ? JSON.parse(apiPayloadString) : null;
    let academicLevel = apiPayload.academicLevel;
    let qty = apiPayload.qty;
    let deadline = apiPayload.date;

    let price = null;

    if (academicLevel === "Graduate") {
      price = 15;
    } else {
      price = 14;
    }

    price = price * +qty;
    if (pageSpaced === "single") {
      price = price * 2;
    }

    let hrs = deadlineInHours(moment(apiPayload.date));
    price = getEmergencyPrice(price, hrs);

    setPrice(price);
  };

  const handleFileInputClick = () => {
    // document.getElementById("fileInput").click();
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.click();
    } else {
      // Handle the case where the element with ID "fileInput" does not exist
    }
  };

  const handleRadio = (e: any) => {
    setPageSpaced(e.target.value);
  };
  // new logics end

  //   const handleFileInputClick = () => {
  //     const fileInput = document.getElementById("fileInput");
  //     if (fileInput) {
  //       fileInput.click();
  //     }
  //   };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]; // Get the selected file
    if (selectedFile) {
      setFile(selectedFile);
    }
  };
  return (
    <div className="container mx-auto">
      <div className="grid md:grid-cols-2 font-light gap-6">
        <div className="relative">
          <div className="mb-2">Format</div>
          <div
            className="border border-[#E9E9E9] py-2 px-3 flex justify-between items-center"
            onClick={() => setIsFormatOpen(!isFormatOpen)}
          >
            <div>{formatValue}</div>
            <div className="w-4">
              <DownChevron />
            </div>
          </div>
          <div
            className={`absolute z-10 w-full bg-white border border-[#767676] shadow-lg ${
              isFormatOpen ? "block" : "hidden"
            }`}
          >
            <div className="opacity-75 py-px px-5">-select-</div>
            {format.map((item, index) => (
              <div
                key={index}
                className="py-px px-5 hover:bg-primary-400 hover:text-white"
                onClick={() => {
                  setFormatValue(item.label);
                  setIsFormatOpen(!isFormatOpen);
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="mb-2">Type</div>
          <div
            className="border border-[#E9E9E9] py-2 px-3 flex justify-between items-center"
            onClick={() => setIsTypeOpen(!isTypeOpen)}
          >
            <div>{type}</div>
            <div className="w-4">
              <DownChevron />
            </div>
          </div>
          <div
            className={`absolute z-10 w-full bg-white border border-[#767676] shadow-lg max-h-96 overflow-auto ${
              isTypeOpen ? "block" : "hidden"
            }`}
          >
            <div className="opacity-75 py-px px-5">-select-</div>
            {exam_types.map((item, index) => (
              <div
                key={index}
                className="py-px px-5 hover:bg-primary-400 hover:text-white "
                onClick={() => {
                  setType(item.label);
                  setIsTypeOpen(!isTypeOpen);
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 font-light gap-6 mt-3 items-end">
        <div className="relative">
          <div className="mb-2">Subject</div>
          <div
            className="border border-[#E9E9E9] py-2 px-3 flex justify-between items-center"
            onClick={() => setIsSubjectOpen(!isSubjectOpen)}
          >
            <div>{subjectValue}</div>
            <div className="w-4">
              <DownChevron />
            </div>
          </div>
          <div
            className={`absolute z-10 w-full bg-white border border-[#767676] shadow-lg ${
              isSubjectOpen ? "block" : "hidden"
            }`}
          >
            <div className="opacity-75 py-px px-5">-select-</div>
            {subjects.map((item, index) => (
              <div
                key={index}
                className="py-px px-5 hover:bg-primary-400 hover:text-white"
                onClick={() => {
                  setSubjectValue(item.label);
                  setIsSubjectOpen(!isSubjectOpen);
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="border border-[#E9E9E9] py-2 px-3 flex">
            <form className="flex justify-between items-center w-full">
              <div>275 words - 1 Page</div>

              <label>
                <input
                  type="radio"
                  name="spacing"
                  value="single"
                  className="mr-2"
                  checked={pageSpaced === "single"}
                  onClick={handleRadio}
                ></input>
                Single-spaced
              </label>
              <label>
                <input
                  type="radio"
                  name="spacing"
                  value="double"
                  className="mr-2"
                  checked={pageSpaced === "double"}
                  onClick={handleRadio}
                  defaultChecked
                ></input>
                Double-spaced
              </label>
            </form>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-5">
        <div className="">
          <div className="bg-[#E9E9E9] p-5 ">
            <div className="bg-white border border-[#CFCFCF] rounded-xl overflow-hidden px-3 py-4">
              <form>
                <textarea
                  className="w-full focus:outline-none "
                  rows={6}
                  name="description"
                  value={desciptionValue}
                  placeholder="Describe your papaer details in at least 3 words in english"
                  onChange={(e) => setDescriptionValue(e.target.value)}
                />
              </form>
              <div className="py-2">
                <div
                  className="flex justify-end"
                  onClick={handleFileInputClick}
                >
                  <Image src={ClipIcon} alt="clipIcon" className="w-4" />
                </div>
                {file && <div className="text-xs text-start">{file?.name}</div>}
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-[#A9A9A9] text-sm font-light w-[87%]">
              Upload your files here, if any. The file size limit is 100 Mb per
              file - otherwise, please contact support team for help
            </div>
            <div className="border border-[#E6E6EF] grid grid-cols-12 items-center mt-4">
              <div className="border border-transparent border-r-[#E6E6EF] col-span-2 flex justify-center items-center py-3 ">
                <YellowInfo />
              </div>
              <div className="text-xs col-span-10 px-3">
                Not ready to add the files?
                <br />
                Upload them later in your control panel
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="bg-primary-400 py-6 px-5 text-white">
            <div className="text-3xl font-semibold">Summary</div>
            <div className="border border-transparent border-t-[3px] border-t-[#6467e0] my-4"></div>
            <div className="font-light">
              {/* Dynamic values */}
              <div className="grid grid-cols-2">
                <div>Type</div>
                <div>$ {price}</div>
              </div>
              <div className="grid grid-cols-2 mt-2">
                <div>Quantity:</div>
                {apiPayload && (<div>{apiPayload.qty} page</div>)}
              </div>
              <div className="grid grid-cols-2 mt-2">
                <div>Deadline:</div>
                {/* <div>date & time will be here</div> */}
                <div>
                  {apiPayload && (formatDateWithTime(moment(apiPayload.date)))}
                </div>
              </div>
              <div className="grid grid-cols-2 mt-2">
                <div>Academic Level:</div>
                {/* <div>Undergraduate</div> */}
                {apiPayload && (<div>{apiPayload.academicLevel} </div>)}
              </div>
            </div>
            <div className="border border-transparent border-t-[3px] border-t-[#6467e0] my-4"></div>
            <div>
              <div className="grid grid-cols-2 font-bold">
                <div>Total</div>
                <div className="text-end">$ {price}</div>
              </div>
              <div className="font-light">Enter A Promo Code (Optional)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1;
