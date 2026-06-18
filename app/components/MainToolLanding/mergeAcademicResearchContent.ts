import {
  AcademicResearchPageData,
  defaultAcademicResearchContent,
} from "./MainToolContent";
import {
  PickToolItem,
  buildDefaultTabTools,
} from "./pickTabUtils";

function mergeArray<T>(fallback: T[], fromDb?: T[] | null): T[] {
  if (Array.isArray(fromDb) && fromDb.length > 0) return fromDb;
  return fallback;
}

function mergeObject<T extends Record<string, unknown>>(
  fallback: T,
  fromDb?: Partial<T> | null,
): T {
  if (!fromDb || typeof fromDb !== "object") return fallback;
  return { ...fallback, ...fromDb };
}

function mergeTabTools(
  allTools: PickToolItem[],
  fromDb?: Record<string, PickToolItem[]> | null,
): Record<string, PickToolItem[]> {
  const defaults = buildDefaultTabTools(allTools);
  const merged = { ...defaults };

  if (fromDb && typeof fromDb === "object") {
    for (const [slug, tools] of Object.entries(fromDb)) {
      if (Array.isArray(tools) && tools.length > 0) {
        merged[slug] = tools;
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
      tools: mergeArray(
        defaultAcademicResearchContent.pickSection.tools,
        pageData.pickSection?.tools,
      ),
      tabTools: mergeTabTools(
        mergeArray(
          defaultAcademicResearchContent.pickSection.tools,
          pageData.pickSection?.tools,
        ),
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
      cards: mergeArray(
        defaultAcademicResearchContent.cardsSection.cards,
        pageData.cardsSection?.cards,
      ),
    },
    faq: mergeArray(defaultAcademicResearchContent.faq, pageData.faq),
  };
}
