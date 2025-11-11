interface DeviceFingerprint {
  screen: string;
  colorDepth: number | string;
  timezone: string;
  language: string;
  platform: string;
  userAgent: string;
  touchSupport: string;
}

interface DeviceIdentifier {
  ip: string;
  deviceHash: string;
  fingerprint: DeviceFingerprint;
}

/**
 * Get device fingerprint - simplified version for reliability
 */
export const getDeviceFingerprint = (): DeviceFingerprint => {
  return {
    screen: (typeof screen !== 'undefined' && screen.width && screen.height) 
      ? `${screen.width}x${screen.height}` 
      : 'unknown',
    
    colorDepth: (typeof screen !== 'undefined' && screen.colorDepth) 
      ? screen.colorDepth 
      : 'unknown',
    
    timezone: (() => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch {
        return 'UTC';
      }
    })(),
    
    language: navigator.language || 'unknown',
    platform: navigator.platform || 'unknown',
    userAgent: navigator.userAgent || 'unknown',
    touchSupport: 'ontouchstart' in window ? 'touch' : 'no-touch'
  };
};

/**
 * Create a hash from the fingerprint data
 */
export const createDeviceHash = (fingerprint: DeviceFingerprint): string => {
  const fingerprintString = Object.entries(fingerprint)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${String(value)}`)
    .join('|');
  
  let hash = 0;
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
};

/**
 * Get user's IP address
 */
export const getUserIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown-ip';
  } catch (error) {
    console.error('Failed to get IP address:', error);
    return 'unknown-ip';
  }
};

/**
 * Get complete device identifier (IP + Fingerprint)
 */
export const getDeviceIdentifier = async (): Promise<DeviceIdentifier> => {
  const fingerprint = getDeviceFingerprint();
  const deviceHash = createDeviceHash(fingerprint);
  const ip = await getUserIP();
  
  return {
    ip,
    deviceHash,
    fingerprint
  };
};

