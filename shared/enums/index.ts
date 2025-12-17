export enum QualityLevel {
  COMPLETE_BLACKOUT = 0,
  INCORRECT_EASY_RECALL = 1,
  INCORRECT_HARD_RECALL = 2,
  CORRECT_HARD_RECALL = 3,
  CORRECT_HESITATION = 4,
  PERFECT_RESPONSE = 5
}

export enum Algorithm {
  SM2 = 'sm2',
  FSRS = 'fsrs',
  LEITNER = 'leitner'
}

export enum SourceType {
  OBSIDIAN = 'obsidian',
  NOTION = 'notion',
  MANUAL = 'manual',
  UPLOAD = 'upload'
}
