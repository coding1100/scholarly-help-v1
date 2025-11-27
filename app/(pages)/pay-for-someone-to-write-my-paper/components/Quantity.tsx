"use client";
import Minus from "@/app/assets/Icons/Minus";
import Plus from "@/app/assets/Icons/Plus";
import { Input } from "postcss";
import { FC, useState } from "react";

interface QuantityProps {}
const Quantity: FC<QuantityProps> = ({}) => {
  const [quantityvalue, setQuatityValue] = useState(1);

  const handleOnChange =(e:any)=>{
    setQuatityValue(e.target.value);
  }
  const valueIncrement = () => {
    setQuatityValue(+quantityvalue + 1);
  };
  const valueDecrement = () => {
    if (quantityvalue <= 0) {
      return;
    } else {
      setQuatityValue(+quantityvalue - 1);
    }
  };
  return (
    <div className="border border-transparent border-b-black pb-2 flex justify-between items-center cursor-pointer">
      <div>
        <p>Quantity</p>
      </div>
      <div className="flex items-center">
        <div className="px-5">
          <input
            className="bg-transparent text-right max-w-12 focus:outline-none"
            type="text"
            value={quantityvalue}
            onChange={handleOnChange}
          />
        </div>
        <div>
          <div className="w-3" onClick={valueIncrement}>
            <Plus />
          </div>
          <div className="w-3" onClick={valueDecrement}>
            <Minus />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quantity;
