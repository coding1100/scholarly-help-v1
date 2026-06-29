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
        showCloseIcon
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
