import { QuestSession, QuestionResponse, HonestyTag } from '../types/types';

// Local storage keys
const STORAGE_KEYS = {
  SESSION: 'fraterny_quest_session',
  RESPONSES: 'fraterny_quest_responses',
  SETTINGS: 'fraterny_quest_settings'
};

// Type for quest settings
interface QuestSettings {
  theme?: 'light' | 'dark';
  animationsEnabled?: boolean;
  showTags?: boolean;
  lastSectionId?: string;
}

/**
 * Save the current session to local storage
 */
export const saveSessionToStorage = (session: QuestSession): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save session to local storage:', error);
  }
};

/**
 * Load the session from local storage
 */
export const loadSessionFromStorage = (): QuestSession | null => {
  try {
    const sessionData = localStorage.getItem(STORAGE_KEYS.SESSION);
    return sessionData ? JSON.parse(sessionData) : null;
  } catch (error) {
    console.error('Failed to load session from local storage:', error);
    return null;
  }
};

/**
 * Save a single response to local storage
 */
export const saveResponseToStorage = (
  questionId: string,
  response: string,
  tags?: HonestyTag[]
): void => {
  try {
    // Load existing responses
    const existingData = localStorage.getItem(STORAGE_KEYS.RESPONSES);
    const responses: Record<string, QuestionResponse> = existingData 
      ? JSON.parse(existingData) 
      : {};
    
    // Add new response
    responses[questionId] = {
      questionId,
      response,
      tags,
      timestamp: new Date().toISOString()
    };
    
    // Save updated responses
    localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));
  } catch (error) {
    console.error('Failed to save response to local storage:', error);
  }
};

/**
 * Load all responses from local storage
 */
export const loadResponsesFromStorage = (): Record<string, QuestionResponse> | null => {
  try {
    const responsesData = localStorage.getItem(STORAGE_KEYS.RESPONSES);
    return responsesData ? JSON.parse(responsesData) : null;
  } catch (error) {
    console.error('Failed to load responses from local storage:', error);
    return null;
  }
};

/**
 * Save quest settings to local storage
 */
export const saveSettingsToStorage = (settings: Partial<QuestSettings>): void => {
  try {
    // Load existing settings
    const existingData = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const existingSettings: QuestSettings = existingData 
      ? JSON.parse(existingData) 
      : {
        theme: 'light',
        animationsEnabled: true,
        showTags: true
      };
    
    // Update settings
    const updatedSettings = { ...existingSettings, ...settings };
    
    // Save updated settings
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
  } catch (error) {
    console.error('Failed to save settings to local storage:', error);
  }
};

/**
 * Load quest settings from local storage
 */
export const loadSettingsFromStorage = (): QuestSettings => {
  try {
    const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settingsData 
      ? JSON.parse(settingsData) 
      : {
        theme: 'light',
        animationsEnabled: true,
        showTags: true
      };
  } catch (error) {
    console.error('Failed to load settings from local storage:', error);
    return {
      theme: 'light',
      animationsEnabled: true,
      showTags: true
    };
  }
};

/**
 * Clear all quest-related data for a fresh test start
 */
export const clearQuestTags = (): void => {
  try {
    const keysToRemove: string[] = [];
    
    // Find all quest-related keys to remove
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('quest_tags_') ||     // Tag data
        key === 'questSessionId' ||         // Previous session ID
        key === 'testid' ||                 // Previous test ID
        // key === 'fraterny_quest_session' || // Quest session
        key === 'fraterny_quest_responses'  // Quest responses
      )) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all found keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🧹 Cleared: ${key}`);
    });
    
    console.log(`✅ Cleared ${keysToRemove.length} quest-related keys`);
  } catch (error) {
    console.error('Failed to clear quest tags:', error);
  }
};

/**
 * Check if there's a saved session in local storage
 */
export const hasSavedSession = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEYS.SESSION) !== null;
  } catch (error) {
    console.error('Failed to check for saved session:', error);
    return false;
  }
};