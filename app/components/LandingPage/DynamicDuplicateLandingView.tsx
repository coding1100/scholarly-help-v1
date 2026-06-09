import MainLayout from "@/app/MainLayout";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import BelowFoldLanding from "@/app/components/LandingPage/BelowFoldLanding";
import DelayedBelowFold from "@/app/components/LandingPage/DelayedBelowFold";
import Subjects from "@/app/components/LandingPage/Subjects";
import ProductSchema from "@/app/components/ProductSchema";
import { TakeMyClassDataProvider } from "@/app/(pages)/TakeMyClassDataProvider";
import { TakeMyExamDataProvider } from "@/app/(pages)/TakeMyExamDataProvider";
import { TakeMyProctoredExamDataProvider } from "@/app/(pages)/TakeMyProctoredExamDataProvider";
import { examsSubjects } from "@/app/(pages)/exams/content";
import {
  dynamicLandingCanonicalUrl,
  resolveDuplicateLandingLayout,
  type DuplicateLandingLayout,
} from "@/app/lib/dynamicLandingPage";

type Props = {
  pageData: Record<string, unknown>;
  slug: string;
};

function LandingShell({
  pageData,
  layout,
}: {
  pageData: Record<string, unknown>;
  layout: DuplicateLandingLayout;
}) {
  const useHeroForm2 = !!pageData?.landingUseHeroForm2;

  return (
    <MainLayout>
      <HeroSection useHeroForm2={useHeroForm2} />
      <DelayedBelowFold>
        <BelowFoldLanding>
          {layout === "take-my-proctored-exam" ? (
            <Subjects defaultSubjects={examsSubjects} />
          ) : null}
        </BelowFoldLanding>
      </DelayedBelowFold>
    </MainLayout>
  );
}

export default function DynamicDuplicateLandingView({ pageData, slug }: Props) {
  const layout = resolveDuplicateLandingLayout(pageData);
  const productTitle =
    (pageData?.meta as { title?: string })?.title ||
    `Scholarly Help — ${String(pageData?.adminNavLabel || slug)}`;
  const metaDescription =
    (pageData?.meta as { description?: string })?.description ||
    "Expert academic help — assignments, exams, and classes.";
  const pageUrl = dynamicLandingCanonicalUrl(
    slug,
    pageData as { meta?: { canonicalUrl?: string } },
  );

  const schema = (
    <ProductSchema
      productTitle={productTitle}
      metaDescription={metaDescription}
      pageUrl={pageUrl}
    />
  );

  const shell = <LandingShell pageData={pageData} layout={layout} />;

  if (layout === "take-my-proctored-exam") {
    return (
      <TakeMyProctoredExamDataProvider data={pageData}>
        {schema}
        {shell}
      </TakeMyProctoredExamDataProvider>
    );
  }

  if (layout === "take-my-exam") {
    return (
      <TakeMyExamDataProvider data={pageData}>
        {schema}
        {shell}
      </TakeMyExamDataProvider>
    );
  }

  return (
    <TakeMyClassDataProvider data={pageData}>
      {schema}
      {shell}
    </TakeMyClassDataProvider>
  );
}
