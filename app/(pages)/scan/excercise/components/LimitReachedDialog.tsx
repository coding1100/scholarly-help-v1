import React, { FC, useState } from "react";
import "react-responsive-modal/styles.css";
import Modal from "react-responsive-modal";
import Link from "next/link";
import useAuth from "../../hooks/useAuth";

type DialogProps = {
  open: boolean;
  handleClose: () => void;
  handleOpen: () => void;
};

const Dialog: FC<DialogProps> = ({ open, handleClose, handleOpen }) => {
  // @ts-ignore
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <Modal
        showCloseIcon={false}
        open={open}
        onClose={handleClose}
        onOverlayClick={handleOpen}
        closeOnOverlayClick={false}
        closeOnEsc={false}
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
          <h2 className="text-2xl font-semibold text-center">
            You Have Reached <br /> Your Free Limit
          </h2>
          {!isAuthenticated && (
            <p className="text-center mt-6 text-xs">
              You have used up your free credit. Register now and choose your
              plan to continue.
            </p>
          )}

          {isAuthenticated ? (
            <Link href="/scan/plans">
              <button className="bg-white text-[#FF3449] min-w-[200px] rounded font-semibold text-sm p-2 mt-6">
                Go to plans
              </button>
            </Link>
          ) : (
            <>
              <Link href="/scan/register">
                <button className="bg-white text-[#FF3449] min-w-[200px] rounded font-semibold text-sm p-2 mt-6">
                  Register
                </button>
              </Link>
              <div className="text-xs font-normal mt-6">
                Already a User?{" "}
                <Link href="/scan/login" className="font-bold">
                  Login in
                </Link>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Dialog;
