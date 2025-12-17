/**
 * FSRS (Free Spaced Repetition Scheduler) Algorithm
 * 
 * A modern algorithm that uses a probabilistic model of memory retention.
 * More sophisticated than SM-2 with better interval calibration.
 */

export interface FSRSCard {
  id: string;
  stability: number; // Memory stability
  difficulty: number; // Card difficulty (0-10)
  elapsedDays: number; // Days since last review
  scheduledDays: number; // Days until next review
  reps: number; // Number of reviews
  lapses: number; // Number of lapses
  state: 'new' | 'learning' | 'review' | 'relearning';
}

export interface FSRSResult {
  stability: number;
  difficulty: number;
  scheduledDays: number;
  state: 'new' | 'learning' | 'review' | 'relearning';
  nextReview: Date;
}

export class FSRSAlgorithm {
  // FSRS parameters (can be optimized through data)
  private static readonly WEIGHTS = [
    0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05,
    0.34, 1.26, 0.29, 2.61
  ];
  
  private static readonly DECAY = -0.5;
  private static readonly FACTOR = 0.9 ** (1 / this.DECAY) - 1;

  /**
   * Calculate next review using FSRS algorithm
   */
  static calculate(
    card: FSRSCard,
    rating: number, // 1=again, 2=hard, 3=good, 4=easy
    targetRetention: number = 0.9
  ): FSRSResult {
    let { stability, difficulty, state, reps, lapses } = card;

    // Update based on rating
    if (rating === 1) {
      // Again - card failed
      state = reps === 0 ? 'learning' : 'relearning';
      stability = this.calculateNewStability(stability, difficulty, rating);
      difficulty = this.calculateNewDifficulty(difficulty, rating);
      lapses += 1;
    } else {
      // Card passed
      if (state === 'new') state = 'learning';
      else if (state === 'learning' || state === 'relearning') state = 'review';
      
      stability = this.calculateNewStability(stability, difficulty, rating);
      difficulty = this.calculateNewDifficulty(difficulty, rating);
      reps += 1;
    }

    // Calculate interval based on retention target
    const interval = this.calculateInterval(stability, targetRetention);

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    return {
      stability: parseFloat(stability.toFixed(2)),
      difficulty: parseFloat(Math.max(1, Math.min(10, difficulty)).toFixed(2)),
      scheduledDays: interval,
      state,
      nextReview
    };
  }

  private static calculateNewStability(
    stability: number,
    difficulty: number,
    rating: number
  ): number {
    if (rating === 1) {
      return stability * Math.exp(this.WEIGHTS[11] * (difficulty - 1));
    }
    return stability * (1 + Math.exp(this.WEIGHTS[8]) *
      (11 - difficulty) *
      Math.pow(stability, this.WEIGHTS[9]) *
      (Math.exp((1 - rating) * this.WEIGHTS[10]) - 1));
  }

  private static calculateNewDifficulty(
    difficulty: number,
    rating: number
  ): number {
    const delta = rating - 3;
    return difficulty - this.WEIGHTS[6] * delta;
  }

  private static calculateInterval(
    stability: number,
    targetRetention: number
  ): number {
    return Math.round(
      stability * (Math.pow(targetRetention, 1 / this.DECAY) - 1)
    );
  }

  /**
   * Get initial card state
   */
  static getInitialState(): Omit<FSRSResult, 'nextReview'> {
    return {
      stability: 1,
      difficulty: 5,
      scheduledDays: 0,
      state: 'new'
    };
  }

  static getName(): string {
    return 'FSRS';
  }

  static getDescription(): string {
    return 'Free Spaced Repetition Scheduler with probabilistic model';
  }
}
