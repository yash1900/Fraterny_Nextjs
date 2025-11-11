import { Question } from '../types/types';

export interface QuestionSection {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export const questSections: QuestionSection[] = [
  {
    id: 'section_1',
    title: 'Self',
    description: 'We start with some basic information about you',
    questions: [
      {
        id: 'q1_1',
        text: "What's your name?",
        difficulty: 'easy',
        type: 'text_input',
        category: 'personal_info',
        sectionId: 'section_1',
        placeholder: 'Your name',
        allowAnonymous: true,
        isInfo: true,
        infoText: 'Share your preferred name so I can address you properly. Press the toggle button below to stay Anonymous.'
      },
      {
        id: 'q1_2',
        text: "What's your email?",
        difficulty: 'easy',
        type: 'text_input',
        category: 'personal_info',
        sectionId: 'section_1',
        placeholder: 'To share a copy of the report',
        allowAnonymous: true,
        isInfo: true,
        infoText: 'I require your email id to share your detailed report. You can choose to remain anonymous if you prefer. But it is not recommended.'
      },
      {
        id: 'q1_3',
        text: "Your Age?",
        difficulty: 'easy',
        type: 'number_dropdown',
        options: Array.from({ length: 86 }, (_, i) => (i + 10).toString()),
        category: 'personal_info',
        sectionId: 'section_1',
        placeholder: 'Your age',
        //allowAnonymous: true,
        isInfo: true,
        infoText: 'Age is important to understand the life stage you are currently in. Your life stage plays a key role in determining your priorities and future outlook. While interpreting your psychology, it will help me map and compare your actual age with your mental age. It will give me more context when I combine it with your responses to other questions.'
      },
      {
        id: 'q1_4',
        text: "What's your gender?",
        difficulty: 'easy',
        type: 'multiple_choice',
        options: ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'],
        category: 'personal_info',
        sectionId: 'section_1',
        isInfo: true,
        infoText: 'Your gender when combined with your cultural context, your personality traits and family dynamics can reveal details about your societal conditioning, your conformity or dissonance with societal and family norms and possible inner conflicts with your self identity.'
      },
      {
        id: 'q1_5',
        text: "Where have you lived the most in your life?",
        difficulty: 'easy',
        type: 'text_input',
        category: 'personal_info',
        sectionId: 'section_1',
        placeholder: 'Give more context to your upbringing in different locations.  You can write multiple locations and timelines.',
        enableCityAutocomplete: true,
        allowAnonymous: true, 
        isInfo: true,
        infoText: 'Your surroundings helps in understanding the cultural and environmental influences on your upbringing. When combined with other answers, this can provide valuable insights into your thinking patterns and behavior based on you living in a single location vs multiple locations, rural vs urban, developed country vs developing country, cosmopolitan society vs homogenous society. '
      }
    ]
  },
  {
    id: 'section_2',
    title: 'Grow',
    description: 'To know your roots',
    questions: [
      {
        id: 'q2_1',
        text: "Who did you grow up living with mostly?",
        difficulty: 'easy',
        type: 'text_input',
        category: 'family',
        sectionId: 'section_2',
        allowTags: true,
        placeholder: 'Just like you text a friend. You can write about multiple life stages if needed.',
        isInfo: true,
        infoText: 'The influence of people in your proximity when you are a child can cement your fundamental values and how you perceive the world. Your subconscious mind absorbs the most from the people who you were surrounded with when your brain was developing.'
      },
      {
        id: 'q2_2',
        text: "Is there anything about your childhood or family life you wish was different?",
        difficulty: 'hard',
        type: 'text_input',
        category: 'family',
        sectionId: 'section_2',
        allowTags: true,
        isInfo: true,
        infoText: 'Everyone is destined face emotional, psychological and situational consequences of the situations that were out of their control. This question gives me more context on what’s valuable to you, your unmet desires, possible motivations and even your emotional maturity.',
        placeholder: 'You can write more than 1 thing if you want. Even a small change you would have liked is helpful.'
      },
      {
        id: 'q2_3',
        text: "Who in your family do you fight with or disagree with the most? Why?",
        difficulty: 'easy',
        type: 'text_input',
        category: 'family',
        sectionId: 'section_2',
        allowTags: true,
        isInfo: true,
        infoText: 'You can also write about your past self when answering this question. Conflicts and reasons of conflict with close ones can reveal several aspects of your personality and mindset, especially when cross-linked with other answers. ',
        placeholder: 'More context will increase the accuracy of my analysis.'
      }
    ]
  },
  {
    id: 'section_3',
    title: 'Values',
    description: 'Understanding your priorities and aspirations',
    questions: [
      {
        id: 'q3_1',
        text: "What is your highest priority goal for this year/month?",
        difficulty: 'medium',
        type: 'text_input',
        category: 'goals',
        sectionId: 'section_3',
        allowTags: true,
        isInfo: true,
        infoText: 'Your near term goals tells me your dominant current motivation. This question has no purpose in isolation but becomes highly relevant when cross-linked with childhood dynamics, emotional loops, identity structure, and fear-reward mapping.',
        placeholder: 'Basically what you are looking forward to achieve. You can write more than 1 thing.'
      },
      {
        id: 'q3_2',
        text: "What matters the most to you? Write one sentence explaining why your top choice is most important.",
        difficulty: 'hard',
        type: 'ranking',
        options: ['Being Known/Respected', 'Family', 'Money', 'Peace'],
        category: 'values',
        sectionId: 'section_3',
        allowTags: true,
        isInfo: true,
        infoText: 'This question maps a personal value hierarchy. It helps extract your core motivations, Self-justification style, implied worldview, and internal contradictions in self-image.',
        additionalInput: {
          type: 'text_input',
          label: 'Explain why your top choice is most important to you'
        }
      },
      {
        id: 'q3_3',
        text: "If you could magically get 3 things in life right now, what would you ask for?",
        difficulty: 'medium',
        type: 'text_input',
        category: 'desires',
        sectionId: 'section_3',
        isInfo: true,
        infoText: 'Don’t hold back, this is your chance to manifest your desires. To keep your answers unbiased and my analysis accurate, I will have to refrain myself from explaining how I interpret your respons.',
        allowTags: true,
        placeholder: 'Think of anything— “Ability to fly”, “Meeting with Jeff Bezos”, “CEO of Google”, “I have everything I want, I don’t need anything”, “A pet named Jaws”'
      },
      {
        id: 'q3_4',
        text: "What's something you feel you understand better than most people around you?",
        difficulty: 'medium',
        type: 'text_input',
        category: 'self_perception',
        sectionId: 'section_3',
        allowTags: true,
        isInfo: true,
        infoText: 'You can write multiple things if you want. To keep your answers unbiased and my analysis accurate, I will have to refrain myself from explaining how I interpret your response.',
        placeholder: 'It can be anything— “I am better at solving Rubics Cube”, “Reading People’s emotions”, “Financial Modelling”, “Critical thinking”, “Building Profitable Businesses”, “Pokemon Go cards”'
      },
      {
        id: 'q3_5',
        text: "If you could become the best in the world at one thing, what would it be? And what would you do after becoming the best?",
        difficulty: 'medium',
        type: 'text_input',
        category: 'ambition',
        sectionId: 'section_3',
        allowTags: true,
        isInfo: true,
        infoText: 'The more details you give, the more accurate I’ll be. To keep your answers unbiased and my analysis accurate, I will have to refrain myself from explaining how I interpret your response.',
        placeholder: 'Again, Anything you can think of.'
      },
      {
        id: 'q3_6',
        text: "Who's someone (alive or not) that really inspires you? What is it about them that connects with you personally?",
        difficulty: 'hard',
        type: 'text_input',
        category: 'inspiration',
        sectionId: 'section_3',
        allowTags: true,
        isInfo: true,
        infoText: 'This question targets the ideal-self blueprint. The person chosen as a role model acts as a mirror or missing piece: either aspirational or compensatory.',
        placeholder: 'It can be a celebrity, family member, fictional character, or even a friend.'
      }
    ]
  },
  {
    id: 'section_4',
    title: 'Behavior',
    description: 'Understanding your habits and emotional responses',
    questions: [
      {
        id: 'q4_1',
        text: "What's a habit you have that others say is bad, But you feel it's helping you in some way?",
        difficulty: 'medium',
        type: 'text_input',
        category: 'habits',
        sectionId: 'section_4',
        isInfo: true,
        infoText: 'This question reveals ideological independence, moral divergence, and resistance to conformity.',
        placeholder: 'Examples: Sleeping late, overthinking, isolating, being blunt, etc.'
      },
      {
        id: 'q4_2',
        text: "Is there something you do regularly that you know is not good for you, but you can't or don't want to stop?",
        difficulty: 'medium',
        type: 'text_input',
        category: 'habits',
        sectionId: 'section_4',
        isInfo: true,
        infoText: 'This question reveals Compulsion loops, Emotional dependencies, Subconscious trade-offs. ',
        placeholder: 'Be honest to yourself. It can be small or big.'
      },
      {
        id: 'q4_3',
        text: "What's one emotion you find hard to show others? Why do you think that is?",
        difficulty: 'medium',
        type: 'text_input',
        category: 'emotions',
        sectionId: 'section_4',
        isInfo: true,
        infoText: 'Answering this question requires critical self introspection. This question has no purpose in isolation but becomes highly relevant when cross-linked with your worldview and self identity.',
        placeholder: 'Examples: Sadness, jealousy, fear, anger, softness, etc.'
      },
      {
        id: 'q4_4',
        text: "Are you proud of yourself as a person right now?",
        difficulty: 'hard',
        type: 'text_input',
        category: 'self_perception',
        sectionId: 'section_4',
        allowTags: true,
        isInfo: true,
        infoText: 'This question uncovers identity alignment, internal value coherence and several other insights when cross-linked with your answers on aspirations, self image and values.',
        placeholder: 'If yes, what makes you proud? If no, what’s missing?'
      }
    ]
  },
  {
    id: 'section_5',
    title: 'Identity',
    description: 'Understanding how you see yourself and how others see you',
    questions: [
      {
        id: 'q5_1',
        text: "How do you think your close friends describe you when you're not around?",
        difficulty: 'medium',
        type: 'text_input',
        category: 'self_perception',
        sectionId: 'section_5',
        allowTags: true,
        isInfo: true,
        infoText: 'This question explores the projected identity vs perceived identity gap. It brings out social awareness, emotional transparency and truth masking behavior.',
        placeholder: 'Try to guess as honestly as possible.'
      },
      {
        id: 'q5_2',
        text: "If you had to describe your personality in one sentence, what would you say?",
        difficulty: 'medium',
        type: 'text_input',
        category: 'self_perception',
        sectionId: 'section_5',
        allowTags: true,
        isInfo: true,
        infoText: 'This question tests self-concept clarity, emotional honesty, self-storytelling ability in a compressed form and several other variables when cross-linked with other answers.',
        placeholder: 'Think of how you would explain yourself to someone you are meeting for the first time. '
      },
      {
        id: 'q5_3',
        text: "What's something you wish people understood about you more clearly?",
        difficulty: 'medium',
        type: 'text_input',
        category: 'self_perception',
        sectionId: 'section_5',
        allowTags: true,
        isInfo: true,
        infoText: 'This question reveals the part of the self that feels unseen, misjudged, or misunderstood. ',
        placeholder: 'Detailed answer will improve the analysis.'
      }
    ]
  }
];

// Helper function to get all questions in a flat array
export const getAllQuestions = (): Question[] => {
  return questSections.flatMap(section => section.questions);
};

// Helper function to get questions by difficulty
export const getQuestionsByDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): Question[] => {
  return getAllQuestions().filter(q => q.difficulty === difficulty);
};

// Helper function to get questions by section
export const getQuestionsBySection = (sectionId: string): Question[] => {
  const section = questSections.find(s => s.id === sectionId);
  return section ? section.questions : [];
};

// Summary counts
export const questionSummary = {
  totalQuestions: getAllQuestions().length,
  easyQuestions: getQuestionsByDifficulty('easy').length,
  mediumQuestions: getQuestionsByDifficulty('medium').length,
  hardQuestions: getQuestionsByDifficulty('hard').length,
  sectionCount: questSections.length,
  estimatedTimeMinutes: {
    min: 10,
    max: 15
  }
};

export default questSections;