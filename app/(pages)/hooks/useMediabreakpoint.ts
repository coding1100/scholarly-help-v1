import { useEffect, useState } from "react";

const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;

      if (windowWidth < 465) {
        setBreakpoint("xxs");
        setIsMobile(true);
      } else if (windowWidth < 576) {
        setBreakpoint("xs");
        setIsMobile(true);
      } else if (windowWidth < 768) {
        setBreakpoint("sm");
        setIsMobile(true);
      } else if (windowWidth < 992) {
        setBreakpoint("md");
        setIsMobile(true);
      } else if (windowWidth < 1168) {
        setBreakpoint("lg");
        setIsMobile(false);
      } else if (windowWidth < 1200) {
        setBreakpoint("xl");
        setIsMobile(false);
      } else {
        setBreakpoint("2xl");
        setIsMobile(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { breakpoint, isMobile };
};

export default useBreakpoint;
