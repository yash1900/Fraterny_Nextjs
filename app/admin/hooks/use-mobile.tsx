// import * as React from "react"

// const MOBILE_BREAKPOINT = 768

// export function useIsMobile() {
//   const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

//   React.useEffect(() => {
//     const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
//     const onChange = () => {
//       setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
//     }
//     mql.addEventListener("change", onChange)
//     setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
//     return () => mql.removeEventListener("change", onChange)
//   }, [])

//   return !!isMobile
// }

import * as React from "react"

const MOBILE_BREAKPOINT = 768
const DEBOUNCE_DELAY = 100 // ms

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function useIsMobile() {
  // Always initialize as false to ensure SSR and first client render match
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Detect actual mobile state after mount
    const initialValue = window.innerWidth < MOBILE_BREAKPOINT;
    if (initialValue !== isMobile) {
      console.log(`📱 [useIsMobile] Initial detection`, {
        initialValue,
        innerWidth: window.innerWidth,
        timestamp: new Date().toISOString()
      });
      setIsMobile(initialValue);
    }

    // Set up listener for viewport changes
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const handleChange = () => {
      const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT;
      if (newIsMobile !== isMobile) {
        console.log(`📱 [useIsMobile] Viewport changed:`, {
          oldValue: isMobile,
          newValue: newIsMobile,
          innerWidth: window.innerWidth,
          timestamp: new Date().toISOString()
        });
        setIsMobile(newIsMobile);
      }
    };
    
    // Debounce the change handler
    const debouncedChange = debounce(handleChange, DEBOUNCE_DELAY);
    
    mql.addEventListener("change", debouncedChange);
    return () => mql.removeEventListener("change", debouncedChange);
  }, []); // Empty deps - run once after mount

  return isMobile;
}