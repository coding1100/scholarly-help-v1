"use client";

import AboutUsImg from "@/app/assets/Images/aboutusImg.webp";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

interface TermsConditonsProps {}
const TermsConditons: FC<TermsConditonsProps> = ({}) => {
  return (
    <div>
      <div className="bg-primary-300 py-16">
        <div className="flex justify-center">
          <Image src={AboutUsImg} alt="image" className="max-w-80" />
        </div>
        <div className="my-4 ">
          <h1 className="text-center md:text-5xl text-2xl font-bold text-primary-500">
            Terms And Conditions
          </h1>
        </div>
      </div>
      <div className="sm:px-20 px-10 pt-16 pb-20">
        <p className="leading-7 pt-4 font-semibold">
          Terms and Conditions of Scholarly Help
        </p>
        <p className="leading-7 pt-4">
          By accessing and using Scholarly Help, you agree to abide by the terms
          and conditions outlined on this website. These terms and conditions
          apply to all users of Scholarly Help. Your access to and use of the
          website is contingent upon your acceptance of these terms. If you
          disagree with these terms and conditions, you must refrain from using
          this website.
        </p>
        <p className="leading-7 pt-4">
          To access this website, you must agree to both these terms and
          conditions and the{" "}
          <Link className="underline text-primary-400" href="/privacy">
            privacy policy
          </Link>
          . If you do not agree to these terms and conditions, you won&apos;t be
          able to access or utilize this website&apos;s services.
        </p>
        <p className="leading-7 pt-4">
          In these terms and conditions and the privacy policy, specific
          terminology such as &apos;User,&apos; &apos;Client,&apos;
          &apos;You,&apos; and &apos;Your&apos; refers to visitors, users, and
          those accessing the website. On the other hand, terms like
          &apos;We,&apos; &apos;Us,&apos; and &apos;Our&apos; are used to denote
          Scholarly Help or the website itself.
        </p>
        <p className="leading-7 pt-4 font-semibold text-primary-500">
          Services Provided
        </p>
        <p className="leading-7">
          Under these terms and conditions, Scholarly Help provides various
          academic writing services detailed on the website.
          <br /> Our services encompass aiding students with research papers,
          dissertations, midterm and final-term papers, online classes,
          homework, and assignments. Our teams of experts utilize authentic
          research papers and sources to gather data, ensuring originality. All
          provided papers are genuine and suitable for official submission,
          either reviewed or unreviewed for personal satisfaction. Additionally,
          we offer unlimited revisions, editing, proofreading, formatting, and
          paraphrasing upon request. Please note that each service is priced
          differently based on subject, requirements, length, and delivery time.
          Prices may also vary depending on the urgency of the deadline.
          <br /> These services are available to users who place orders through
          WhatsApp, LiveChat, or the Calculator on the website. Services are
          provided in accordance with these terms and conditions and the privacy
          policy, which may be subject to modification or enhancement over time.
        </p>

        <p className="leading-7 pt-4 font-semibold text-primary-500">
          Payment Details
        </p>
        <p className="leading-7">
          Payments are processed through debit or credit cards. Declining or not
          making payments will result in forfeiture of services. Payments are
          exclusive of taxes or hidden charges, and users are responsible for
          the calculated amount based on selected services or agreed terms.
          Declining payment during an ongoing order process constitutes a
          service violation and may lead to automatic order dismissal.
          <br />
          The website reserves the right to change prices at any time, with
          updates posted on the website for immediate user awareness.
        </p>

        <p className="leading-7 pt-4 font-semibold text-primary-500">
          Verification Process
        </p>
        <p className="leading-7">
          To verify users, Scholarly Help requires certain information like
          email addresses and optional phone numbers. This information is
          forwarded to authorized sources to facilitate the verification
          process. By accepting these terms and conditions, users authorize
          order placement and inquiries related to orders using this
          information.
          <br />
          Your consent is vital for processing personal information, necessary
          for communication and accounting purposes.
        </p>

        <p className="leading-7 pt-4 font-semibold text-primary-500">
          Discount Policy
        </p>
        <p className="leading-7">
          Scholarly Help may offer discount programs to clients to enhance
          customer satisfaction.
        </p>

        <p className="leading-7 pt-4 font-semibold text-primary-500">
          Refund Policy
        </p>
        <p className="leading-7">
          Refunds are offered based on specific terms and conditions. Claims for
          refunds initiate a refund period, beginning when the client makes the
          claim and concluding upon refund.
          <br />
          Refund requests must meet specific conditions, such as not achieving
          desired grades or academic loss. Requests are evaluated on a
          case-by-case basis, often requiring evidence such as plagiarism
          reports or grade records.
        </p>

        <p className="leading-7 pt-4 font-semibold text-primary-500">
          Revisions
        </p>
        <p className="leading-7">
          Scholarly Help offers unlimited revisions, with certain conditions.
          Revisions are made within specific timeframes and in adherence to
          original instructions.
          <br />
          Revision requests must be based on original instructions provided
          during order placement. Additional content requests may incur extra
          charges.
        </p>

        <p className="leading-7 pt-4 font-semibold text-primary-500">
          Limitations of Liability
        </p>
        <p className="leading-7">
          Scholarly Help&apos;s responsibility is to deliver work within
          deadlines and assist in achieving committed grades. We are not liable
          for any error or miscommunication from the user’s side.
        </p>

        <p className="leading-7 pt-4 font-semibold text-primary-500">
          Disclaimer
        </p>
        <p className="leading-7">
          The website does not make false warranties and denies representation
          of precision or accuracy. Users accessing the website from different
          jurisdictions are responsible for compliance with applicable laws.
        </p>

        <p className="leading-7 pt-4 font-semibold text-primary-500">
          Copyrights
        </p>
        <p className="leading-7">
          Final drafts become the user&apos;s property upon delivery. The
          delivered paper is for personal use and may be submitted for
          assignments or used as an exam guide.
          <br />
          Copying, sharing, or distributing the paper to third parties without
          user consent is prohibited.
        </p>

        <p className="leading-7 pt-4 font-semibold text-primary-500">
          Testimonials
        </p>
        <p className="leading-7">
          Testimonials may be posted on the website without personal
          information, granting consent to post customer experiences and
          reviews. Feedback may be used, published, or removed from the website
          as needed.
          <br />
          Users must not submit false information, materials infringing on
          intellectual property or privacy rights, explicit content, or content
          violating principles.
        </p>

        <p className="leading-7 pt-4 font-semibold text-primary-500">
          Notification Alerts
        </p>
        <p className="leading-7">
          The website reserves the right to modify terms and conditions, with
          user acceptance required to access the website. Users are encouraged
          to review changes before agreeing.
        </p>
      </div>
    </div>
  );
};

export default TermsConditons;
