// constants.ts
import { ResultData } from './types';

export const tokens = {
  textDark: "#0A0A0A",
  textLight: "#FFFFFF",
  muted: "#6B7280",
  border: "#E6EAF2",
  accent: "#0C45F0",
  accent2: "#41D9FF",
  accent3: "#48B9D8",
  soft: "#F7F9FC",
};

export const CTA_HEIGHT = 60;

export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const DUR_SM = 0.18;
export const DUR_MD = 0.32;

export const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR_MD, ease: EASE_OUT, staggerChildren: 0.06 },
  },
};

export const MOCK_RESULT_DATA: ResultData = {
  session_id: "mock-session-123",
  user_id: "mock-user-456",
  completion_date: new Date().toISOString(),
  results: {
    "section 1": "You project calm intensity—ambitious, observant, and guarded until conviction clicks into motion.",
    "Mind Card": {
      name: "The Architect",
      personality: "#Strategic-Minded Individual",
      description: "A methodical thinker who builds systems and seeks elegant solutions.",
      attributes: ["self awareness", "collaboration", "conflict navigation", "risk appetite"],
      scores: ["82/100", "76/100", "71/100", "65/100"],
      insights: [
        "High self-reflection and emotional intelligence",
        "Prefers small, high-trust team environments",
        "Approaches conflict with diplomatic solutions",
        "Calculated risk-taker with thorough analysis"
      ]
    },
    findings: [
      "You hoard unfinished ideas until urgency forces elegant execution.",
      "You listen to patterns first, people second—useful, but sometimes misread as cold.",
      "You avoid small talk not from arrogance, but from conservation of focus.",
      "You under-share wins; your excellence is discoverable, not broadcast.",
      "You feel safest when plans are modular—Plan B is always pre-built."
    ],
    quotes: [
      { text: "What we dwell on is who we become.", author: "Marcus Aurelius" },
      { text: "The obstacle is the way.", author: "Ryan Holiday" },
      { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" }
    ],
    films: [
      { title: "Interstellar", description: "Explores themes of sacrifice and human connection across time and space.", imageUrl: "/film.svg" },
      { title: "The Social Network", description: "A study in ambition, innovation, and the cost of success.", imageUrl: "/film.svg" },
      { title: "Her", description: "An intimate look at connection in an increasingly digital world.", imageUrl: "/film.svg" }
    ],
    subjects: [
      { title: "Systems Thinking", description: "Understanding complex interconnections", matchPercentage: 92 },
      { title: "Behavioral Psychology", description: "Human decision-making patterns", matchPercentage: 87 },
      { title: "Strategic Design", description: "Intentional problem-solving frameworks", matchPercentage: 84 }
    ],
    astrology: {
      actualSign: "Capricorn",
      behavioralSign: "Virgo",
      description: "Your actual sign reflects ambition and structure, while your behavior shows analytical precision.",
      predictions: [
        { title: "You'll build a framework or system", likelihood: 78, reason: "Pattern recognition + systems thinking." },
        { title: "You'll publish a guide", likelihood: 59, reason: "Pattern memory + urge to compress chaos." },
        { title: "Sleep becomes a ritual", likelihood: 54, reason: "Performance dependency discovered via dips." }
      ]
    },
    books: [
      { title: "Range", author: "David Epstein" },
      { title: "Deep Work", author: "Cal Newport" },
      { title: "Man's Search for Meaning", author: "Viktor Frankl" }
    ],
    actionItem: "Ship one imperfect artifact daily for 14 days. Log it and write a one-line reflection."
  }
};