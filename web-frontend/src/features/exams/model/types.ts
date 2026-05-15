// Exam feature types - re-exported from foundation

export type {
  Exam,
  ExamDifficulty,
  ExamStatus,
  ExamType,
  ExamFilters,
  Question,
  RandomExamConfig,
  ExamStatistics,
  EnumOption,
} from '@/foundation/types/exam';

export type {
  StatCardData,
  QuestionType,
  QuestionOption,
  ExamQuestion,
  ExamDetails,
  ExamAnswer,
  ExamSubmission,
  ExamResult,
  SessionStatus,
  ExamSession,
} from '@/foundation/types/examTypes';

// Feature-specific types
export interface ExamQuestionAnswer {
  questionId: string;
  selectedOptionId?: string;
  answerText?: string;
  isFlagged: boolean;
  timeSpent: number;
}

export interface ExamNavigationState {
  currentIndex: number;
  totalQuestions: number;
  answeredQuestions: string[];
  flaggedQuestions: string[];
  visitedQuestions: string[];
}

export interface ExamTimerState {
  timeRemaining: number;
  isPaused: boolean;
  warningThreshold: number;
}

export interface ExamCameraState {
  isReady: boolean;
  error: string | null;
  stream: MediaStream | null;
}
