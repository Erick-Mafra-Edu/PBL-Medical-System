export interface Flashcard {
  id: string;
  userId: string;
  courseId: string;
  question: string;
  answer: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Spaced Repetition fields
  interval: number; // days until next review
  repetition: number; // number of times reviewed
  easeFactor: number; // SM2 ease factor
  nextReview: Date;
  lastReviewed?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFlashcardDTO {
  userId: string;
  courseId: string;
  question: string;
  answer: string;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface UpdateFlashcardDTO {
  question?: string;
  answer?: string;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface FlashcardReviewResult {
  flashcardId: string;
  quality: number; // 0-5 (SM2 quality rating)
  timeSpent: number; // seconds
  reviewedAt: Date;
}

export interface FlashcardStats {
  totalCards: number;
  dueToday: number;
  masteredCards: number;
  learningCards: number;
  averageRetention: number;
}
