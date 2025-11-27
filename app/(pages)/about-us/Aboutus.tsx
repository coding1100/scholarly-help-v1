"use client";

import AboutUsImg from "@/app/assets/Images/aboutusImg.webp";
import Image from "next/image";
import { FC } from "react";

interface AboutUsProps {}
const AboutUs: FC<AboutUsProps> = ({}) => {
  return (
    <div>
      <div className="bg-primary-300 py-16">
        <div className="flex justify-center">
          <Image
            src={AboutUsImg}
            alt="About us image"
            width={450}
            height={350}
            className="max-w-80"
            priority
          />
        </div>
        <div className="my-4 ">
          <h1 className="text-center text-5xl font-bold text-primary-500">
            About Us
          </h1>
        </div>
      </div>
      <div className="px-20 pt-16 pb-20">
        <p className="text-lg leading-7 pt-4">
          ScholarlyHelp is an academic writing service provider that holds a
          vast team of professional writers, certified with advanced degrees in
          respective fields. We offer tremendously affordable and inclusive
          academic assistance to deliver guaranteed results. With the prosperity
          of subject experts’ experience and a remarkable reputation, we are
          assertive in our academic efficiency.
        </p>
        <p className="text-lg leading-7 pt-4">
          We sponsor several learning opportunities for our subject specialists
          to encourage them and ensure the excellence of their work. Our team
          includes dedicated writers and keen editors, who are always there to
          help you with your complicated academic projects.
        </p>
        <p className="text-5xl leading-7 py-12 font-bold text-primary-500 text-center">
          Our Mission
        </p>
        <p className="text-lg leading-7">
          Our main objective is to elongate the knowledge of students and
          instruct them at affordable rates. To make them stand out in their
          specific field in an online class, we try our best to meet their
          expectations and make them 100% satisfied.
        </p>
        <p className="text-5xl leading-7 py-12 font-bold text-primary-500 text-center">
          Our Vision
        </p>
        <p className="text-lg leading-7">
          We hold a straightforward vision to offer excellent academic solutions
          for students of all levels. We try our best to become versatile in any
          project type and help you find the finest means to accomplish your
          goal.
        </p>
        <p className="text-5xl leading-7 py-12 font-bold text-primary-500 text-center">
          Ownership
        </p>
        <p className="text-lg leading-7">
          ScholarlyHelp is proudly owned by Eliya Enterprises, dedicated to
          providing quality services for online learning.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
