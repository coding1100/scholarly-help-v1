import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import "./index.css";
import { Dispatch, FC, SetStateAction } from "react";

type PhoneNumberInputProps = {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
};

const PhoneNumberInput: FC<PhoneNumberInputProps> = ({ value, setValue }) => {
  // function PhoneNumberInput({ value, setValue, style }) {
  // `value` will be the parsed phone number in E.164 format.
  // Example: "+12133734253".

  return (
    <PhoneInput
      defaultCountry="us"
      value={value}
      onChange={(val: string) => setValue(val)}
      placeholder="Phone Number"
      //   style={style}
    />
  );

  //   return (
  //     <PhoneInput
  //       placeholder="Enter phone number"
  //       value={value}
  //       onChange={setValue}
  //     />
  //   );
};

export default PhoneNumberInput;
