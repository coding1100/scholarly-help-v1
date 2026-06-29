"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import Modal from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import HeroForm from "@/app/components/LandingPage/HeroForm";

type ExpertQuoteModalContextValue = {
  openExpertQuoteModal: () => void;
  closeExpertQuoteModal: () => void;
};

const ExpertQuoteModalContext =
  createContext<ExpertQuoteModalContextValue | null>(null);

export function ExpertQuoteModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <ExpertQuoteModalContext.Provider
      value={{
        openExpertQuoteModal: () => setOpen(true),
        closeExpertQuoteModal: () => setOpen(false),
      }}
    >
      {children}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        showCloseIcon={false}
        closeOnOverlayClick
        closeOnEsc
        center
        classNames={{ modalContainer: "bg-[#ffffffcf]" }}
        styles={{
          modal: {
            backgroundColor: "#fff",
            padding: 0,
            margin: "16px",
            maxWidth: "600px",
            width: "100%",
          },
        }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#ECECFC] px-10 pt-6 pb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-[#1A1A1A] leading-snug pr-2">
            Tell us what you need, we&apos;ll find your expert
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="shrink-0 border-0 bg-transparent p-0 cursor-pointer text-[#6B7280] hover:text-[#1A1A1A]"
          >
            <svg width={28} height={28} viewBox="0 0 36 36" aria-hidden="true">
              <path
                d="M28.5 9.62L26.38 7.5 18 15.88 9.62 7.5 7.5 9.62 15.88 18 7.5 26.38 9.62 28.5 18 20.12 26.38 28.5 28.5 26.38 20.12 18 28.5 9.62Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <HeroForm variant="modal" showStickyOnMobile={false} />
        </div>
      </Modal>
    </ExpertQuoteModalContext.Provider>
  );
}

export function useExpertQuoteModal() {
  const context = useContext(ExpertQuoteModalContext);
  if (!context) {
    throw new Error(
      "useExpertQuoteModal must be used within ExpertQuoteModalProvider",
    );
  }
  return context;
}
