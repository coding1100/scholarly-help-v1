"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { AcademicResearchPageData } from "@/app/components/MainToolLanding/MainToolContent";

const AcademicResearchDataContext =
  createContext<AcademicResearchPageData | null>(null);

export function AcademicResearchDataProvider({
  children,
  data,
}: {
  children: ReactNode;
  data: AcademicResearchPageData;
}) {
  return (
    <AcademicResearchDataContext.Provider value={data}>
      {children}
    </AcademicResearchDataContext.Provider>
  );
}

export function useAcademicResearchData() {
  return useContext(AcademicResearchDataContext);
}
