"use client";
import { FC, useState } from "react";
import Datetime from "react-datetime";
import { formattedDate } from "@/app/utilities/utilities";
import dayjs from "dayjs";
import CalenderIcon from "@/app/assets/Icons/Calender";

import "react-datetime/css/react-datetime.css";
interface DateTimeProps {}
const DateTime: FC<DateTimeProps> = ({}) => {
  const isValidDate = (current: any) => {
    const today = new Date().setHours(0, 0, 0, 0); // Get today's date without time
    const selectedDate = current.startOf("day").valueOf(); // Get selected date without time

    return selectedDate >= today; // Only allow dates equal to or greater than today
  };
  const [date, setDate] = useState(
    formattedDate(dayjs().add(2, "days"), "MM/DD/YYYY hh:mm A")
  );
  return (
    <div className="border border-transparent border-b-black pb-2 flex justify-between items-center">
      <Datetime
        className="date-time-picker focus:outline-none dateTimeBox"
        isValidDate={isValidDate}
        initialValue={formattedDate(dayjs(), "MM/DD/YYYY hh:mm A")}
        inputProps={{
          placeholder: "Select a date and time",
          value: date + " EST",
          className: "focus:outline-none rounded bg-transparent",
        }}
        onChange={(v) => {
          setDate(dayjs(v.toLocaleString()).format("MM/DD/YYYY hh:mm A"));
        }}
        // onClose={() => setActiveStep(4)}
      />
      <div>
        <CalenderIcon />
      </div>
    </div>
  );
};

export default DateTime;
