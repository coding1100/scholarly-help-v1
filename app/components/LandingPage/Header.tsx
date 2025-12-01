"use client";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import megaMenuImage from "@/app/assets/Images/mega-menu-image.svg"
import Image from "next/image";
import LogoSmall from "@/app/assets/Images/logoSmall.png";
import LogoNormal from "@/app/assets/Images/logo.png";
import Phone from "@/app/assets/Icon/phone.svg";

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState<number | null>(null);

    const navItems = [

        {
            title: "Online Class",
            submenu: [
                {
                    title: "Take My Math Class",
                    links: [
                        { name: "Algebra", href: "/math/algebra" },
                        { name: "Calculus", href: "/math/calculus" },
                        { name: "Statistics", href: "/math/statistics" },
                        { name: "Business", href: "/math/Business" },
                        { name: "Computer Science & IT", href: "/math/Computer Science & IT" },
                        { name: "Nursing", href: "/math/Nursing" },
                    ],
                    button: [
                        { name: "See All Subjects", href: "#" },
                    ]
                },
                {
                    title: "Take My Psychology Class",
                    links: [
                        { name: "Algebra", href: "/math/algebra" },
                        { name: "Calculus", href: "/math/calculus" },
                        { name: "Statistics", href: "/math/statistics" },
                        { name: "Business", href: "/math/Business" },
                        { name: "Computer Science & IT", href: "/math/Computer Science & IT" },
                        { name: "Nursing", href: "/math/Nursing" },

                    ],
                    button: [
                        { name: "Find Your Solution", href: "#" },
                    ]
                },
                {
                    title: "Take My Business Class",
                    links: [
                        { name: "Algebra", href: "/math/algebra" },
                        { name: "Calculus", href: "/math/calculus" },
                        { name: "Statistics", href: "/math/statistics" },
                        { name: "Business", href: "/math/Business" },
                        { name: "Computer Science & IT", href: "/math/Computer Science & IT" },
                        { name: "Nursing", href: "/math/Nursing" },

                    ],
                    button: [
                        { name: "See Success Stories", href: "#" },
                    ]
                },
                {
                    title: "Computer Science & IT",
                    links: [
                        { name: "Algebra", href: "/math/algebra" },
                        { name: "Calculus", href: "/math/calculus" },
                        { name: "Statistics", href: "/math/statistics" },
                        { name: "Business", href: "/math/Business" },
                        { name: "Computer Science & IT", href: "/math/Computer Science & IT" },
                        { name: "Nursing", href: "/math/Nursing" },

                    ],
                    button: [
                        { name: "See Tools", href: "#" },
                    ]
                },

            ],
        },
        {
            title: "Exam Help",
            submenu: [
                {
                    title: "Take My Math Class",
                    links: [
                        { name: "Algebra", href: "/math/algebra" },
                        { name: "Calculus", href: "/math/calculus" },
                        { name: "Statistics", href: "/math/statistics" },
                        { name: "Business", href: "/math/Business" },
                        { name: "Computer Science & IT", href: "/math/Computer Science & IT" },
                        { name: "Nursing", href: "/math/Nursing" },
                    ],
                    button: [
                        { name: "See All Subjects", href: "#" },
                    ]
                },
                {
                    title: "Take My Psychology Class",
                    links: [
                        { name: "Algebra", href: "/math/algebra" },
                        { name: "Calculus", href: "/math/calculus" },
                        { name: "Statistics", href: "/math/statistics" },
                        { name: "Business", href: "/math/Business" },
                        { name: "Computer Science & IT", href: "/math/Computer Science & IT" },
                        { name: "Nursing", href: "/math/Nursing" },

                    ],
                    button: [
                        { name: "Find Your Solution", href: "#" },
                    ]
                },
                {
                    title: "Take My Business Class",
                    links: [
                        { name: "Algebra", href: "/math/algebra" },
                        { name: "Calculus", href: "/math/calculus" },
                        { name: "Statistics", href: "/math/statistics" },
                        { name: "Business", href: "/math/Business" },
                        { name: "Computer Science & IT", href: "/math/Computer Science & IT" },
                        { name: "Nursing", href: "/math/Nursing" },

                    ],
                    button: [
                        { name: "See Success Stories", href: "#" },
                    ]
                },
                {
                    title: "Computer Science & IT",
                    links: [
                        { name: "Algebra", href: "/math/algebra" },
                        { name: "Calculus", href: "/math/calculus" },
                        { name: "Statistics", href: "/math/statistics" },
                        { name: "Business", href: "/math/Business" },
                        { name: "Computer Science & IT", href: "/math/Computer Science & IT" },
                        { name: "Nursing", href: "/math/Nursing" },

                    ],
                    button: [
                        { name: "See Tools", href: "#" },
                    ]
                },
            ],
        },
        {
            title: "Assignment Help",
            submenu: [
                {
                    title: "Take My Math Class",
                    links: [
                        { name: "Algebra", href: "/math/algebra" },
                        { name: "Calculus", href: "/math/calculus" },
                        { name: "Statistics", href: "/math/statistics" },
                        { name: "Business", href: "/math/Business" },
                        { name: "Computer Science & IT", href: "/math/Computer Science & IT" },
                        { name: "Nursing", href: "/math/Nursing" },
                    ],
                    button: [
                        { name: "See All Subjects", href: "#" },
                    ]
                },
                {
                    title: "Take My Psychology Class",
                    links: [
                        { name: "Algebra", href: "/math/algebra" },
                        { name: "Calculus", href: "/math/calculus" },
                        { name: "Statistics", href: "/math/statistics" },
                        { name: "Business", href: "/math/Business" },
                        { name: "Computer Science & IT", href: "/math/Computer Science & IT" },
                        { name: "Nursing", href: "/math/Nursing" },

                    ],
                    button: [
                        { name: "Find Your Solution", href: "#" },
                    ]
                },
                {
                    title: "Take My Business Class",
                    links: [
                        { name: "Algebra", href: "/math/algebra" },
                        { name: "Calculus", href: "/math/calculus" },
                        { name: "Statistics", href: "/math/statistics" },
                        { name: "Business", href: "/math/Business" },
                        { name: "Computer Science & IT", href: "/math/Computer Science & IT" },
                        { name: "Nursing", href: "/math/Nursing" },

                    ],
                    button: [
                        { name: "See Success Stories", href: "#" },
                    ]
                },
                {
                    title: "Computer Science & IT",
                    links: [
                        { name: "Algebra", href: "/math/algebra" },
                        { name: "Calculus", href: "/math/calculus" },
                        { name: "Statistics", href: "/math/statistics" },
                        { name: "Business", href: "/math/Business" },
                        { name: "Computer Science & IT", href: "/math/Computer Science & IT" },
                        { name: "Nursing", href: "/math/Nursing" },

                    ],
                    button: [
                        { name: "See Tools", href: "#" },
                    ]
                },
            ],
        },
        {
            title: "Homework",
            submenu: [
                {
                    title: "Take My Math Class",
                    links: [
                        { name: "Algebra", href: "/math/algebra" },
                        { name: "Calculus", href: "/math/calculus" },
                        { name: "Statistics", href: "/math/statistics" },
                        { name: "Business", href: "/math/Business" },
                        { name: "Computer Science & IT", href: "/math/Computer Science & IT" },
                        { name: "Nursing", href: "/math/Nursing" },
                    ],
                    button: [
                        { name: "See All Subjects", href: "#" },
                    ]
                },
                {
                    title: "Take My Psychology Class",
                    links: [
                        { name: "Algebra", href: "/math/algebra" },
                        { name: "Calculus", href: "/math/calculus" },
                        { name: "Statistics", href: "/math/statistics" },
                        { name: "Business", href: "/math/Business" },
                        { name: "Computer Science & IT", href: "/math/Computer Science & IT" },
                        { name: "Nursing", href: "/math/Nursing" },

                    ],
                    button: [
                        { name: "Find Your Solution", href: "#" },
                    ]
                },
                {
                    title: "Take My Business Class",
                    links: [
                        { name: "Algebra", href: "/math/algebra" },
                        { name: "Calculus", href: "/math/calculus" },
                        { name: "Statistics", href: "/math/statistics" },
                        { name: "Business", href: "/math/Business" },
                        { name: "Computer Science & IT", href: "/math/Computer Science & IT" },
                        { name: "Nursing", href: "/math/Nursing" },

                    ],
                    button: [
                        { name: "See Success Stories", href: "#" },
                    ]
                },
                {
                    title: "Computer Science & IT",
                    links: [
                        { name: "Algebra", href: "/math/algebra" },
                        { name: "Calculus", href: "/math/calculus" },
                        { name: "Statistics", href: "/math/statistics" },
                        { name: "Business", href: "/math/Business" },
                        { name: "Computer Science & IT", href: "/math/Computer Science & IT" },
                        { name: "Nursing", href: "/math/Nursing" },

                    ],
                    button: [
                        { name: "See Tools", href: "#" },
                    ]
                },
            ],
        },
        {
            title: "Essay Writing",
            submenu: [
                {
                    title: "Take My Math Class",
                    links: [
                        { name: "Algebra", href: "/math/algebra" },
                        { name: "Calculus", href: "/math/calculus" },
                        { name: "Statistics", href: "/math/statistics" },
                        { name: "Business", href: "/math/Business" },
                        { name: "Computer Science & IT", href: "/math/Computer Science & IT" },
                        { name: "Nursing", href: "/math/Nursing" },
                    ],
                    button: [
                        { name: "See All Subjects", href: "#" },
                    ]
                },
                {
                    title: "Take My Psychology Class",
                    links: [
                        { name: "Algebra", href: "/math/algebra" },
                        { name: "Calculus", href: "/math/calculus" },
                        { name: "Statistics", href: "/math/statistics" },
                        { name: "Business", href: "/math/Business" },
                        { name: "Computer Science & IT", href: "/math/Computer Science & IT" },
                        { name: "Nursing", href: "/math/Nursing" },

                    ],
                    button: [
                        { name: "Find Your Solution", href: "#" },
                    ]
                },
                {
                    title: "Take My Business Class",
                    links: [
                        { name: "Algebra", href: "/math/algebra" },
                        { name: "Calculus", href: "/math/calculus" },
                        { name: "Statistics", href: "/math/statistics" },
                        { name: "Business", href: "/math/Business" },
                        { name: "Computer Science & IT", href: "/math/Computer Science & IT" },
                        { name: "Nursing", href: "/math/Nursing" },

                    ],
                    button: [
                        { name: "See Success Stories", href: "#" },
                    ]
                },
                {
                    title: "Computer Science & IT",
                    links: [
                        { name: "Algebra", href: "/math/algebra" },
                        { name: "Calculus", href: "/math/calculus" },
                        { name: "Statistics", href: "/math/statistics" },
                        { name: "Business", href: "/math/Business" },
                        { name: "Computer Science & IT", href: "/math/Computer Science & IT" },
                        { name: "Nursing", href: "/math/Nursing" },

                    ],
                    button: [
                        { name: "See Tools", href: "#" },
                    ]
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
                    className="lg:hidden text-gray-700"
                >
                    {mobileOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center font-medium text-gray-700 ">
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
                                        className={`transition ${activeMenu === index ? "rotate-180" : ""
                                            }`}
                                    />
                                )}
                            </Link>

                            {/* Full Width Mega Menu */}
                            {item.submenu && activeMenu === index && (
                                <div className="absolute left-0 right-0 top-full bg-[#F9FBFF] flex gap-y-8 px-10 py-10 max-h-[400px] overflow-auto">
                                    {/* Invisible hover buffer to prevent flicker */}
                                    <div className="absolute top-[-12px] left-0 w-full h-12 bg-transparent"></div>

                                    <div className="w-full mx-auto grid grid-cols-4 gap-8 pr-[32px] max-[1500px]:grid-cols-2">
                                        {item.submenu.map((sub, idx) => (
                                            <div key={idx} className="flex flex-col shadow-[0px_0px_31.8px_0px_#00000012] p-[30px] rounded-[5px]" >
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
                                                {sub.button && sub.button.map((btn, btnIdx) => (
                                                    <Link
                                                        key={`button-${btnIdx}`}
                                                        href={btn.href}
                                                        className="mt-4 rounded-md flex cursor-pointer bg-[#ff641a] text-white border border-transparent transition duration-300 text-[15px] font-medium flex items-center justify-center hover:bg-white hover:text-[#ff641a] hover:border-[#ff641a] h-[54px]"
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
                                    />
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
                <div className="lg:hidden bg-white border-t shadow-inner max-h-[90vh] overflow-auto">
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
                                                        <span className="font-medium text-gray-800">{sub.title}</span>
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
