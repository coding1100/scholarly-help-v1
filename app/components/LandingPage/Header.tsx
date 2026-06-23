"use client";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronDown, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import megaMenuImage from "@/app/assets/Images/mega-menu-image.webp";
import Image from "next/image";
import LogoSmall from "@/app/assets/Images/logoSmall.png";
import LogoNormal from "@/app/assets/Images/logo.svg";
import Phone from "@/app/assets/Icons/phone.webp";
import {
  isTakeMyClass3LandingPage,
  isTakeMyClassHeaderRoute,
} from "@/app/lib/takeMyClassLandingRoutes";

const Star: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"
      fill="currentColor"
    />
  </svg>
);

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const prefetchedRoutesRef = useRef<Set<string>>(new Set());
  const isTakeMyClass3 = isTakeMyClass3LandingPage(pathname);
  const isTakeMyClass = isTakeMyClassHeaderRoute(pathname);
  const isTakeMyExam =
    pathname === "/take-my-exam/" || pathname === "/take-my-exam";
  const isSpecialRoute = isTakeMyClass || isTakeMyExam;
  const isSpecialRoute3 = isSpecialRoute || isTakeMyClass3;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [mobileActiveIndex, setMobileActiveIndex] = useState<number | null>(
    null,
  );

  const navItems = [
    {
      title: "Online Class",
      submenu: [
        {
          title: "Subjects",
          links: [
            {
              name: "Take My Chemistry Class",
              href: "/online-class/chemistry/",
            },
            {
              name: "Take My Biology Class",
              href: "/online-class/biology/",
            },
            {
              name: "Take My Economics Class",
              href: "/online-class/economics/",
            },
            {
              name: "Take My Math Class",
              href: "/online-class/math/",
            },
            {
              name: "Take My Law Class",
              href: "/online-class/law/",
            },
          ],
          button: [{ name: "See All Subjects", href: "/online-class/" }],
        },
        {
          title: "How It Works & Proof",
          links: [
            {
              name: "100% Confidentiality Pact",
              href: "/guarantee-anonymity/",
            },
            {
              name: "0% Plagiarism Guarantee",
              href: "/plagiarism-free-process/",
            },
            {
              name: "A or B Grade Guarantee",
              href: "/a-or-b-grade-guarantee/",
            },
            {
              name: "On-Time Delivery Guarantee",
              href: "/on-time-delivery-guarantee/",
            },
            {
              name: "Our US-Based PhD Experts",
              href: "/us-based-phd-experts/",
            },
          ],
          button: [
            {
              name: "Success Stories & Reviews",
              href: "/success-stories-and-reviews/",
            },
          ],
        },
        {
          title: "Online Class Support",
          links: [
            {
              name: "Improve Your Grades",
              href: "https://scholarlyhelp.com/blog/how-to-get-better-grades/",
            },
            {
              name: "Time Management Help",
              href: "https://scholarlyhelp.com/blog/time-management-for-students/",
            },
            {
              name: "Work–Study Balance",
              href: "https://scholarlyhelp.com/blog/how-to-balance-work-and-study/",
            },
            {
              name: "Study Tips & Productivity",
              href: "https://scholarlyhelp.com/blog/15-study-tips-for-students/",
            },
            {
              name: "Tough Math & Study Help",
              href: "https://scholarlyhelp.com/blog/hardest-math-class-in-high-school/",
            },
          ],
          button: [{ name: "Ask for Class Help", href: "/online-class/" }],
        },
      ],
      href: "/online-class/",
    },
    {
      title: "Exam Help",
      submenu: [
        {
          title: "Subjects",
          links: [
            { name: "Take My History Exam", href: "/exams/history/" },
            { name: "Take My Philosophy Exam", href: "/exams/philosophy/" },
            { name: "Take My Finance Exam", href: "/exams/finance/" },
            { name: "Take My Nursing Exam", href: "/exams/nursing/" },
            { name: "Take My Math Exam", href: "/exams/math/" },
          ],
          button: [{ name: "See All Subjects", href: "/exams/" }],
        },
        {
          title: "How It Works & Proof",
          links: [
            {
              name: "100% Confidentiality Pact",
              href: "/guarantee-anonymity/",
            },
            {
              name: "0% Plagiarism Guarantee",
              href: "/plagiarism-free-process/",
            },
            {
              name: "A or B Grade Guarantee",
              href: "/a-or-b-grade-guarantee/",
            },
            {
              name: "On-Time Delivery Guarantee",
              href: "/on-time-delivery-guarantee/",
            },
            {
              name: "Our US-Based PhD Experts",
              href: "/us-based-phd-experts/",
            },
          ],
          button: [
            {
              name: "Success Stories & Reviews",
              href: "/success-stories-and-reviews/",
            },
          ],
        },
        {
          title: "Exam Help Center",
          links: [
            {
              name: "Math Exam Preparation",
              href: "https://scholarlyhelp.com/blog/how-to-prepare-for-maths-exam/",
            },
            {
              name: "Exam Passing Tips",
              href: "https://scholarlyhelp.com/blog/how-to-prepare-for-maths-exam/",
            },
            {
              name: "Bonus Questions Strategy",
              href: "https://scholarlyhelp.com/blog/bonus-questions-in-exam/",
            },
            {
              name: "Edgenuity Cumulative Exam Help",
              href: "https://scholarlyhelp.com/blog/edgenuity-cumulative-exam/",
            },
            {
              name: "ATI Nutrition Proctored Exam",
              href: "https://scholarlyhelp.com/blog/ati-nutrition-proctored-exam/",
            },
          ],
          button: [{ name: "Get Expert Exam Help", href: "/exams/" }],
        },
      ],
      href: "/exams/",
    },
    {
      title: "Assignment Help",
      submenu: [
        {
          title: "Subjects",
          links: [
            {
              name: "Statistics Assignment Help",
              href: "/assignment/statistics/",
            },
            {
              name: "Finance Assignment Help",
              href: "/assignment/finance/",
            },
            {
              name: "Marketing Assignment Help",
              href: "/assignment/marketing/",
            },
            {
              name: "Math Assignment Help",
              href: "/assignment/math/",
            },
            {
              name: "Accounting Assignment Help",
              href: "/assignment/accounting/",
            },
          ],
          button: [{ name: "See All Subjects", href: "/assignment/" }],
        },
        {
          title: "How It Works & Proof",
          links: [
            {
              name: "100% Confidentiality Pact",
              href: "/guarantee-anonymity/",
            },
            {
              name: "0% Plagiarism Guarantee",
              href: "/plagiarism-free-process/",
            },
            {
              name: "A or B Grade Guarantee",
              href: "/a-or-b-grade-guarantee/",
            },
            {
              name: "On-Time Delivery Guarantee",
              href: "/on-time-delivery-guarantee/",
            },
            {
              name: "Our US-Based PhD Experts",
              href: "/us-based-phd-experts/",
            },
          ],
          button: [
            {
              name: "Success Stories & Reviews",
              href: "/success-stories-and-reviews/",
            },
          ],
        },
      ],
      href: "/assignment/",
    },
    {
      title: "Homework",
      submenu: [
        {
          title: "Subjects",
          links: [
            { name: "Math Homework Help", href: "/homework/math/" },
            { name: "Statistics Homework Help", href: "/homework/statistics/" },
            { name: "Chemistry Homework Help", href: "/homework/chemistry/" },
            { name: "Accounting Homework Help", href: "/homework/accounting/" },
            {
              name: "Computer science Homework Help",
              href: "/homework/computer-science/",
            },
          ],
          button: [{ name: "See All Subjects", href: "/homework/" }],
        },
      ],
      href: "/homework/",
    },
    {
      title: "Essay Writing",
      submenu: [
        {
          title: "Subjects",
          links: [
            { name: "Law essay writing", href: "/essay-writing/law/" },
            { name: "History essay writing", href: "/essay-writing/history/" },
            { name: "Nursing essay writing", href: "/essay-writing/nursing/" },
            {
              name: "Psychology essay writing",
              href: "/essay-writing/psychology/",
            },
            {
              name: "Economics essay writing",
              href: "/essay-writing/economics/",
            },
          ],
          button: [{ name: "See All Subjects", href: "/essay-writing/" }],
        },
      ],
      href: "/essay-writing/",
    },
    {
      title: "Tools",
      href: "/tools/",
    },
  ];

  const prefetchRoute = (href?: string) => {
    if (!href || !href.startsWith("/")) return;
    if (prefetchedRoutesRef.current.has(href)) return;
    prefetchedRoutesRef.current.add(href);
    router.prefetch(href);
  };

  const prefetchNavItem = (item: (typeof navItems)[number]) => {
    prefetchRoute(item.href);
    if (!item.submenu) return;
    item.submenu.forEach((sub) => {
      sub.links.forEach((link) => prefetchRoute(link.href));
      sub.button?.forEach((btn) => prefetchRoute(btn.href));
    });
  };

  useEffect(() => {
    // Warm common routes to reduce page-switch delay from header links.
    navItems.forEach((item) => prefetchRoute(item.href));
  }, []);

  return (
    <header className="bg-white z-[9999] sticky top-0 shadow-sm">
      {/* Header Top Bar */}
      <div
        className={`max-w-7xl mx-auto max-[1320px]:px-3 flex items-center pt-2 min-h-[64px] ${isTakeMyClass3 ? "md:justify-between justify-center" : "justify-between"}`}
      >
        {/* Menu Button - Hidden for special routes */}
        {!isSpecialRoute3 && (
          <button
            onClick={() => {
              setMobileOpen((prev) => {
                const next = !prev;
                if (next) {
                  navItems.forEach((item) => prefetchNavItem(item));
                }
                return next;
              });
            }}
            className="min-[1200px]:hidden text-gray-700 relative z-[10000] p-1 bg-[#EEEEEE] rounded-md"
            aria-label={
              mobileOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X size={20} color="#3e42b3" />
            ) : (
              <Menu size={20} color="#3e42b3" />
            )}
          </button>
        )}
        {/* Logo */}
        <Link href="/">
          {/* <Image
            src={LogoSmall}
            alt="Scholarly Help Logo"
            className="max-[480px]:block hidden max-w-[32px] min-w-[29px]"
            width={32}
            height={29}
            priority
          /> */}
          <Image
            src={LogoNormal}
            alt="Scholarly Help"
            className=""
            width={138}
            height={36}
            priority
            fetchPriority="high"
          />
        </Link>

        {/* Rating Stars - Only for /take-my-class/ */}
        {(isTakeMyClass || isTakeMyClass3) && (
          <div className="max-[768px]:hidden md:flex flex-col items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-6 h-6 text-[#facc15] fill-[#facc15]"
                />
              ))}
              <span className="text-sm font-semibold text-gray-700 ml-2">
                4.9/5
              </span>
              <span className="text-sm ml-4">(1,000+ Satisfied Students)</span>
            </div>
          </div>
        )}

        {/* Phone Number - Shown for special routes (take-my-class, take-my-exam): always show number on mobile */}

        {isSpecialRoute && (
          <div className="flex items-center gap-2">
            {/* Text Us CTA (SMS) */}
            <a
              href={`sms:${process.env.NEXT_PUBLIC_COMPANY_PHONE_NUMBER || "17167081869"}`}
              className="flex items-center sm:text-primary-400 sm:text-[#565add] transition sm:bg-white bg-[#9F92EC] sm:rounded-none rounded-full sm:px-4 px-4 sm:py-0 py-1"
            >
              <span className="w-6 mr-1 text-[#565add] sm:block hidden">
                <MessageSquare size={22} aria-hidden="true" />
              </span>
              <span className="text-white sm:text-[#565add]">Text Us</span>
            </a>
            {/* Phone Number CTA (call) */}
            <a
              href={`tel:${process.env.NEXT_PUBLIC_COMPANY_PHONE_NUMBER || "17167081869"}`}
              className="flex items-center sm:text-primary-400 sm:text-[#565add] transition sm:bg-white bg-[#9F92EC] sm:rounded-none rounded-full sm:px-0 px-4 sm:py-0 py-1"
            >
              <span className="w-6 mr-1 text-primary-400 sm:block hidden">
                <Image
                  src={Phone}
                  alt="Phone"
                  width={22}
                  height={22}
                  fetchPriority="high"
                />
              </span>
              <span className="text-white sm:text-[#565add]">+1 646 480 6092</span>
            </a>
          </div>
        )}
        {/* {isTakeMyClass3 && (
          <div>
            <button className="rounded-md px-3 py-2 cursor-pointer bg-[#ff641a] text-white border border-transparent transition duration-300 text-[15px] font-medium md:flex hidden items-center justify-center hover:bg-white hover:text-[#ff641a] hover:border-[#ff641a] w-full">
              Secure My "A" or "B" Grades
            </button>
          </div>
        )} */}

        {/* Desktop Navigation - Hidden for special routes */}
        {!isSpecialRoute && (
          <>
            {!isTakeMyClass3 && (
              <nav className="hidden min-[1200px]:flex items-center font-medium text-gray-700 ">
                {navItems.map((item, index) => (
                  <div
                    key={index}
                    className="gap-2"
                    onMouseEnter={() => {
                      setActiveMenu(index);
                      prefetchNavItem(item);
                    }}
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
                                className="flex flex-col justify-between shadow-[0px_0px_31.8px_0px_#00000012] p-[25px] rounded-[5px] w-[350px]"
                              >
                                <div className="text-gray-900 mb-2 font-semibold">
                                  {sub.title}
                                </div>
                                {sub.links.map((link, linkIdx) => (
                                  <Link
                                    key={linkIdx}
                                    href={link.href}
                                    className="block text-gray-700 hover:text-[#155dfc] transition mb-1"
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
                          <div className="ml-8">
                            <Image
                              src={megaMenuImage}
                              alt="SiteJabber"
                              width={325}
                              height={250}
                              fetchPriority="high"
                              className="h-[100%] max-w-[280px]"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            )}
            {!isTakeMyClass3 && (
              <div>
                 {/* <button
           
           className="rounded-md sm:px-3 px-2 cursor-pointer bg-[#ff641a] text-white border border-transparent transition duration-300 sm:text-xs text-[10px] font-medium flex items-center justify-center hover:bg-white hover:text-[#ff641a] hover:border-[#ff641a] h-[40px] w-full"
         >
           Secure My "A" or "B" Grades
         </button> */}
                <a
                  href={`tel:${process.env.NEXT_PUBLIC_COMPANY_PHONE_NUMBER || "17167081869"}`}
                  className="flex items-center sm:text-primary-400 sm:text-[#565add] transition sm:bg-white bg-[#9F92EC] sm:rounded-none rounded-full sm:px-0 px-4 sm:py-0 py-1"
                >
                  <span className="w-6 mr-1 text-primary-400 sm:block hidden">
                    <Image
                      src={Phone}
                      alt="Phone"
                      width={22}
                      height={22}
                      fetchPriority="high"
                    />
                  </span>
                  <span className="sm:block hidden">+1 646 480 6092</span>
                  <span className="sm:hidden block text-white">Text Us</span>
                </a>
              </div>
            )}
          </>
        )}
      </div>
      {(isTakeMyClass || isTakeMyClass3) && (
        <div className=" md:hidden flex-col items-center flex py-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-[#facc15] fill-[#facc15]" />
            ))}
            <span className="text-sm font-semibold text-gray-700 ml-2">
              4.9/5
            </span>
            <span className="text-sm ml-4">(1,000+ Satisfied Students)</span>
          </div>
        </div>
      )}
      {/* Mobile Navigation - full-width dropdown under header with smooth transition and outside click close */}
      {(!isSpecialRoute || !isTakeMyClass3) && (
        <div
          className={`min-[1200px]:hidden fixed inset-0 z-40 transition-opacity duration-300 ease-in-out ${
            mobileOpen
              ? "block pointer-events-auto"
              : "hidden pointer-events-none"
          }`}
          onClick={() => {
            setMobileOpen(false);
            setMobileActiveIndex(null);
          }}
        >
          <div
            className={`absolute inset-x-0 top-[64px] mx-auto max-w-7xl bg-white border-t shadow-lg rounded-b-2xl max-h-[70vh] overflow-auto transform transition-transform duration-300 ease-in-out ${
              mobileOpen ? "translate-y-[0px]" : "-translate-y-[400px]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="flex flex-col divide-y">
              {navItems.map((item, index) => (
                <li key={index} className="p-3">
                  {item.submenu ? (
                    <details
                      className="group"
                      open={mobileActiveIndex === index}
                      onClick={(e) => {
                        e.preventDefault();
                        setMobileActiveIndex(
                          mobileActiveIndex === index ? null : index,
                        );
                      }}
                    >
                      <summary className="flex justify-between items-center cursor-pointer font-medium text-[#1e1e1e]">
                        {item.title}
                        <ChevronDown
                          size={18}
                          className="transition-transform duration-300 ease-in-out group-open:rotate-180"
                        />
                      </summary>
                      <div className="mt-2 overflow-hidden transition-all duration-300 ease-in-out max-h-0 group-open:max-h-fit">
                        <ul className="pl-3 border-l border-gray-200 space-y-1">
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
                                        className="block text-gray-600 hover:text-[#155dfc] py-1"
                                        onClick={() => {
                                          setMobileOpen(false);
                                          setMobileActiveIndex(null);
                                        }}
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
                      </div>
                    </details>
                  ) : (
                    <Link
                      href={item.href || "#"}
                      className="block text-gray-700 hover:text-[#155dfc]"
                      onClick={() => {
                        setMobileOpen(false);
                        setMobileActiveIndex(null);
                      }}
                    >
                      {item.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
