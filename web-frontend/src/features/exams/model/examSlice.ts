// Exam slice - re-exported from foundation/store/slices
export {
  fetchExamDetails,
  startExamSession,
  submitExam,
  saveAnswer,
  setCurrentQuestion,
  goToNextQuestion,
  goToPreviousQuestion,
  goToQuestion,
  updateAnswer,
  toggleQuestionFlag,
  tickTimer,
  setTimeRemaining,
  setCameraReady,
  setCameraError,
  resetExam,
  setPreCheckStatus,
  setStatus,
} from '@/foundation/store/slices/examSlice';

export {
  default as examReducer,
} from '@/foundation/store/slices/examSlice';

export type { ExamState, ExamStatus } from '@/foundation/store/slices/examSlice';
