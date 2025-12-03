"use client";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import megaMenuImage from "@/app/assets/Images/mega-menu-image.svg";
import Image from "next/image";
import LogoSmall from "@/app/assets/Images/logoSmall.png";
import LogoNormal from "@/app/assets/Images/logo.png";
import Phone from "@/app/assets/Icons/phone.svg";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const navItems = [
    {
      title: "Online Class",
      submenu: [
        {
          title: "Subjects",
          links: [
            {
              name: "Take My Chemistry Class",
              href: "/online-class/chemistry",
            },
            { name: "Take My Biology Class", href: "/online-class/biology/" },
            { name: "Take My Math Class", href: "/online-class/math" },
            {
              name: "Take My Accounting Class",
              href: "/online-class/accounting",
            },
            {
              name: "Take My Statistics Class",
              href: "/online-class/statistics",
            },
          ],
          button: [{ name: "See All Subjects", href: "/online-class" }],
        },
        {
          title: "The Stress We Solve",
          links: [
            { name: "Struggling to manage online classes?", href: "" },
            { name: "No time for discussions or quizzes?", href: "" },
            { name: "Need guaranteed grades for your class?", href: "" },
            { name: "Balancing work, study, and life?", href: "" },
            { name: "Computer Science & IT", href: "" },
            { name: "This Prerequisite is Tanking My GPA", href: "" },
          ],
          button: [{ name: "Find Your Solution", href: "" }],
        },
        {
          title: "How It Works & Proof",
          links: [
            { name: "How We Guarantee 100% Anonymity", href: "" },
            { name: "Our Plagiarism-Free Process", href: "" },
            { name: "Our US-Based PhD Experts", href: "" },
            { name: "Success Stories & Reviews", href: "" },
          ],
          button: [{ name: "See Success Stories", href: "#" }],
        },
      ],
    },
    {
      title: "Exam Help",
      submenu: [
        {
          title: "Subjects",
          links: [
            { name: "Take My Nursing Exam", href: "/exams/nursing" },
            { name: "Take My Statistics Exam", href: "/exams/statistics" },
            { name: "Take My Economics Exam", href: "/exams/economics" },
            { name: "Take My Accounting  Exam", href: "/exams/accounting" },
            { name: "Take My English Exam", href: "/exams/english" },
          ],
          button: [{ name: "See All Subjects", href: "/exams" }],
        },
        {
          title: "Our Guarantees",
          links: [
            { name: "Our Promise (Risk-Free)", href: "" },
            { name: "A or B Grade Guarantee", href: "" },
            { name: "100% Confidentiality Pact", href: "" },
            { name: "0% Plagiarism Guarantee", href: "" },
            { name: "On-Time Delivery Guarantee", href: "" },
          ],
          button: [{ name: "Find Your Solution", href: "" }],
        },
        {
          title: "How It Works & Proof",
          links: [
            { name: "How We Guarantee 100% Anonymity", href: "" },
            { name: "Our Plagiarism-Free Process", href: "" },
            { name: "Our US-Based PhD Experts", href: "" },
            { name: "Success Stories & Reviews", href: "" },
          ],
          button: [{ name: "See Success Stories", href: "" }],
        },
      ],
    },
    {
      title: "Assignment Help",
      submenu: [
        {
          title: "Subjects",
          links: [
            {
              name: "Statistics Assignment Help",
              href: "/assignment/statistics",
            },
            { name: "Finance Assignment Help", href: "/assignment/finance" },
            {
              name: "Marketing Assignment Help",
              href: "/assignment/marketing",
            },
            { name: "Math Assignment Help", href: "/assignment/math" },
            {
              name: "Accounting Assignment Help",
              href: "/assignment/accounting",
            },
          ],
          button: [{ name: "See All Subjects", href: "/assignment" }],
        },
        {
          title: "How It Works & Proof",
          links: [
            { name: "How We Guarantee 100% Anonymity", href: "" },
            { name: "Our Plagiarism-Free Process", href: "" },
            { name: "Our US-Based PhD Experts", href: "" },
            { name: "Success Stories & Reviews", href: "" },
          ],
          button: [{ name: "Find Your Solution", href: "" }],
        },
      ],
    },
    {
      title: "Homework",
      submenu: [
        {
          title: "Subjects",
          links: [
            { name: "Math Homework Help", href: "/homework/math" },
            { name: "Statistics Homework Help", href: "/homework/statistics" },
            { name: "Chemistry Homework Help", href: "/homework/chemistry" },
            { name: "Accounting Homework Help", href: "/homework/accounting" },
            {
              name: "Computer science Homework Help",
              href: "/homework/computer-science",
            },
          ],
          button: [{ name: "See All Subjects", href: "/homework" }],
        },
      ],
    },
    {
      title: "Essay Writing",
      submenu: [
        {
          title: "Subjects",
          links: [
            { name: "Statistics Assignment Help", href: "" },
            { name: "Finance Assignment Help", href: "" },
            { name: "Marketing Assignment Help", href: "" },
            { name: "Computer Science Assignment Help", href: "" },
            { name: "Law Assignment Help", href: "" },
          ],
          button: [{ name: "See All Subjects", href: "/essay-writing" }],
        },
      ],
    },
    {
      title: "Tools",
      href: "/tools",
    },
  ];

  return (
    <header className="sticky top-0 bg-white shadow-md z-50 relative max-[1020px]:py-3">
      {/* Header Top Bar */}
      <div className="max-w-7xl mx-auto max-[1320px]:px-8 flex items-center justify-between pt-2 px-6">
        {/* Logo */}
        <Link href="/">
          <Image
            src={LogoSmall}
            alt="logo"
            className="max-[480px]:block hidden max-w-[30px] min-w-[30px]"
          />
          <Image
            src={LogoNormal}
            alt=""
            className="min-[480px]:block hidden max-w-[142px] min-w-[142px]"
          />
          {/* <Logo /> */}
        </Link>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="min-[1200px]:hidden text-gray-700"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden min-[1200px]:flex items-center font-medium text-gray-700 ">
          {navItems.map((item, index) => (
            <div
              key={index}
              className="gap-2"
              onMouseEnter={() => setActiveMenu(index)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link
                href={item.href || "#"}
                className="flex items-center hover:bg-[#F9FBFF] transition py-[20px] px-[10px] ml-[10px]"
              >
                {item.title}
                {item.submenu && (
                  <ChevronDown
                    size={16}
                    className={`transition ${
                      activeMenu === index ? "rotate-180" : ""
                    }`}
                  />
                )}
              </Link>

              {/* Full Width Mega Menu */}
              {item.submenu && activeMenu === index && (
                <div className="absolute left-0 right-0 top-full bg-[#F9FBFF] flex gap-y-8 px-10 py-10 max-h-[400px] overflow-auto">
                  {/* Invisible hover buffer to prevent flicker */}
                  <div className="absolute top-[-12px] left-0 w-full h-12 bg-transparent"></div>
                  <div className="flex mx-auto">
                    <div className=" flex mx-auto gap-8 max-[1500px]:grid-cols-2">
                      {item.submenu.map((sub, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col justify-between shadow-[0px_0px_31.8px_0px_#00000012] p-[30px] rounded-[5px] w-[350px]"
                        >
                          {/* <h3 className="text-gray-900 mb-2 font-semibold">{sub.title}</h3> */}
                          {sub.links.map((link, linkIdx) => (
                            <Link
                              key={linkIdx}
                              href={link.href}
                              className="block text-gray-700 hover:text-blue-600 transition mb-1"
                            >
                              {link.name}
                            </Link>
                          ))}
                          {sub.button &&
                            sub.button.map((btn, btnIdx) => (
                              <Link
                                key={`button-${btnIdx}`}
                                href={btn.href}
                                className="rounded-md flex cursor-pointer bg-[#ff641a] text-white border border-transparent transition duration-300 text-[15px] font-medium flex items-center justify-center hover:bg-white hover:text-[#ff641a] hover:border-[#ff641a] min-h-[54px]"
                              >
                                {btn.name}
                              </Link>
                            ))}
                        </div>
                      ))}
                    </div>
                    <div className=" ">
                      <Image
                        src={megaMenuImage}
                        alt="SiteJabber"
                        width={367}
                        height={250}
                        loading="lazy"
                        className="h-[100%]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="mr-4">
          <a
            href={`tel:${process.env.NEXT_PUBLIC_COMPANY_PHONE_NUMBER}`}
            className="flex items-center text-primary-400 text-[#565add]"
          >
            <span className="w-6 mr-1 text-primary-400">
              <Image
                src={Phone}
                alt="Phone"
                width={22}
                height={22}
                loading="lazy"
              />
            </span>
            1-716-708-1869
          </a>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="min-[1200px]:hidden bg-white border-t shadow-inner max-h-[90vh] overflow-auto">
          <ul className="flex flex-col divide-y ">
            {navItems.map((item, index) => (
              <li key={index} className="p-3 ">
                {item.submenu ? (
                  <details className="group">
                    <summary className="flex justify-between items-center cursor-pointer font-medium">
                      {item.title}
                      <ChevronDown
                        size={18}
                        className="transition group-open:rotate-180"
                      />
                    </summary>
                    <ul className="mt-2 pl-3 border-l border-gray-200 space-y-1">
                      {item.submenu.map((sub, idx) => (
                        <li key={idx}>
                          <div className="mb-2">
                            <span className="font-medium text-gray-800">
                              {sub.title}
                            </span>
                            <ul className="ml-2 mt-1 space-y-1">
                              {sub.links.map((link, linkIdx) => (
                                <li key={linkIdx}>
                                  <Link
                                    href={link.href}
                                    className="block text-gray-600 hover:text-blue-600 py-1"
                                  >
                                    {link.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className="block text-gray-700 hover:text-blue-600"
                  >
                    {item.title}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
