import Image from "next/image";
import { Star } from "lucide-react";

// Import all images at the top (Next.js static imports)
import sitejabberLogo from "@/app/assets/Images/sidejabber.webp";
import googleLogo from "@/app/assets/Images/google.webp";
import trustpilotLogo from "@/app/assets/Images/Trustpilot.webp";
import reviewIoLogo from "@/app/assets/Images/review.webp";

export default function ReviewRatings() {
  return (
    <div className="xl:flex justify-center py-8 mt-[-96px]">
      <div
        className="max-w-7xl container py-6 px-12 rounded-lg lg:flex justify-between grid grid-cols-2 gap-6 bg-[#fff] "
        style={{ boxShadow: " 0px 11px 32px 0px #DFE5FF " }}
      >
        {/* Sitejabber */}
        <div className="flex items-center justify-center col-span-1">
          <div className="md:w-14 w-10 mr-3">
            <Image
              src={sitejabberLogo}
              alt="SiteJabber"
              width={56}
              height={56}
              loading="lazy"
              className="w-full h-auto"
            />
          </div>
          <div>
            <p className="md:text-lg text-sm font-semibold tracking-normal text-[#171717]">
              4.9
            </p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 md:w-5 md:h-5 ${
                    i < 4
                      ? "fill-yellow-400 text-yellow-400"
                      : i === 4
                      ? "fill-yellow-400/50 text-yellow-400"
                      : "fill-gray-300 text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="md:text-lg text-sm text-gray-600 tracking-normal">
              Sitejabber
            </p>
          </div>
        </div>

        {/* Google Reviews */}
        <div className="flex items-center justify-center col-span-1">
          <div className="md:w-14 w-10 mr-3">
            <Image
              src={googleLogo}
              alt="Google Reviews"
              width={56}
              height={56}
              loading="lazy"
              className="w-full h-auto"
            />
          </div>
          <div>
            <p className="md:text-lg text-sm font-semibold tracking-normal text-[#171717]">
              4.8
            </p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 md:w-5 md:h-5 ${
                    i < 4
                      ? "fill-yellow-400 text-yellow-400"
                      : i === 4
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-300 text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="md:text-lg text-sm text-gray-600 tracking-normal">
              Google Reviews
            </p>
          </div>
        </div>

        {/* Trustpilot */}
        <div className="flex items-center justify-center col-span-1">
          <div className="md:w-14 w-10 mr-3">
            <Image
              src={trustpilotLogo}
              alt="Trustpilot"
              width={56}
              height={56}
              loading="lazy"
              className="w-full h-auto"
            />
          </div>
          <div>
            <p className="md:text-lg text-sm font-semibold tracking-normal text-[#171717]">
              4.9
            </p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 md:w-5 md:h-5 ${
                    i < 4
                      ? "fill-yellow-400 text-yellow-400"
                      : i === 4
                      ? "fill-yellow-400/50 text-yellow-400"
                      : "fill-gray-300 text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="md:text-lg text-sm text-gray-600 tracking-normal">
              Trustpilot
            </p>
          </div>
        </div>

        {/* Review.io */}
        <div className="flex items-center justify-center col-span-1">
          <div className="md:w-14 w-10 mr-3">
            <Image
              src={reviewIoLogo}
              alt="Review.io"
              width={56}
              height={56}
              loading="lazy"
              className="w-full h-auto"
            />
          </div>
          <div>
            <p className="md:text-lg text-sm font-semibold tracking-normal text-[#171717]">
              4.9
            </p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 md:w-5 md:h-5 ${
                    i < 4
                      ? "fill-yellow-400 text-yellow-400"
                      : i === 4
                      ? "fill-yellow-400/50 text-yellow-400"
                      : "fill-gray-300 text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="md:text-lg text-sm text-gray-600 tracking-normal">
              Review.io
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
