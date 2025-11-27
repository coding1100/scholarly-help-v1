import React, { FC } from "react";
import "react-responsive-modal/styles.css";
import Modal from "react-responsive-modal";

type PaymentSuccessDialogProps = {
  open: boolean;
  handleClose: () => void;
};

const PaymentSuccessDialog: FC<PaymentSuccessDialogProps> = ({
  open,
  handleClose,
}) => {
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
          <h2 className="text-2xl font-semibold text-center">Success</h2>

          <p className="text-center mt-6 text-xs">Thank you for your payment</p>
        </div>
      </Modal>
    </div>
  );
};

export default PaymentSuccessDialog;
