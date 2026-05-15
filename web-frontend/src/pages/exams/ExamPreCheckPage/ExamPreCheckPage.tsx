import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Camera, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { ExamProgressIndicator } from '@/shared/ui/molecules/ExamProgressIndicator/ExamProgressIndicator';
import { ExamInstructionsSection } from '@/shared/ui/sections/ExamInstructionsSection';
import { CameraCheckSection } from '@/shared/ui/sections/CameraCheckSection';
import { ExamReadySection } from '@/shared/ui/sections/ExamReadySection';
import Button from '@/shared/ui/atoms/Button/Button';
import { fetchExamDetails, startExamSession, setCameraReady, setCameraError } from '@/foundation/store/slices/examSlice';
import { RootState, AppDispatch } from '@/foundation/store';
import styles from './ExamPreCheckPage.module.css';

export default function ExamPreCheckPage(): JSX.Element {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [currentStep, setCurrentStep] = useState<'loading' | 'instructions' | 'camera-check' | 'ready'>('loading');
  const [isCameraWorking, setIsCameraWorking] = useState(false);

  const {
    currentExam,
    status,
    error,
    isCameraReady,
    cameraError
  } = useSelector((state: RootState) => state.exam);

  useEffect(() => {
    if (examId && status !== 'loading' && !currentExam) {
      dispatch(fetchExamDetails(examId));
    }
  }, [examId, status, currentExam, dispatch]);

  useEffect(() => {
    if (status === 'idle' && currentExam) {
      setCurrentStep('instructions');
    }
  }, [status, currentExam]);

  const handleStartCameraCheck = () => {
    setCurrentStep('camera-check');
  };

  const handleCameraReady = (stream: MediaStream) => {
    setIsCameraWorking(true);
    dispatch(setCameraReady(true));
    dispatch(setCameraError(null));
  };

  const handleCameraError = (error: string) => {
    console.error('Camera error:', error);
    setIsCameraWorking(false);
    dispatch(setCameraError(error));
    dispatch(setCameraReady(false));
  };

  const handleProceedToExam = async () => {
    if (examId) {
      try {
        await dispatch(startExamSession(examId));
        navigate(`/exam/${examId}/take`);
      } catch (error) {
        console.error('Error starting exam:', error);
      }
    }
  };

  const handleGoBack = () => {
    navigate('/user/home');
  };

  // Loading State
  if (status === 'loading' || currentStep === 'loading') {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingCard}>
          <div className={styles.loadingSpinner} />
          <h2 className={styles.loadingTitle}>
            Đang tải...
          </h2>
          <p className={styles.loadingText}>
            Vui lòng chờ trong giây lát
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <AlertCircle className={styles.errorIcon} />
          <h2 className={styles.errorTitle}>
            Lỗi
          </h2>
          <p className={styles.errorMessage}>{error}</p>
          <Button onClick={handleGoBack} variant="secondary">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  // Main Content
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            Kiểm tra trước khi thi
          </h1>
          <p className={styles.subtitle}>
            {currentExam?.title}
          </p>
        </div>

        {/* Progress Indicator */}
        <ExamProgressIndicator currentStep={currentStep} />

        {/* Main Content */}
        <div className={styles.mainContent}>
          {currentStep === 'instructions' && currentExam && (
            <ExamInstructionsSection exam={currentExam} />
          )}

          {currentStep === 'camera-check' && (
            <CameraCheckSection
              onCameraReady={(stream: MediaStream) => handleCameraReady(stream)}
              onCameraError={(error: string) => handleCameraError(error)}
              isCameraWorking={isCameraWorking}
              cameraError={cameraError}
            />
          )}

          {currentStep === 'ready' && currentExam && (
            <ExamReadySection exam={currentExam} />
          )}
        </div>

        {/* Navigation Buttons */}
        {(currentStep === 'instructions' || currentStep === 'camera-check') && (
          <div className={styles.navigationContainer}>
            <div className={styles.navigationButtons}>
              <Button
                onClick={handleGoBack}
                variant="secondary"
                className={styles.navigationButton}
              >
                <ArrowLeft />
                Quay lại
              </Button>

              {currentStep === 'instructions' && (
                <Button
                  onClick={handleStartCameraCheck}
                  className={styles.navigationButton}
                >
                  Kiểm tra camera
                  <Camera />
                </Button>
              )}

              {currentStep === 'camera-check' && isCameraWorking && (
                <Button
                  onClick={() => setCurrentStep('ready')}
                  className={styles.navigationButton}
                >
                  Tiếp tục
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Final Action Button */}
        {currentStep === 'ready' && (
          <div className={styles.finalActionContainer}>
            <Button
              onClick={handleProceedToExam}
              className={styles.finalActionButton}
            >
              Bắt đầu làm bài
              <ArrowRight />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
