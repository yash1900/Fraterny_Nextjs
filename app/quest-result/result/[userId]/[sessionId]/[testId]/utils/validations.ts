// validations.ts
import { ResultData } from './types';

export const validateResultData = (data: any): ResultData => {
  // 🎯 Parse results if it's a string
  let parsedResults = data.results;
  
  if (typeof parsedResults === 'string') {
    try {
      parsedResults = JSON.parse(parsedResults);
    } catch (parseError) {
      console.error('❌ Failed to parse results:', parseError);
      // Try to fix common typo (personlity → personality)
      try {
        const cleanedResults = parsedResults.replace('"personlity":', '"personality":');
        parsedResults = JSON.parse(cleanedResults);
      } catch (finalError) {
        console.error('❌ Complete parsing failure:', finalError);
        parsedResults = {}; // Fallback to empty object
      }
    }
  }

  const mindCardData = parsedResults?.["Mind Card"];

  const validated: ResultData = {
    session_id: data.session_id || 'unknown',
    user_id: data.user_id,
    completion_date: data.completion_date || new Date().toISOString(),
    pecentile: data.pecentile,
    qualityscore: data.qualityscore,
    referred_by: data.referred_by,
    results: {
      "section 1": parsedResults?.["section 1"] || '',

      "Mind Card": mindCardData ? {
        name: mindCardData.personality_type || "The Architect",
        personality: mindCardData.personlity || mindCardData.personality || "#Game-Styled Mindcard",
        description: mindCardData.description || "A methodical thinker who builds systems and seeks elegant solutions.",
        attributes: mindCardData.attribute || mindCardData.attributes || ["self awareness", "collaboration", "conflict navigation", "risk appetite"],
        scores: mindCardData.score || mindCardData.scores || ["50/100", "50/100", "50/100", "50/100"],
        insights: mindCardData.insight || mindCardData.insights || ["Analysis in progress...", "Analysis in progress...", "Analysis in progress...", "Analysis in progress..."]
      } : {
        name: "User",
        personality: "#Game-Styled Mindcard",
        description: "Loading analysis...",
        attributes: ["self awareness", "collaboration", "conflict navigation", "risk appetite"],
        scores: ["50/100", "50/100", "50/100", "50/100"],
        insights: ["Analysis in progress...", "Analysis in progress...", "Analysis in progress...", "Analysis in progress..."]
      },

      findings: Array.isArray(parsedResults?.findings) ? parsedResults.findings : [],
      quotes: Array.isArray(parsedResults?.quotes) ? parsedResults.quotes : [],
      films: Array.isArray(parsedResults?.films) ? parsedResults.films.map((film: any) => ({
        title: film.title || '',
        description: film.description || '',
        imageUrl: `/film.svg`
      })) : [],
      subjects: Array.isArray(parsedResults?.subjects) ? parsedResults.subjects : [],
      astrology: parsedResults?.astrology || null,
      books: Array.isArray(parsedResults?.books) ? parsedResults.books : [],
      actionItem: parsedResults?.actionItem || ''
    }
  };

  return validated;
};