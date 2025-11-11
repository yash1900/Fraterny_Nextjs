// /src/components/quest-landing/sections/Hero.styles.ts

// We can create reusable class constants to keep our Tailwind classes organized
export const heroStyles = {
  // Changed to white background, relative positioning for absolute children
  container: "relative w-full min-h-screen p-6 overflow-hidden flex flex-col justify-start pt-16",
  
  // New bottom gradient element
  bottomGradient: "absolute bottom-0 left-0 right-0 h-[40%] z-0",
  
  // Background gradient style remains the same, but will only be applied to the bottom portion
  
  // Removed the ellipse since we're changing the design approach
  
  // Moved higher in z-index to be above the gradient
  content: "relative z-10 max-w-xl",
  
  // Changed text color to dark
  greeting: "font-gilroy-regular text-[54px] leading-none text-gray-900 m-0 mb-2",
  
  // Changed title styling to match design
  title: "font-gilroy-bold text-[72px] leading-none tracking-tighter text-black m-0 mb-4",
  
  // Changed text color to dark
  subtitle: "font-gilroy-regular text-[36px] leading-none text-gray-900 m-0 mb-2",
  
  // Changed text color to dark
  highlight: "font-gilroy-bold text-[40px] leading-none text-black m-0 mb-2",
  
  // Changed text color to dark
  closing: "font-gilroy-regular text-[36px] leading-none text-gray-900 m-0 mb-8",
  
  // Updated button to be on the blue gradient
  button: "w-[160px] h-[60px] border-2 border-white rounded-[30px] bg-sky-400/30 text-white transition-all hover:bg-white/10 cursor-pointer"
};

// For the gradient background, we'll use this style only for the bottom portion
export const heroBackgroundStyle = {
  background: "radial-gradient(50% 50% at 50% 50%, #0C45F0 0%, #41D9FF 50.96%, #48B9D8 100%)"
};