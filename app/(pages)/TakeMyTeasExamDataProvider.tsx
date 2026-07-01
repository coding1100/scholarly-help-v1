"use client";

import React, { createContext, useContext, ReactNode } from "react";

interface TakeMyTeasExamPageData {
  heroSection?: any;
  ratings?: any;
  whySlider?: any;
  cardCarousel?: any;
  description?: any;
  guaranteedBlock?: any;
  customerReviews?: any;
  processSection?: any;
  success?: any;
  subjects?: any;
  academicPartners?: any;
  getQuote?: any;
  faq?: any;
  meta?: any;
}

const TakeMyTeasExamDataContext =
  createContext<TakeMyTeasExamPageData | null>(null);

export function TakeMyTeasExamDataProvider({
  children,
  data,
}: {
  children: ReactNode;
  data: TakeMyTeasExamPageData | null;
}) {
  return (
    <TakeMyTeasExamDataContext.Provider value={data}>
      {children}
    </TakeMyTeasExamDataContext.Provider>
  );
}

export function useTakeMyTeasExamData() {
  return useContext(TakeMyTeasExamDataContext);
}
