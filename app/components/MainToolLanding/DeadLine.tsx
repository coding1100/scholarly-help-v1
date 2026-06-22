import { FC } from "react";

interface DeadLineProps {}

const DeadLine: FC<DeadLineProps> = () => {
    return (
        <div className="bg-[#3D3D5E]">
            <div className="w-full max-w-7xl container py-10 sm:py-14 lg:py-[70px] px-4 sm:px-8 lg:px-14 mx-auto flex flex-col items-center justify-center text-center">
                <p
                    className="text-white text-[26px] sm:text-[28px] md:text-3xl lg:text-[42px] font-bold max-w-4xl"
                    style={{ lineHeight: "1.2" }}
                >
                    Your{" "}
                    <span
                        className="bg-[#5A5BE0] rounded-full px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 md:-rotate-6 inline-block font-semibold whitespace-nowrap mx-1 sm:mx-2"
                        style={{
                            boxShadow:
                                "rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px",
                        }}
                    >
                        Deadline
                    </span>{" "}
                    Won&apos;t wait
                </p>
                <p className="text-white text-sm sm:text-base text-center mt-4 sm:mt-5 mb-6 sm:mb-8 max-w-2xl px-2">
                    Use a free tool to get started in 30 seconds — or speak to an expert right now.
                </p>
                <div className="w-full max-w-xl sm:max-w-none flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 px-2 sm:px-0">
                    <button className="w-full sm:w-auto bg-secondary-400 border border-secondary-400 text-white text-base sm:text-lg lg:text-xl font-medium py-3 sm:py-4 px-6 sm:px-7 rounded-md text-center">
                        Try a Free Tool
                    </button>
                    <button className="w-full sm:w-auto bg-transparent border border-white text-white text-base sm:text-lg lg:text-xl font-medium py-3 sm:py-4 px-6 sm:px-7 rounded-md text-center">
                        Talk To an Expert
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeadLine;
