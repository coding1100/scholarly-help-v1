"use client";

import { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadCrumbsProps {
  pageName: string;
}
const BreadCrumbs: FC<BreadCrumbsProps> = ({ pageName }) => {
  const pathnames = usePathname()
    .split("/")
    .filter((x) => x);

  return (
    <div className="flex justify-center bg-primary-400 py-4 font-medium text-lg text-white">
      <div className="container">
        <div className="flex justify-between max-w-fit ml-12">
          <span className="after:content-['>'] after:mx-3">
            <Link href="/">Home</Link>
          </span>
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;

            return (
              <span
                key={name}
                className={` ${
                  isLast ? "active" : "after:content-['>'] after:mx-3"
                }`}
              >
                {isLast ? (
                  <span>{pageName}</span>
                ) : (
                  <Link className="" href={routeTo}>
                    {name}
                  </Link>
                )}
              </span>
            );
          })}
        </div>
        {/* <div className="col-lg-6 col-12">
              <div className="searchBox ms-lg-auto mt-2">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  className="search"
                  type="search"
                  placeholder="Search Tool"
                  aria-label="Search"
                />
              </div>
            </div> */}
      </div>
    </div>
  );
};

export default BreadCrumbs;
