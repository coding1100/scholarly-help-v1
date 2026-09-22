import { FC, useEffect, useRef } from "react";

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
  const cardRef = useRef<HTMLDivElement | null>(null);

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
          Document marked as published
        </p>
        <p className="text-sm text-gray-500 mt-2">
          A shareable public link isn&apos;t available yet — this only flags
          the document for the public read-only page we&apos;re building.
        </p>

        <div className="mt-6 flex items-center justify-end">
          <button
            type="button"
            onClick={onUnpublish || handleClose}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Unpublish
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishedDocument;
