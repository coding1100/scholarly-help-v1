"use client";

import { FC, useState } from "react";
import Image from "next/image";

const DownArrow = "/assets/Images/faqDropdown.webp";

type Content = {
  id?: number;
  question?: string;
  answer: string;
};

const faqContent = [
  {
    id: 1,
    question: "Will anyone know if I’m getting your services?",
    answer:
      "Absolutely not! Your work will be 100% confidential and won’t be shared with any third party. Your personal information and data will be in safe hands.",
  },
  {
    id: 2,
    question: "Will you find a subject expert for me?",
    answer:
      "Certainly, you have an option to choose a desired subject expert for your project. In case you can’t make a choice, we will hand over your work to the most suitable and perfect subject expert for you.",
  },
  {
    id: 3,
    question: "Can I get a Plagiarism report with the final document?",
    answer:
      "Of course! We aim to make our customers satisfied. Therefore, we check plagiarism of every document and attach its report with the final draft to provide it to the customer.",
  },
  {
    id: 4,
    question: "How fast can you complete my project?",
    answer:
      "We provide our writing services on an urgent basis as well. If your assignment’s due date is about to come, you can hand over your project to our subject experts. Concisely, you should not be anxious about the quality of your work.",
  },
  {
    id: 5,
    question: "What if I’m not satisfied with the outcomes?",
    answer:
      "We guarantee improved marks on your online exam or assignments along with unlimited revisions. Nonetheless, if you do not get quality results, we are ready to refund your payment.",
  },
  {
    id: 6,
    question:
      "Can we do all your course assignments and quizzes, also how do we do it?",
    answer:
      "We sure can! Our team is experienced in taking exams and doing assignments, even if they’re proctored exams. Rest assured all our content is 100% original and guaranteed to be plagiarism-free! We use tools and premium software to run tests on all our content to make sure that there is no plagiarism anywhere in our work. Our company has strict policies against plagiarism and copying someone else’s work. You can count on us! Remote Desktop Connection has been a trusted tool for us to take proctored exams for you. So no matter how secure your exam is, you don’t have to worry about missing it.",
  },
  {
    id: 7,
    question: "What is the procedure to take my online exam?",
    answer:
      "You can contact our representatives to know about the procedure to take my exam online through a live chat button. The alternative way is just to fill out the form and click ‘Order now’ when you are done with the required information. We will assign your exam to a relevant subject specialist as soon as you complete your order.",
  },
  {
    id: 8,
    question: "Can I contact your subject experts directly?",
    answer:
      "Definitely! You are allowed to communicate with the subject specialists directly via email and ask them about the current status of your project. You can also share the guidelines about the online class.",
  },
  {
    id: 9,
    question: "What if I’m not happy with the paper?",
    answer:
      "We put every effort to make you satisfied. If you are not satisfied with your paper and need any modifications, you can return it back to us for free revisions. On the other hand, we offer a money-back guarantee in case of any plagiarism or student loss, but some terms and conditions are applied.",
  },
  {
    id: 10,
    question: "Can I be found cheating in an online exam?",
    answer:
      "There is a 0% risk of getting caught while getting online exam help as we use your location while taking your exams. Furthermore, we take responsibility and refund your money in case you get caught.",
  },
];

interface FaqProps {
  content?: Content[];
}
const Faq: FC<FaqProps> = ({ content = faqContent }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showMore, setShowMore] = useState(false);

  const toggleAccordion = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  const toggleShowMore = () => {
    setShowMore((prev) => !prev);
  };

  const displayedFaqs = showMore ? content : content.slice(0, 3);

  return (
    <section className="sm:pt-[83px] sm:pb-14 max-[1320px]:px-8 pt-8 pb-8 bg-white text-[#171717]">
      <div className="max-w-7xl mx-auto max-[1320px]:px-8">
        <h2 className="font-bold text-primary-500 text-center text-[42px]  mb-3 mb-10">
          Frequently Asked Questions
        </h2>

        {/* Mobile & Tablet View (Grid with Show More) */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6">
          {displayedFaqs.map((item, i) => (
            <div
              key={item.id}
              className={`transition-all duration-500 rounded-md border p-5 max-[992px]:p-2 ${
                activeIndex === i
                  ? "bg-primary-200 border-primary-200"
                  : "border-primary-500 hover:border-primary-400"
              } ${activeIndex === i ? "" : "max-h-[90px] overflow-hidden"}`}
            >
              <div
                onClick={() => toggleAccordion(i)}
                className="flex justify-between items-start cursor-pointer max-[768px]:items-center"
              >
                <h3 className="sm:text-lg text-sm font-semibold pr-4">
                  {item.question}
                </h3>
                <div
                  className={`w-8 h-8 flex-shrink-0 transition-transform duration-500 ${
                    activeIndex === i ? "rotate-180" : ""
                  }`}
                >
                  <Image
                    src={DownArrow}
                    alt="Toggle"
                    width={24}
                    height={24}
                    className="w-full h-full"
                  />
                </div>
              </div>

              <div
                className={`mt-4 text-sm sm:text-base whitespace-pre-line transition-all duration-500 ${
                  activeIndex === i ? "block" : "hidden"
                }`}
                dangerouslySetInnerHTML={{ __html: item.answer }}
              />
            </div>
          ))}
        </div>

        {/* Desktop View (Full Grid, No Show More) */}
        <div className="hidden lg:grid grid-cols-2 gap-6">
          {content.map((item, i) => (
            <div
              key={item.id}
              className={`transition-all duration-500 rounded-md border p-5 max-[992px]:p-2 ${
                activeIndex === i
                  ? "bg-primary-200 border-primary-200"
                  : "border-primary-500 hover:border-primary-400"
              } ${activeIndex === i ? "" : "h-[90px] overflow-hidden"}`}
            >
              <div
                onClick={() => toggleAccordion(i)}
                className="flex justify-between h-[45px] cursor-pointer items-center"
              >
                <h3 className="text-lg font-semibold pr-4">{item.question}</h3>
                <div
                  className={`w-8 h-8 flex-shrink-0 transition-transform duration-500 ${
                    activeIndex === i ? "rotate-180" : ""
                  }`}
                >
                  <Image
                    src={DownArrow}
                    alt="Toggle"
                    width={24}
                    height={24}
                    className="w-full h-full"
                  />
                </div>
              </div>

              <div
                className={`mt-4 text-base transition-all duration-500 ${
                  activeIndex === i ? "block" : "hidden"
                }`}
                dangerouslySetInnerHTML={{ __html: item.answer }}
              />
            </div>
          ))}
        </div>

        {/* Show More / Show Less Button (Mobile Only) */}
        <div className="flex justify-center mt-8 lg:hidden">
          <button
            onClick={toggleShowMore}
            className="text-primary-500 font-bold hover:underline focus:outline-none"
          >
            {showMore ? "Show Less FAQs" : "Show More FAQs"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Faq;
