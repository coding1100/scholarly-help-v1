import useBreakpoint from "@/app/(pages)/hooks/useMediabreakpoint";
import HowItWorkIcon from "@/app/assets/Icons/howItWork.png";
import SubscriptionIcon from "@/app/assets/Icons/subcriptionIcon.png";
import ScanLogo from "@/app/assets/Images/ScanToSolve.png";
import Image from "next/image";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoLogOutOutline } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";
import { SidebarType } from "../NewLayoutExcercise";
interface SideBarProps {
  openSidebar: SidebarType;
  setOpenSidebar: Dispatch<SetStateAction<SidebarType>>;
}

const SideBar: FC<SideBarProps> = ({ openSidebar, setOpenSidebar }) => {
  const { isMobile } = useBreakpoint();
  const [howWork, setHowWork] = useState<boolean>(false);

  const handleSidebar = () => {
    setOpenSidebar({ flag: false, isOpen: "close" });
  };
  return (
    <div className="bg-[#F7F9FC] w-full h-screen pb-9 pt-2">
      <div
        className={`${
          openSidebar.flag
            ? "flex justify-end px-7 text-primary-400 text-lg"
            : "hidden"
        } `}
      >
        <MdOutlineCancel onClick={handleSidebar} />
      </div>
      <div className="mx-auto w-[77%] h-full flex flex-col justify-between pt-6">
        <div>
          <Image src={ScanLogo} alt="" />
          <div className="mt-8">
            <p className="text-[#7A7A7A] font-bold leading-[14px]">Name here</p>
            <p className="text-[#7A7A7A] font-medium text-[13px]">
              nameemail@gmail.com
            </p>
          </div>
          <div className="w-full bg-[#e6e8eb] h-px my-4"></div>
          <div className="mb-8">
            <p className="text-[#7A7A7A] text-[13px]">
              Subscription Plan: <span className="font-bold">Free</span>
            </p>
            <p className="text-[#7A7A7A] text-[11px]">
              (Change/Renew Subscription)
            </p>
          </div>
          <div className="w-full flex flex-col gap-[10px]">
            <div className="w-full border text-[#7A7A7A] border-[#7A7A7A] rounded-[5px] py-3 px-4 h-[46px]">
              <div className="w-full flex justify-between items-center gap-2">
                <Image src={SubscriptionIcon} alt="" />
                <p className="text-[14px] font-medium grow">
                  subscription details
                </p>
                <IoIosArrowDown />
              </div>
            </div>
            <div
              className={`w-full border text-[#7A7A7A] border-[#7A7A7A] rounded-[5px] py-3 px-4 transition-all duration-500 overflow-hidden ${
                howWork ? "h-[150px]" : "h-[46px]"
              }`}
            >
              <div
                onClick={() => setHowWork(!howWork)}
                className="w-full flex justify-between items-center cursor-pointer"
              >
                <Image
                  src={HowItWorkIcon}
                  alt=""
                  className={`transition-all duration-500 ${
                    howWork ? "rotate-90" : "rotate-0"
                  }`}
                />

                <p className="text-sm font-medium grow ml-2">How it works:</p>
                <IoIosArrowDown
                  className={` ${howWork ? "rotate-180" : "rotate-0"}`}
                />
              </div>
              {/* {howWork && ( */}
              <div className="pl-4 pt-4">
                <ol className="text-xs font-medium list-decimal">
                  <li className="mb-2">
                    Upload a clear image file of homework with questions.
                  </li>
                  <li>
                    Our scan tool will scan the image and provide you with
                    accurate answers.
                  </li>
                </ol>
              </div>
              {/* )} */}
            </div>
            <div className="flex items-center gap-1">
              <p className="text-[11px] text-[#444746] font-semibold">
                Found a bug?
              </p>
              <p className="text-[11px] text-[#444746]">Report us here!</p>
            </div>
          </div>
        </div>
        <div className="w-full h-full flex flex-col justify-between">
          <div className="grow flex flex-col justify-center">
            <p className="text-[#444746] text-xs font-bold mb-4">
              Need Quick Expert Assistance?
            </p>
            <button className="w-full text-[14px] font-medium text-white hover:text-primary-400 bg-primary-400 hover:bg-white transition-colors duration-500 border border-primary-400 rounded-md py-3">
              Get Scholarly Help Now!
            </button>
          </div>
          <div className="flex items-center gap-2 text-[#444746]">
            <IoLogOutOutline />
            <p className="text-[14px] font-medium">Logout</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
