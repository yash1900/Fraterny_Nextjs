// sectionHelpers.ts

export const sectionIds = [
  "emotional",
  "mind",
  "findings",
  "subjects",
  "quotes",
  "films",
  "books",
  "work",
  "pdf-report"
];

export const getSectionTitle = (sectionId: string): string => {
  const titles: Record<string, string> = {
    emotional: "Your Emotional Signature",
    mind: "Mind Card",
    findings: "Thought Provoking Findings",
    subjects: "Subjects You Should Explore",
    quotes: "Philosophical Mirrors",
    films: "Films That Will Hit Closer",
    books: "Books That Will Resonate",
    work: "Work Predictions",
    "pdf-report": "Your Complete Report"
  };
  
  return titles[sectionId] || sectionId;
};