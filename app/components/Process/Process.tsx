"use client";

import { FC, useEffect, useState } from "react";
import ScheduleIcon from "@/app/assets/Images/schedule-icon.webp";
import Image from "next/image";
import Button from "../Button/Button";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Content = {
  title?: string;
  description?: string;
  img?: any;
};

interface ProcessProps {
  content: Content[];
}
const Process: FC<ProcessProps> = ({ content }) => {
  const [activeProcessIndex, setActiveProcessIndex] = useState(0);
  const currentPage = usePathname();
  useEffect(() => {
    let interval = setInterval(() => {
      setActiveProcessIndex((prev) =>
        prev === content.length - 1 ? 0 : prev + 1
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-8 flex justify-center bg-primary-100">
      <div className="container px-10">
        <div>
          <h2 className="md:text-5xl text-2xl font-bold text-primary-500 text-center">
            State-of-the-Art Process We Follow
          </h2>
        </div>
        <div className="pt-16">
          {content.map((item, index) => {
            return (
              <div key={index} className="grid grid-cols-2">
                {activeProcessIndex === index && (
                  <div className="flex justify-center md:col-span-1 col-span-2">
                    <div>
                      <Image
                        src={item.img}
                        alt="process"
                        className="w-full max-h-[210px]"
                        width={400}
                        height={210}
                      />
                    </div>
                  </div>
                )}
                {activeProcessIndex === index && (
                  <div className="flex flex-col justify-center text-primary-500 md:col-span-1 col-span-2 md:pt-0 pt-4">
                    <div className="font-bold text-lg">
                      <h3>{item.title}</h3>
                    </div>
                    <div className="">
                      <p>{item.description}</p>
                    </div>
                    <div className="mt-8 md:block flex justify-center ">
                      {currentPage === "/take-my-class/" ? (
                        <Link href="#PhoneEmailMsgForm">
                          <Button className="md:w-64 w-48 bg-secondary-500 hover:text-secondary-500 hover:border-secondary-500">
                            Place an Order Now
                          </Button>
                        </Link>
                      ) : (
                        <a href="javascript:void(Tawk_API.toggle())">
                          <Button className="md:w-64 w-48 bg-secondary-500 hover:text-secondary-500 hover:border-secondary-500">
                            Place an Order Now
                          </Button>
                        </a>
                      )}
                      {/* <a href="javascript:void(Tawk_API.toggle())">
                        <Button className="md:w-64 w-48 bg-secondary-500 hover:text-secondary-500 hover:border-secondary-500">
                          Place an Order Now
                        </Button>
                      </a> */}
                    </div>
                    {/* <div>
                      <a
                        href="javascript:void(Tawk_API.toggle())"
                        style={{ textDecoration: "none" }}
                      >
                        <PlaceAnOrderBtn className="mx-auto mx-md-0" />
                      </a>
                    </div> */}
                  </div>
                )}
              </div>
            );
          })}
          <div className="flex justify-center md:px-16">
            <div className="items-center flex justify-between bg-primary-300 h-1.5 sm:max-w-[330px] w-full mx-5 my-auto relative -top-4 mt-16">
              <div className="relative -top-8 flex justify-between mt-16 w-full">
                {content.map((_, i) => (
                  <span
                    key={i}
                    className="border-4 border-primary-300 rounded-full h-8 w-8 flex items-center justify-center text-white bg-primary-500 cursor-pointer text-sm"
                    style={{
                      background:
                        activeProcessIndex === i ? "#2b1c50" : "#6d6493",
                    }}
                    onClick={() => setActiveProcessIndex(i)}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Process;
