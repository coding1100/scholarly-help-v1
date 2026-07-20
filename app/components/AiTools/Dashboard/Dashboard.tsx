import HeroSection from "./HeroSection";
import ToolGrid from "./ToolGrid";
import FeaturesSection from "./FeaturesSection";
import TrustSection from "./TrustSection";
import CTASection from "./CTASection";

export default function Dashboard() {
  return (
    <main className="overflow-y-auto h-full bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <HeroSection />
      <ToolGrid />
      <FeaturesSection />
      {/* <TrustSection /> */}
      <CTASection />
    </main>
  );
}
