export const ALGORITHMS = {
  SM2: 'sm2',
  FSRS: 'fsrs',
  LEITNER: 'leitner'
} as const;

export const AI_MODELS = {
  OPENAI: {
    GPT_4_TURBO: 'gpt-4-turbo-preview',
    GPT_4: 'gpt-4',
    GPT_35_TURBO: 'gpt-3.5-turbo'
  },
  GEMINI: {
    PRO: 'gemini-pro',
    PRO_VISION: 'gemini-pro-vision'
  },
  PERPLEXITY: {
    CODELLAMA_70B: 'codellama-70b-instruct',
    MISTRAL_7B: 'mistral-7b-instruct'
  }
} as const;

export const QUALITY_LEVELS = {
  COMPLETE_BLACKOUT: 0,
  INCORRECT_EASY_RECALL: 1,
  INCORRECT_HARD_RECALL: 2,
  CORRECT_HARD_RECALL: 3,
  CORRECT_HESITATION: 4,
  PERFECT_RESPONSE: 5
} as const;
