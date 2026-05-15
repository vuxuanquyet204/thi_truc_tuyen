// useExamTaking - exam taking session management
import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/foundation/store/hooks';
import {
  fetchExamDetails,
  startExamSession,
  submitExam,
  saveAnswer,
  setCurrentQuestion,
  goToNextQuestion,
  goToPreviousQuestion,
  goToQuestion,
  toggleQuestionFlag,
  updateTimeRemaining,
  resetExam,
} from '@/foundation/store/slices/examSlice';

export function useExamTaking(examId: string) {
  const dispatch = useAppDispatch();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentExam = useAppSelector((state) => state.exam.currentExam);
  const questions = useAppSelector((state) => state.exam.questions);
  const currentQuestionIndex = useAppSelector((state) => state.exam.currentQuestionIndex);
  const answers = useAppSelector((state) => state.exam.answers);
  const timeRemaining = useAppSelector((state) => state.exam.timeRemaining);
  const status = useAppSelector((state) => state.exam.status);
  const visitedQuestions = useAppSelector((state) => state.exam.visitedQuestions);
  const flaggedQuestions = useAppSelector((state) => state.exam.flaggedQuestions);
  const session = useAppSelector((state) => state.exam.session);

  const currentQuestion = questions[currentQuestionIndex] || null;
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  const loadExam = useCallback(async () => {
    await dispatch(fetchExamDetails(examId));
  }, [dispatch, examId]);

  const start = useCallback(async () => {
    await dispatch(startExamSession(examId));
  }, [dispatch, examId]);

  const answer = useCallback(
    (questionId: number, answerValue: number | string | string[]) => {
      dispatch(saveAnswer({ questionId, answer: answerValue }));
    },
    [dispatch]
  );

  const next = useCallback(() => {
    dispatch(goToNextQuestion());
  }, [dispatch]);

  const prev = useCallback(() => {
    dispatch(goToPreviousQuestion());
  }, [dispatch]);

  const goTo = useCallback(
    (index: number) => {
      dispatch(goToQuestion(index));
    },
    [dispatch]
  );

  const flag = useCallback(
    (questionId: number) => {
      dispatch(toggleQuestionFlag(questionId));
    },
    [dispatch]
  );

  const submit = useCallback(async () => {
    await dispatch(submitExam());
  }, [dispatch]);

  useEffect(() => {
    if (status === 'active' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        dispatch(updateTimeRemaining(timeRemaining - 1));
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status, timeRemaining, dispatch]);

  useEffect(() => {
    if (timeRemaining === 0 && status === 'active') {
      submit();
    }
  }, [timeRemaining, status, submit]);

  useEffect(() => {
    return () => {
      dispatch(resetExam());
    };
  }, [dispatch]);

  return {
    currentExam,
    questions,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    answers,
    timeRemaining,
    status,
    visitedQuestions,
    flaggedQuestions,
    session,
    answeredCount,
    unansweredCount: totalQuestions - answeredCount,
    progress: totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0,
    loadExam,
    start,
    answer,
    next,
    prev,
    goTo,
    flag,
    submit,
  };
}

export default useExamTaking;
