"use client";

import useBreakpoint from "@/app/(pages)/hooks/useMediabreakpoint";
import CalenderIcon from "@/app/assets/Icons/Calender";
import DownChevron from "@/app/assets/Icons/DownChevron";
import Minus from "@/app/assets/Icons/Minus";
import Plus from "@/app/assets/Icons/Plus";
import HeroBg from "@/app/assets/Images/bubblesBg.svg";
import Dots from "@/app/assets/Images/dots.svg";
import SemiCircle from "@/app/assets/Images/semiCircle.svg";
import Button from "@/app/components/Button/Button";
import { formattedDate } from "@/app/utilities/utilities";
import dayjs from "dayjs";
import moment from "moment";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";

interface HeroProps {}
const Hero: FC<HeroProps> = ({}) => {
  const currentPage = usePathname();
  const { isMobile } = useBreakpoint();
  const [academicDropDownopen, setAcademicDropDownOpen] = useState(false);

  const [date, setDate] = useState(
    formattedDate(dayjs().add(2, "days"), "MM/DD/YYYY hh:mm A")
  );
  const navigate = useRouter();
  const [payloadErr, setPayloadErr] = useState("");
  const [apiPayload, setApiPayload] = useState({
    academicLevel: "Undergraduate",
    qty: 1,
    date: moment(new Date()).add(3, "days"),
  });

  const isValidDate = (current: any) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const selectedDate = current?.startOf("day")?.valueOf();

    return selectedDate >= today;
  };

  const addfunc = () => {
    setApiPayload({ ...apiPayload, qty: +apiPayload.qty + 1 });
    setPayloadErr("");
  };

  const minusfunc = () => {
    if (apiPayload.qty === 0) {
      return;
    } else {
      setApiPayload({ ...apiPayload, qty: apiPayload.qty - 1 });
    }
    setPayloadErr("");
  };

  const handleOnChange = (e: any) => {
    setApiPayload({ ...apiPayload, qty: e.target.value });
    setPayloadErr("");
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (apiPayload.qty === 0) {
      setPayloadErr("Please select quantity");
      return;
    }

    if (!moment(apiPayload.date).isValid()) {
      setPayloadErr("Invalid date selection");
      return;
    }

    navigate.push("/order");
  };

  useEffect(() => {
    localStorage.setItem("apiPayload", JSON.stringify(apiPayload));
  }, [apiPayload]);

  return (
    <div className="bg-gradient-to-r from-[#DAF2EF] to-[#FFE9EA] -mt-[90px] overflow-visible">
      <div
        className="bg-no-repeat bg-right-top pt-[65px] overflow-visible"
        style={{
          backgroundImage: `url(${SemiCircle.src})`,
        }}
      >
        <div
          className="bg-no-repeat bg-right pt-[100px] pb-14"
          style={{
            backgroundImage: `${isMobile ? "none" : `url(${HeroBg.src})`}`,
            backgroundSize: "550px",
            zIndex: 100,
          }}
        >
          <div className="sm:container sm:mx-auto mx-5">
            <div>
              <div className="pt-7 relative">
                <div className="absolute md:top-16 top-11 -left-5 md:w-full w-24">
                  <Image src={Dots} alt="" />
                </div>
                <div className="text-primary-400 md:text-5xl text-2xl font-bold relative z-10">
                  <h1 className=" md:leading-[63px]">
                    Get Expert
                    <br />
                    Paper Help Now
                  </h1>
                </div>
                <div className="mt-3 relative z-10 md:text-lg text-sm">
                  We deliver the most trustworthy academic
                  <br />
                  writing assistance for your online class!
                </div>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-12 mt-10">
                  <div className="lg:col-span-7 col-span-12 grid xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-3 sm:grid-cols-2 grid-cols-3 gap-4">
                    <div className="sm:col-span-1 col-span-3">
                      {/* <Education /> */}
                      <div className="relative">
                        <div
                          className="border border-transparent border-b-black pb-2 flex justify-between items-center cursor-pointer"
                          onClick={() =>
                            setAcademicDropDownOpen(!academicDropDownopen)
                          }
                        >
                          <div>
                            {/* <p>{academicLevel}</p> */}
                            <p>{apiPayload.academicLevel}</p>
                          </div>
                          <div className="w-4">
                            <DownChevron />
                          </div>
                        </div>
                        {academicDropDownopen === true && (
                          <div className="absolute bg-white rounded-md border border-[#BBC6C6] translate-y-1 w-full py-2 font-normal">
                            <div
                              className="hover:bg-[#F8F9FA] px-4 py-1 cursor-pointer"
                              onClick={() => {
                                // setAcademicLevel("Graduate");
                                setApiPayload({
                                  ...apiPayload,
                                  academicLevel: "Graduate",
                                });
                                setAcademicDropDownOpen(!academicDropDownopen);
                              }}
                            >
                              <p>Graduate</p>
                            </div>
                            <div
                              className="hover:bg-[#F8F9FA] px-4 py-1 cursor-pointer"
                              onClick={() => {
                                // setAcademicLevel("Undergraduate");
                                setApiPayload({
                                  ...apiPayload,
                                  academicLevel: "Undergraduate",
                                });
                                setAcademicDropDownOpen(!academicDropDownopen);
                              }}
                            >
                              <p>Undergraduate</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="sm:col-span-1 col-span-3">
                      {/* <Quantity /> */}
                      <div className="border border-transparent border-b-black pb-2 flex justify-between items-center cursor-pointer">
                        <div>
                          <p>Quantity</p>
                        </div>
                        <div className="flex items-center">
                          <div className="px-5">
                            <input
                              className="bg-transparent text-right max-w-12 focus:outline-none"
                              type="text"
                              value={apiPayload.qty}
                              // onChange={handleQuantityChange}
                              onChange={handleOnChange}
                            />
                          </div>
                          <div>
                            <div className="w-3" onClick={addfunc}>
                              <Plus />
                            </div>
                            <div className="w-3" onClick={minusfunc}>
                              <Minus />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="sm:col-span-1 col-span-3">
                      {/* <DateTime /> */}
                      <div className="border border-transparent border-b-black pb-2 flex justify-between items-center">
                        <Datetime
                          className="date-time-picker focus:outline-none dateTimeBox"
                          isValidDate={isValidDate}
                          initialValue={formattedDate(
                            dayjs(),
                            "MM/DD/YYYY hh:mm A"
                          )}
                          inputProps={{
                            placeholder: "Select a date and time",
                            value: date + " EST",
                            className:
                              "focus:outline-none rounded bg-transparent",
                          }}
                          onChange={(v) => {
                            setDate(
                              dayjs(v.toLocaleString()).format(
                                "MM/DD/YYYY hh:mm A"
                              )
                            );
                          }}
                          // onClose={() => setActiveStep(4)}
                        />
                        <div>
                          <CalenderIcon />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex md:justify-start justify-center">
                  <Button
                    className="bg-primary-400 md:w-60 w-40 md:h-14 h-10  text-sm"
                    type="submit"
                  >
                    Check Price
                  </Button>
                </div>

                {payloadErr && <div className="text-danger">{payloadErr}</div>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
