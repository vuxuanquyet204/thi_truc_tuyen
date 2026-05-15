import React from 'react';
import { Camera, Minimize2 } from 'lucide-react';
import { QuestionNavigator } from '@/shared/ui/molecules/QuestionNavigator';
import { ProctoringView } from '@/shared/ui/molecules/ProctoringView';
import styles from './ExamSidebar.module.css';
import { ExamQuestion } from '@/foundation/types';

interface ExamSidebarProps {
  questions: ExamQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, any>;
  visitedQuestions: readonly number[];
  flaggedQuestions: readonly number[];
  onGoToQuestion: (index: number) => void;
  isProctoringMinimized: boolean;
  onToggleMinimize: () => void;
  onCameraReady: () => void;
  onCameraError: (error: string) => void;
  isLocked?: boolean;
}

export const ExamSidebar: React.FC<ExamSidebarProps> = ({
  questions,
  currentQuestionIndex,
  answers,
  visitedQuestions,
  flaggedQuestions,
  onGoToQuestion,
  isProctoringMinimized,
  onToggleMinimize,
  onCameraReady,
  onCameraError,
  isLocked = false,
}) => {
  return (
    <div className={styles.sidebar} style={{ pointerEvents: isLocked ? 'none' : undefined, opacity: isLocked ? 0.5 : 1 }}>
      <QuestionNavigator
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        answers={answers}
        visitedQuestions={visitedQuestions}
        flaggedQuestions={flaggedQuestions}
        onGoToQuestion={onGoToQuestion}
      />

      {!isProctoringMinimized ? (
        <div className={styles.cameraContainer}>
          <div className={styles.cameraHeader}>
            <h3 className={styles.cameraTitle}>
              <Camera className={styles.cameraIcon} />
              Camera giám sát
            </h3>
            <button
              onClick={onToggleMinimize}
              className={styles.minimizeButton}
              title="Thu nhỏ camera"
            >
              <Minimize2 className={styles.minimizeIcon} />
            </button>
          </div>

          <div className={styles.cameraContent}>
            <ProctoringView
              width={typeof window !== 'undefined' ? Math.min(352, window.innerWidth - 40) : 352}
              height={typeof window !== 'undefined' ? Math.min(264, Math.floor((window.innerWidth - 40) * 0.75)) : 264}
              onStreamReady={onCameraReady}
              onError={onCameraError}
              showControls={false}
            />
          </div>
        </div>
      ) : (
        <ProctoringView
          width={typeof window !== 'undefined' ? Math.min(352, window.innerWidth - 40) : 352}
          height={typeof window !== 'undefined' ? Math.min(264, Math.floor((window.innerWidth - 40) * 0.75)) : 264}
          onStreamReady={onCameraReady}
          onError={onCameraError}
          showControls={false}
          isMinimized={true}
          onToggleMinimize={onToggleMinimize}
        />
      )}
    </div>
  );
};
