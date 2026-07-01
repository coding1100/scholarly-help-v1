"use client";

import React, { createContext, useContext, ReactNode } from "react";

interface TakeMyHesiExamPageData {
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

const TakeMyHesiExamDataContext =
  createContext<TakeMyHesiExamPageData | null>(null);

export function TakeMyHesiExamDataProvider({
  children,
  data,
}: {
  children: ReactNode;
  data: TakeMyHesiExamPageData | null;
}) {
  return (
    <TakeMyHesiExamDataContext.Provider value={data}>
      {children}
    </TakeMyHesiExamDataContext.Provider>
  );
}

export function useTakeMyHesiExamData() {
  return useContext(TakeMyHesiExamDataContext);
}
