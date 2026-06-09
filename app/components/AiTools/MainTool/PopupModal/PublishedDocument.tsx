import { FC, useEffect, useRef, useState } from "react";

type PopUpModalProps = {
  open: boolean;
  handleClose: () => void;
  onUnpublish?: () => void;
};

const PublishedDocument: FC<PopUpModalProps> = ({
  open,
  handleClose,
  onUnpublish,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window?.location?.href || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // no-op
    }
  };

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (!cardRef.current) return;
      if (e.target instanceof Node && !cardRef.current.contains(e.target)) {
        handleClose();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, handleClose]);

  if (!open) return null;

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="false"
      className="fixed top-14 right-20 z-[100001] bg-white rounded-xl shadow-xl sm:min-w-[360px] w-[80px]"
    >
      <div className="px-5 py-4">
        <p className="text-[15px] font-semibold text-gray-900">
          Document Published
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Document is published in read-only format. Copy the link and share
          with collaborators.
        </p>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onUnpublish || handleClose}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Unpublish
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-md bg-[#155dfc] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3473fc]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M13.06 7.94a3 3 0 0 1 4.24 4.24l-3 3a3 3 0 0 1-4.24 0 .75.75 0 0 1 1.06-1.06 1.5 1.5 0 0 0 2.12 0l3-3a1.5 1.5 0 1 0-2.12-2.12.75.75 0 0 1-1.06-1.06Z" />
              <path d="M10.94 16.06a3 3 0 0 1-4.24-4.24l3-3a3 3 0 0 1 4.24 0 .75.75 0 0 1-1.06 1.06 1.5 1.5 0 0 0-2.12 0l-3 3a1.5 1.5 0 1 0 2.12 2.12.75.75 0 0 1 1.06 1.06Z" />
            </svg>
            {copied ? "Copied" : "Copy Link"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishedDocument;
