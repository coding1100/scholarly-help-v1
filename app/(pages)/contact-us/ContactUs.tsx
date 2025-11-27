"use client";

import Facebook from "@/app/assets/Icons/Facebook";
import AboutUsImg from "@/app/assets/Images/aboutusImg.webp";
import EmailIcon from "@/app/assets/Images/contactEmail.webp";
import CustomerCareIcon from "@/app/assets/Images/customercare.webp";
import Instagram from "@/app/assets/Images/instagram.webp";
import Linkedin from "@/app/assets/Images/linkedIn.webp";
import Tiktok from "@/app/assets/Images/tiktok.webp";
import PhoneIcon from "@/app/assets/Images/tollFree.webp";
import Image from "next/image";
import { FC } from "react";

interface ContactUsProps {}
const ContactUs: FC<ContactUsProps> = ({}) => {
  return (
    <div>
      <div className="bg-primary-300 py-16">
        <div className="flex justify-center">
          <Image src={AboutUsImg} alt="image" className="max-w-80" />
        </div>
        <div className="my-4 ">
          <h1 className="text-center md:text-5xl text-2xl font-bold text-primary-500">
            Contact Us
          </h1>
        </div>
      </div>
      <div className="sm:container sm:mx-auto mx-10 pt-16 pb-20">
        <p className="text-lg leading-7 pt-4 text-center">
          Communicate with Us in any Suitable Way!
        </p>

        <div className="grid grid-cols-12 mt-12 gap-5">
          <div className="lg:col-span-4 sm:col-span-6 col-span-12 flex">
            <div className="mr-2">
              <Image className="max-w-8" src={CustomerCareIcon} alt="icon" />
            </div>
            <div>
              <p className="sm:text-xl text-primary-500 font-bold mb-3">
                Customer Support
              </p>
              <p className="text-primary-500 leading-7">
                Request your query and get an instant solution to your problem.
              </p>
              <p className=" text-primary-500 font-semibold leading-7">
                support@scholarlyhelp.com
              </p>
            </div>
          </div>
          <div className="lg:col-span-4 sm:col-span-6 col-span-12 flex">
            <div className=" mr-2">
              <Image className="max-w-8" src={EmailIcon} alt="icon" />
            </div>
            <div>
              <p className="sm:text-xl text-primary-500 font-bold mb-3">
                Email
              </p>
              <p className="text-primary-500 leading-7">
                Seeking information regarding our services? Email us directly.
              </p>
              <p className=" text-primary-500 font-semibold leading-7">
                info@scholarlyhelp.com
              </p>
            </div>
          </div>
          <div className="lg:col-span-4 sm:col-span-6 col-span-12 flex">
            <div className=" mr-2">
              <Image className="max-w-8" src={PhoneIcon} alt="icon" />
            </div>
            <div>
              <p className="text-xl text-primary-500 font-bold mb-3">
                Toll-Free
              </p>
              <p className="text-primary-500 leading-7">
                Call us directly to get your urgent work done.
              </p>
              <p className=" text-primary-500 font-semibold leading-7">
                1-716-708-1869
              </p>
            </div>
          </div>
        </div>

        <div className="sm:px-16 mt-9">
          <div>
            <p className="md:text-5xl sm:text-3xl text-xl text-primary-500 font-bold text-center">
              Our Hub
            </p>
          </div>
          <div className="grid grid-cols-12 gap-6 mt-9">
            <div className="md:col-span-6 col-span-12 bg-primary-200 rounded-2xl px-5 py-5">
              <p className="text-xl text-primary-500 font-bold">
                Live Chat Support
              </p>
              <p className="text-primary-500">
                Communicate with our friendly customer care center and get an
                immediate response within seconds. Our 24/7 online live chat
                support is ready to assist you.
              </p>
            </div>
            <div className="md:col-span-6 col-span-12 bg-primary-200 rounded-2xl px-5 py-5">
              <p className="text-xl text-primary-500 font-bold">
                Social Media Channels
              </p>
              <p className="text-primary-500">
                Reach us on social media networks to get connected with us.
              </p>
              <div className="flex">
                <div className="w-5 mr-1">
                  <a
                    target="_blank"
                    href="https://www.facebook.com/Scholarly.help"
                  >
                    <Facebook color="#2b1c51" />
                  </a>
                </div>
                <div className="w-5 mr-1">
                  <a
                    target="_blank"
                    href="https://www.instagram.com/scholarlyhelp/"
                  >
                    <Image src={Instagram} alt="instagram" />
                  </a>
                </div>
                <div className="w-5 mr-1">
                  <a
                    target="_blank"
                    href="https://www.linkedin.com/company/scholarlyhelp/"
                  >
                    <Image src={Linkedin} alt="Linkedin" />
                  </a>
                </div>
                <div className="w-5 mr-1">
                  <a
                    target="_blank"
                    href="https://www.tiktok.com/@scholarlyhelp.com"
                  >
                    <Image src={Tiktok} alt="Tiktok" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
