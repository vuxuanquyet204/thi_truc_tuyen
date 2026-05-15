import React, { useState, useEffect } from 'react'
import Modal from '@/features/admin/ui/common/Modal'
import { BookOpen, ListChecks, PlusCircle, Shuffle, RefreshCw, BookMarked } from 'lucide-react'
import courseApi, {
  type Quiz,
  type ApiResponse,
} from '@/features/courses/api/courseApi'
import { getAllSubjects } from '@/features/admin/api/examApi'

interface CourseQuizModalProps {
  isOpen: boolean
  onClose: () => void
  courseId?: string
}

export default function CourseQuizModal({ isOpen, onClose, courseId }: CourseQuizModalProps): JSX.Element {
  const [tab, setTab] = useState<'view' | 'create'>('create')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [quizIdInput, setQuizIdInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Subject selection
  const [subjects, setSubjects] = useState<string[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<string>('')

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    questionCount: 5,
  })

  // Preview state
  const [previewQuestions, setPreviewQuestions] = useState<any[]>([])

  // Load subjects on open
  useEffect(() => {
    if (isOpen) {
      setLoadingSubjects(true)
      getAllSubjects()
        .then(setSubjects)
        .catch(() => setSubjects([]))
        .finally(() => setLoadingSubjects(false))
    }
  }, [isOpen])

  // Reset when closing
  useEffect(() => {
    if (!isOpen) {
      setSelectedSubject('')
      setPreviewQuestions([])
      setQuiz(null)
      setError(null)
      setForm({ title: '', description: '', timeLimit: 30, questionCount: 5 })
    }
  }, [isOpen])

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject)
    setPreviewQuestions([])
  }

  const handlePreview = () => {
    if (!selectedSubject) return
    const count = form.questionCount
    if (count < 1) {
      setError('Số câu hỏi phải từ 1 trở lên')
      return
    }
    setError(null)
    // Mock preview — backend sẽ shuffle thật khi tạo
    const mockQuestions = Array.from({ length: count }, (_, i) => ({
      id: `preview-${i + 1}`,
      content: `Câu hỏi #${i + 1} từ môn "${selectedSubject}" (sẽ được shuffle ngẫu nhiên khi tạo)`,
      type: 'multiple',
      options: [
        { id: `opt-a-${i}`, content: 'Đáp án A', isCorrect: i === 0 },
        { id: `opt-b-${i}`, content: 'Đáp án B', isCorrect: false },
        { id: `opt-c-${i}`, content: 'Đáp án C', isCorrect: false },
        { id: `opt-d-${i}`, content: 'Đáp án D', isCorrect: false },
      ],
    }))
    // Fisher-Yates shuffle
    for (let i = mockQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mockQuestions[i], mockQuestions[j]] = [mockQuestions[j], mockQuestions[i]]
    }
    setPreviewQuestions(mockQuestions)
  }

  const handleCreate = async () => {
    if (!courseId) {
      setError('Thiếu courseId để tạo quiz')
      return
    }
    if (!form.title.trim()) {
      setError('Vui lòng nhập tiêu đề quiz')
      return
    }
    if (!selectedSubject) {
      setError('Vui lòng chọn một môn học')
      return
    }
    if (!form.questionCount || form.questionCount < 1) {
      setError('Số câu hỏi phải từ 1 trở lên')
      return
    }

    try {
      setCreating(true)
      setError(null)
      const body = {
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        timeLimitMinutes: form.timeLimit,
        subject: selectedSubject,
        questionCount: form.questionCount,
      }
      const res = await courseApi.createQuiz(courseId, body as any)
      if (res.data) {
        const id = (res.data as any).id || (res.data as any).quizId
        if (id) {
          const detail = await courseApi.getQuizDetails(id)
          setQuiz(detail.data ?? null)
          setTab('view')
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Tạo quiz thất bại')
    } finally {
      setCreating(false)
    }
  }

  const fetchQuiz = async () => {
    setError(null)
    setQuiz(null)
    if (!quizIdInput.trim()) return
    setLoading(true)
    try {
      const res = await courseApi.getQuizDetails(quizIdInput.trim())
      setQuiz(res.data ?? null)
    } catch (e: any) {
      setError(e?.message || 'Không lấy được chi tiết quiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quản trị Quiz"
      maxWidth="900px"
      footer={<button className="btn btn-secondary" onClick={onClose}>Đóng</button>}
    >
      <div className="modal-content-wrapper">
        <div className="modal-form-section">
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button className={`btn ${tab === 'view' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('view')}>
              <BookOpen size={16} /> Xem quiz
            </button>
            <button className={`btn ${tab === 'create' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('create')}>
              <PlusCircle size={16} /> Tạo quiz
            </button>
          </div>

          {tab === 'view' && (
            <>
              <div className="section-title">
                <ListChecks />
                <h4>Lấy chi tiết Quiz theo ID</h4>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  className="form-input"
                  placeholder="Nhập Quiz ID (UUID)"
                  value={quizIdInput}
                  onChange={e => setQuizIdInput(e.target.value)}
                  style={{ minWidth: 320 }}
                />
                <button className="btn btn-primary" onClick={fetchQuiz} disabled={loading}>
                  <ListChecks size={16} /> Xem chi tiết
                </button>
              </div>
            </>
          )}

          {tab === 'create' && (
            <>
              <div className="section-title">
                <PlusCircle />
                <h4>Tạo quiz từ ngân hàng câu hỏi theo môn học</h4>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>

                {/* Subject selection */}
                <div>
                  <label className="form-label">
                    <BookMarked size={14} style={{ display: 'inline', marginRight: 4 }} />
                    Chọn môn học
                  </label>
                  {loadingSubjects ? (
                    <div style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>Đang tải môn học...</div>
                  ) : (
                    <select
                      className="form-input"
                      value={selectedSubject}
                      onChange={e => handleSubjectChange(e.target.value)}
                    >
                      <option value="">-- Chọn môn học --</option>
                      {subjects.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  )}
                  {subjects.length === 0 && !loadingSubjects && (
                    <small style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                      Không có môn học nào — hãy đảm bảo exam-service đang chạy và có dữ liệu câu hỏi.
                    </small>
                  )}
                </div>

                {/* Selected subject info */}
                {selectedSubject && (
                  <div style={{ background: 'var(--card)', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontWeight: 600 }}>📚 {selectedSubject}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>
                      Hệ thống sẽ chọn ngẫu nhiên câu hỏi từ ngân hàng đề của môn này khi tạo quiz.
                    </div>
                  </div>
                )}

                {/* Question count */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <label className="form-label">Số câu hỏi muốn lấy</label>
                    <input
                      className="form-input"
                      type="number"
                      min={1}
                      value={form.questionCount}
                      onChange={e => {
                        setForm(prev => ({ ...prev, questionCount: Number(e.target.value) || 0 }))
                        setPreviewQuestions([])
                      }}
                    />
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={handlePreview}
                    disabled={!selectedSubject || form.questionCount < 1}
                    title="Xem trước các câu hỏi sẽ được lấy (sẽ shuffle ngẫu nhiên khi tạo thật)"
                  >
                    <Shuffle size={16} /> Preview
                  </button>
                </div>

                {/* Preview */}
                {previewQuestions.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <RefreshCw size={14} style={{ color: 'var(--muted-foreground)' }} />
                      <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
                        Preview {previewQuestions.length} câu (sẽ được shuffle ngẫu nhiên khi tạo)
                      </span>
                    </div>
                    {previewQuestions.map((q, qi) => (
                      <div key={q.id} className="modal-card" style={{ marginBottom: 6 }}>
                        <div style={{ fontWeight: 500, marginBottom: 6 }}>
                          Q{qi + 1}: {q.content}
                        </div>
                        <div style={{ display: 'grid', gap: 4, paddingLeft: 12 }}>
                          {q.options.map((opt: any, oi: number) => (
                            <div key={opt.id} style={{ fontSize: 13 }}>
                              {String.fromCharCode(65 + oi)}. {opt.content}
                              {opt.isCorrect && <span style={{ color: 'var(--success)', marginLeft: 4 }}>✓</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quiz info */}
                <div>
                  <label className="form-label">Tiêu đề quiz</label>
                  <input
                    className="form-input"
                    placeholder="VD: Kiểm tra chương 1 - Đại số"
                    value={form.title}
                    onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">Mô tả (tùy chọn)</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Mô tả ngắn về bài kiểm tra"
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="form-label">Thời gian (phút)</label>
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    placeholder="30"
                    value={form.timeLimit ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, timeLimit: Number(e.target.value) || undefined }))}
                    style={{ maxWidth: 200 }}
                  />
                </div>

                {error && <div style={{ color: 'var(--destructive)', fontSize: 13 }}>{error}</div>}

                <div>
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleCreate}
                    disabled={creating || !selectedSubject}
                  >
                    {creating ? 'Đang tạo...' : `Tạo quiz (lấy ${form.questionCount} câu ngẫu nhiên từ môn "${selectedSubject}")`}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quiz detail viewer */}
        {loading && <div>Đang tải quiz...</div>}
        {quiz && (
          <div className="modal-detail-section">
            <div className="section-title">
              <ListChecks />
              <h4>Chi tiết Quiz</h4>
            </div>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>{quiz.title}</div>
            <div style={{ color: 'var(--muted-foreground)', marginBottom: 12, fontSize: 13 }}>
              {quiz.description}
            </div>
            {quiz.timeLimit && (
              <div style={{ fontSize: 13, marginBottom: 12 }}>⏱ Thời gian: {quiz.timeLimit} phút</div>
            )}
            <ul className="modal-list">
              {(quiz.questions || []).map((q, idx) => (
                <li key={q.id || idx} className="list-item">
                  <div className="item-icon">Q{idx + 1}</div>
                  <div className="item-content">
                    <div className="item-title">{q.content}</div>
                    <div className="item-subtitle" style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                      {q.type} • {Array.isArray(q.options) ? `${q.options.length} lựa chọn` : '—'}
                    </div>
                    {Array.isArray(q.options) && q.options.length > 0 && (
                      <ul style={{ marginTop: 8, paddingLeft: 18, color: 'var(--muted-foreground)', fontSize: 12 }}>
                        {q.options.map(option => (
                          <li key={option.id || option.content}>
                            {option.content}
                            {option.isCorrect ? ' ✅' : ''}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  )
}
