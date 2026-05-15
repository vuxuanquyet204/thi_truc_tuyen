import React, { useState, useCallback } from 'react';
import { ExamQuestion } from '@/shared/ui/molecules/ExamQuestion';
import { ExamHeader } from '@/shared/ui/molecules/ExamHeader';
import { ExamSidebar } from '@/shared/ui/molecules/ExamSidebar';
import { ExamNavigation } from '@/shared/ui/molecules/ExamNavigation';
import { SubmitConfirmationModal } from '@/shared/ui/molecules/SubmitConfirmationModal';
import { ExamStatusDisplay } from '@/shared/ui/molecules/ExamStatusDisplay';
import { AICameraMonitor } from '@/shared/ui/molecules/AICameraMonitor';
import { ExamViolationAlert } from '@/shared/ui/molecules/ExamViolationAlert';
import { useExamSession } from '@/features/exams/hooks';
import { useAICameraMonitor, CheatingDetection } from '@/features/proctoring/hooks';
import styles from './ExamTakingPage.module.css';
import { useSelector } from 'react-redux';
import { RootState } from '@/foundation/store';

export default function ExamTakingPage(): JSX.Element {
  const [violations, setViolations] = useState<CheatingDetection[]>([]);
  const [cameraMetrics, setCameraMetrics] = useState<any>(null);
  const [isCameraAutoStarted, setIsCameraAutoStarted] = useState(false);
  const [currentViolation, setCurrentViolation] = useState<CheatingDetection | null>(null);
  const [showViolationAlert, setShowViolationAlert] = useState(false);
  const [examStopped, setExamStopped] = useState(false);
  const [examStoppedReason, setExamStoppedReason] = useState<string>('');
  const [isExamSubmitted, setIsExamSubmitted] = useState(false); // Flag để báo cho camera monitor biết exam đã submit
  const [connectionLost, setConnectionLost] = useState(false); // Trạng thái mất kết nối WebSocket

  const authUser = useSelector((state: RootState) => state.auth.user);

  const { 
    currentExam, 
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    answeredQuestions,
    progress,
    timeRemaining,
    timeWarning,
    status,
    error,
    questions,
    answers,
    visitedQuestions,
    flaggedQuestions,
    session,
    isProctoringMinimized,
    setIsProctoringMinimized,
    showSubmitModal,
    setShowSubmitModal,
    isSubmitting,
    handleAnswerChange,
    handleFlagQuestion,
    handleNextQuestion,
    handlePreviousQuestion,
    handleGoToQuestion,
    handleSubmitExam,
    handleCameraReady,
    handleCameraError,
    formatTime,
    navigate
  } = useExamSession();

  // Note: Blockchain integration removed - using backend API instead

  // Auto-start camera when exam loads
  React.useEffect(() => {
    if (currentExam && !isCameraAutoStarted && status === 'idle') {
      setIsCameraAutoStarted(true);
    }
  }, [currentExam, isCameraAutoStarted, status]);

  // Handle cheating detection with alert
  const handleViolationDetected = useCallback(async (detection: CheatingDetection) => {
    setViolations(prev => [...prev, detection]);
    
    // Show alert for medium, high, and critical violations
    if (detection.severity === 'medium' || detection.severity === 'high' || detection.severity === 'critical') {
      setCurrentViolation(detection);
      setShowViolationAlert(true);
    }
  }, []); // Không cần session?.id vì không dùng trong callback

  // Handle violation alert dismiss
  const handleViolationAlertDismiss = useCallback(() => {
    setShowViolationAlert(false);
    setCurrentViolation(null);
  }, []);

  // Handle exam stop due to violation
  const handleExamStop = useCallback(() => {
    setExamStopped(true);
    setExamStoppedReason('Bài thi đã bị dừng do phát hiện hành vi vi phạm quy chế thi.');
    setShowViolationAlert(false);
  }, []);

  // Handle admin warning
  const handleAdminWarning = useCallback((data: { message: string; sentBy?: string | null; timestamp: string }) => {
    alert(`Cảnh báo từ giám thị:\n\n${data.message}`);
  }, []);

  // Handle exam terminated by admin
  const handleExamTerminated = useCallback((data: { reason?: string; terminatedBy?: string | null }) => {
    setExamStopped(true);
    setExamStoppedReason(data.reason || 'Phiên thi đã bị dừng bởi giám thị');
    setShowViolationAlert(false);
  }, []);

  // Handle WebSocket connection lost
  const handleConnectionLost = useCallback(() => {
    if (!examStopped && !isExamSubmitted) {
      setConnectionLost(true);
    }
  }, [examStopped, isExamSubmitted]);

  // Handle WebSocket connection restored
  const handleConnectionRestored = useCallback(() => {
    setConnectionLost(false);
  }, []);

  // Handle camera metrics update
  const handleMetricsUpdate = useCallback((metrics: any) => {
    setCameraMetrics(metrics);
  }, []);

  // Submit exam using backend API
  const handleSubmitExamWithBackend = useCallback(async () => {
    // Set flag to stop camera monitoring before submitting
    setIsExamSubmitted(true);
    // Call original submit handler which uses backend API
    handleSubmitExam();
  }, [currentExam, answers, totalQuestions, handleSubmitExam]);

  // Loading state
  if (status === 'loading') {
    return <ExamStatusDisplay type="loading" />;
  }

  // Error state
  if (error) {
    return (
      <ExamStatusDisplay
        type="error"
        errorMessage={error}
        onBack={() => navigate('/user/home')}
      />
    );
  }

  // Guard clause - ensure exam and question are loaded
  if (!currentExam || !currentQuestion) {
    return null;
  }

  return (
    <div className={styles.page}>
      <ExamHeader
        examTitle={currentExam.title}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        answeredQuestions={answeredQuestions}
        progress={progress}
        timeRemaining={timeRemaining}
        timeWarning={timeWarning}
        formatTime={formatTime}
      />

      <div className={styles.mainContent}>
        {/* Left Column - Question */}
        <div className={styles.leftColumn}>
          <div className={styles.questionCard}>
            <ExamQuestion
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={totalQuestions}
              currentAnswer={answers[currentQuestion.id]?.answer}
              onAnswerChange={examStopped || isExamSubmitted ? () => {} : handleAnswerChange}
              onFlagQuestion={handleFlagQuestion}
              isFlagged={flaggedQuestions.includes(currentQuestion.id)}
              timeSpent={answers[currentQuestion.id]?.timeSpent || 0}
              isLocked={examStopped || isExamSubmitted}
            />
          </div>

          <ExamNavigation
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            onPrevious={handlePreviousQuestion}
            onNext={handleNextQuestion}
            onSubmit={handleSubmitExamWithBackend}
            isLocked={examStopped || isExamSubmitted}
          />
        </div>

        {/* Right Column - Sidebar with AI Camera Monitor */}
        <div className={`${styles.rightColumn} ${examStopped || isExamSubmitted ? styles.rightColumnLocked : ''}`}>
          <ExamSidebar
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            answers={answers}
            visitedQuestions={visitedQuestions}
            flaggedQuestions={flaggedQuestions}
            onGoToQuestion={handleGoToQuestion}
            isProctoringMinimized={isProctoringMinimized}
            onToggleMinimize={() => setIsProctoringMinimized(!isProctoringMinimized)}
            onCameraReady={handleCameraReady}
            onCameraError={handleCameraError}
            isLocked={examStopped || isExamSubmitted}
          />
          
              {/* AI Camera Monitor - Hidden but functional */}
              {currentExam && session && authUser && (
                <div className={styles.aiCameraMonitorHidden}>
                  <AICameraMonitor
                    examId={currentExam.id}
                    studentId={authUser.id}
                    sessionId={session.id}
                    onViolationDetected={handleViolationDetected}
                    onMetricsUpdate={handleMetricsUpdate}
                    onAdminWarning={handleAdminWarning}
                    onExamTerminated={handleExamTerminated}
                    onConnectionLost={handleConnectionLost}
                    onConnectionRestored={handleConnectionRestored}
                    className={styles.aiCameraMonitor}
                    shouldStop={examStopped || isExamSubmitted}
                  />
                </div>
              )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <SubmitConfirmationModal
        isOpen={showSubmitModal}
        answeredQuestions={answeredQuestions}
        totalQuestions={totalQuestions}
        isSubmitting={isSubmitting}
        onConfirm={handleSubmitExamWithBackend}
        onCancel={() => setShowSubmitModal(false)}
      />

      {/* Violation Alert */}
      <ExamViolationAlert
        violation={currentViolation}
        onDismiss={handleViolationAlertDismiss}
        onStopExam={handleExamStop}
        isVisible={showViolationAlert}
      />

      {/* Connection Lost Overlay */}
      {connectionLost && !examStopped && !isExamSubmitted && (
        <div className={styles.connectionLostOverlay}>
          <div className={styles.connectionLostContainer}>
            <div className={styles.connectionLostIcon}>📡</div>
            <h2 className={styles.connectionLostTitle}>Mất kết nối</h2>
            <p className={styles.connectionLostMessage}>
              Kết nối đến máy chủ bị gián đoạn. Hệ thống đang tự động kết nối lại...
            </p>
            <p className={styles.connectionLostSubMessage}>
              Bạn vẫn có thể tiếp tục làm bài. Câu trả lời đang được giữ lại.
            </p>
          </div>
        </div>
      )}

      {/* Exam Stopped Overlay */}
      {examStopped && (
        <div className={styles.examStoppedOverlay}>
          <div className={styles.examStoppedContainer}>
            <div className={styles.stoppedIcon}>⛔</div>
            <h2 className={styles.stoppedTitle}>Bài thi đã bị dừng</h2>
            <p className={styles.stoppedMessage}>
              {examStoppedReason || 'Phiên thi đã bị kết thúc.'}
              <br />
              Kết quả bài thi đã được ghi nhận.
            </p>
            <div className={styles.stoppedActions}>
              <button
                onClick={() => navigate('/user/home')}
                className={styles.returnButton}
              >
                Quay về trang chủ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
