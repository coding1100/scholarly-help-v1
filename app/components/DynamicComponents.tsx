import dynamic from "next/dynamic";
import { PulseLoader } from "react-spinners";

// Shared loading states with proper loading components
const LoadingLarge = () => (
  <div className="flex justify-center items-center h-96 bg-gray-50">
    <PulseLoader color="#565add" />
  </div>
);

const LoadingMedium = () => (
  <div className="flex justify-center items-center h-72 bg-gray-50">
    <PulseLoader color="#565add" />
  </div>
);

// Dynamic imports for shared components
export const DynamicAcademicPartner = dynamic(
  () => import("@/app/components/AcademicPartner/AcademicPartner"),
  { loading: LoadingLarge, suspense: true, ssr: true }
);

export const DynamicCustomerReviews = dynamic(
  () => import("@/app/components/CustomerReviews/CustomerReviews"),
  { loading: LoadingLarge, suspense: true, ssr: true }
);

export const DynamicExamType = dynamic(
  () => import("@/app/components/ExamType/ExamType"),
  { loading: LoadingLarge, suspense: true, ssr: true }
);

export const DynamicExcellenceProof = dynamic(
  () => import("@/app/components/ExcellenceProof/ExcellenceProof"),
  { loading: LoadingLarge, suspense: true, ssr: true }
);

export const DynamicFaq = dynamic(() => import("@/app/components/Faq/Faq"), {
  loading: LoadingMedium,
  suspense: true,
  ssr: true,
});

export const DynamicProcess = dynamic(
  () => import("@/app/components/Process/Process"),
  { loading: LoadingLarge, suspense: true, ssr: true }
);

export const DynamicQualities = dynamic(
  () => import("@/app/components/Qualities/Qualities"),
  { loading: LoadingMedium, suspense: true, ssr: true }
);

export const DynamicSamples = dynamic(
  () => import("@/app/components/Samples/Samples"),
  { loading: LoadingLarge, suspense: true, ssr: true }
);

export const DynamicSamplesAssignments = dynamic(
  () => import("@/app/components/SamplesAssignments/SamplesAssignments"),
  { loading: LoadingLarge, suspense: true, ssr: true }
);

export const DynamicSiteReviews = dynamic(
  () => import("@/app/components/SiteReviews/SiteReviews"),
  { loading: LoadingMedium, suspense: true, ssr: true }
);

export const DynamicSubjects = dynamic(
  () => import("@/app/components/Subjects/Subjects"),
  { loading: LoadingLarge, suspense: true, ssr: true }
);

export const DynamicVariousName = dynamic(
  () => import("@/app/components/VariousName/VariousName"),
  { loading: LoadingLarge, suspense: true, ssr: true }
);

export const DynamicWhyScholarly = dynamic(
  () => import("@/app/components/WhyScholarly/WhyScholarly"),
  { loading: LoadingLarge, suspense: true, ssr: false }
);

// Add any other shared components here...
