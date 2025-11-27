import { FC } from "react";
import DetailsAndMsgForm from "../FreeQuoteForm/DetailsAndMsgFrom";

interface ContactSectionProps {}

const ContactSection: FC<ContactSectionProps> = ({}) => {
  return (
    <div className="bg-primary-300">
      <div className="container mx-auto">
        <DetailsAndMsgForm />
      </div>
    </div>
  );
};

export default ContactSection;
