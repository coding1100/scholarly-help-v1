import Image, { StaticImageData } from "next/image";
import { FC } from "react";

interface WhyGuaranteeMattersProps {
  content: {
    mainHeading: string;
    description: string;
    heading2: string;
    details: {
      imge: StaticImageData;
      alt: string;
      title: string;
      description: string;
    }[];
  };
}

const WhyGuaranteeMatters: FC<WhyGuaranteeMattersProps> = ({ content }) => {
  return (
    <section className="w-full bg-white py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto text-center">
        {/* Header Section */}
        <h2 className="text-[28px] text-black sm:text-[36px] sm:leading-[45px] md:text-[42px] md:leading-[53px] lg:text-[50px] lg:leading-[63px] font-bold mb-3 sm:mb-4 max-w-[600px] mx-auto">
          {content.mainHeading}
        </h2>
        <p className="text-[#263238] text-[14px] sm:text-[15px] md:text-[16px] font-normal  max-w-4xl mx-auto px-4 sm:px-0 mb-14">
          {content.description}
        </p>

        <h2 className="text-[24px] text-black sm:text-[30px] md:text-[40px] font-bold mb-3 sm:mb-10">
          {content.heading2}
        </h2>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 text-start">
          {content.details.map((item, index) => (
            <div key={index} className="col-span-1 bg-[#565ADD]">
              <Image src={item.imge} alt={item.alt} />
              <div className="text-white px-10 pb-8">
                <p className="lg:text-[30px] text-[24px] lg:font-bold font-semibold lg:leading-[35px] leading-[28px] mb-5">
                  {item.title}
                </p>
                <p className="text-[17px] font-normal">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyGuaranteeMatters;
