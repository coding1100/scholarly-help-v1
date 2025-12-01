"use client";

import React from "react";

const Star: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" fill="#FFB400"/>
  </svg>
);

// Simple brand marks as inline SVGs (lightweight, no external requests)
const SitejabberIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fill="#6A3CF7" d="M12 2l2.2 6.8H21l-5.4 3.9 2.1 6.9L12 16.3 6.3 19.6l2.1-6.9L3 8.8h6.8L12 2z"/>
  </svg>
);

const GoogleIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.7 3.7-5.5 3.7-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.4l2.6-2.5C16.9 3 14.7 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c7.2 0 8.9-6.1 8.3-10.2H12z"/>
  </svg>
);

const TrustpilotIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fill="#00B67A" d="M12 2l2.9 6.6 7.1.6-5.4 4.6 1.7 7.1L12 17.5 5.7 21l1.7-7.1L2 9.2l7.1-.6L12 2z"/>
  </svg>
);

const ReviewsIoIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="#0B101A"/>
    <path d="M12 15.6l-3.8 2 1-4.2L6 10.4l4.3-.4L12 6l1.7 4 4.3.4-3.2 3 1 4.2-3.8-2z" fill="#87FFB7"/>
  </svg>
);

type Item = {
  id: string;
  icon: React.ReactNode;
  score: string;
  label: string;
};

const items: Item[] = [
  { id: "sitejabber", icon: <SitejabberIcon />, score: "4.9", label: "Sitejabber" },
  { id: "google", icon: <GoogleIcon />, score: "4.8", label: "Google Reviews" },
  { id: "trustpilot", icon: <TrustpilotIcon />, score: "4.9", label: "Trustpilot" },
  { id: "reviewsio", icon: <ReviewsIoIcon />, score: "4.9", label: "Review.io" },
];

const ReviewBar: React.FC = () => {
  return (
    <section aria-label="Customer ratings" className="w-full">
      <div className="mx-auto w-full max-w-screen-xl px-6">
        <div className="mx-auto w-full rounded-2xl border shadow-lg shadow-black/5" style={{ backgroundColor: "#FFFFFF", borderColor: "#EDEEF5" }}>
          <ul className="grid grid-cols-1 gap-6 px-6 py-4 sm:grid-cols-2 md:grid-cols-4 md:gap-0 md:divide-x" style={{ borderColor: "#F0F1F6" }}>
            {items.map((item, idx) => (
              <li key={item.id} className="flex items-center gap-3 md:justify-center md:px-6">
                <span aria-hidden="true">{item.icon}</span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-[#111318]">{item.score}</span>
                    <div className="flex items-center" aria-label={`${item.score} out of 5 stars`}>
                      <Star /><Star /><Star /><Star /><Star />
                    </div>
                  </div>
                  <span className="text-[12px] text-[#6A6F7A]">{item.label}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ReviewBar;


