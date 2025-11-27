"use client";

import AboutUsImg from "@/app/assets/Images/aboutusImg.webp";
import Image from "next/image";
import { FC } from "react";

interface PrivacyProps {}
const Privacy: FC<PrivacyProps> = ({}) => {
  return (
    <div>
      <div className="bg-primary-300 py-16">
        <div className="flex justify-center">
          <Image src={AboutUsImg} alt="image" className="max-w-80" />
        </div>
        <div className="my-4 ">
          <h1 className="text-center md:text-5xl text-2xl font-bold text-primary-500">
            Privacy Policy
          </h1>
        </div>
      </div>
      <div className="sm:px-20 px-10 pt-16 pb-20">
        <p className="leading-7 pt-4">
          Our privacy policy includes the collection, usage, disclosure, and
          confidentiality of users’ personal information, which is collected
          through the website while filling out the form. Other than this, we
          gather users’ personal data in order to identify your requirements and
          strive to provide those services in an improved manner. However, these
          pieces of information are used in accordance with our privacy policy.
        </p>
        <p className="leading-7 pt-4">
          Our website is a registered academic writing agency, which can be
          accessed through laptops, desktops, smartphones, and tablets to get
          smart services. ScholarlyHelp is committed to respecting and
          protecting user privacy. Therefore, we make sure to store personal
          user data in a secure and safe database, which is only accessible by
          the website authorities, while executing your projects.
        </p>

        <p className="leading-7 pt-4 font-semibold text-primary-500">
          Collection of Personal Data
        </p>
        <p className="leading-7">
          Keep in mind all the user information and personal data we acquire is
          provided by the user, himself. We collect and store your information
          with your consent. We can collect such personal information through
          various ways, such as filling the form, contacting us, placing orders,
          accepting cookies, live chatting, and so on. However, we do not use
          any third way to capture your information without your permission. All
          data that we gather is stored safely as per the authorized
          protections.
        </p>

        <p className="leading-7 pt-4 font-semibold text-primary-500">
          Use of Personal Data
        </p>
        <p className="leading-7">
          While using your personal information, we strive our best to protect
          your private data. Although all data is collected with your consent
          and is only used in case of some urgency. Such as, your information
          can be used on the demand of courts or law enforcement in order to
          obey the regulations implemented on us.
        </p>
        <p className="leading-7">
          We might also store your personal information to identify the real
          demands of our users and try to improve our services according to your
          desires. For instance, if you ordered a particular service from our
          website, we may provide you with information about related products.
          In order to send such information, we require the user’s personal
          information to detect the website issues.
        </p>

        <p className="leading-7 pt-4 font-semibold text-primary-500">Cookies</p>
        <p className="leading-7">
          Cookies are the small files created by the website you visit. This is
          used to make your online experience simpler by saving your browsing
          information, yet with your consent. When you visit our website, you
          can either ‘enable’ or ‘disable’ cookies. However, these are only used
          to remember your site preferences and provide you with related
          content.
        </p>
        <p className="leading-7">
          There are two types of cookies we use, persistent cookies, which
          remain on your device to track the information, such as login
          passwords and registration IDs. And, Session ID cookies, which expire
          once you close your browser. Yet, providing your personal information
          is always in your hands by accepting or rejecting the cookies’
          functionality.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
