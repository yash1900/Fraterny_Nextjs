export const isInAppBrowser = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || '';
  
  // Check for Instagram in-app browser
  const isInstagram = userAgent.includes('Instagram');
  
  // Check for Facebook in-app browser
  const isFacebook = userAgent.includes('FBAN') || userAgent.includes('FBAV') || userAgent.includes('FB_IAB');
  
  // Check for Twitter/X in-app browser
  const isTwitter = userAgent.includes('Twitter');
  
  // Check for LinkedIn in-app browser
  const isLinkedIn = userAgent.includes('LinkedInApp');
  
  // Check for Snapchat in-app browser
  const isSnapchat = userAgent.includes('Snapchat');
  
  // Check for TikTok in-app browser
  const isTikTok = userAgent.includes('TikTok') || userAgent.includes('Musical.ly');
  
  // Check for Gmail app browser
  const isGmail = userAgent.includes('GSA') || (userAgent.includes('Gmail') && userAgent.includes('Mobile'));
  
  // Check for WeChat in-app browser
  const isWeChat = userAgent.includes('MicroMessenger');
  
  // Check for Reddit in-app browser
  const isReddit = userAgent.includes('Reddit');
  
  // Check for Discord in-app browser
  const isDiscord = userAgent.includes('Discord');
  
  // Check for Telegram in-app browser
  const isTelegram = userAgent.includes('TelegramBot') || userAgent.includes('Telegram');
  
  // Check for WhatsApp in-app browser
  const isWhatsApp = userAgent.includes('WhatsApp');
  
  // Check for generic WebView
  const isWebView = userAgent.includes('WebView') || 
                    (userAgent.includes('wv)') && userAgent.includes('Mobile'));
  
  return isInstagram || isFacebook || isTwitter || isLinkedIn || 
         isSnapchat || isTikTok || isGmail || isWeChat || 
         isReddit || isDiscord || isTelegram || isWhatsApp || isWebView;
};

/**
 * Gets the name of the detected in-app browser
 */
export const getInAppBrowserName = (): string => {
  const userAgent = navigator.userAgent || navigator.vendor || '';
  
  if (userAgent.includes('Instagram')) return 'Instagram';
  if (userAgent.includes('FBAN') || userAgent.includes('FBAV') || userAgent.includes('FB_IAB')) return 'Facebook';
  if (userAgent.includes('Twitter')) return 'Twitter/X';
  if (userAgent.includes('LinkedInApp')) return 'LinkedIn';
  if (userAgent.includes('Snapchat')) return 'Snapchat';
  if (userAgent.includes('TikTok') || userAgent.includes('Musical.ly')) return 'TikTok';
  if (userAgent.includes('GSA') || (userAgent.includes('Gmail') && userAgent.includes('Mobile'))) return 'Gmail';
  if (userAgent.includes('MicroMessenger')) return 'WeChat';
  if (userAgent.includes('Reddit')) return 'Reddit';
  if (userAgent.includes('Discord')) return 'Discord';
  if (userAgent.includes('TelegramBot') || userAgent.includes('Telegram')) return 'Telegram';
  if (userAgent.includes('WhatsApp')) return 'WhatsApp';
  if (userAgent.includes('WebView')) return 'App';
  
  return 'App';
};

/**
 * Attempts to open the current URL in the default browser
 */
export const openInDefaultBrowser = (): void => {
  const currentUrl = window.location.href;
  const urlProtocol = window.location.protocol.replace(':', ''); // http or https
  const urlWithoutProtocol = currentUrl.replace(/^https?:\/\//, '');

  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    window.open(currentUrl, '_blank');
    setTimeout(() => {
      window.location.href = `x-safari-${currentUrl}`;
    }, 100);
  } else if (/Android/i.test(navigator.userAgent)) {
    const intentUrl = `intent://${urlWithoutProtocol}#Intent;action=android.intent.action.VIEW;scheme=${urlProtocol};package=com.android.chrome;end`;
    window.location.href = intentUrl;

    setTimeout(() => {
      window.open(currentUrl, '_system');
    }, 500);
  } else {
    window.open(currentUrl, '_blank');
  }
};

