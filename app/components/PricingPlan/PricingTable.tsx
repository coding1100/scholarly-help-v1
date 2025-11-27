import { FC } from "react";
import { PricingTableContent } from "./content";
import Image from "next/image";
import PricingIcon from "@/app/assets/Icons/pricingicon.svg";

const check = (
  <svg
    className="w-5 h-5 text-green-500 mx-auto"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const cross = (
  <svg
    className="w-5 h-5 text-red-500 mx-auto"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
const dash = (
  <svg
    className="w-5 h-5 text-gray-400 mx-auto"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
  </svg>
);

const PricingTable: FC = () => {
  return (
    <>
      <p className="text-[28px] text-[#172b4d] text-center mb-5">
        Plan Comparison
      </p>
      <div className="p-5 border border-gray-200 bg-white shadow-md rounded-2xl w-[80%] mx-auto">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="">
                <th className="py-4 px-6 text-left font-semibold text-gray-700 w-1/3">
                  &nbsp;
                </th>
                <th className="py-4 px-6 text-center font-semibold text-gray-700 border-l border-gray-200">
                  Free
                </th>
                <th className="py-4 px-6 text-center font-semibold text-gray-700 border-l border-gray-200">
                  Unlimited
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {PricingTableContent.simpleContent.map((item, index) => (
                <tr
                  key={index}
                  className="even:bg-white odd:bg-[#f7f8f9] rounded-lg"
                >
                  <td className="py-3 px-6 text-gray-700 flex items-center gap-2">
                    <Image src={PricingIcon} alt="" /> {item.option}
                  </td>
                  <td className="py-3 px-6 text-center">{item.free}</td>
                  <td className="py-3 px-6 text-center">{item.unlimited}</td>
                </tr>
              ))}
              {PricingTableContent.booleanContent.map((item, index) => (
                <tr
                  key={index}
                  className=" even:bg-white odd:bg-[#f7f8f9] rounded-lg"
                >
                  <td className="py-3 px-6 text-gray-700 flex items-center gap-2">
                    <Image src={PricingIcon} alt="" /> {item.option}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {item.free ? check : cross}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {item.unlimited ? check : cross}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default PricingTable;
