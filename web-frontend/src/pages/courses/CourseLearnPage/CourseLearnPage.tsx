import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Clock, ChevronLeft, ChevronRight, Award, AlertCircle, Menu, X as CloseIcon, Video, FileQuestion, FileText, Flag, CheckCircle2 } from 'lucide-react'
import courseApi, { Course, Material, Progress, Quiz } from '@/features/courses/api'
import { awardCourseCompletion } from '@/features/rewards/api'
import { useAppSelector } from '@/foundation/store/hooks'

type ProgressState = Progress & {
  progressPercentage?: number;
  completedMaterials?: string[];
  lastAccessedAt?: string;
};

const COURSE_COMPLETION_REWARD = Number(import.meta.env.VITE_COURSE_COMPLETION_REWARD ?? 100);

export default function CourseLearnPage(): JSX.Element {
  const { courseId } = useParams<{ courseId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  
  const [course, setCourse] = useState<Course | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [progress, setProgress] = useState<ProgressState | null>(null)
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [isQuizStarted, setIsQuizStarted] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Set<string>>>({})
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false)
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const [quizSubmitError, setQuizSubmitError] = useState<string | null>(null)
  const [quizValidationError, setQuizValidationError] = useState<string | null>(null)
  const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null)
  const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = useState(0)
  const [completingMaterial, setCompletingMaterial] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)
  const [hasAwardedCompletion, setHasAwardedCompletion] = useState(false)
  const [isAwardingTokens, setIsAwardingTokens] = useState(false)
  const [awardMessage, setAwardMessage] = useState<string | null>(null)
  const [awardError, setAwardError] = useState<string | null>(null)
  const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/v1`

  const resolveMaterialFileUrl = (storageKey?: string, fallbackUrl?: string): string | undefined => {
    if (fallbackUrl) return fallbackUrl
    if (!storageKey) return undefined
    // If it's already an absolute URL (including MinIO), return as is
    if (/^https?:\/\//i.test(storageKey)) return storageKey
    // For legacy local paths, keep existing logic
    if (storageKey.startsWith('/api/materials/files/')) {
      return `${API_BASE_URL}${storageKey.replace('/api', '')}`
    }
    if (storageKey.startsWith('materials/files/')) {
      return `${API_BASE_URL}/${storageKey}`
    }
    const parts = storageKey.split('/')
    const filename = parts[parts.length - 1] || storageKey
    return `${API_BASE_URL}/materials/files/${encodeURIComponent(filename)}`
  }

  const getDerivedCompletedCount = (total: number, percent: number): number => {
    if (!Number.isFinite(percent) || total <= 0) return 0
    if (percent >= 100) return total
    const approx = Math.round((percent / 100) * total)
    return Math.min(Math.max(approx, 0), total)
  }

  const getPercentComplete = (value?: ProgressState | null): number => {
    if (!value) {
      return 0
    }
    const rawPercent =
      value.percentComplete ??
      value.progressPercentage ??
      (value as any).progress ??
      0
    const numericPercent = Number(rawPercent)
    return Number.isFinite(numericPercent) ? numericPercent : 0
  }

  const normalizeProgress = (data: any): ProgressState | null => {
    if (!data) {
      return null
    }
    const percent = Number(
      data?.percentComplete ?? data?.progressPercentage ?? data?.progress ?? 0
    )
    const normalizedPercent = Number.isFinite(percent) ? percent : 0
    const completedMaterials = Array.isArray(data?.completedMaterials)
      ? data.completedMaterials
      : []

    return {
      ...data,
      percentComplete: normalizedPercent,
      progressPercentage: normalizedPercent,
      completedMaterials,
    } as ProgressState
  }

  const handleCourseCompletionReward = async (): Promise<void> => {
    if (!user?.id || !courseId) {
      return
    }

    setIsAwardingTokens(true)
    setAwardMessage(null)
    setAwardError(null)

    try {
      const transaction = await awardCourseCompletion({
        userId: user.id,
        courseId,
        amount: COURSE_COMPLETION_REWARD,
      })

      setHasAwardedCompletion(true)
      const awardedAmountRaw =
        transaction?.amount ??
        transaction?.tokensAwarded ??
        COURSE_COMPLETION_REWARD
      const awardedAmount = Number.isFinite(Number(awardedAmountRaw))
        ? Number(awardedAmountRaw)
        : COURSE_COMPLETION_REWARD
      setAwardMessage(
        `Bạn đã nhận ${awardedAmount} LEARN khi hoàn thành khóa học${course?.title ? ` "${course.title}"` : ''
        }.`
      )
    } catch (rewardErr: unknown) {
      const message =
        rewardErr instanceof Error
          ? rewardErr.message
          : (rewardErr as { message?: string })?.message || 'Không thể cộng token phần thưởng.'
      setAwardError(message)
    } finally {
      setIsAwardingTokens(false)
    }
  }

  const handleRetryAward = () => {
    if (isAwardingTokens) {
      return
    }
    void handleCourseCompletionReward()
  }

  const percentComplete = getPercentComplete(progress)
  const completedMaterialsCount = (() => {
    const listCount = Array.isArray(progress?.completedMaterials) ? progress!.completedMaterials!.length : 0
    const derived = getDerivedCompletedCount(materials.length, percentComplete)
    return Math.max(listCount, derived)
  })()

  const rewardBanner = (() => {
    if (isAwardingTokens) {
      return (
        <div className="reward-banner loading">
          <Award />
          <span>Đang cộng token phần thưởng cho bạn...</span>
        </div>
      )
    }

    if (awardMessage) {
      return (
        <div className="reward-banner success">
          <Award />
          <span>{awardMessage}</span>
        </div>
      )
    }

    if (awardError) {
      return (
        <div className="reward-banner error">
          <AlertCircle />
          <span>{awardError}</span>
          <button
            type="button"
            onClick={handleRetryAward}
            disabled={isAwardingTokens}
            className="retry-button"
          >
            Thử lại
          </button>
        </div>
      )
    }

    return null
  })()

  // ✅ FIX: Add guard to prevent duplicate fetch
  useEffect(() => {
    if (courseId && !hasFetched) {
      fetchCourseData()
      setHasFetched(true)
    }
  }, [courseId, hasFetched])

  // ✅ FIX: Separate effect for material selection (doesn't re-fetch course data)
  useEffect(() => {
    const materialId = searchParams.get('material')
    if (materialId && materials.length > 0) {
      const material = materials.find(m => m.id === materialId)
      if (material) {
        setCurrentMaterial(material)
        loadMaterialContent(material)
      }
    } else if (materials.length > 0 && !currentMaterial) {
      // Load first material by default
      setCurrentMaterial(materials[0])
      loadMaterialContent(materials[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, materials.length])

  const fetchCourseData = async () => {
    if (!courseId) return
    
    try {
      setLoading(true)
      
      // Fetch course details
      const courseResponse = await courseApi.getCourseById(courseId)
      setCourse(courseResponse.data ?? null)

      // Fetch materials
      const materialsResponse = await courseApi.getCourseMaterials(courseId)
      let fetchedMaterials: Material[] = (materialsResponse.data ?? [])

      // Also fetch quizzes of course and append as "quiz materials" so UI có thể hiển thị/navigate
      try {
        const quizzesRes = await courseApi.getCourseQuizzes(courseId)
        const quizzes = (quizzesRes.data ?? []) as any[]
        const quizAsMaterials: Material[] = quizzes.map((q) => ({
          id: q.id,
          title: q.title || 'Quiz',
          type: 'quiz',
          description: q.description,
          displayOrder: (q.displayOrder ?? 10_000) as number,
        }))
        fetchedMaterials = [...fetchedMaterials, ...quizAsMaterials]
      } catch (e) {
        // nếu API quiz chữ sắn sàng, bỏ qua
        // console.warn('Unable to load quizzes for course', e)
      }

      const sortedMaterials = fetchedMaterials.sort((a, b) => {
        const orderA = a.order ?? a.displayOrder ?? 0
        const orderB = b.order ?? b.displayOrder ?? 0
        return orderA - orderB
      })
      setMaterials(sortedMaterials)

      // Fetch progress
      if (user?.id) {
        try {
          const progressResponse = await courseApi.getStudentProgress(user.id, courseId)
          const normalizedProgress = normalizeProgress(progressResponse.data)
          setProgress(normalizedProgress)
          setHasAwardedCompletion(getPercentComplete(normalizedProgress) >= 100)
        } catch (err) {
          // Backend có thể trả 404/500 khi chưa có progress
          const fallbackProgress = normalizeProgress({
            id: '',
            studentId: user.id,
            courseId,
            completedMaterials: [] as string[],
            percentComplete: 0,
            progressPercentage: 0,
            lastAccessedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as ProgressState)
          setProgress(fallbackProgress)
          setHasAwardedCompletion(false)
        }
      }

      setError(null)
    } catch (err: any) {
      console.error('Error fetching course data:', err)
      setError(err.message || 'Không thể tải thông tin khóa học')
    } finally {
      setLoading(false)
    }
  }

  const loadMaterialContent = async (material: Material) => {
    if (material.type === 'quiz') {
      // Load quiz content
      try {
        const quizResponse = await courseApi.getQuizDetails(material.id)
        setQuiz(quizResponse.data ?? null)
        // Reset quiz-related states when switching materials
        setIsQuizStarted(false)
        setQuizAnswers({})
        setQuizScore(null)
        setQuizSubmitError(null)
        setQuizValidationError(null)
        setCurrentQuizQuestionIndex(0)
        // Restore last result for completed quiz so user can review score/answers
        try {
          if (isMaterialCompleted(material.id)) {
            const storageKey = `quiz:lastResult:${user?.id}:${material.id}`
            const raw = localStorage.getItem(storageKey)
            if (raw) {
              const parsed = JSON.parse(raw) as { score?: number; answers?: Record<string, string[]> }
              if (typeof parsed?.score === 'number') {
                setQuizScore(parsed.score)
              }
              if (parsed?.answers && typeof parsed.answers === 'object') {
                const restored: Record<string, Set<string>> = {}
                Object.entries(parsed.answers).forEach(([qid, arr]) => {
                  restored[qid] = new Set<string>(Array.isArray(arr) ? arr : [])
                })
                setQuizAnswers(restored)
              }
            }
          }
        } catch { /* ignore */ }
      } catch (err) {
        console.error('Error loading quiz:', err)
      }
    } else {
      setQuiz(null)
      setIsQuizStarted(false)
      setQuizAnswers({})
      setQuizScore(null)
      setQuizSubmitError(null)
      setQuizValidationError(null)
      setCurrentQuizQuestionIndex(0)
    }
  }

  const handleMaterialSelect = (material: Material) => {
    setCurrentMaterial(material)
    setSearchParams({ material: material.id })
    loadMaterialContent(material)
  }

  const toggleAnswer = (questionId: string, optionId: string) => {
    // Prevent editing if quiz is already completed
    if (currentMaterial?.type === 'quiz' && isMaterialCompleted(currentMaterial.id)) {
      return
    }
    setQuizAnswers(prev => {
      // Enforce single-choice: selecting an option replaces any previous one
      const next = new Set<string>()
      next.add(optionId)
      return { ...prev, [questionId]: next }
    })
  }

  const handleSubmitQuiz = async () => {
    if (!quiz || !user?.id) return
    // Validate: require all questions answered
    const unansweredIndexes: number[] = []
    quiz.questions.forEach((q, idx) => {
      if (!(quizAnswers[q.id]?.size > 0)) unansweredIndexes.push(idx)
    })
    if (unansweredIndexes.length > 0) {
      setQuizValidationError(`Bạn còn ${unansweredIndexes.length} câu chưa trả lời. Hãy hoàn thành trước khi nộp.`)
      setCurrentQuizQuestionIndex(unansweredIndexes[0])
      return
    } else {
      setQuizValidationError(null)
    }
    setIsSubmittingQuiz(true)
    setQuizSubmitError(null)
    try {
      const payload = Object.fromEntries(
        (quiz.questions || []).map(q => [q.id, Array.from(quizAnswers[q.id] || [])])
      )
      const result = await courseApi.submitQuiz(quiz.id, {
        studentId: user.id,
        answers: payload
      })
      const scoreValue =
        typeof result.data?.score === 'number'
          ? result.data.score
          : Number((result.data as any)?.score ?? 0)
      setQuizScore(Number.isFinite(scoreValue) ? scoreValue : 0)
      // Save last result locally to support review on revisit
      try {
        const storageKey = `quiz:lastResult:${user.id}:${quiz.id}`
        const last = {
          score: Number.isFinite(scoreValue) ? scoreValue : 0,
          submittedAt: new Date().toISOString(),
          answers: payload
        }
        localStorage.setItem(storageKey, JSON.stringify(last))
      } catch { /* ignore */ }

      // Refresh progress after submit
      if (courseId) {
        try {
          const progressResponse = await courseApi.getStudentProgress(user.id, courseId)
          const normalized = normalizeProgress(progressResponse.data)
          const previousPercent = getPercentComplete(progress)
          setProgress(normalized)
          const newPercent = getPercentComplete(normalized)
          if (!hasAwardedCompletion && previousPercent < 100 && newPercent >= 100) {
            await handleCourseCompletionReward()
          }
        } catch (err) {
          console.warn('Unable to refresh progress after quiz submission', err)
        }
      }

      // Business rule: quiz submission completes the course and prevents retake
      // Locally mark all materials as completed and percent to 100 to lock quiz UI
      setProgress(prev => {
        const allIds = materials.map(m => m.id)
        const completedSet = new Set<string>([
          ...(prev?.completedMaterials ?? []),
          ...allIds,
        ])
        const updated: ProgressState = {
          ...(prev ?? {
            id: '',
            studentId: user?.id ?? '',
            courseId: courseId as string,
            percentComplete: 0,
            updatedAt: new Date().toISOString(),
          }),
          percentComplete: 100,
          progressPercentage: 100,
          completedMaterials: Array.from(completedSet),
        }
        return updated
      })
      if (!hasAwardedCompletion) {
        await handleCourseCompletionReward()
      }
    } catch (err: any) {
      console.error('Error submitting quiz:', err)
      setQuizSubmitError(err?.message || 'Không thể nộp bài quiz, vui lòng thử lại.')
    } finally {
      setIsSubmittingQuiz(false)
    }
  }

  const handleMarkComplete = async () => {
    if (!currentMaterial || !user?.id || !courseId) return
    
    const previousPercent = getPercentComplete(progress)
    setCompletingMaterial(true)
    try {
      const response = await courseApi.updateProgress(
        user.id,
        courseId,
        currentMaterial.id
      )
      const normalizedProgress = normalizeProgress(response.data)
      setProgress(normalizedProgress)

      const newPercent = getPercentComplete(normalizedProgress)
      if (!hasAwardedCompletion && previousPercent < 100 && newPercent >= 100) {
        await handleCourseCompletionReward()
      }
      
      // Move to next material
      const currentIndex = materials.findIndex(m => m.id === currentMaterial.id)
      if (currentIndex < materials.length - 1) {
        handleMaterialSelect(materials[currentIndex + 1])
      }
    } catch (err) {
      console.error('Error marking material complete:', err)
      alert('Không thể cập nhạt tiẟn độ')
    } finally {
      setCompletingMaterial(false)
    }
  }

  const handlePrevious = () => {
    if (!currentMaterial) return
    const currentIndex = materials.findIndex(m => m.id === currentMaterial.id)
    if (currentIndex > 0) {
      handleMaterialSelect(materials[currentIndex - 1])
    }
  }

  const handleNext = () => {
    if (!currentMaterial) return
    const currentIndex = materials.findIndex(m => m.id === currentMaterial.id)
    if (currentIndex < materials.length - 1) {
      handleMaterialSelect(materials[currentIndex + 1])
    }
  }

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video size={20} />
      case 'quiz': return <FileQuestion size={20} />
      case 'document': return <FileText size={20} />
      default: return <FileText size={20} />
    }
  }

  const isMaterialCompleted = (materialId: string) => {
    // If it's a quiz material, require explicit completion from backend
    const target = materials.find(m => m.id === materialId)
    const completed = progress?.completedMaterials || []
    if (target?.type === 'quiz') {
      return Array.isArray(completed) && completed.includes(materialId)
    }
    // Non-quiz: Prefer explicit list, else fallback by derived percent
    if (Array.isArray(completed) && completed.includes(materialId)) return true
    const total = materials.length
    if (total === 0) return false
    const derivedCount = getDerivedCompletedCount(total, percentComplete)
    if (derivedCount <= 0) return false
    const index = materials.findIndex(m => m.id === materialId)
    return index > -1 && index < derivedCount
  }

  const getCurrentMaterialIndex = () => {
    if (!currentMaterial) return 0
    return materials.findIndex(m => m.id === currentMaterial.id) + 1
  }

  if (loading) {
    return (
      <div className="course-learn-loading">
        <div className="spinner"></div>
        <p>Đang tải bài học...</p>
      </div>
    )
  }

  if (error || !course || !currentMaterial) {
    return (
      <div className="course-learn-error">
        <p>{error || 'Không tìm thấy bài học'}</p>
        <button onClick={() => navigate(`/user/courses/${courseId}`)} className="btn-back">
          Quay lại khóa học
        </button>
      </div>
    )
  }

  return (
    <div className="course-learn-page" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="learn-header">
        <div className="header-info">
          <h1>{course.title}</h1>
          <p className="material-position">
            Bại {getCurrentMaterialIndex()} / {materials.length}
          </p>
        </div>

          <div className="header-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
              style={{ width: `${percentComplete}%` }}
              ></div>
          </div>
          <span className="progress-text">{percentComplete}%</span>
        </div>

        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="btn-toggle-sidebar"
          title={sidebarOpen ? 'Ẩn nội dung' : 'Hiện nội dung'}
        >
          {sidebarOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {rewardBanner}
      {!isAwardingTokens && !awardMessage && !awardError && (() => {
        const hasQuiz = materials.some(m => m.type === 'quiz')
        const firstIncompleteQuiz = materials.find(m => m.type === 'quiz' && !isMaterialCompleted(m.id))
        const allowReward = percentComplete >= 100 && !hasAwardedCompletion && (!hasQuiz || !firstIncompleteQuiz)
        return allowReward
      })() && (
        <div className="reward-banner cta">
          <Award />
          <span>Bạn đã hoàn thành 100% khóa học. Nhấn để nhận {COURSE_COMPLETION_REWARD} LEARN.</span>
          <button
            type="button"
            onClick={() => { void handleCourseCompletionReward() }}
            className="claim-button"
          >
            Nhận thưởng
          </button>
        </div>
      )}
      {/* Nếu còn quiz chưa làm khi đạt 100%, yêu cầu làm quiz trước */}
      {!isAwardingTokens && !awardMessage && !awardError && percentComplete >= 100 && !hasAwardedCompletion && materials.some(m => m.type === 'quiz' && !isMaterialCompleted(m.id)) && (
        <div className="reward-banner warning">
          <FileQuestion />
          <span>Bạn cần hoàn thành bài quiz cuối cùng trước khi nhận thưởng.</span>
          <button
            type="button"
            onClick={() => {
              const pending = materials.find(m => m.type === 'quiz' && !isMaterialCompleted(m.id))
              if (pending) handleMaterialSelect(pending)
            }}
            className="claim-button"
          >
            LẠm quiz ngay
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="learn-content" style={{ flex: 1, minHeight: 0, display: 'flex', gap: 'var(--space-6)', overflow: 'hidden' }}>
        {/* Main Content */}
        <div className="main-content" style={{ flex: 1, minWidth: 0, overflowY: 'auto', paddingRight: 8, position: 'relative', zIndex: 0 }}>
          {/* Material Content */}
          <div
            className="material-content"
            style={{
              position: 'relative',
              overflow: 'visible',
              // Media (video/image): ô chứa không thêm padding/border để không to hơn nội dung
              paddingBottom: (currentMaterial.type === 'text') ? 24 : 0,
              display: 'block',
              background: (currentMaterial.type === 'text') ? undefined : 'transparent',
              border: (currentMaterial.type === 'text') ? undefined : 'none',
              boxShadow: (currentMaterial.type === 'text') ? undefined : 'none'
            }}
          >
            {/* Video */}
            {currentMaterial.type === 'video' && (
              <div
                className="video-container"
                style={{
                  width: '100%',
                  maxHeight: 'calc(100vh - 220px)', // trừ phần header + banner + margin để không bị cắt
                  backgroundColor: '#000',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 2,
                  marginBottom: 0
                }}
              >
                <video 
                  controls 
                  autoPlay
                  key={currentMaterial.id}
                  style={{ 
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                  playsInline
                  onLoadedMetadata={(e) => {
                    const v = e.currentTarget
                    if (v?.videoWidth && v?.videoHeight) {
                      const ratio = v.videoWidth / v.videoHeight
                      if (Number.isFinite(ratio) && ratio > 0) {
                        setVideoAspectRatio(ratio)
                      }
                    }
                  }}
                >
                  <source
                    src={resolveMaterialFileUrl(currentMaterial.storageKey, currentMaterial.videoUrl || currentMaterial.contentUrl) || ''}
                    type="video/mp4"
                  />
                  Trình duyệt của bạn không hỗ trợ video.
                </video>
              </div>
            )}

            {/* Image */}
            {currentMaterial.type === 'image' && (
              <div
                className="image-container"
                style={{
                  width: '100%',
                  maxHeight: 'calc(100vh - 220px)',
                  backgroundColor: '#000',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                <img
                  alt={currentMaterial.title}
                  src={resolveMaterialFileUrl(currentMaterial.storageKey, currentMaterial.contentUrl) || ''}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                />
              </div>
            )}

            {/* Document/Text Content */}
            {(currentMaterial.type === 'document' || currentMaterial.type === 'text') && (
              <div className="document-content">
                <div className="document-header">
                  <FileText size={32} />
                  <h2>{currentMaterial.title}</h2>
                </div>
                {currentMaterial.description && (
                  <div className="document-body">
                  <p>{currentMaterial.description ?? currentMaterial.content}</p>
                  </div>
                )}
                {(currentMaterial.contentUrl || currentMaterial.storageKey) && (
                  <div className="document-actions">
                    <a 
                      href={resolveMaterialFileUrl(currentMaterial.storageKey, currentMaterial.contentUrl) || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-download"
                    >
                      <FileText size={20} />
                      Tải tài liệu
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Quiz - Exam Style UI */}
            {currentMaterial.type === 'quiz' && quiz && !isQuizStarted && (
              <div style={{
                background: 'var(--card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: 'var(--space-6)',
                boxShadow: 'var(--shadow-lg)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'white'
                  }}>
                  <FileQuestion size={32} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: 'var(--space-2)' }}>{quiz.title}</h2>
                    {quiz.description && <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>{quiz.description}</p>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
                  {quiz.timeLimit && (
                    <div style={{
                      background: 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)',
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-lg)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      border: '1px solid #60a5fa'
                    }}>
                      <Clock size={20} style={{ color: '#2563eb' }} />
                      <span style={{ fontWeight: 600, color: '#1e40af' }}>Thời gian: {quiz.timeLimit} phút</span>
                    </div>
                  )}
                  <div style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    border: '1px solid #fbbf24'
                  }}>
                    <FileQuestion size={20} style={{ color: '#d97706' }} />
                    <span style={{ fontWeight: 600, color: '#92400e' }}>{quiz.questions.length} cêu hơi</span>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    border: '1px solid #34d399'
                  }}>
                    <Award size={20} style={{ color: '#059669' }} />
                    <span style={{ fontWeight: 600, color: '#065f46' }}>điểm đạt: {quiz.passingScore}%</span>
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #ede9fe 0%, #e9d5ff 100%)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: 'var(--space-6)',
                  border: '1px solid #c084fc'
                }}>
                  <p style={{ fontSize: '14px', color: '#6b21a8', lineHeight: 1.6 }}>
                    💡 Lưu ý: Bạn cần đạt ít nhất {quiz.passingScore}% để hoàn thành bài quiz này.
                  </p>
                </div>

                <button
                  onClick={() => setIsQuizStarted(true)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    padding: 'var(--space-4) var(--space-6)',
                    borderRadius: 'var(--radius-lg)',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                disabled={isMaterialCompleted(currentMaterial.id)}
                >
                  {isMaterialCompleted(currentMaterial.id) ? 'đã hoàn thành (chỉ xem lại)' : 'Bắt đâảu làm bài'}
                </button>
              </div>
            )}

            {/* Quiz Started - Exam Style */}
            {currentMaterial.type === 'quiz' && quiz && isQuizStarted && quizScore === null && !isMaterialCompleted(currentMaterial.id) && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr clamp(300px, 28vw, 400px)',
                gap: 'var(--space-6)',
                alignItems: 'start'
              }}>
                {/* Validation banner */}
                {quizValidationError && (
                  <div style={{
                    gridColumn: '1 / -1',
                    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                    border: '1px solid #f87171',
                    color: '#7f1d1d',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)'
                  }}>
                    <AlertCircle size={18} style={{ color: '#dc2626' }} />
                    <span style={{ fontSize: '14px' }}>{quizValidationError}</span>
                  </div>
                )}
                {/* Left: Current Question */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {(() => {
                    const currentQ = quiz.questions[currentQuizQuestionIndex]
                    if (!currentQ) return null
                    const currentAnswer = quizAnswers[currentQ.id] || new Set()
                    
                    return (
                      <div style={{
                        background: 'var(--card)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-lg)',
                        padding: 'var(--space-6)'
                      }}>
                        {/* Question Header */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          marginBottom: 'var(--space-6)',
                          gap: 'var(--space-4)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                            <div style={{
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              color: 'white',
                              padding: '6px 16px',
                              borderRadius: '9999px',
                              fontSize: '13px',
                              fontWeight: 600,
                              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                            }}>
                              Câu {currentQuizQuestionIndex + 1}/{quiz.questions.length}
                            </div>
                            <div style={{
                              background: '#d1fae5',
                              color: '#065f46',
                              padding: '6px 16px',
                              borderRadius: '9999px',
                              fontSize: '13px',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'var(--space-2)'
                            }}>
                              <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                              Trắc nghiệm
                            </div>
                          </div>
                        </div>

                        {/* Question Content */}
                        <h3 style={{
                          fontSize: '17px',
                          fontWeight: 500,
                          color: 'var(--foreground)',
                          marginBottom: 'var(--space-5)',
                          lineHeight: 1.8
                        }}>
                          {currentQ.content}
                        </h3>

                        {/* Options */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                          {currentQ.options.map((opt, optIdx) => {
                            const isSelected = currentAnswer.has(opt.id)
                            return (
                              <label
                                key={opt.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: 'var(--space-3)',
                                  padding: 'var(--space-4)',
                                  borderRadius: 'var(--radius-lg)',
                                  border: `2px solid ${isSelected ? '#3b82f6' : 'var(--border)'}`,
                                  background: isSelected ? 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)' : 'var(--background)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  boxShadow: isSelected ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.background = 'var(--card)'
                                    e.currentTarget.style.borderColor = 'var(--accent)'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.background = 'var(--background)'
                                    e.currentTarget.style.borderColor = 'var(--border)'
                                  }
                                }}
                              >
                                <input
                                  type="radio"
                                  name={`quiz-q-${currentQ.id}`}
                                  checked={isSelected}
                                  disabled={isMaterialCompleted(currentMaterial.id)}
                                  onChange={() => {
                                    if (isMaterialCompleted(currentMaterial.id)) return
                                    toggleAnswer(currentQ.id, opt.id)
                                  }}
                                  style={{
                                    marginTop: '2px',
                                    width: '18px',
                                    height: '18px',
                                    accentColor: '#3b82f6',
                                    cursor: 'pointer'
                                  }}
                                />
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <span style={{
                                      fontWeight: 600,
                                      fontSize: '14px',
                                      color: isSelected ? '#3b82f6' : 'var(--muted-foreground)',
                                      minWidth: '24px'
                                    }}>
                                      {String.fromCharCode(65 + optIdx)}.
                                    </span>
                                    <span style={{
                                      color: isSelected ? '#1e40af' : 'var(--foreground)',
                                      fontSize: '15px',
                                      lineHeight: 1.6
                                    }}>
                                      {opt.content}
                                    </span>
                                  </div>
                                </div>
                                {isSelected && (
                                  <CheckCircle2 style={{
                                    width: '20px',
                                    height: '20px',
                                    color: '#3b82f6',
                                    flexShrink: 0
                                  }} />
                                )}
                              </label>
                            )
                          })}
                        </div>

                        {/* Answer Status */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: 'var(--space-4)',
                          borderTop: '1px solid var(--border)',
                          marginTop: 'var(--space-4)'
                        }}>
                          <div style={{
                            fontSize: '13px',
                            color: currentAnswer.size > 0 ? '#10b981' : 'var(--muted-foreground)',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)'
                          }}>
                            {currentAnswer.size > 0 ? (
                              <>
                                <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                                để trả lời
                              </>
                            ) : (
                              'Chữ trả lời'
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Navigation */}
                  <div style={{
                    display: 'flex',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-4)',
                    background: 'var(--card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)'
                  }}>
                    <button
                      onClick={() => setCurrentQuizQuestionIndex(Math.max(0, currentQuizQuestionIndex - 1))}
                      disabled={currentQuizQuestionIndex === 0}
                      style={{
                        flex: 1,
                        padding: 'var(--space-3) var(--space-4)',
                        background: currentQuizQuestionIndex === 0 ? 'var(--muted)' : 'var(--secondary)',
                        color: currentQuizQuestionIndex === 0 ? 'var(--muted-foreground)' : 'var(--secondary-foreground)',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: currentQuizQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-2)'
                      }}
                    >
                      <ChevronLeft size={16} />
                      Câu trước
                    </button>
                    <button
                      onClick={() => setCurrentQuizQuestionIndex(Math.min(quiz.questions.length - 1, currentQuizQuestionIndex + 1))}
                      disabled={currentQuizQuestionIndex === quiz.questions.length - 1}
                      style={{
                        flex: 1,
                        padding: 'var(--space-3) var(--space-4)',
                        background: currentQuizQuestionIndex === quiz.questions.length - 1 ? 'var(--muted)' : 'var(--secondary)',
                        color: currentQuizQuestionIndex === quiz.questions.length - 1 ? 'var(--muted-foreground)' : 'var(--secondary-foreground)',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: currentQuizQuestionIndex === quiz.questions.length - 1 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-2)'
                      }}
                    >
                      Câu sau
                      <ChevronRight size={16} />
                    </button>
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={isSubmittingQuiz}
                      style={{
                        flex: 1,
                        padding: 'var(--space-3) var(--space-4)',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: isSubmittingQuiz ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                      }}
                      onMouseEnter={(e) => !isSubmittingQuiz && (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      {isSubmittingQuiz ? 'Đang nộp bài...' : 'Nộp bài'}
                    </button>
                  </div>
                </div>

                {/* Right: Question Navigator */}
                <div style={{
                  background: 'var(--card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  padding: 'var(--space-4)',
                  boxShadow: 'var(--shadow-lg)',
                  position: 'sticky',
                  top: 'var(--space-4)'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Danh sách câu hỏi</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(45px, 1fr))',
                    gap: 'var(--space-2)'
                  }}>
                    {quiz.questions.map((q, idx) => {
                      const isAnswered = (quizAnswers[q.id]?.size || 0) > 0
                      const isCurrent = idx === currentQuizQuestionIndex
                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuizQuestionIndex(idx)}
                          style={{
                            padding: 'var(--space-2)',
                            borderRadius: 'var(--radius)',
                            border: isCurrent ? '2px solid #3b82f6' : '1px solid var(--border)',
                            background: isAnswered ? '#10b981' : isCurrent ? '#3b82f6' : 'var(--background)',
                            color: (isAnswered || isCurrent) ? 'white' : 'var(--foreground)',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            minHeight: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            if (!isCurrent && !isAnswered) {
                              e.currentTarget.style.background = 'var(--accent)'
                              e.currentTarget.style.borderColor = '#3b82f6'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isCurrent && !isAnswered) {
                              e.currentTarget.style.background = 'var(--background)'
                              e.currentTarget.style.borderColor = 'var(--border)'
                            }
                          }}
                        >
                          {idx + 1}
                        </button>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <div style={{ width: '16px', height: '16px', background: '#10b981', borderRadius: '4px' }} />
                        <span>để trả lời</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <div style={{ width: '16px', height: '16px', background: '#3b82f6', borderRadius: '4px', border: '2px solid #3b82f6' }} />
                        <span>Câu hiện tại</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <div style={{ width: '16px', height: '16px', background: 'var(--background)', borderRadius: '4px', border: '1px solid var(--border)' }} />
                        <span>Chữ trả lời</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: 'var(--space-2)' }}>
                      Tiến độ: {Object.values(quizAnswers).filter(s => s.size > 0).length}/{quiz.questions.length}
                    </div>
                    <div style={{
                      height: '8px',
                      background: 'var(--muted)',
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #10b981, #059669)',
                        width: `${(Object.values(quizAnswers).filter(s => s.size > 0).length / quiz.questions.length) * 100}%`,
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quiz Result */}
            {currentMaterial.type === 'quiz' && quiz && quizScore !== null && (
              <div style={{
                background: 'var(--card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: 'var(--space-6)',
                boxShadow: 'var(--shadow-lg)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto var(--space-4)',
                  borderRadius: '50%',
                  background: quizScore >= (quiz.passingScore || 0) 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: 700,
                  boxShadow: quizScore >= (quiz.passingScore || 0) 
                    ? '0 8px 20px rgba(16, 185, 129, 0.4)' 
                    : '0 8px 20px rgba(239, 68, 68, 0.4)'
                }}>
                  {quizScore}%
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  marginBottom: 'var(--space-2)',
                  color: quizScore >= (quiz.passingScore || 0) ? '#10b981' : '#ef4444'
                }}>
                  {quizScore >= (quiz.passingScore || 0) ? 'Chúc mừng! Bạn đã đạt' : 'Chưa đạt'}
                </h3>
                <p style={{ color: 'var(--muted-foreground)', marginBottom: 'var(--space-6)' }}>
                  {quizScore >= (quiz.passingScore || 0) 
                    ? `Bạn đã vượt qua bài quiz vừỏi ${quizScore}% điểm.`
                    : `Bạn cần đạt tối thiểu ${quiz.passingScore}% đã hoàn thành bài quiz.`
                  }
                </p>
                {quizSubmitError && (
                  <div style={{
                    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius)',
                    marginBottom: 'var(--space-4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    border: '1px solid #f87171'
                  }}>
                    <AlertCircle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', color: '#7f1d1d' }}>{quizSubmitError}</span>
                  </div>
                )}
                {!isMaterialCompleted(currentMaterial.id) && (
                <button
                  onClick={() => {
                    setQuizScore(null)
                    setIsQuizStarted(false)
                    setQuizAnswers({})
                    setCurrentQuizQuestionIndex(0)
                  }}
                  style={{
                    padding: 'var(--space-3) var(--space-6)',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  LẠm lại
                </button>
                )}
              </div>
            )}
          </div>

          {/* Material Info & Description */}
          <div className="material-info-section">
            <div className="material-header">
              <div className="material-icon-large">
                {getMaterialIcon(currentMaterial.type)}
              </div>
              <div>
                <h3>{currentMaterial.title}</h3>
                {currentMaterial.duration && (
                  <p className="material-duration">
                    <Clock size={16} />
                    {currentMaterial.duration} phút
                  </p>
                )}
              </div>
            </div>

            {currentMaterial.type !== 'quiz' && (currentMaterial.description || currentMaterial.content) && (
              <div className="material-description">
                <h4>Mô tả</h4>
                <p>{currentMaterial.description ?? currentMaterial.content}</p>
              </div>
            )}

            {/* Mark Complete Button */}
            {!isMaterialCompleted(currentMaterial.id) && currentMaterial.type !== 'quiz' && (
              <button 
                onClick={handleMarkComplete}
                disabled={completingMaterial}
                className="btn-complete"
              >
                <CheckCircle size={20} />
                {completingMaterial ? 'Đang lưu...' : 'đánh dấu hoàn thành'}
              </button>
            )}
            {/* Với tài liệu dạng quiz: hoàn thành thông qua nộp bài (submitQuiz) */}
            {currentMaterial.type === 'quiz' && !isMaterialCompleted(currentMaterial.id) && (
              <div className="quiz-completion-hint">
                <AlertCircle />
                <span>Hoàn thành bài quiz bðng cách nơp bài. Nút hoàn thành sẽ tữ cập nhật sau khi nơp.</span>
              </div>
            )}

            {isMaterialCompleted(currentMaterial.id) && (
              <div className="completed-badge">
                <CheckCircle size={20} />
                <span>đã hoàn thành</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="material-navigation">
            <button
              onClick={handlePrevious}
              disabled={getCurrentMaterialIndex() === 1}
              className="btn-nav"
            >
              <ChevronLeft size={20} />
              <span>Bài trước</span>
            </button>
            <button
              onClick={handleNext}
              disabled={getCurrentMaterialIndex() === materials.length}
              className="btn-nav"
            >
              <span>Bại tiẟp theo</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`materials-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <h3>Nội dung khóa học</h3>
            <p>{completedMaterialsCount} / {materials.length} hoàn thành</p>
          </div>

          <div className="materials-list">
            {materials.map((material, index) => (
              <div
                key={material.id}
                className={`material-item ${material.id === currentMaterial?.id ? 'active' : ''} ${isMaterialCompleted(material.id) ? 'completed' : ''}`}
                onClick={() => handleMaterialSelect(material)}
              >
                <div className="material-number">{index + 1}</div>
                <div className="material-icon">
                  {getMaterialIcon(material.type)}
                </div>
                <div className="material-details">
                  <h4>{material.title}</h4>
                  {material.duration && (
                    <span className="duration">
                      <Clock size={14} />
                      {material.duration} phút
                    </span>
                  )}
                </div>
                {isMaterialCompleted(material.id) && (
                  <CheckCircle size={20} className="completed-icon" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

