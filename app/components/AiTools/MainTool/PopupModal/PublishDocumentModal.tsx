"use client";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlineXMark } from "react-icons/hi2";
import { HiOutlineChartBar, HiOutlineUserGroup } from "react-icons/hi";
import { HiOutlineSquare2Stack } from "react-icons/hi2";
import PublishedDocument from "./PublishedDocument";
import {
  getAcademicErrorMessage,
  toggleDocumentPublish,
} from "../academicResearchApi";

type PublishDocumentModalProps = {
  open: boolean;
  onClose: () => void;
  onPublish?: () => void;
  variant?: "modal" | "popover";
  documentId?: string | null;
};

const FeatureRow: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-indigo-600">{icon}</div>
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 leading-5">{description}</p>
      </div>
    </div>
  );
};

const PublishDocumentModal: React.FC<PublishDocumentModalProps> = ({
  open,
  onClose,
  onPublish,
  variant = "modal",
  documentId,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showPublished, setShowPublished] = useState<boolean>(false);

  // Close on outside click for popover variant
  useEffect(() => {
    if (!open || variant !== "popover") return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        containerRef.current &&
        target &&
        !containerRef.current.contains(target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [open, variant, onClose]);

  if (!open) return null;

  const handlePublishClick = async () => {
    if (!documentId) {
      toast.error("Save this document before publishing.");
      return;
    }

    try {
      await toggleDocumentPublish(documentId);
      onPublish?.();
      setShowPublished(true);
    } catch (error) {
      toast.error(
        getAcademicErrorMessage(error, "Could not publish document."),
      );
    }
  };

  const handleUnpublishClick = async () => {
    if (!documentId) {
      onClose();
      return;
    }

    try {
      await toggleDocumentPublish(documentId);
      setShowPublished(false);
      onClose();
    } catch (error) {
      toast.error(
        getAcademicErrorMessage(error, "Could not unpublish document."),
      );
    }
  };

  const Panel = (
    <div className="rounded-xl bg-white shadow-2xl ring-1 ring-black/5">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Publish document
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Publish a read-only version of this document. You can unpublish at
              any time.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <FeatureRow
            icon={<HiOutlineSquare2Stack className="h-5 w-5" />}
            title="Increase exposure"
            description="We will index your paper in Google search results and drive traffic."
          />
          <FeatureRow
            icon={<HiOutlineChartBar className="h-5 w-5" />}
            title="Track your impact"
            description="Get updates on number of pageviews your paper is receiving."
          />
          <FeatureRow
            icon={<HiOutlineUserGroup className="h-5 w-5" />}
            title="Find collaborators"
            description="Sharing a pre-print is an excellent way to attract potential collaborators."
          />
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => void handlePublishClick()}
            className="w-full rounded-md bg-[#ff641a] py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#f76f30] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Publish Document
          </button>
        </div>
      </div>
    </div>
  );

  if (variant === "popover") {
    return (
      <div ref={containerRef} className="absolute right-0 mt-2 z-[9999] w-80">
        {!showPublished && Panel}
        <PublishedDocument
          open={showPublished}
          handleClose={() => {
            setShowPublished(false);
            onClose();
          }}
          onUnpublish={() => void handleUnpublishClick()}
        />
      </div>
    );
  }

  return (
    <div
      aria-modal
      role="dialog"
      className="fixed inset-0 z-[9999] flex items-center justify-center"
    >
      {!showPublished && (
        <>
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden
          />

          <div className="relative w-full max-w-sm px-4">{Panel}</div>
        </>
      )}

      {/* Published confirmation modal */}
      <PublishedDocument
        open={showPublished}
        handleClose={() => {
          setShowPublished(false);
          onClose();
        }}
        onUnpublish={() => void handleUnpublishClick()}
      />
    </div>
  );
};

export default PublishDocumentModal;
