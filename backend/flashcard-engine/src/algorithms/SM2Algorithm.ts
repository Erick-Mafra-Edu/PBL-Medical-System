/**
 * SM-2 (SuperMemo 2) Algorithm Implementation
 * 
 * The SM-2 algorithm calculates optimal intervals for flashcard reviews
 * based on the quality of recall (0-5 scale).
 * 
 * Quality scale:
 * 0 - Complete blackout
 * 1 - Incorrect response; correct answer seemed familiar
 * 2 - Incorrect response; correct answer seemed easy to recall
 * 3 - Correct response; recalled with serious difficulty
 * 4 - Correct response; recalled after some hesitation
 * 5 - Perfect response; immediate recall
 */

export interface Flashcard {
  id: string;
  interval: number; // Days until next review
  repetition: number; // Number of times reviewed
  easeFactor: number; // Ease factor (default: 2.5)
}

export interface SM2Result {
  interval: number;
  repetition: number;
  easeFactor: number;
  nextReview: Date;
}

export class SM2Algorithm {
  private static readonly MIN_EASE_FACTOR = 1.3;
  private static readonly DEFAULT_EASE_FACTOR = 2.5;

  /**
   * Calculate next review parameters using SM-2 algorithm
   * @param card Current flashcard state
   * @param quality Quality of recall (0-5)
   * @returns Updated flashcard parameters
   */
  static calculate(card: Flashcard, quality: number): SM2Result {
    let { interval, repetition, easeFactor } = card;

    // Quality < 3 means the card needs to be repeated
    if (quality < 3) {
      interval = 1;
      repetition = 0;
    } else {
      // Update interval based on repetition count
      if (repetition === 0) {
        interval = 1;
      } else if (repetition === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetition += 1;
    }

    // Update ease factor
    easeFactor = Math.max(
      this.MIN_EASE_FACTOR,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    return {
      interval,
      repetition,
      easeFactor: parseFloat(easeFactor.toFixed(2)),
      nextReview
    };
  }

  /**
   * Get initial flashcard state
   */
  static getInitialState(): Omit<SM2Result, 'nextReview'> {
    return {
      interval: 0,
      repetition: 0,
      easeFactor: this.DEFAULT_EASE_FACTOR
    };
  }

  /**
   * Get algorithm name
   */
  static getName(): string {
    return 'SM2';
  }

  /**
   * Get algorithm description
   */
  static getDescription(): string {
    return 'SuperMemo 2 algorithm for spaced repetition';
  }
}
