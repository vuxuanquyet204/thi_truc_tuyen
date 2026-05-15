import React, { useState, useEffect } from 'react'
import Modal from '@/features/admin/ui/common/Modal'
import {
	BookOpen, ListChecks, PlusCircle, Shuffle, RefreshCw, BookMarked, Trash2, Eye
} from 'lucide-react'
import courseApi, {
	type Quiz,
} from '@/features/courses/api/courseApi'
import { getAllSubjects } from '@/features/admin/api/examApi'

interface CourseQuizModalProps {
	isOpen: boolean
	onClose: () => void
	courseId?: string
	selectedQuizId?: string | null
	onQuizDeleted?: () => void
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const wrapperStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 20,
	padding: 24,
}

const cardStyle: React.CSSProperties = {
	background: '#fff',
	borderRadius: 16,
	padding: 20,
	border: '1px solid rgba(102, 126, 234, 0.1)',
	boxShadow: '0 4px 20px rgba(102, 126, 234, 0.06)',
}

const sectionTitleStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 10,
	paddingBottom: 14,
	marginBottom: 18,
	borderBottom: '2px solid rgba(102, 126, 234, 0.1)',
	fontSize: 16,
	fontWeight: 700,
	color: '#1e293b',
}

const tabRowStyle: React.CSSProperties = {
	display: 'flex',
	gap: 8,
	marginBottom: 20,
}

const tabStyle = (active: boolean): React.CSSProperties => ({
	padding: '9px 18px',
	borderRadius: 10,
	border: 'none',
	fontSize: 13,
	fontWeight: 600,
	cursor: 'pointer',
	display: 'flex',
	alignItems: 'center',
	gap: 6,
	transition: 'all 0.2s',
	...active
		? {
			background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
			color: '#fff',
			boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
		  }
		: {
			background: '#f1f5f9',
			color: '#64748b',
			border: '1.5px solid #e2e8f0',
		  },
})

const inputStyle: React.CSSProperties = {
	padding: '10px 14px',
	border: '1.5px solid #e2e8f0',
	borderRadius: 10,
	background: '#fff',
	color: '#1f2937',
	fontSize: 14,
	outline: 'none',
	width: '100%',
	boxSizing: 'border-box' as const,
	transition: 'border-color 0.2s',
}

const selectStyle: React.CSSProperties = {
	...inputStyle,
	appearance: 'none' as const,
	backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
	backgroundPosition: 'right 10px center',
	backgroundRepeat: 'no-repeat',
	backgroundSize: 18,
	paddingRight: 36,
}

const labelStyle: React.CSSProperties = {
	display: 'block',
	fontSize: 13,
	fontWeight: 600,
	color: '#374151',
	marginBottom: 8,
}

const fieldGroupStyle: React.CSSProperties = {
	marginBottom: 16,
}

const errorStyle: React.CSSProperties = {
	color: '#ef4444',
	fontSize: 13,
	fontWeight: 600,
	marginTop: 8,
}

const spinnerStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 8,
	color: '#64748b',
	fontSize: 14,
	padding: '16px 0',
}

const previewCardStyle: React.CSSProperties = {
	border: '1px solid rgba(102, 126, 234, 0.15)',
	borderRadius: 10,
	padding: 14,
	marginBottom: 10,
	background: '#fafbff',
}

const quizHeaderStyle: React.CSSProperties = {
	background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
	borderRadius: 14,
	padding: '16px 20px',
	marginBottom: 16,
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	flexWrap: 'wrap' as const,
	gap: 12,
}

const statBoxStyle: React.CSSProperties = {
	textAlign: 'center' as const,
	padding: '8px 16px',
	background: 'rgba(255,255,255,0.15)',
	borderRadius: 10,
}

const statValueStyle: React.CSSProperties = {
	color: '#fff',
	fontWeight: 800,
	fontSize: 22,
}

const statLabelStyle: React.CSSProperties = {
	color: 'rgba(255,255,255,0.75)',
	fontSize: 11,
	fontWeight: 600,
	marginTop: 2,
}

const questionCardStyle: React.CSSProperties = {
	border: '1px solid #e2e8f0',
	borderRadius: 12,
	marginBottom: 12,
	overflow: 'hidden',
}

const questionHeaderStyle: React.CSSProperties = {
	background: '#f8fafc',
	padding: '12px 16px',
	display: 'flex',
	gap: 12,
	alignItems: 'flex-start',
}

const questionNumStyle: React.CSSProperties = {
	minWidth: 32,
	height: 32,
	borderRadius: '50%',
	background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
	color: '#fff',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	fontWeight: 700,
	fontSize: 13,
	flexShrink: 0,
}

const badgeStyle = (color: string, bg: string): React.CSSProperties => ({
	fontSize: 11,
	padding: '2px 8px',
	borderRadius: 100,
	background: bg,
	color,
	fontWeight: 600,
	marginRight: 6,
})

const optionCardStyle = (correct: boolean): React.CSSProperties => ({
	display: 'flex',
	alignItems: 'center',
	gap: 10,
	padding: '9px 14px',
	borderRadius: 8,
	border: correct ? '1.5px solid #10b981' : '1px solid #e2e8f0',
	background: correct ? 'rgba(16, 185, 129, 0.06)' : '#fff',
	fontSize: 13,
	marginBottom: 6,
})

const optionLetterStyle = (correct: boolean): React.CSSProperties => ({
	width: 24,
	height: 24,
	borderRadius: '50%',
	background: correct ? '#10b981' : '#e2e8f0',
	color: correct ? '#fff' : '#94a3b8',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	fontWeight: 700,
	fontSize: 12,
	flexShrink: 0,
})

// ─── Component ────────────────────────────────────────────────────────────────

export default function CourseQuizModal({
	isOpen,
	onClose,
	courseId,
	selectedQuizId,
	onQuizDeleted,
}: CourseQuizModalProps) {
	const [tab, setTab] = useState<'view' | 'create'>('create')
	const [loading, setLoading] = useState(false)
	const [creating, setCreating] = useState(false)
	const [quiz, setQuiz] = useState<Quiz | null>(null)
	const [quizIdInput, setQuizIdInput] = useState('')
	const [error, setError] = useState<string | null>(null)

	const [subjects, setSubjects] = useState<string[]>([])
	const [loadingSubjects, setLoadingSubjects] = useState(false)
	const [selectedSubject, setSelectedSubject] = useState('')

	const [form, setForm] = useState({
		title: '',
		description: '',
		timeLimit: undefined as number | undefined,
		questionCount: 5,
	})

	const [previewQuestions, setPreviewQuestions] = useState<any[]>([])

	// Load subjects
	useEffect(() => {
		if (isOpen) {
			setLoadingSubjects(true)
			getAllSubjects()
				.then(setSubjects)
				.catch(() => setSubjects([]))
				.finally(() => setLoadingSubjects(false))
		}
	}, [isOpen])

	// Auto-load quiz when selected
	useEffect(() => {
		if (isOpen && selectedQuizId) {
			setTab('view')
			setQuizIdInput(selectedQuizId)
			setLoading(true)
			courseApi.getQuizDetailsAdmin(selectedQuizId)
				.then(res => setQuiz(res.data ?? null))
				.catch(() =>
					courseApi.getQuizDetails(selectedQuizId)
						.then(res => setQuiz(res.data ?? null))
						.catch(() => setQuiz(null))
				)
				.finally(() => setLoading(false))
		}
	}, [isOpen, selectedQuizId])

	// Reset on close
	useEffect(() => {
		if (!isOpen) {
			setSelectedSubject('')
			setPreviewQuestions([])
			setQuiz(null)
			setError(null)
			setTab('create')
			setQuizIdInput('')
			setForm({ title: '', description: '', timeLimit: undefined, questionCount: 5 })
		}
	}, [isOpen])

	const handlePreview = () => {
		if (!selectedSubject) return
		setError(null)
		const count = Math.max(1, form.questionCount)
		const mock = Array.from({ length: count }, (_, i) => ({
			id: `preview-${i}`,
			content: `Câu hỏi #${i + 1} từ "${selectedSubject}" (sẽ shuffle khi tạo thật)`,
			type: 'SINGLE_CHOICE',
			options: [
				{ id: `o${i}a`, content: 'Đáp án A', isCorrect: i === 0 },
				{ id: `o${i}b`, content: 'Đáp án B', isCorrect: false },
				{ id: `o${i}c`, content: 'Đáp án C', isCorrect: false },
				{ id: `o${i}d`, content: 'Đáp án D', isCorrect: false },
			],
		}))
		for (let i = mock.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[mock[i], mock[j]] = [mock[j], mock[i]]
		}
		setPreviewQuestions(mock)
	}

	const handleCreate = async () => {
		if (!courseId) { setError('Thiếu courseId'); return }
		if (!form.title.trim()) { setError('Nhập tiêu đề quiz'); return }
		if (!selectedSubject) { setError('Chọn môn học'); return }
		if (!form.questionCount || form.questionCount < 1) { setError('Số câu hỏi phải từ 1'); return }

		try {
			setCreating(true)
			setError(null)
			const res = await courseApi.createQuiz(courseId, {
				title: form.title.trim(),
				description: form.description?.trim() || undefined,
				timeLimitMinutes: form.timeLimit || 30,
				subject: selectedSubject,
				questionCount: form.questionCount,
			} as any)
			const id = (res.data as any)?.id || (res.data as any)?.quizId
			if (id) {
				const detail = await courseApi.getQuizDetailsAdmin(id)
				setQuiz(detail.data ?? null)
				setTab('view')
				setQuizIdInput(id)
				onQuizDeleted?.()
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
			const res = await courseApi.getQuizDetailsAdmin(quizIdInput.trim())
			setQuiz(res.data ?? null)
		} catch {
			try {
				const res = await courseApi.getQuizDetails(quizIdInput.trim())
				setQuiz(res.data ?? null)
			} catch (e: any) {
				setError(e?.message || 'Không lấy được chi tiết quiz')
			}
		} finally {
			setLoading(false)
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Quản trị Quiz" maxWidth="900px">
			<div style={wrapperStyle}>

				{/* Tabs */}
				<div style={tabRowStyle}>
					<button style={tabStyle(tab === 'view')} onClick={() => setTab('view')}>
						<BookOpen size={15} /> Xem quiz
					</button>
					<button style={tabStyle(tab === 'create')} onClick={() => setTab('create')}>
						<PlusCircle size={15} /> Tạo quiz
					</button>
				</div>

				{/* VIEW TAB */}
				{tab === 'view' && (
					<div style={cardStyle}>
						<div style={sectionTitleStyle}>
							<ListChecks size={18} style={{ color: '#667eea' }} />
							Tìm quiz theo ID
						</div>
						<div style={{ display: 'flex', gap: 8 }}>
							<input
								style={{ ...inputStyle, flex: 1 }}
								placeholder="Nhập Quiz ID (UUID)"
								value={quizIdInput}
								onChange={e => setQuizIdInput(e.target.value)}
							/>
							<button
								style={{ ...tabStyle(true), whiteSpace: 'nowrap' as const }}
								onClick={fetchQuiz}
								disabled={loading}
							>
								{loading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Eye size={14} />}
								{loading ? 'Đang tải...' : 'Xem chi tiết'}
							</button>
						</div>
					</div>
				)}

				{/* CREATE TAB */}
				{tab === 'create' && (
					<div style={cardStyle}>
						<div style={sectionTitleStyle}>
							<PlusCircle size={18} style={{ color: '#667eea' }} />
							Tạo quiz từ ngân hàng câu hỏi
						</div>

						{/* Subject */}
						<div style={fieldGroupStyle}>
							<label style={labelStyle}>
								<BookMarked size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
								Chọn môn học
							</label>
							{loadingSubjects ? (
								<div style={{ color: '#64748b', fontSize: 13 }}>Đang tải môn học...</div>
							) : (
								<select
									style={selectStyle}
									value={selectedSubject}
									onChange={e => { setSelectedSubject(e.target.value); setPreviewQuestions([]) }}
								>
									<option value="">— Chọn môn học —</option>
									{subjects.map(s => (
										<option key={s} value={s}>{s}</option>
									))}
								</select>
							)}
							{!loadingSubjects && subjects.length === 0 && (
								<small style={{ color: '#94a3b8', fontSize: 12 }}>Không có dữ liệu môn học — kiểm tra exam-service.</small>
							)}
						</div>

						{/* Subject info */}
						{selectedSubject && (
							<div style={{ ...previewCardStyle, marginBottom: 16, background: 'rgba(102, 126, 234, 0.06)', borderColor: 'rgba(102, 126, 234, 0.2)' }}>
								<div style={{ fontWeight: 700, color: '#4f46e5', marginBottom: 4 }}>📚 {selectedSubject}</div>
								<div style={{ fontSize: 13, color: '#64748b' }}>Hệ thống sẽ lấy ngẫu nhiên câu hỏi từ ngân hàng đề khi tạo quiz.</div>
							</div>
						)}

						{/* Question count + preview */}
						<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
							<div style={{ flex: '1 1 160px' }}>
								<label style={labelStyle}>Số câu hỏi</label>
								<input
									style={inputStyle}
									type="number"
									min={1}
									value={form.questionCount}
									onChange={e => {
										setForm(prev => ({ ...prev, questionCount: Number(e.target.value) || 0 }))
										setPreviewQuestions([])
									}}
								/>
							</div>
							<div style={{ display: 'flex', alignItems: 'flex-end' }}>
								<button
									style={{ ...tabStyle(false) }}
									onClick={handlePreview}
									disabled={!selectedSubject || form.questionCount < 1}
								>
									<Shuffle size={14} /> Preview
								</button>
							</div>
						</div>

						{/* Preview */}
						{previewQuestions.length > 0 && (
							<div style={{ marginBottom: 20 }}>
								<div style={{ fontSize: 13, color: '#64748b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
									<RefreshCw size={13} />
									Preview {previewQuestions.length} câu (shuffle ngẫu nhiên)
								</div>
								{previewQuestions.map((q, qi) => (
									<div key={q.id} style={previewCardStyle}>
										<div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
											Câu {qi + 1}: {q.content}
										</div>
										{q.options?.map((opt: any, oi: number) => (
											<div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: 13 }}>
												<span style={{ fontWeight: 700, color: opt.isCorrect ? '#10b981' : '#94a3b8', minWidth: 20 }}>
													{String.fromCharCode(65 + oi)}.
												</span>
												<span style={{ color: opt.isCorrect ? '#065f46' : '#374151' }}>
													{opt.content}
												</span>
												{opt.isCorrect && <span style={{ color: '#10b981', fontWeight: 700, marginLeft: 4 }}>✓</span>}
											</div>
										))}
									</div>
								))}
							</div>
						)}

						{/* Quiz info */}
						<div style={{ ...fieldGroupStyle, marginTop: 4 }}>
							<label style={labelStyle}>Tiêu đề quiz</label>
							<input
								style={inputStyle}
								placeholder="VD: Kiểm tra chương 1 - Đại số"
								value={form.title}
								onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
							/>
						</div>
						<div style={fieldGroupStyle}>
							<label style={labelStyle}>Mô tả (tùy chọn)</label>
							<textarea
								style={{ ...inputStyle, resize: 'vertical' as const, minHeight: 64 }}
								placeholder="Mô tả ngắn"
								value={form.description}
								onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
							/>
						</div>
						<div style={fieldGroupStyle}>
							<label style={labelStyle}>Thời gian (phút)</label>
							<input
								style={{ ...inputStyle, maxWidth: 200 }}
								type="number"
								min={1}
								placeholder="30"
								value={form.timeLimit ?? ''}
								onChange={e => setForm(prev => ({ ...prev, timeLimit: e.target.value ? Number(e.target.value) : undefined }))}
							/>
						</div>

						{error && <div style={errorStyle}>{error}</div>}

						<div style={{ marginTop: 8 }}>
							<button
								style={{
									...tabStyle(true),
									width: '100%',
									justifyContent: 'center',
									padding: '12px 24px',
									fontSize: 14,
								}}
								onClick={handleCreate}
								disabled={creating || !selectedSubject}
							>
								{creating ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <PlusCircle size={15} />}
								{creating
									? 'Đang tạo...'
									: `Tạo quiz (${form.questionCount} câu từ "${selectedSubject || '...'}"${form.timeLimit ? `, ${form.timeLimit} phút` : ''})`
								}
							</button>
						</div>
					</div>
				)}

				{/* QUIZ DETAIL */}
				{loading && (
					<div style={spinnerStyle}>
						<RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
						Đang tải chi tiết quiz...
					</div>
				)}

				{quiz && (
					<div style={cardStyle}>
						{/* Header */}
						<div style={quizHeaderStyle}>
							<div>
								<div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>TIÊU ĐỀ QUIZ</div>
								<div style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>{quiz.title}</div>
								{quiz.description && (
									<div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>{quiz.description}</div>
								)}
							</div>
							<div style={{ display: 'flex', gap: 12 }}>
								{(quiz.timeLimit || quiz.timeLimitMinutes) && (
									<div style={statBoxStyle}>
										<div style={statValueStyle}>{quiz.timeLimit ?? quiz.timeLimitMinutes}</div>
										<div style={statLabelStyle}>phút</div>
									</div>
								)}
								<div style={statBoxStyle}>
									<div style={statValueStyle}>{quiz.questions?.length ?? 0}</div>
									<div style={statLabelStyle}>câu hỏi</div>
								</div>
							</div>
						</div>

						{/* Questions */}
						<div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 12 }}>
							Danh sách câu hỏi
						</div>

						{(quiz.questions || []).map((q, idx) => {
							const typeLabel = q.type === 'SINGLE_CHOICE' ? 'Một đáp án'
								: q.type === 'MULTIPLE_CHOICE' ? 'Nhiều đáp án'
								: q.type === 'true_false' ? 'Đúng / Sai'
								: q.type || 'Tự luận'
							const correctCount = Array.isArray(q.options) ? q.options.filter(o => o.isCorrect).length : 0

							return (
								<div key={q.id || idx} style={questionCardStyle}>
									{/* Question header */}
									<div style={questionHeaderStyle}>
										<div style={questionNumStyle}>{idx + 1}</div>
										<div style={{ flex: 1 }}>
											<div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b', marginBottom: 6, lineHeight: 1.5 }}>
												{q.content}
											</div>
											<div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
												<span style={badgeStyle('#6366f1', 'rgba(99,102,241,0.1)')}>{typeLabel}</span>
												{Array.isArray(q.options) && q.options.length > 0 && (
													<span style={badgeStyle(
														correctCount > 0 ? '#10b981' : '#64748b',
														correctCount > 0 ? 'rgba(16,185,129,0.1)' : '#f1f5f9'
													)}>
														{correctCount > 0 ? `${correctCount} đáp án đúng` : `${q.options.length} lựa chọn`}
													</span>
												)}
											</div>
										</div>
									</div>

									{/* Options */}
									{Array.isArray(q.options) && q.options.length > 0 && (
										<div style={{ padding: '0 16px 14px 16px' }}>
											{q.options.map((opt, oi) => (
												<div key={opt.id || oi} style={optionCardStyle(opt.isCorrect)}>
													<div style={optionLetterStyle(opt.isCorrect)}>
														{String.fromCharCode(65 + oi)}
													</div>
													<div style={{
														flex: 1,
														color: opt.isCorrect ? '#065f46' : '#374151',
														fontWeight: opt.isCorrect ? 600 : 400,
													}}>
														{opt.content}
													</div>
													{opt.isCorrect && (
														<div style={{ color: '#10b981', fontWeight: 800, fontSize: 16 }}>✓</div>
													)}
												</div>
											))}
										</div>
									)}
								</div>
							)
						})}
					</div>
				)}
			</div>
		</Modal>
	)
}
