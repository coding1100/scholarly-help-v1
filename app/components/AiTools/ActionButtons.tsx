import React from "react";

interface ActionButtonsProps {
  onClear: () => void;
  onSubmit: () => void;
  submitButtonText?: string;
  secondaryButtonText?: string;
  onSecondarySubmit?: () => void;
  isSubmitting?: boolean;
  isDisabled?: boolean;
  isSecondaryDisabled?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onClear,
  onSubmit,
  submitButtonText = "Button",
  secondaryButtonText,
  onSecondarySubmit,
  isSubmitting = false,
  isDisabled,
  isSecondaryDisabled,
}) => {
  const showSecondary = Boolean(secondaryButtonText && onSecondarySubmit);
  return (
    <div className="flex text-sm justify-between space-x-4 px-2 md:px-8 py-3 bg-white dark:bg-gray-900 transition-colors duration-300">
      {" "}
      <button
        onClick={onClear}
        disabled={isSubmitting || isDisabled}
        className={`p-3 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] focus:ring-opacity-50 transition-colors duration-300 ${
          isSubmitting || isDisabled
            ? "bg-white dark:bg-gray-800 cursor-not-allowed"
            : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
      >
        Clear Inputs
      </button>
      <div className="flex items-center gap-3">
        {showSecondary && (
          <button
            onClick={onSecondarySubmit}
            disabled={isSubmitting || isSecondaryDisabled}
            className={`p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] focus:ring-opacity-50 transition-colors duration-300 ${
              isSubmitting || isSecondaryDisabled
                ? "bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {secondaryButtonText}
          </button>
        )}
        <button
          onClick={onSubmit}
          disabled={isSubmitting || isDisabled}
          className={`p-3 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] focus:ring-opacity-50 transition-colors duration-300 ${
            isSubmitting || isDisabled
              ? "bg-primary-400 cursor-not-allowed"
              : "bg-primary-400 hover:bg-primary-300"
          }`}
        >
          {isSubmitting ? `${submitButtonText}...` : submitButtonText}
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;
