import Hero from "@/components/common/Hero";
import Footer from "@/components/sections/Footer";
import SkillsSection from "@/components/sections/SkillsSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import WhySection from "@/components/sections/WhySection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import TokenSection from "@/components/sections/TokenSection";
import RoadMapSection from "@/components/sections/RoadMapSection";

export default function Home() {
  return (
    <div>
      <Hero />
      <SkillsSection />
      <Footer />
     
    </div>
  );
}