import DesktopNavigation from './website-navigation/components/DesktopNavigation';
import Navigation from './website-navigation/components/Navigation';
import HeroSection from './home/HeroSection';
import NavalQuoteSection from './home/NavalQuoteSection';
import VillaLabSection from './home/VillaLabSection';
import OurValuesSection from './home/OurValuesSection';
import HowItWorksSection from './home/HowItWorksSection';
import Footer from './website-navigation/components/Footer';

export default function Home() {
  return (
    <div className="h-full w-full bg-white overflow-y-hidden">
      <Navigation />
      <Navigation />
      <HeroSection />
      <NavalQuoteSection />
      <VillaLabSection />
      <OurValuesSection />
      <HowItWorksSection />
      <Footer />
      
      {/* <Footer /> */}
    </div>
  );
}


