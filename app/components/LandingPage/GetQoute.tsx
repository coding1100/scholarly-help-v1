// components/GetQoute.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import dynamic from "next/dynamic";

const HeroForm = dynamic(() => import("./HeroForm"), { ssr: false });

export default function GetQuote() {
  const scrollToQuote = () => {
    const quoteForm = document.getElementById("quote-form");
    if (quoteForm) {
      quoteForm.scrollIntoView({ behavior: "smooth" });
    }
  };

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    subject: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Quote request submitted!");
    console.log(formData);
  };

  return (
    <section
      id="quote-form"
      className="w-full bg-[#F3F4F9] max-[1020px]:overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex max-[1080px]:flex-col-reverse pt-[130px] pb-[80px] max-[1320px]:px-8">
        <div className="w-[70%] max-[1080px]:w-[100%] p-4 flex relative justify-end">
          <Image
            src="/assets/Icon/aGrade.png"
            alt=""
            width={580}
            height={600}
            className="max-[768px]:hidden"
            style={{
              height: "auto",
              position: "absolute",
              left: "10px",
              top: "-80px",
            }}
          />

          <div className="relative max-[768px]:mx-auto ">
            <Image
              src="/assets/Icon/ag-1.png"
              alt=""
              width={50}
              height={50}
              className="z-[8]"
              style={{
                position: "absolute",
                left: "56px",
                top: "-75px",
                width: "auto",
                height: "auto",
                zIndex: "8",
              }}
            />

            <Image
              src="/assets/Icon/ag-2.png"
              alt=""
              width={50}
              height={50}
              style={{
                position: "absolute",
                left: "300px",
                top: "-77px",
                width: "auto",
                zIndex: "8",
                height: "auto",
              }}
            />
            <Image
              src="/assets/Icon/ag-3.png"
              alt=""
              width={50}
              height={50}
              style={{
                position: "absolute",
                right: "-50px",
                bottom: "56px",
                width: "auto",
                zIndex: "8",
                height: "auto",
              }}
            />
            <div className="sm:w-[450px] formtwo">
              <HeroForm />
            </div>
            <div className="hidden">
              <form
                onSubmit={handleSubmit}
                className="shadow-xl  max-w-lg z-[9] min-w-[445px] max-[480px]:min-w-[300px] space-y-4 rounded-3xl bg-white p-4 w-full relative"
              >
                {/* Email */}
                <div>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="text-[#949ACB] outline-none w-full pr-14 pl-4 py-7 bg-[#F8F8F8] rounded-xl  transition font-poppins font-medium leading-[154%] tracking-normal text-[15.73px]"
                      placeholder="Email *"
                    />
                    <span className="absolute right-6 top-8.5 text-gray-400">
                      <Image
                        src="/assets/Icon/email.png"
                        alt=""
                        width={20}
                        height={20}
                      />
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="text-[#949ACB] outline-none w-full pl-4 pr-14 py-7 bg-[#F8F8F8] rounded-xl  transition font-poppins font-medium leading-[154%] tracking-normal text-[15.73px]"
                      placeholder="Phone # *"
                    />
                    <span className="absolute right-6 top-8.5 text-gray-400">
                      <Image
                        src="/assets/Icon/phone.png"
                        alt=""
                        width={20}
                        height={20}
                      />
                    </span>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <div className="relative">
                    <textarea
                      name="subject"
                      required
                      rows={4}
                      value={formData.subject}
                      onChange={handleChange}
                      className="text-[#949ACB] outline-none w-full pl-4 pr-14 py-7 bg-[#F8F8F8] rounded-xl  transition resize-none font-poppins font-medium leading-[154%] tracking-normal text-[15.73px]"
                      placeholder="What do you need help with? *"
                    />
                    <span className="absolute right-6 top-8.5 text-gray-400">
                      <Image
                        src="/assets/Icon/msg.png"
                        alt=""
                        width={20}
                        height={20}
                      />
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={scrollToQuote}
                  className="w-full mt-8 rounded-md px-3 cursor-pointer bg-[#ff641a] text-white border border-transparent transition duration-300 text-[15px] font-medium flex items-center justify-center hover:bg-white hover:text-[#ff641a] hover:border-[#ff641a] h-[54px]"
                >
                  Take my online class
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="w-[30%] p-4 bg-gray-100 max-[1080px]:w-[100%] max-[1080px]:mb-20">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            Stop Sacrificing Your Time, We’ll Handle Your Classes
          </h3>
          <p className="text-gray-600 mt-4 text-sm md:text-base">
            From exams and essays to full‑class management, we handle it all so
            you don’t have to.
          </p>
        </div>
      </div>
    </section>
  );
}
