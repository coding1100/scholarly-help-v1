"use client";

import axiosInstance from "@/app/axios";
import { usePathname, useRouter } from "next/navigation";
import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { IoIosMail } from "react-icons/io";
import { IoChatbubbles } from "react-icons/io5";
import { MdPhoneInTalk } from "react-icons/md";
import { ClipLoader } from "react-spinners";
import Image, { StaticImageData } from "next/image";
import FormBackImg from "@/app/assets/Images/Hero-Group-195.webp";
import { usePageData } from "./usePageData";
import SignInCard from "../Auth/SignInCard";
import SignUpCard from "../Auth/SignUpCard";

interface HeroFormProps {
  nameValue?: string;
  textAreaRows?: number;
  formBackImg2?: StaticImageData;
  showStickyOnMobile?: boolean;
  variant?: "default" | "modal";
}

type SubjectLabel = (typeof SUBJECTS)[number]["label"];
type FormDataState = {
  Email: string;
  Phone: string;
  Description: string;
};

const SUBJECTS = [
  { emoji: "🧮", label: "Math" },
  { emoji: "🧬", label: "Science" },
  { emoji: "📊", label: "Business" },
  { emoji: "📝", label: "Essay/English" },
  { emoji: "💻", label: "Coding" },
  { emoji: "📂", label: "Other" },
] as const;

const MULTI_STEP_ROUTES = new Set(["/take-my-class-1", "/take-my-class-2"]);

const PRICE_HEADER_ROUTES = new Set([
  "/",
  "/online-class",
  "/assignment",
  "/exam",
  "/exams",
  "/homework",
  "/take-my-proctored-exam-for-me",
  "/essay-writing",
]);

const PRICE_HEADER_PREFIXES = [
  "/online-class/",
  "/exam/",
  "/exams/",
  "/assignment/",
  "/homework/",
  "/essay-writing/",
];

function normalizePathname(pathname: string | null | undefined) {
  return (pathname || "").replace(/\/+$/, "") || "/";
}

function getQuoteTypeLabelFromPath(pathname: string) {
  if (pathname.includes("assignment")) return "Assignment";
  if (pathname.includes("homework")) return "Homework";
  if (pathname.includes("exam")) return "Exam";
  if (pathname.includes("class")) return "Class";
  if (pathname.includes("essay-writing")) return "Essay";
  return "Class";
}

function validateEmailMaybe(emailRaw: string) {
  const email = emailRaw.trim();
  if (!email) return { ok: true as const };
  // Simple, pragmatic check; server-side validation should be authoritative.
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return ok
    ? ({ ok: true as const } as const)
    : { ok: false as const, message: "Please enter a valid email address." };
}

function buildInstructions(params: {
  isMultiStepRoute: boolean;
  selectedSubject: string;
  otherSubjectDescription: string;
  description: string;
}) {
  const {
    isMultiStepRoute,
    selectedSubject,
    otherSubjectDescription,
    description,
  } = params;

  if (!isMultiStepRoute) return description?.trim() ? description.trim() : "";

  let text = "";
  if (selectedSubject) {
    text += `Subject: ${selectedSubject}`;
    if (selectedSubject === "Other" && otherSubjectDescription.trim()) {
      text += ` - ${otherSubjectDescription.trim()}`;
    }
    text += "\n";
  }
  if (description?.trim()) text += `Additional Info: ${description.trim()}`;
  return text.trim();
}

function buildQuoteFormData(params: {
  FBCLID: string;
  GCLID: string;
  url: string;
  email: string;
  phone: string;
  instructions: string;
}) {
  const { FBCLID, GCLID, url, email, phone, instructions } = params;
  const fd = new FormData();
  if (FBCLID) fd.append("fbclid", FBCLID);
  if (GCLID) fd.append("gclid", GCLID);
  fd.append("url", url);
  if (email) fd.append("email", email);
  if (phone) fd.append("phone_number", phone);
  if (instructions) fd.append("instructions", instructions);
  return fd;
}

const BackgroundIllustration = ({
  image,
  isTakeMyClass2Route,
  variant,
}: {
  image?: StaticImageData;
  isTakeMyClass2Route: boolean;
  variant: "multistep" | "default";
}) => {
  if (image) {
    return (
      <Image
        src={image}
        alt="Academic success illustration"
        width={526}
        height={551}
        className={
          variant === "multistep"
            ? "min-[1200px]:max-w-[450px] max-w-[450px] cus-img absolute min-[1200px]:right-[-280px] min-[1200px]:top-[-83px] -z-[1] max-[1025px]:hidden min-[1000px]:right-[-272px] min-[1000px]:top-[-83px]"
            : "min-[1200px]:max-w-[450px] max-w-[450px] cus-img absolute min-[1200px]:right-[-280px] min-[1200px]:top-[-83px] -z-[1] max-[1025px]:hidden min-[1000px]:right-[-272px] min-[1000px]:top-[-120px]"
        }
      />
    );
  }

  if (variant === "multistep") {
    return (
      <Image
        src={FormBackImg}
        alt="Academic success illustration"
        width={526}
        height={551}
        className={
          isTakeMyClass2Route
            ? "cus-img absolute w-[302px] min-[1200px]:right-[-205px] -z-[1] max-[1025px]:hidden"
            : "cus-img absolute min-[1200px]:right-[-258px] -z-[1] max-[1025px]:hidden min-[1100px]:right-[-208px] min-[1150px]:right-[-150px]"
        }
      />
    );
  }

  return (
    <Image
      src={FormBackImg}
      alt="Academic success illustration"
      width={400}
      className="cus-img absolute w-[400px] min-[1200px]:right-[-258px] -z-[1] max-[1025px]:hidden min-[1100px]:right-[-208px] min-[1150px]:right-[-150px]"
    />
  );
};

const IconInput = ({
  id,
  name,
  type,
  placeholder,
  value,
  onChange,
  required,
  maxLength,
  icon,
  wrapperClassName,
  inputClassName,
  showMobileDivider,
}: {
  id: string;
  name: keyof FormDataState;
  type: React.HTMLInputTypeAttribute;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  maxLength?: number;
  icon: React.ReactNode;
  wrapperClassName: string;
  inputClassName: string;
  showMobileDivider?: boolean;
}) => {
  return (
    <div className={wrapperClassName}>
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        className={inputClassName}
      />
      {showMobileDivider ? (
        <div className="absolute top-[15px] right-[50px] w-[2px] h-[20px] bg-gray-200 min-[768px]:hidden"></div>
      ) : null}
      {icon}
    </div>
  );
};

const IconTextarea = ({
  id,
  name,
  placeholder,
  rows,
  value,
  onChange,
  required,
  icon,
  wrapperClassName,
  textareaClassName,
  showMobileDivider,
}: {
  id: string;
  name: keyof FormDataState;
  placeholder: string;
  rows: number;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  icon: React.ReactNode;
  wrapperClassName: string;
  textareaClassName: string;
  showMobileDivider?: boolean;
}) => {
  return (
    <div className={wrapperClassName}>
      <textarea
        id={id}
        name={name}
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={onChange}
        required={required}
        className={textareaClassName}
      />
      {showMobileDivider ? (
        <div className="absolute top-[15px] right-[50px] w-[2px] h-[20px] bg-gray-200 min-[768px]:hidden"></div>
      ) : null}
      {icon}
    </div>
  );
};

const PrimaryButton = ({
  disabled,
  loading,
  label,
}: {
  disabled: boolean;
  loading: boolean;
  label: string;
}) => {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="rounded-md px-3 cursor-pointer bg-[#ff641a] text-white border border-transparent transition duration-300 text-[15px] font-medium flex items-center justify-center hover:bg-white hover:text-[#ff641a] hover:border-[#ff641a] h-[54px] w-full"
    >
      {loading ? <ClipLoader color="#fff" size={22} /> : label}
    </button>
  );
};

const StickyCtaButton = ({
  visible,
  onClick,
  label,
  className,
}: {
  visible: boolean;
  onClick: (e: React.MouseEvent) => void;
  label: string;
  className: string;
}) => {
  if (!visible) return null;
  return (
    <button type="button" onClick={onClick} className={className}>
      {label}
    </button>
  );
};

const HeroForm: FC<HeroFormProps> = ({
  textAreaRows = 4,
  formBackImg2,
  showStickyOnMobile = true,
  variant = "default",
}) => {
  const data = usePageData();
  const getQuote = data?.getQuote;
  const currentPage = usePathname();
  const normalizedPage = normalizePathname(currentPage);
  const isModalVariant = variant === "modal";
  const isTakeMyClass2Route = normalizedPage === "/take-my-class-2";
  const [switchAuthForm, setSwitchAuthForm] = useState<"signin" | "signup">(
    "signin",
  );

  const isToolsOrResearchPage =
    normalizedPage === "/tools" || normalizedPage === "/academic-research";

  const shouldShowPriceHeader = useMemo(() => {
    if (isToolsOrResearchPage) return false;
    if (isModalVariant) return true;
    return (
      PRICE_HEADER_ROUTES.has(normalizedPage) ||
      PRICE_HEADER_PREFIXES.some((p) => normalizedPage.startsWith(p))
    );
  }, [isModalVariant, isToolsOrResearchPage, normalizedPage]);

  const quoteTypeLabel = isModalVariant
    ? "Class"
    : getQuoteTypeLabelFromPath(currentPage);
  const isToolsAuthPage =
    !isModalVariant &&
    (normalizedPage === "/tools" || normalizedPage === "/tools/");
  const router = useRouter();

  // Check if we're on the multi-step form route
  const isMultiStepRoute = MULTI_STEP_ROUTES.has(normalizedPage);

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedSubject, setSelectedSubject] = useState<SubjectLabel | "">("");
  // Step 2 state (deadline) kept commented for later reuse.
  // const [selectedDeadline, setSelectedDeadline] = useState<string>("");
  const [otherSubjectDescription, setOtherSubjectDescription] =
    useState<string>("");
  // const [otherDeadlineDescription, setOtherDeadlineDescription] =
  //   useState<string>("");

  const [formData, setFormData] = useState<FormDataState>({
    Email: "",
    Phone: "",
    Description: "",
  });
  const [FBCLID, setFBCLID] = useState("");
  const [GCLID, setGCLID] = useState("");
  const [wholeUrl, setWholeUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isFormVisible, setIsFormVisible] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Step 2 options (deadline) kept commented for later reuse.
  // const deadlines = [
  //   { emoji: "🔥", label: "Urgent" },
  //   { emoji: "🗓️", label: "This Week" },
  //   { emoji: "📝", label: "Other" },
  // ];

  useEffect(() => {
    setWholeUrl(window.location?.href ?? currentPage);
  }, [currentPage]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const fbclid = searchParams.get("fbclid");
    const gclid = searchParams.get("gclid");

    if (fbclid) {
      setFBCLID(fbclid);
    }
    if (gclid) {
      setGCLID(gclid);
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!formRef.current) return;

    // Use IntersectionObserver only to avoid repeated layout reads
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFormVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px", // Account for button space at bottom
      },
    );

    observer.observe(formRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setErrorMessage("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const email = formData.Email.trim();
    const phone = formData.Phone.trim();

    if (isMultiStepRoute) {
      if (!email && !phone) {
        return {
          ok: false as const,
          message: "Please provide either an email address or a phone number.",
        };
      }
      const emailCheck = validateEmailMaybe(email);
      return emailCheck.ok
        ? ({ ok: true as const } as const)
        : ({ ok: false as const, message: emailCheck.message } as const);
    }

    const emailCheck = validateEmailMaybe(email);
    return emailCheck.ok
      ? ({ ok: true as const } as const)
      : ({ ok: false as const, message: emailCheck.message } as const);
  };

  // Multi-step form handlers
  const handleSubjectSelect = (subject: SubjectLabel) => {
    setSelectedSubject(subject);
    // if (subject !== "Other") {
    //   setOtherSubjectDescription("");
    //   setCurrentStep(3);
    // }
    setOtherSubjectDescription("");
    setCurrentStep(3);
  };

  // Step 2 handler (deadline) kept commented for later reuse.
  // const handleDeadlineSelect = (deadline: string) => {
  //   setSelectedDeadline(deadline);
  //   if (deadline !== "Other") {
  //     setOtherDeadlineDescription("");
  //     setCurrentStep(3);
  //   }
  // };

  useEffect(() => {
    if (!isMultiStepRoute) return;
    if (currentStep === 1 && selectedSubject === "Other") {
      if (otherSubjectDescription.trim()) setCurrentStep(3);
    }
  }, [currentStep, isMultiStepRoute, otherSubjectDescription, selectedSubject]);

  // Step 2 auto-advance effect kept commented for later reuse.
  // useEffect(() => {
  //   if (!isMultiStepRoute) return;
  //   if (currentStep === 2 && selectedDeadline === "Other") {
  //     if (otherDeadlineDescription.trim()) setCurrentStep(3);
  //   }
  // }, [
  //   currentStep,
  //   isMultiStepRoute,
  //   otherDeadlineDescription,
  //   selectedDeadline,
  // ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);
    const validation = validateForm();
    if (!validation.ok) {
      setErrorMessage(validation.message);
      setLoading(false);
      return;
    }

    const instructions = buildInstructions({
      isMultiStepRoute,
      selectedSubject,
      otherSubjectDescription,
      description: formData.Description,
    });

    const fd = buildQuoteFormData({
      FBCLID,
      GCLID,
      url: wholeUrl,
      email: formData.Email.trim(),
      phone: formData.Phone.trim(),
      instructions,
    });

    try {
      await axiosInstance.post(`/order/quote`, fd);
      // Clear form fields on successful submission
      setFormData({
        Email: "",
        Phone: "",
        Description: "",
      });
      if (isMultiStepRoute) {
        setSelectedSubject("");
        setOtherSubjectDescription("");
        // Step 2 resets kept commented for later reuse.
        // setSelectedDeadline("");
        // setOtherDeadlineDescription("");
        setCurrentStep(1);
      }
      setLoading(false);
      router.push("/thank-you");
    } catch {
      setErrorMessage("Failed to send request – try again later");
      setLoading(false);
      return;
    }
  };

  const scrollToForm = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isFormVisible && formRef.current) {
      const top =
        formRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // Multi-step form render
  if (isMultiStepRoute) {
    return (
      <div className="relative">
        <BackgroundIllustration
          image={formBackImg2}
          isTakeMyClass2Route={isTakeMyClass2Route}
          variant="multistep"
        />

        <div className="max-w-[600px] mx-auto cus-div">
          <div className="w-full bg-[#263238] rounded-t-lg px-2 sm:py-3 py-2">
            <p className="text-white text-center lg:text-[28px] md:text-2xl sm:text-xl text-lg font-semibold">
              Check Your{" "}
              <span className="bg-[#F56200] rounded-full px-4 -rotate-3 inline-block">
                {currentPage.includes("class") ? "Class" : "Exam"}
              </span>{" "}
              Price
            </p>
          </div>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-sm p-6 flex flex-col gap-4 -z-[999]"
            id="quote-form"
          >
            {/* Step Indicator */}
            {/* <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      currentStep >= step
                        ? "bg-[#ff641a] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`h-1 w-12 transition-all duration-300 ${
                        currentStep > step ? "bg-[#ff641a]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div> */}

            {/* Step 1: Subject Selection */}
            {currentStep === 1 && (
              <>
                {/* <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  What Subject You Need Help With?
                </h3> */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {SUBJECTS.map((subject, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSubjectSelect(subject.label)}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md border-2 transition-all duration-200 text-sm font-medium ${
                        selectedSubject === subject.label
                          ? "border-[#ff641a] bg-[#fff5f0] text-[#ff641a]"
                          : "border-[#E3E5F3] bg-[#EDEFFE] text-gray-700 hover:border-[#ff641a] hover:bg-[#fff5f0]"
                      }`}
                    >
                      <span className="text-lg">{subject.emoji}</span>
                      <span>{subject.label}</span>
                    </button>
                  ))}
                </div>

                {/* Textarea for "Other" subject */}
                {/* {selectedSubject === "Other" && (
                  <div className="mb-4">
                    <textarea
                      value={otherSubjectDescription}
                      onChange={(e) =>
                        setOtherSubjectDescription(e.target.value)
                      }
                      placeholder="What Subject You Need Help With?"
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-[#E3E5F3] rounded-md bg-[#EDEFFE] text-black outline-none resize-none text-sm placeholder:text-[#6B7280] focus:border-[#ff641a] transition-all duration-200"
                    />
                  </div>
                )} */}
              </>
            )}

            {/* Step 2: Deadline Selection (temporarily disabled for later use) */}
            {/* {currentStep === 2 && (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  When is your deadline?
                </h3>
                <div className="grid grid-cols-1 gap-3 mb-4">
                  {deadlines.map((deadline, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDeadlineSelect(deadline.label)}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md border-2 transition-all duration-200 text-sm font-medium ${
                        selectedDeadline === deadline.label
                          ? "border-[#ff641a] bg-[#fff5f0] text-[#ff641a]"
                          : "border-[#E3E5F3] bg-[#EDEFFE] text-gray-700 hover:border-[#ff641a] hover:bg-[#fff5f0]"
                      }`}
                    >
                      <span className="text-lg">{deadline.emoji}</span>
                      <span>{deadline.label}</span>
                    </button>
                  ))}
                </div>

                {selectedDeadline === "Other" && (
                  <div className="mb-4">
                    <textarea
                      value={otherDeadlineDescription}
                      onChange={(e) =>
                        setOtherDeadlineDescription(e.target.value)
                      }
                      placeholder="Please specify your deadline"
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-[#E3E5F3] rounded-md bg-[#EDEFFE] text-black outline-none resize-none text-sm placeholder:text-[#6B7280] focus:border-[#ff641a] transition-all duration-200"
                    />
                  </div>
                )}
              </>
            )} */}

            {/* Step 3: Contact Information */}
            {currentStep === 3 && (
              <>
                <h3 className="md:text-lg sm:text-base text-sm font-semibold text-gray-900 mb-4 text-center">
                  Where should we send your quote?
                </h3>

                {/* Email Field */}
                <IconInput
                  type="email"
                  id="Email"
                  name="Email"
                  placeholder="Email *"
                  value={formData.Email}
                  onChange={(e) => handleChange(e)}
                  wrapperClassName="flex items-center sm:h-18 h-[65px] border rounded-md bg-[#EDEFFE] border-[#E3E5F3] px-4"
                  inputClassName="flex-1 text-black bg-transparent outline-none text-sm placeholder:text-[#6B7280] pr-3 "
                  icon={<IoIosMail className="text-[#6B7280] text-xl" />}
                />

                {/* Phone Field */}
                <IconInput
                  type="text"
                  id="Phone"
                  name="Phone"
                  placeholder="Mobile No to Text Your Quote *"
                  value={formData.Phone}
                  onChange={(e) => handleChange(e)}
                  maxLength={30}
                  wrapperClassName="flex text-black items-center sm:h-18 h-[65px] border rounded-md bg-[#EDEFFE] border-[#E3E5F3] px-4"
                  inputClassName="flex-1 bg-transparent outline-none text-sm placeholder:text-[#6B7280] pr-3 "
                  icon={<MdPhoneInTalk className="text-[#6B7280] text-xl" />}
                />

                {errorMessage ? (
                  <p className="text-sm text-red-600 text-center">
                    {errorMessage}
                  </p>
                ) : null}

                {/* Submit Button */}
                <PrimaryButton
                  disabled={
                    loading ||
                    (!formData.Email.trim() && !formData.Phone.trim())
                  }
                  loading={loading}
                  label="Secure My 'A' or 'B' Grades"
                />

                {/* Micro-copy */}
                <p className="text-center text-xs text-gray-500 mt-2">
                  🔒 Anonymous & 100% Confidential.
                </p>
              </>
            )}
          </form>
        </div>
        {/* Sticky Button for Mobile - Only visible when form is NOT visible */}
        <StickyCtaButton
          visible={!!(showStickyOnMobile && isMobile && !isFormVisible)}
          onClick={scrollToForm}
          label={getQuote?.ctaButton?.text || "Secure My 'A' or 'B' Grades"}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[75%] h-12 rounded-md font-medium text-sm text-white uppercase tracking-wider bg-[#ff641a] hover:bg-white hover:text-[#ff641a] hover:border-[#ff641a] border border-transparent shadow-lg transition-all duration-300 z-50 cursor-pointer"
        />
      </div>
    );
  }

  // Original form render for all other routes
  return (
    <div className="relative">
      {!isModalVariant && (
        <BackgroundIllustration
          image={formBackImg2}
          isTakeMyClass2Route={isTakeMyClass2Route}
          variant="default"
        />
      )}
      {isToolsAuthPage ? (
        <>
          {switchAuthForm === "signin" ? (
            <SignInCard
              switchAuthForm={switchAuthForm}
              setSwitchAuthForm={setSwitchAuthForm}
            />
          ) : (
            <SignUpCard
              switchAuthForm={switchAuthForm}
              setSwitchAuthForm={setSwitchAuthForm}
            />
          )}
        </>
      ) : (
        <div className="w-full mx-auto cus-div">
          {shouldShowPriceHeader && (
            <div className="w-full bg-[#263238] rounded-t-lg px-2 sm:py-3 py-2">
              <p className="text-white text-center lg:text-[28px] md:text-2xl sm:text-xl text-lg font-semibold">
                Check{" "}
                {isModalVariant || currentPage.includes("exam")
                  ? "Your "
                  : currentPage.includes("class")
                    ? "Your "
                    : currentPage === "/"
                      ? "Your "
                      : ""}{" "}
                <span className="bg-[#F56200] rounded-full px-4 -rotate-3 inline-block">
                  {quoteTypeLabel}
                </span>{" "}
                Price
              </p>
            </div>
          )}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className={`bg-white rounded-lg shadow-sm p-6 flex flex-col gap-4 -z-[999] ${
              isModalVariant
                ? ""
                : "max-[768px]:bg-transparent max-[768px]:shadow-none max-[768px]:p-0"
            }`}
            id={isModalVariant ? "quote-form-modal" : "quote-form"}
          >
            {/* Email Field */}
            <IconInput
              type="email"
              id="Email"
              name="Email"
              placeholder="Email *"
              value={formData.Email}
              onChange={(e) => handleChange(e)}
              required
              wrapperClassName="flex items-center sm:h-18 h-[65px] max-[768px]:h-[50px] border rounded-md bg-[#EDEFFE] max-[768px]:bg-[#F5F6FA] border-[#E3E5F3] px-4 max-[768px]:relative"
              inputClassName="flex-1 text-black bg-transparent outline-none text-sm placeholder-[#9CA3AF] pr-3"
              showMobileDivider
              icon={
                <IoIosMail className="text-[#9ea9bf] text-xl flex-shrink-0 max-[768px]:absolute max-[768px]:right-4" />
              }
            />

            {/* Phone Field */}
            <IconInput
              type="text"
              id="Phone"
              name="Phone"
              placeholder="Phone # *"
              value={formData.Phone}
              onChange={(e) => handleChange(e)}
              maxLength={30}
              required
              wrapperClassName="flex text-black items-center sm:h-18 h-[65px] max-[768px]:h-[50px] border rounded-md bg-[#EDEFFE] max-[768px]:bg-[#F5F6FA] border-[#E3E5F3] px-4 max-[768px]:relative"
              inputClassName="flex-1 bg-transparent outline-none text-sm placeholder-[#9CA3AF] pr-3 "
              showMobileDivider
              icon={
                <MdPhoneInTalk className="text-[#9ea9bf] text-xl flex-shrink-0 max-[768px]:absolute max-[768px]:right-4" />
              }
            />

            {/* Instructions Field */}
            <IconTextarea
              id="Description"
              name="Description"
              placeholder="What do you need help with? *"
              rows={textAreaRows}
              value={formData.Description}
              onChange={(e) => handleChange(e)}
              required
              wrapperClassName="flex items-start border rounded-md bg-[#EDEFFE] border-[#E3E5F3] h-[65px] max-[768px]:bg-[#F5F6FA] px-4 pt-3 pb-2 min-[768px]:min-h-[150px] max-[768px]:relative"
              textareaClassName="flex-1 text-black outline-none resize-none text-sm pr-3 bg-[#EDEFFE] min-[768px]:min-h-[130px] max-[768px]:h-[50px]"
              showMobileDivider
              icon={
                <IoChatbubbles className="text-[#9ea9bf] text-xl mt-1 flex-shrink-0" />
              }
            />

            {errorMessage ? (
              <p className="text-sm text-red-600 text-center">{errorMessage}</p>
            ) : null}

            {/* Submit Button */}
            <PrimaryButton
              disabled={loading}
              loading={loading}
              label={getQuote?.ctaButton?.text || "Secure My 'A' or 'B' Grades"}
            />
          </form>
        </div>
      )}
      {/* Sticky Button for Mobile - Only visible when form is NOT visible */}
      <StickyCtaButton
        visible={!!(showStickyOnMobile && !isFormVisible)}
        onClick={scrollToForm}
        label={getQuote?.ctaButton?.text || "Secure My 'A' or 'B' Grades"}
        className="fixed bottom-2 left-1/2 -translate-x-1/2 px-4 h-12 sm:w-fit w-[75%] rounded-md font-medium text-sm text-white uppercase tracking-wider bg-[#ff641a] hover:bg-white hover:text-[#ff641a] hover:border-[#ff641a] border border-transparent shadow-lg transition-all duration-300 z-50 cursor-pointer"
      />
    </div>
  );
};

export default HeroForm;
