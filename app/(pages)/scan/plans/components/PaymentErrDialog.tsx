import React, { FC } from "react";
import "react-responsive-modal/styles.css";
import Modal from "react-responsive-modal";

type PaymentErrDialogProps = {
  open: boolean;
  handleClose: () => void; 
};

const PaymentErrDialog: FC<PaymentErrDialogProps> = ({ open, handleClose }) => {
  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        center
        classNames={{
          modalContainer: "bg-[#ffffffcf] text-white",
        }}
        styles={{
          modal: {
            backgroundColor: "#FF3449",
            minWidth: "400px",
            textAlign: "center",
            padding: "50px 0",
          },
        }}
      >
        <div className="max-w-[320px] flex flex-col items-center justify-center mx-auto">
          <h2 className="text-2xl font-semibold text-center">Alert</h2>

          <p className="text-center mt-6 text-xs">
            Something went wrong while processing your payment please try again
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default PaymentErrDialog;
