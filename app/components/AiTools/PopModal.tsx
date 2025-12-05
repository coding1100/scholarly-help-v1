import React from "react";
import { MdOutlineClose } from "react-icons/md";

interface PopModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const PopModal: React.FC<PopModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Overlay with soft blur */}
      <div
        className="inset-0 absolute bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal content with scrollable support */}
      <div className="relative z-10 w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg border max-h-[100vh] overflow-y-auto border-gray-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-8 text-gray-400 hover:text-gray-700"
        >
          <MdOutlineClose size={16} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default PopModal;
