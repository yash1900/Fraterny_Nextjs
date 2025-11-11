
import { useState, useEffect } from 'react';

/**
 * Network connection types
 */
export type ConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';

/**
 * Network status information
 */
export interface NetworkStatus {
  online: boolean;
  effectiveConnectionType: ConnectionType;
  saveDataEnabled: boolean;
  downlink: number | null;
  rtt: number | null;
}

/**
 * Hook to detect network status for adaptive loading decisions
 */
export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    online: true,
    effectiveConnectionType: 'unknown',
    saveDataEnabled: false,
    downlink: null,
    rtt: null,
  });

  useEffect(() => {
    // Basic online/offline detection
    const updateOnlineStatus = () => {
      setNetworkStatus(prevState => ({
        ...prevState,
        online: navigator.onLine
      }));
    };

    // Enhanced network information detection
    const updateConnectionStatus = () => {
      // Check if the Network Information API is available
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;

        if (connection) {
          setNetworkStatus({
            online: navigator.onLine,
            effectiveConnectionType: connection.effectiveType || 'unknown',
            saveDataEnabled: connection.saveData || false,
            downlink: connection.downlink || null,
            rtt: connection.rtt || null,
          });
        }
      }
    };

    // Initial status
    updateOnlineStatus();
    updateConnectionStatus();

    // Event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Connection change event if supported
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener('change', updateConnectionStatus);
      }
    }

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);

      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          connection.removeEventListener('change', updateConnectionStatus);
        }
      }
    };
  }, []);

  return networkStatus;
}
