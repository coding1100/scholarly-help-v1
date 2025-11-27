"use client";

import logo from "@/app/assets/Images/ScanToSolve.png";
import axiosInstance from "@/app/axios";
import { notification } from "@/app/utilities/utilities";
import axios from "axios";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { AiOutlineScan } from "react-icons/ai";
import { FiChevronRight } from "react-icons/fi";
import { HiOutlineUserPlus } from "react-icons/hi2";
import { IoIosLogOut } from "react-icons/io";
import { MdOutlineManageHistory } from "react-icons/md";
import useAuth from "../../hooks/useAuth";
import LimitReachedDialog from "./LimitReachedDialog";
import PaymentSuccessDialog from "./PaymentSuccessDialog";

function Exercise() {
  // @ts-ignore
  const { isAuthenticated } = useAuth();
  const [file, setFile] = useState<any>(null);
  const [query, setQuery] = useState("");
  const [solutions, setSolutions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("exercise");
  const [histories, setHistories] = useState<any[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [openPaymentSuccess, setOpenPaymentSuccess] = useState(false);
  const [userIp, setUserIp] = useState<string>("");

  useEffect(() => {
    if (window.location?.href.includes("?session_id")) {
      setOpenPaymentSuccess(true);
    }

    if (isAuthenticated) return;
    getUserIp();
  }, []);

  const getUserIp = async () => {
    try {
      const res = await axios.get("https://api-bdc.net/data/client-ip");

      setUserIp(res?.data?.ipString);
    } catch (error) {}
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    const fd = new FormData();

    fd.append("query", query);
    fd.append("image", file);

    setIsLoading(true);

    let apiUrl = isAuthenticated
      ? "scan-to-solve/predict/image"
      : "scan-to-solve/predict/image/ip";

    if (!isAuthenticated) {
      fd.append("ipAddress", userIp);
    }

    try {
      const res = await axiosInstance.post(apiUrl, fd, {
        // const res = await axiosInstance.post("scan-to-solve/predict/image/ip", fd, {
        headers: {
          "Content-Type": "multipart/formdata",
        },
      });

      setIsLoading(false);
      setSolutions([...solutions, res.data.content]);
      setQuery("");
    } catch (e) {
      if (
        // @ts-ignore
        e?.response?.data?.message?.includes(
          "You have reached the limit for free credits"
        )
      ) {
        setOpen(true);
        return;
      }

      // @ts-ignore
      notification("error", e?.response?.data?.message);
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    window.location.href = window.location.origin + "/scan";
  };

  const showHistory = async () => {
    setActiveTab("history");
    try {
      const res = await axiosInstance.get(
        "/scan-to-solve/user/exercise/history"
      );

      setHistories(res?.data);
    } catch (error) {}
  };

  const handleClose = () => setOpenPaymentSuccess(false);

  return (
    <div className="md:flex min-h-[100vh]">
      <div className="md:w-[25%] bg-[#F1F4F8] md:pb-0 md:block flex justify-between items-center">
        <div className="sm:p-12 pl-5">
          <Link href="/scan">
            <Image src={logo} alt="logo" />
          </Link>
        </div>
        <div className="md:block flex justify-end">
          <div
            className="md:mx-8 sm:mx-4 mx-1 my-2 text-left"
            onClick={() => setActiveTab("exercise")}
          >
            <div className="flex items-center sm:p-4 px-1 bg-white rounded-md shadow-md justify-evenly hover:shadow-lg">
              <div className="md:basis-1/12">
                <AiOutlineScan
                  size={30}
                  color="#696969"
                  className="sm:w-9 w-5"
                />
              </div>
              <div className="basis-10/12 md:block hidden">
                <p className="text-md text-[#716A6A] pl-2">Scan an exercise</p>
              </div>
              <div className="md:basis-1/12 md:block hidden">
                <FiChevronRight />
              </div>
            </div>
          </div>
          <div
            className="md:mx-8 sm:mx-4 mx-1 my-2 text-left"
            onClick={showHistory}
          >
            <div className="flex items-center sm:p-4 px-1 bg-white rounded-md shadow-md justify-evenly hover:shadow-lg">
              <div className="md:basis-1/12">
                <MdOutlineManageHistory
                  size={30}
                  color="#696969"
                  className="sm:w-9 w-5"
                />
              </div>
              <div className="basis-10/12 md:block hidden">
                <p className="text-md text-[#716A6A] pl-2">Exercise history</p>
              </div>
              <div className="md:basis-1/12 md:block hidden">
                <FiChevronRight />
              </div>
            </div>
          </div>
          <div className="md:mx-8 sm:mx-4 mx-1 my-4 text-left md:block hidden">
            <p className="text-lg text-[#716A6A]">Account</p>
          </div>

          <div className="md:mx-8 sm:mx-4 mx-1 my-2 text-left">
            <div className="flex items-center sm:p-4 px-1 bg-white rounded-md shadow-md justify-evenly hover:shadow-lg">
              <div className="md:basis-1/12">
                <HiOutlineUserPlus
                  size={30}
                  color="#696969"
                  className="sm:w-9 w-5"
                />
              </div>
              <div className="basis-10/12 md:block hidden">
                <p className="text-md text-[#716A6A] pl-2">
                  Edit your information
                </p>
              </div>
              <div className="md:basis-1/12 md:block hidden">
                <FiChevronRight />
              </div>
            </div>
          </div>
          {isAuthenticated && (
            // {false && (
            <div className="md:mx-8 sm:mx-4 mx-1 my-2 text-left">
              <div className="flex items-center sm:p-4 px-1 bg-white rounded-md shadow-md justify-evenly hover:shadow-lg">
                <div className="md:basis-1/12">
                  <IoIosLogOut
                    size={30}
                    color="#696969"
                    className="sm:w-9 w-5"
                  />
                </div>
                <div className="basis-10/12 md:block hidden">
                  <div
                    className="text-md text-[#716A6A] pl-2 cursor-pointer"
                    onClick={logout}
                  >
                    Log Out
                  </div>
                </div>
                <div className="md:basis-1/12 md:block hidden">
                  <FiChevronRight />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="md:w-[75%]">
        {activeTab === "exercise" && (
          <div>
            <div className="h-[60vh] overflow-y-auto">
              <p className="p-8 text-lg font-semibold text-left"> Exercise</p>
              {solutions.map((solution, i) => (
                <pre key={i}>
                  <p
                    className="pl-8 text-lg font-semibold text-left whitespace-break-spaces"
                    dangerouslySetInnerHTML={{ __html: solution }}
                  />
                </pre>
              ))}
            </div>
            <div className="md:h-[35vh] bg-[#F1F4F8] m-2 rounded-md md:flex md:flex-col md:justify-end md:pt-0 pt-4">
              <form onSubmit={handleSubmit}>
                <div className="md:flex justify-center p-4 md:space-x-4 sm:px-8 sm:py-4 ">
                  <div className="md:flex-none flex justify-center">
                    <label
                      htmlFor="files"
                      className="md:p-4 p-3 md:text-lg border-dashed font-medium border-2 border-[#FF3449] rounded-full shadow-sm text-[#FF3449]"
                    >
                      + Upload Files
                    </label>
                    <input
                      type="file"
                      id="files"
                      name="files"
                      className="hidden"
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFile(e?.target?.files?.[0])
                      }
                    />
                  </div>
                  {file && (
                    <div>
                      <div className="absolute md:bottom-0 -bottom-80 md:left-[25px]">
                        <p>{file.name}</p>
                      </div>
                      {/* <div className="absolute -bottom-80 block md:hidden">
                        <p>{file.name}</p>
                      </div> */}
                    </div>
                  )}
                  <div className=" md:flex justify-between font-medium md:border border-[#FF3449] rounded-full md:bg-white md:w-[78%] md:mt-0 mt-4">
                    <input
                      type="text"
                      id="text"
                      name="text"
                      className="md:w-[80%] w-full focus:ring-0 focus:outline-none p-2 md:text-lg rounded-full text-[#FF3449] border border-[#FF3449] md:border-none"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="md:flex-none flex justify-center md:mt-0 mt-2">
                      <button
                        type="submit"
                        className=" bg-[#FF3449] justify-items-end hover:bg-red-700 text-white md:text-base text-sm font-bold py-4 px-8 rounded-full text-left flex m-1"
                      >
                        {isLoading ? "Analyzing" : "Solution"}
                      </button>
                    </div>
                    {/* <Link to="/exercise" className="text-red-500">Exercise</Link> */}
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
        {activeTab === "history" && (
          <div className="p-4">
            {histories?.map((history) => (
              <div key={history._id}>
                <div
                  className={`mt-2 ${
                    history.senderId && "font-bold capitalize"
                  }`}
                >
                  {history.senderId ? history.query : history.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <LimitReachedDialog
        open={open}
        handleClose={() => setOpen(false)}
        handleOpen={() => setOpen(true)}
      />
      <PaymentSuccessDialog
        open={openPaymentSuccess}
        handleClose={handleClose}
      />
    </div>
  );
}

export default dynamic(() => Promise.resolve(Exercise), { ssr: false });
