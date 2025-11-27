import { FC } from "react";
import Modal from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import ContactForm from "../Form/ContactForm";

type PopUpModalProps = {
  open: boolean;
  handleClose: () => void;
};

const PopUpModal: FC<PopUpModalProps> = ({ open, handleClose }) => {
  return (
    <Modal
      showCloseIcon={true}
      open={open}
      onClose={handleClose}
      closeOnOverlayClick={true}
      closeOnEsc={true}
      center
      classNames={{ modalContainer: "bg-[#ffffffcf]" }}
      styles={{
        modal: {
          backgroundColor: "#fff",
          //   minWidth: "400px",
          //   paddingRight:"50px",
          //   paddingLeft:"50px"
        },
      }}
    >
      <div className="sm:min-w-[400px] min-w-[280px] sm:px-12 px-4">
        <ContactForm />
      </div>
    </Modal>
  );
};

export default PopUpModal;
