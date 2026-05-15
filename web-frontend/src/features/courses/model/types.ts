// Courses feature types - re-exported from foundation & API
export type {
  CourseVisibility,
  CourseForm,
  CourseFilters,
  CourseStats,
  CourseDashboard,
} from '@/foundation/types/course';

// Types from courseApi (API layer also defines types alongside functions)
export type {
  Course,
  Lesson,
  Instructor,
  CourseCategory,
  Material,
  Quiz,
  QuizQuestion,
  QuizOption,
  QuizResult,
  Progress,
  PageResponse,
  ApiResponse,
  Reward,
  GrantRewardRequest,
  CreateCourseRequest,
  UpdateCourseRequest,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  SubmitQuizRequest,
  CreateQuizOption,
  CreateQuizQuestion,
  CreateQuizRequest,
  UpdateQuizRequest,
} from '../api/courseApi';

// Feature-specific types
export interface CourseQuestionAnswer {
  questionId: string;
  selectedOptionId?: string;
  answerText?: string;
  isFlagged: boolean;
  timeSpent: number;
}

export interface CourseNavigationState {
  currentIndex: number;
  totalMaterials: number;
  completedMaterials: string[];
  visitedMaterials: string[];
}

export interface CourseTimerState {
  timeRemaining: number;
  isPaused: boolean;
  warningThreshold: number;
}
