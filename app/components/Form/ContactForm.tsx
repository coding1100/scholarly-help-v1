

"use client";

import { useState } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import emailIcon from "@/app/assets/Images/email-quote.png";

import { useForm, SubmitHandler, Controller } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { usePathname } from "next/navigation";
import t from "react-hot-toast";
import Button from "../Button/Button";

const toast = (msg: string) =>
  t(msg, {
    duration: 4000,
    position: "bottom-center",
  });
 
type Inputs = {
  email?: string;
  phoneNumber?: string;
  message?: string;
};

const ContactUs = () => {
  const router = useRouter();
  const currentPage = usePathname();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setPhoneNumber("");

    try {
      setIsLoading(true);
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/order/email-submission`,
        data
      );
      reset();
      toast("Form submitted successfully");
    } catch (error) {
      toast("Something went wrong please try again.");
    }
    setIsLoading(false);
  };

  return (
    <>
      <div id="contact-form" className="flex flex-col mt-10">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Controller
              name="phoneNumber"
              control={control}
              defaultValue=""
            //   rules={{ required: "Phone Number is required" }}
              render={({ field }) => {
                return (
                  <PhoneInput
                    defaultCountry="us"
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    placeholder="Phone Number"
                    className="border-b-2 border-[#D1D5DB] max-w-[300px] w-full"
                    style={{
                      borderBottom: errors.phoneNumber && "2px solid #FB3C1D",
                      maxWidth: "300px",
                    }}
                  />
                );
              }}
            />
            {errors.phoneNumber && (
              <div className="text-primary-500">
                {errors.phoneNumber.message}
              </div>
            )}
          </div>
          <div className="flex flex-col items-center mt-4">
            <div className="flex w-full">
              <Image src={emailIcon} className="absolute w-6 h-4 mt-1 ml-1" alt="icon" />
              {/* <Image src={emailIcon} alt="email" className="w-6 h-4 mr-2" /> */}
              <input
                type="text"
                className={`w-full border-b-2 border-0 focus:outline-none bg-transparent max-w-[300px] pl-10 pb-2 ${
                  errors.email ? "border-primary-500" : "border-gray-300"
                }`}
                placeholder="@email.com"
                {...register("email", {
                //   required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
            </div>
            {errors.email && (
              <div className="text-red-500 text-left self-start">
                {errors.email.message}
              </div>
            )}
          </div>
          <div className="flex flex-col mt-4">
            <div className="flex items-center">
              <textarea
                placeholder="Message"
                className="w-full border-b-2 border-0 border-gray-300 focus:outline-none bg-transparent max-w-[300px] pl-1"
                {...register("message")}
              ></textarea>
            </div>
          </div>
          <div>
            <Button
              type="submit"
              size="md"
              className="mt-4 uppercase rounded-md py-4 flex items-center justify-center h-[50px] max-w-fit px-6"
            >
              submit
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ContactUs;
