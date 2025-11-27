import BotImg from "@/app/assets/Images/botImg.png";
import UserImg from "@/app/assets/Images/userImg.png";
import axiosInstance from "@/app/axios";
import EmailPopup from "@/app/components/PopUpModal/EmailPopup";
import Image from "next/image";
import { FC, FormEvent, useEffect, useRef, useState } from "react";
import { GoPaperclip } from "react-icons/go";
import { HiArrowRight } from "react-icons/hi2";
import MarkDown from "../../../../../components/MarkDown/MarkDown";

type Response = {
  _id: string | null;
  senderId: string | null;
  query: string | null;
  content: string | null;
  imageUrl: string | null;
  createdAt: string;
  isLoading?: boolean;
};

interface InboxProps {}

const Inbox: FC<InboxProps> = ({}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [text, setText] = useState<string>("");
  const [imgError, setImageError] = useState<string>("");
  const [textError, setTextError] = useState<string>("");
  const [localUserId, setLocalUserId] = useState<string | null>(null);
  const [resData, setResData] = useState<Response[]>([]);
  const [emailDialogues, setEmailDialogues] = useState<boolean>(false);
  const [showEmailPopup, setShowEmailPopup] = useState<boolean>(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const generateUUID = (): string => {
    return window.crypto.randomUUID();
  };

  useEffect(() => {
    if (emailDialogues) {
      const timer = setTimeout(() => setShowEmailPopup(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowEmailPopup(false);
    }
  }, [emailDialogues]);

  useEffect(() => {
    if (chatContainerRef.current) {
      setTimeout(() => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100); // Small delay for rendering
    }
  }, [resData]);

  useEffect(() => {
    let userId = localStorage.getItem("localUserId");

    if (!userId) {
      userId = generateUUID();
      localStorage.setItem("localUserId", userId);
    }

    setLocalUserId(userId);
  }, []);

  useEffect(() => {
    const forEmail = async () => {
      if (!localUserId) return;
      try {
        const response = await axiosInstance.get(
          `/scan-to-solve/email-popup-status/local/${localUserId}`
        );

        setEmailDialogues(response.data.showEmailPopup);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    forEmail();
  }, [localUserId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!localUserId) return;
      try {
        const response = await axiosInstance.get(
          `/scan-to-solve/exercise-history/local/${localUserId}`
        );
        setResData(response.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [localUserId]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const uploadedFile = files[0];
      setFileName(uploadedFile.name);
      setImageError("");
      setUploadedImage(uploadedFile);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!text && !uploadedImage) {
      setTextError("Please add a description or an image");
      return;
    } else {
      setTextError("");
      setImageError("");
    }

    const userMessage: Response = {
      _id: null,
      senderId: localUserId,
      query: text,
      content: null,
      imageUrl: uploadedImage ? URL.createObjectURL(uploadedImage) : null,
      createdAt: new Date().toISOString(),
      isLoading: false, // User messages are not "loading"
    };

    const botPlaceholder: Response = {
      _id: null,
      senderId: null,
      query: null,
      content: null,
      imageUrl: null,
      createdAt: new Date().toISOString(),
      isLoading: true, // Bot response is loading
    };

    // Optimistically add the user's message and bot placeholder to the chat
    setResData((prevData) => [...prevData, userMessage, botPlaceholder]);

    const fd = new FormData();
    fd.append("localUserId", localUserId!);
    if (uploadedImage) {
      fd.append("image", uploadedImage);
    }
    if (text) {
      fd.append("query", text);
    }
    setUploadedImage(null);
    setText("");
    setFileName("");

    try {
      const res = await axiosInstance.post(
        `/scan-to-solve/predict-image/local`,
        fd
      );
      setEmailDialogues(res.data.showEmailPopup);

      // Update the placeholder bot response with actual content
      setResData((prevData) =>
        prevData.map((message) =>
          message.isLoading
            ? {
                ...message,
                content: res.data.responseMessage, // Replace with actual response content
                isLoading: false,
              }
            : message
        )
      );
    } catch (error) {
      console.error("Message failed:", error);
      // Handle error if needed (e.g., show error message)
    } finally {
      // Fetch updated resData after the bot's response
      const response = await axiosInstance.get(
        `/scan-to-solve/exercise-history/local/${localUserId}/`
      );
      setResData(
        response.data.map((msg: Response) => ({ ...msg, isLoading: false }))
      ); // Ensure isLoading is false for all
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  return (
    <>
      <div className="h-[80vh] flex flex-col justify-between">
        <div
          className="h-[77vh] overflow-auto scrollbar-hide"
          ref={chatContainerRef}
        >
          {resData.map((data, index) => (
            <div key={index} className="space-y-3">
              {data.senderId ? (
                //User Messages
                <div className="flex justify-end gap-4">
                  <div>
                    <p className="text-[#9F9F9F] text-xs mb-2 text-end">
                      {formatTime(data.createdAt)}
                    </p>
                    <div className="bg-[#F8F8F8] p-4 rounded-lg text-[#444746] text-[13px] w-fit">
                      {data.imageUrl && (
                        <img
                          src={data.imageUrl || "/default-placeholder.png"}
                          alt="Uploaded Preview"
                          className="w-[200px] h-auto rounded mb-3"
                        />
                      )}
                      {data.query && <p>{data.query}</p>}
                    </div>
                  </div>
                  <div className="pt-8">
                    <Image src={UserImg} alt="" className="w-10" />
                  </div>
                </div>
              ) : (
                //Bot Messages
                <div className="flex gap-4 w-[80%]">
                  <div className="pt-8">
                    <Image src={BotImg} alt="" className="min-w-10" />
                  </div>

                  <div className={`${emailDialogues && "blur-sm"}`}>
                    <p className="text-[#9F9F9F] text-xs mb-2">
                      {formatTime(data.createdAt)}
                    </p>
                    {data.isLoading ? (
                      <div className="space-y-3 animate-pulse w-[200px]">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="h-2 bg-slate-700 rounded col-span-2"></div>
                          <div className="h-2 bg-slate-700 rounded col-span-1"></div>
                        </div>
                        <div className="h-2 bg-slate-700 rounded"></div>
                      </div>
                    ) : (
                      <div className="bg-[#F8F8F8] p-4 rounded-lg text-[#444746] text-[13px] w-fit">
                        <MarkDown content={data.content} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="w-[86%] mx-auto">
          <div>
            {fileName && (
              <p className="text-sm text-gray-600">
                Selected File: <span className="font-medium">{fileName}</span>
              </p>
            )}
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex gap-4 items-center p-[6px] rounded-full border border-primary-400"
          >
            <div
              onClick={triggerFileInput}
              className="flex justify-center items-center bg-primary-400 sm:w-12 w-7 sm:h-12 h-7 sm:min-w-12 min-w-7 sm:min-h-12 min-h-7 rounded-full cursor-pointer"
            >
              <GoPaperclip className="text-white sm:text-2xl text-lg mr-1" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <input
              placeholder="Type your prompt here"
              className="sm:text-lg bg-transparent grow chatInput focus:outline-none"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setTextError("");
              }}
            />
            <button
              type="submit"
              className="flex justify-center items-center bg-primary-400 sm:w-12 w-7 sm:h-12 h-7 sm:min-w-12 min-w-7 sm:min-h-12 min-h-7 rounded-full"
            >
              <HiArrowRight className="text-white sm:text-2xl text-lg" />
            </button>
          </form>
          {imgError && <p className="text-sm text-red-600">{imgError}</p>}
          {textError && <p className="text-sm text-red-600">{textError}</p>}
        </div>
      </div>
      {showEmailPopup && (
        <EmailPopup
          open={showEmailPopup}
          handleClose={() => setEmailDialogues(false)}
        />
      )}
    </>
  );
};

export default Inbox;
