import {
  AcademicResearchPageData,
  defaultAcademicResearchContent,
} from "./MainToolContent";
import { PickToolItem } from "./pickTabUtils";

function mergeArray<T>(fallback: T[], fromDb?: T[] | null): T[] {
  if (Array.isArray(fromDb) && fromDb.length > 0) return fromDb;
  return fallback;
}

function mergeArrayByIndex<T extends object>(fallback: T[], fromDb?: T[] | null): T[] {
  if (!Array.isArray(fromDb) || fromDb.length === 0) return fallback;
  return fromDb.map((item, index) => ({
    ...(fallback[index] ?? {}),
    ...item,
  }));
}

function mergeObject<T extends Record<string, unknown>>(
  fallback: T,
  fromDb?: Partial<T> | null,
): T {
  if (!fromDb || typeof fromDb !== "object") return fallback;
  return { ...fallback, ...fromDb };
}

function mergeTabTools(
  defaultTabTools: Record<string, PickToolItem[]>,
  fromDb?: Record<string, PickToolItem[]> | null,
): Record<string, PickToolItem[]> {
  const merged = { ...defaultTabTools };

  if (fromDb && typeof fromDb === "object") {
    for (const [slug, tools] of Object.entries(fromDb)) {
      if (Array.isArray(tools) && tools.length > 0) {
        const defaults = defaultTabTools[slug] || [];
        merged[slug] = tools.map((item, index) => ({
          ...(defaults[index] ?? {}),
          ...item,
        }));
      }
    }
  }

  return merged;
}

export function mergeAcademicResearchContent(
  pageData?: Partial<AcademicResearchPageData> | null,
): AcademicResearchPageData {
  if (!pageData || Object.keys(pageData).length === 0) {
    return defaultAcademicResearchContent;
  }

  return {
    ...defaultAcademicResearchContent,
    ...pageData,
    meta: mergeObject(defaultAcademicResearchContent.meta, pageData.meta),
    heroSection: {
      ...defaultAcademicResearchContent.heroSection,
      ...pageData.heroSection,
      specs: mergeArray(
        defaultAcademicResearchContent.heroSection.specs,
        pageData.heroSection?.specs,
      ),
    },
    helpSection: mergeObject(
      defaultAcademicResearchContent.helpSection,
      pageData.helpSection,
    ),
    pickSection: {
      ...defaultAcademicResearchContent.pickSection,
      ...pageData.pickSection,
      tabs: mergeArray(
        defaultAcademicResearchContent.pickSection.tabs,
        pageData.pickSection?.tabs,
      ),
      tools: mergeArrayByIndex(
        defaultAcademicResearchContent.pickSection.tools,
        pageData.pickSection?.tools,
      ),
      tabTools: mergeTabTools(
        defaultAcademicResearchContent.pickSection.tabTools,
        pageData.pickSection?.tabTools,
      ),
    },
    dashboardSection: {
      ...defaultAcademicResearchContent.dashboardSection,
      ...pageData.dashboardSection,
      features: mergeArray(
        defaultAcademicResearchContent.dashboardSection.features,
        pageData.dashboardSection?.features,
      ),
      stats: mergeArray(
        defaultAcademicResearchContent.dashboardSection.stats,
        pageData.dashboardSection?.stats,
      ),
      history: mergeArray(
        defaultAcademicResearchContent.dashboardSection.history,
        pageData.dashboardSection?.history,
      ),
    },
    whySection: {
      ...defaultAcademicResearchContent.whySection,
      ...pageData.whySection,
      items: mergeArray(
        defaultAcademicResearchContent.whySection.items,
        pageData.whySection?.items,
      ),
    },
    cardsSection: {
      ...defaultAcademicResearchContent.cardsSection,
      ...pageData.cardsSection,
      cards: mergeArrayByIndex(
        defaultAcademicResearchContent.cardsSection.cards,
        pageData.cardsSection?.cards,
      ),
    },
    faq: mergeArray(defaultAcademicResearchContent.faq, pageData.faq),
  };
}
