import Image from "next/image";
export default function AcademicPartners() {
  return (
    <section className="pt-[90px] pb-[90px] px-4 bg-gradient-to-b from-white w-full to-gray-50 ">
      <div className="max-w-screen-xl mx-auto flex max-[1450px]:flex-col">
        {/* Hero Section */}
        <div className="text-left mb-12 w-[40%] max-[1450px]:w-[100%]">
          <h1 className="sm:text-4xl text-[32px] md:text-5xl sm:font-bold font-semibold text-gray-900 mb-4">
            Your Academic Partners for Success
          </h1>
          <p className="sm:text-lg text-sm text-gray-600 max-w-3xl mb-8">
            From exams and essays to full-class management, we handle it all so
            you don't have to.
          </p>
          <div className="flex sm:justify-start justify-center mt-[30px]">
            <button
              type="button"
              className="rounded-md px-3 cursor-pointer bg-[#ff641a] text-white border border-transparent transition duration-300 text-[15px] font-medium flex items-center justify-center hover:bg-white hover:text-[#ff641a] hover:border-[#ff641a] h-[54px] md:w-64 w-52"
            >
              Take my online class
            </button>
          </div>
        </div>
        {/* Feature Cards */}
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-[60%] relative min-h-[600px] mb-[120px] max-[1450px]:w-[100%] max-[1450px]:mb-[0px]">
          <Image
            src="/assets/Icon/card-line.svg"
            alt="Confidential partner"
            width={800}
            height={800}
            className="absolute top-[135px] left-[-100px] w-[120%] max-w-none max-[1450px]:hidden"
          />

          {/* Card 0 */}

          {/* Card 1 */}
          <div className="p-6 py-7 bg-[#FEF6D3] border-yellow-200 shadow-md hover:shadow-xl transition-shadow rounded-[21px] min-h-[310px] w-[289px] absolute rotate-[3deg] top-[30px] left-[54px] z-[9] max-[1450px]:[position:unset] max-[1450px]:rotate-[0deg] max-[1450px]:min-h-fit max-[1450px]:w-full">
            <div className="flex items-start space-x-4 flex-col">
              <div className="flex-shrink-0 mb-4">
                <Image
                  src="/assets/Icon/img-card-1.png"
                  alt="Confidential partner"
                  width={52}
                  height={52}
                  className="object-contain rotate-[-3deg]"
                />
              </div>
              <div className="flex flex-col">
                <h3 className="font-semibold text-gray-900 mb-4 font-poppins sm:text-2xl text-xl leading-[1.2]  tracking-normal font-poppins">
                  Confidential partner
                </h3>
                <p className="text-sm text-gray-600 font-poppins font-normal text-[15px] leading-[1.4] tracking-normal">
                  Tired of complex homework? We handle it quickly and
                  accurately. Get real-time help on classes that saves time and
                  gets results.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 py-7 pb-[20px] bg-[#ECF5DF] shadow-md hover:shadow-xl transition-shadow rounded-[21px] lg:col-span-1 min-h-[310px] md:col-span-2 w-[289px] absolute -rotate-[9deg] top-2 right-[80px] z-[9] max-[1450px]:[position:unset] max-[1450px]:rotate-[0deg] max-[1450px]:min-h-fit max-[1450px]:w-full">
            <div className="flex items-start space-x-4 flex-col">
              <div className="flex-shrink-0 mb-4">
                <Image
                  src="/assets/Icon/img-card-2.png"
                  alt="Founded by Students"
                  width={52}
                  height={52}
                  className="object-contain rotate-[9deg]"
                />
              </div>
              <div className="flex flex-col">
                <h3 className="font-semibold text-gray-900 mb-4 font-poppins sm:text-2xl text-xl leading-[1.2]  tracking-normal font-poppins">
                  Founded by Students
                </h3>
                <p className="text-sm text-gray-600 font-poppins font-normal text-[15px] leading-[1.4] tracking-normal">
                  Our CEO worked 30-hour shifts while enrolled full-time and was
                  on the verge of expulsion twice due to academic pressure. We
                  get it — we're solving the system that punishes people with
                  real lives.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 py-7 shadow-md hover:shadow-xl transition-shadow rounded-[21px] w-[289px]  min-h-[310px] absolute left-[-186px] rotate-[6deg] bottom-[-110px] bg-[#F5E2FE] z-[9] max-[1450px]:[position:unset] max-[1450px]:rotate-[0deg] max-[1450px]:min-h-fit max-[1450px]:w-full">
            <div className="flex items-start space-x-4 flex-col">
              <div className="flex-shrink-0 mb-4">
                <Image
                  src="/assets/Icon/img-card-3.png"
                  alt="40+ Master's Level Tutors"
                  width={52}
                  height={52}
                  className="object-contain rotate[-3deg]"
                />
              </div>
              <div className="flex flex-col">
                <h3 className="font-semibold text-gray-900 mb-4 font-poppins sm:text-2xl text-xl leading-[1.2]  tracking-normal font-poppins">
                  40+ Master's Level Tutors
                </h3>
                <p className="text-sm text-gray-600 font-poppins font-normal text-[15px] leading-[1.4] tracking-normal">
                  Every tutor is hand-selected through a 7-stage vetting process
                  (only 3% of applicants make it).
                </p>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 py-7 bg-[#CFE4FF] shadow-md hover:shadow-xl transition-shadow rounded-[21px] min-h-[310px] w-[289px] absolute -rotate-[9deg] -bottom-[120px] left-[165px] z-[9] max-[1450px]:[position:unset] max-[1450px]:rotate-[0deg] max-[1450px]:min-h-fit max-[1450px]:w-full">
            <div className="flex items-start space-x-4 flex-col">
              <div className=" flex-shrink-0 mb-4">
                <Image
                  src="/assets/Icon/img-card-4.png"
                  alt="2,100+ Courses Completed"
                  width={52}
                  height={52}
                  className="object-contain rotate[9deg]"
                />
              </div>
              <div className="flex flex-col">
                <h3 className="font-semibold text-gray-900 mb-4 font-poppins sm:text-2xl text-xl leading-[1.2]  tracking-normal font-poppins">
                  2,100+ Courses Completed
                </h3>
                <p className="text-sm text-gray-600 font-poppins font-normal text-[15px] leading-[1.4] tracking-normal">
                  No time to study for the exam? Our experts take your exams for
                  you, just like you're sitting there — with results that speak
                  for themselves.
                </p>
              </div>
            </div>
          </div>

          {/* Card 5 */}
          <div className="p-6 py-7 bg-[#DDF3F1] shadow-md hover:shadow-xl transition-shadow rounded-[21px] min-h-[310px] lg:col-span-1 md:col-span-2 w-[289px] absolute  -bottom-[100px] -right-[45px] z-[9] max-[1450px]:[position:unset] max-[1450px]:rotate-[0deg] max-[1450px]:min-h-fit max-[1450px]:w-full">
            <div className="flex items-start space-x-4 flex-col">
              <div className="flex-shrink-0 mb-4">
                <Image
                  src="/assets/Icon/img-card-5.png"
                  alt="100% Confidentiality Guarantee"
                  width={52}
                  height={52}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <h3 className="font-semibold text-gray-900 mb-4 font-poppins sm:text-2xl text-xl leading-[1.2]  tracking-normal font-poppins">
                  100% Confidentiality Guarantee
                </h3>
                <p className="text-sm text-gray-600 font-poppins font-normal text-[15px] leading-[1.4] tracking-normal">
                  Failing behind on assignments? Let us step in. When you ask us
                  to do my online class for me, we make sure your coursework
                  gets done right — and on time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
