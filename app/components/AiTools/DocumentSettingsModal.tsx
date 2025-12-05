"use client";
import React, { FC, useState } from "react";
import Switch from "react-switch";
import { Toaster, toast } from "react-hot-toast"; // Toaster added for demonstration, can be global
import { MdOutlineClose } from "react-icons/md";
import { IoMdInformationCircle, IoMdCheckmarkCircle } from "react-icons/io";
import { FaRegFileLines } from "react-icons/fa6";
import { GiStarsStack } from "react-icons/gi";

// The component is now just for content, it doesn't handle modal state
interface SettingModalContentProps {
  onBack: () => void; // A function to go back to the previous view
}

const DocumentSettingsModalContent: React.FC<SettingModalContentProps> = ({
  onBack,
}) => {
  const [autoComplete, setAutoComplete] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [autoCiteNew, setAutoCiteNew] = useState(true);
  const [autoCiteLibrary, setAutoCiteLibrary] = useState(true);
  const [citationFilter, setCitationFilter] = useState(false);

  const handleAutoCompleteChange = (checked: boolean) => {
    setAutoComplete(checked);
    if (checked) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } w-[400px] h-auto bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-sm text-gray-700`}
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-2 items-center">
                <IoMdCheckmarkCircle className="text-green-400" />
                <p className="font-medium">Autocomplete enabled</p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MdOutlineClose size={16} />
              </button>
            </div>
            <p className="text-gray-500 text-xs pl-4 mt-2">
              Jennni will give you suggestions as you write.
            </p>
          </div>
        ),
        {
          duration: 4000,
          position: "top-center",
        }
      );
    } else {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-sm text-gray-700`}
            style={{ width: "20rem" }}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <IoMdInformationCircle />
                  <p className="font-medium">Autocomplete disabled</p>
                </div>
                <p className="text-gray-500 text-xs mt-1 px-6">
                  Autocomplete suggestions paused. Use <br />
                  <kbd className="font-medium">CTRL + /</kbd> to call a manual
                  suggestion.
                </p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-gray-400 hover:text-gray-600 ml-4"
              >
                <MdOutlineClose size={16} />
              </button>
            </div>
          </div>
        ),
        {
          duration: 4000,
          position: "top-center",
        }
      );
    }
  };

  const handleAutoCiteNewChange = (checked: boolean) => {
    setAutoCiteNew(checked);
    if (checked) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } w-[400px] h-auto bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-sm text-gray-700`}
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-2 items-center">
                <IoMdCheckmarkCircle className="text-green-400" />
                <p className="font-medium">Auto-cite from external enabled</p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MdOutlineClose size={16} />
              </button>
            </div>
            <p className="text-gray-500 text-xs pl-4 mt-2">
              Citations from external databases will be <br /> considered when
              generating
            </p>
          </div>
        ),
        {
          duration: 4000,
          position: "top-center",
        }
      );
    } else {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-sm text-gray-700`}
            style={{ width: "22rem" }}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <IoMdInformationCircle />
                  <p className="font-medium">
                    Auto-cite from external disabled
                  </p>
                </div>
                <p className="text-gray-500 text-xs mt-1 px-6">
                  Citations from external databases will not be <br />{" "}
                  considered when generating.
                </p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-gray-400 hover:text-gray-600 ml-4"
              >
                <MdOutlineClose size={16} />
              </button>
            </div>
          </div>
        ),
        {
          duration: 4000,
          position: "top-center",
        }
      );
    }
  };

  const handleAutoCiteLibraryChange = (checked: boolean) => {
    setAutoCiteLibrary(checked);
    if (checked) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } w-[350px] h-auto bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-sm text-gray-700`}
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-2 items-center">
                <IoMdCheckmarkCircle className="text-green-400" />
                <p className="font-medium">Auto-cite from library enabled</p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MdOutlineClose size={16} />
              </button>
            </div>
            <p className="text-gray-500 text-xs pl-4 mt-2">
              Library sources will be considered for citations.
            </p>
          </div>
        ),
        {
          duration: 4000,
          position: "top-center",
        }
      );
    } else {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-sm text-gray-700`}
            style={{ width: "20rem" }}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <IoMdInformationCircle />
                  <p className="font-medium">Auto-cite from library disabled</p>
                </div>
                <p className="text-gray-500 text-xs mt-1 px-6">
                  Library sources will not be considered for citations.
                </p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-gray-400 hover:text-gray-600 ml-4"
              >
                <MdOutlineClose size={16} />
              </button>
            </div>
          </div>
        ),
        {
          duration: 4000,
          position: "top-center",
        }
      );
    }
  };

  return (
    // We are now only rendering the content, not the modal wrapper itself
    <>
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Document settings
      </h2>
      <div className="flex items-start gap-2 pb-2.5">
        <GiStarsStack className="text-black" />
        <h3 className="text-xs font-medium text-[#09090b]">Auto Complete</h3>
      </div>
      <div className="flex gap-4 mb-6">
        <div className="flex flex-col items-center">
          <div className="h-[20px]" />
          <div className="w-[2px] h-full bg-gray-200 rounded" />
        </div>
        <div className="flex-1 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Auto-complete</p>
              <p className="text-xs font-normal text-gray-500">
                Turn on to enable auto-complete
              </p>
            </div>
            <Switch
              onChange={handleAutoCompleteChange}
              checked={autoComplete}
              onColor="#6366f1"
              uncheckedIcon={false}
              checkedIcon={false}
              height={20}
              width={40}
            />
          </div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Show Auto-complete Buttons
              </p>
              <p className="text-xs text-gray-500">
                Turn on to show accept/cycle buttons
              </p>
            </div>
            <Switch
              onChange={setShowButtons}
              checked={showButtons}
              onColor="#6366f1"
              uncheckedIcon={false}
              checkedIcon={false}
              height={20}
              width={40}
            />
          </div>
        </div>
      </div>
      <div className="flex items-start gap-2 pb-3">
        <GiStarsStack className="text-black" />
        <h3 className="text-xs font-medium text-[#09090b]">Citations</h3>
      </div>
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="h-[32px]" />
          <div className="w-[2px] h-full bg-gray-200 rounded" />
        </div>
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between w-full mb-4">
            <p className="text-sm font-medium text-gray-900">Citation Style</p>
            <select className="w-4 md:w-80 border border-gray-300 rounded-md p-2 text-sm text-gray-800">
              <option value="apa">
                APA · American Psychological Association
              </option>
              <option value="mla">MLA · Modern Language Association</option>
              <option value="chicago">Chicago · Chicago Manual of Style</option>
            </select>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Auto Cite from New Sources
              </p>
              <p className="text-xs text-gray-500">
                External sources will be considered
              </p>
            </div>
            <Switch
              onChange={handleAutoCiteNewChange}
              checked={autoCiteNew}
              onColor="#6366f1"
              uncheckedIcon={false}
              checkedIcon={false}
              height={20}
              width={40}
            />
          </div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Auto-cite from Library
              </p>
              <p className="text-xs text-gray-500">
                Library sources will be considered
              </p>
            </div>
            <Switch
              onChange={handleAutoCiteLibraryChange}
              checked={autoCiteLibrary}
              onColor="#6366f1"
              uncheckedIcon={false}
              checkedIcon={false}
              height={20}
              width={40}
            />
          </div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Citation Recency Filter
              </p>
              <p className="text-xs text-gray-500">
                Only consider citations from specified year onwards
              </p>
            </div>
            <Switch
              onChange={setCitationFilter}
              checked={citationFilter}
              onColor="#6366f1"
              uncheckedIcon={false}
              checkedIcon={false}
              height={20}
              width={40}
            />
          </div>
        </div>
      </div>
      {/* Back button to go to prompt view */}
      {/* <button
        onClick={onBack}
        className="py-2 px-4 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 font-medium mt-6"
      >
        Go Back
      </button>
      <Toaster position="top-center" toastOptions={{ className: "hidden" }} /> */}
    </>
  );
};

export default DocumentSettingsModalContent;
