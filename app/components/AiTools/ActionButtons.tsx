import React from "react";

interface ActionButtonsProps {
  onClear: () => void;
  onSubmit: () => void;
  submitButtonText?: string;
  isSubmitting?: boolean;
  isDisabled?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onClear,
  onSubmit,
  submitButtonText = "Button",
  isSubmitting = false,
  isDisabled,
}) => {
  return (
    <div className="flex text-sm justify-between space-x-4 px-2 md:px-8 py-3">
      {" "}
      <button
        onClick={onClear}
        disabled={isSubmitting || isDisabled}
        className={` p-3  text-gray-700 border border-gray-300 rounded-md  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
          isSubmitting || isDisabled
            ? "bg-white cursor-not-allowed"
            : "bg-white hover:bg-gray-50"
        }`}
      >
        Clear Inputs
      </button>
      <button
        onClick={onSubmit}
        disabled={isSubmitting || isDisabled}
        className={`p-3 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
          isSubmitting || isDisabled
            ? "bg-indigo-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-500"
        }`}
      >
        {isSubmitting ? `${submitButtonText}...` : submitButtonText}
      </button>
    </div>
  );
};

export default ActionButtons;
