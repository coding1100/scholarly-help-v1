import React from "react";

export default function ProcessSection() {
  return (
    <section className="w-full bg-white text-[#171717]">
      <div className="mx-auto max-w-7xl pb-10 max-[1320px]:px-8">
        <div className="relative rounded-2xl bg-[#3C3D5D] px-6 py-12 sm:px-10 lg:px-14 lg:py-16 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-[42px] text-[#000]font-bold  sm:font-bold font-semibold leading-tight">
              State-of-the-Art Process We Follow
            </h2>
            <p className="mt-3 sm:text-[18px] text-sm font-medium text-white/80">
              Beyond the subjects listed below, we excel at handling diverse
              topics effectively. Our expertise knows no bounds, ensuring we&apos;re
              ready for any challenge that comes our way.
            </p>
          </div>

          <div className="mt-[80px] grid grid-cols-1 gap-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="relative mb-3 h-[98px] w-[98px]">
                <span className="absolute inset-0 rounded-full bg-white/10 rounded-tl-none rounded-bl-none rounded-tr-[90px] rounded-br-[90px] w-[50px] left-[52px]" />
                <span className="relative z-[1] inline-block w-full text-center text-[98px] font-semibold leading-none">
                  1
                </span>
              </div>
              <h3 className="text-[30px] font-semibold leading-tight">
                Place Your
                <br />
                Order
              </h3>
              <p className="mt-3 text-[18px] leading-relaxed text-white/85">
                Use our online form, WhatsApp, Live chat, or email to submit
                order
              </p>

              <div className="pointer-events-none absolute right-[-24px] top-1/2 hidden h-36 -translate-y-1/2 lg:block">
                <span className="block h-full w-px bg-white/20" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="relative mb-3 h-[98px] w-[98px]">
                <span className="absolute inset-0 rounded-full bg-white/10 rounded-tl-none rounded-bl-none rounded-tr-[90px] rounded-br-[90px] w-[50px] left-[52px]" />
                <span className="relative z-[1] inline-block w-full text-center text-[98px] font-semibold leading-none">
                  2
                </span>
              </div>
              <h3 className="text-[30px] font-semibold leading-tight">
                Confirm
                <br />
                Payment
              </h3>
              <p className="mt-3 text-[18px] leading-relaxed text-white/85">
                Secure your order with an advance payment to initiate the
                process.
              </p>

              <div className="pointer-events-none absolute right-[-24px] top-1/2 hidden h-36 -translate-y-1/2 lg:block">
                <span className="block h-full w-px bg-white/20" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="relative mb-3 h-[98px] w-[98px]">
                <span className="absolute inset-0 rounded-full bg-white/10 rounded-tl-none rounded-bl-none rounded-tr-[90px] rounded-br-[90px] w-[50px] left-[52px]" />
                <span className="relative z-[1] inline-block w-full text-center text-[98px] font-semibold leading-none">
                  3
                </span>
              </div>
              <h3 className="text-[30px] font-semibold leading-tight">
                Expert Work
                <br />
                in Progress
              </h3>
              <p className="mt-3 text-[18px] leading-relaxed text-white/85">
                Our skilled tutors start working on your order promptly.
              </p>

              <div className="pointer-events-none absolute right-[-24px] top-1/2 hidden h-36 -translate-y-1/2 lg:block">
                <span className="block h-full w-px bg-white/20" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col items-center text-center">
              <div className="relative mb-3 h-[98px] w-[98px]">
                <span className="absolute inset-0 rounded-full bg-white/10 rounded-tl-none rounded-bl-none rounded-tr-[90px] rounded-br-[90px] w-[50px] left-[52px]" />
                <span className="relative z-[1] inline-block w-full text-center text-[98px] font-semibold leading-none">
                  4
                </span>
              </div>
              <h3 className="text-[30px] font-semibold leading-tight">
                On-Time
                <br />
                Delivery
              </h3>
              <p className="mt-3 text-[18px] leading-relaxed text-white/85">
                Receive your completed work or exam done on time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
