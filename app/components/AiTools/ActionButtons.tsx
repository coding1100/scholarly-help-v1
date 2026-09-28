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
  /** Explicitly disable Clear (it is otherwise only disabled mid-submit). */
  isClearDisabled?: boolean;
  /** Extra classes for the outer bar (e.g. a tinted background on landing pages). */
  containerClassName?: string;
  /** Overrides the primary button's color classes (enabled state). */
  submitColorClassName?: string;
  /** Overrides the Clear button's label (default "Clear Inputs"). */
  clearButtonText?: string;
  /**
   * Optional caption (e.g. a disclaimer) rendered in the left slot instead of
   * a standalone Clear button — Clear moves into the right-hand button group
   * next to Submit instead. Omit for the default layout.
   */
  leftContent?: React.ReactNode;
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
  isClearDisabled,
  containerClassName = "",
  submitColorClassName = "bg-primary-400 hover:bg-primary-300 active:bg-primary-500",
  clearButtonText = "Clear Inputs",
  leftContent,
}) => {
  const showSecondary = Boolean(secondaryButtonText && onSecondarySubmit);
  // Clear is deliberately NOT coupled to `isDisabled`: that historical
  // coupling locked BOTH buttons on over-limit input, leaving users unable to
  // clear the very text that caused the lock.
  const clearDisabled = isSubmitting || isClearDisabled === true;
  const clearButton = (
    <button
      onClick={onClear}
      disabled={clearDisabled}
      className={`p-3 whitespace-nowrap font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] focus:ring-opacity-50 transition-colors duration-300 ${
        clearDisabled
          ? "bg-white dark:bg-gray-800 cursor-not-allowed"
          : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
      }`}
    >
      {clearButtonText}
    </button>
  );
  return (
    // Mobile: the primary button stretches to fill the row as a prominent CTA
    // with Clear compact beside it; md+ keeps the original corner-aligned look.
    <div
      className={`flex text-sm gap-3 px-4 md:px-8 py-3 bg-white dark:bg-gray-900 transition-colors duration-300 ${
        leftContent
          ? "flex-col items-stretch md:flex-row md:items-center md:justify-between md:gap-4"
          : "items-center justify-between md:gap-4"
      } ${containerClassName}`}
    >
      {leftContent ? (
        <div className="min-w-0 flex-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
          {leftContent}
        </div>
      ) : (
        clearButton
      )}
      <div className="flex flex-1 md:flex-initial items-center gap-3">
        {leftContent && clearButton}
        {showSecondary && (
          <button
            onClick={onSecondarySubmit}
            disabled={isSubmitting || isSecondaryDisabled}
            className={`flex-1 md:flex-initial p-3 whitespace-nowrap font-medium border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] focus:ring-opacity-50 transition-colors duration-300 ${
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
          className={`flex-1 md:flex-initial p-3 whitespace-nowrap font-semibold text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2b7fff] focus:ring-opacity-50 transition-colors duration-300 ${
            isSubmitting || isDisabled
              ? `${submitColorClassName} cursor-not-allowed opacity-80 pointer-events-none`
              : submitColorClassName
          }`}
        >
          {isSubmitting ? `${submitButtonText}...` : submitButtonText}
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;
