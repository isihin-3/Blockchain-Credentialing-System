import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { TrustArchitecture } from "@/components/TrustArchitecture";
import { InfoCards } from "@/components/InfoCards";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <Hero />
      <TrustArchitecture />
      <InfoCards />
      <Footer />
    </div>
  );
};

export default Index;
