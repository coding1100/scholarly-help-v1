import dayjs, { Dayjs } from "dayjs";
import { PhoneNumberUtil } from "google-libphonenumber";
import toast from "react-hot-toast";
const phoneUtil = PhoneNumberUtil.getInstance();

export const formattedDate = (data: Dayjs, format: string) => {
  return dayjs(data).format(format);
};

export const isPhoneValid = (phone: string) => {
  try {
    return phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(phone));
  } catch (error) {
    return false;
  }
};

export const isEmailValid = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  return emailRegex.test(email);
};

export const notification = (type: "error" | "success", msg: string) => {
  if (type === "error") {
    toast.error(msg, { duration: 4000 });
  } else {
    toast.success(msg, { duration: 4000 });
  }
};
