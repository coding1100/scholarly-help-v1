import { FC } from "react";

interface Description2Props {}

const Description2: FC<Description2Props> = ({}) => {
  const scrollToQuote = () => {
    const quoteForm = document.getElementById("quote-form");
    if (quoteForm) {
      quoteForm.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <section className="pt-[45px] pb-5 bg-white text-[#171717]">
      <div className="max-w-7xl mx-auto  max-[1320px]:px-8">
        <div className="text-center max-w-[1108px] mx-auto">
          <p className="text-[42px] max-[768px]:text-[28px] font-bold text-center leading-[50px]">
            Comprehensive Online Chemistry Class Help <br />
            <span className="text-[#F56200]">From Labs to Final Exams</span>
          </p>
          <p className="text-[#263238] text-[17px] mt-5">
            Why hire multiple tutors when one expert can handle it all? Our
            “Take My Chemistry Class” service covers every single component of
            your online course. Whether you need help with a difficult ALEKS
            pie, a timed proctored exam, or a weekly discussion board, students
            often pay someone to take online chemistry class services like ours
            for full academic management. We don’t just do your homework; we
            guarantee your grade.
          </p>
        </div>
        <div className="w-full mt-16 h-[263px] overflow-y-auto overflow-hidden custom-scrollbar">
          <div className="w-full grid sm:grid-cols-2 grid-cols-1 md:gap-10 gap-5 ">
            <div className="col-span-1 pr-3">
              <p className="text-2xl font-semibold mb-5">
                Take My Online Chemistry Class For Me: Full Management
              </p>
              <p className="text-[#263238] text-[17px]">
                Struggling to balance your job, family, and a demanding
                chemistry schedule? You don&apos;t need a tutor who just explains
                concepts; you need a manager who executes tasks. Our Online
                Chemistry Class Help service is designed for nursing and pre-med
                students who want to take my online chemistry class without the
                stress. When you hire us, we take over your entire course portal
                whether it’s on Canvas, Blackboard, McGraw Hill Connect, or
                Cengage. From the very first introduction post to the final
                proctored exam, our US-based chemistry experts handle every
                single deadline. We log in daily, complete your weekly modules,
                participate in discussion boards with APA-cited responses, and
                ensure your chemistry homework is submitted on time, every time.
                Stop sacrificing your sleep for stoichiometry. Delegate your
                full course to Scholarly Help and watch your GPA rise while you
                focus on what matters most. We don&apos;t just help you pass; we help
                you excel.
              </p>
            </div>
            <div className="col-span-1 pr-3">
              <p className="text-2xl font-semibold mb-5">
                Online Chemistry Course Help: Exams & Midterms
              </p>
              <p className="text-[#263238] text-[17px]">
                Chemistry midterms and final exams are designed to filter out
                nursing and pre-med students. Don’t risk your GPA on a single
                timed test. Many students pay someone to take my online
                chemistry class when exams decide their final grade. From
                General Chemistry I to Advanced Physical Chemistry, we guarantee
                an ‘A’ or ‘B’. We connect securely using domestic IP addresses
                to bypass proctoring triggers, or provide real-time support
                during your open-book exams. Whether it’s balancing redox
                reactions, calculating mole ratio, or identifying organic
                mechanisms, our PhD-level experts score consistently in the 90%+
                range. From General Chemistry I to Advanced Physical Chemistry,
                we guarantee an &apos;A&apos; or &apos;B&apos; on every major exam or your money
                back. Stop panicking about the clock; let us handle the
                pressure.
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-[30px]">
          <button
            type="button"
            onClick={scrollToQuote}
            className="rounded-md px-6 cursor-pointer bg-[#ff641a] text-white border border-transparent transition duration-300 text-[15px] max-[768px]:w-full font-medium flex items-center justify-center hover:bg-white hover:text-[#ff641a] hover:border-[#ff641a] h-[54px]"
          >
            Secure My &apos;A&apos; or &apos;B&apos; Grades
          </button>
        </div>
      </div>
    </section>
  );
};

export default Description2;
