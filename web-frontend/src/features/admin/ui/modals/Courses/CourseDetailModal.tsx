import React, { useEffect, useState } from 'react'
import Modal from '@/features/admin/ui/common/Modal'
import Button from '@/features/admin/ui/common/primitives/Button'
import {
	BookOpen, Calendar, Hash, User, Layers, ListChecks, Trash2, Eye,
	Plus, ChevronUp, ChevronDown, FileText, Video, HelpCircle
} from 'lucide-react'
import courseApi, { type Material, type CreateMaterialRequest } from '@/features/courses/api/courseApi'
import { toast } from '@/foundation/contexts/ToastContext'
import CourseQuizModal from './CourseQuizModal'

interface CourseDetailModalProps {
	isOpen: boolean
	onClose: () => void
	course: any
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
	position: 'relative',
	overflow: 'hidden',
}

const cardTopBorder: React.CSSProperties = {
	...cardStyle,
}

const sectionTitleStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 10,
	paddingBottom: 14,
	marginBottom: 18,
	borderBottom: '2px solid rgba(102, 126, 234, 0.1)',
	fontSize: 17,
	fontWeight: 700,
	color: '#1e293b',
}

const infoGridStyle: React.CSSProperties = {
	display: 'grid',
	gridTemplateColumns: '1fr 1fr',
	gap: 12,
}

const infoPairStyle: React.CSSProperties = {
	padding: '12px 14px',
	background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
	borderRadius: 10,
	border: '1px solid rgba(102, 126, 234, 0.1)',
}

const infoLabelStyle: React.CSSProperties = {
	fontSize: 12,
	fontWeight: 700,
	color: '#667eea',
	textTransform: 'uppercase',
	letterSpacing: 0.5,
	marginBottom: 4,
}

const infoValueStyle: React.CSSProperties = {
	fontSize: 14,
	color: '#1e293b',
	fontWeight: 500,
}

const headerBarStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	marginBottom: 16,
}

const inputRowStyle: React.CSSProperties = {
	display: 'flex',
	gap: 8,
	flexWrap: 'wrap' as const,
	marginBottom: 12,
	alignItems: 'flex-end',
}

const inputStyle: React.CSSProperties = {
	padding: '9px 14px',
	border: '1.5px solid #e2e8f0',
	borderRadius: 10,
	background: '#fff',
	color: '#1f2937',
	fontSize: 14,
	outline: 'none',
	transition: 'border-color 0.2s',
	flex: '1 1 180px',
	minWidth: 160,
}

const listStyle: React.CSSProperties = {
	listStyle: 'none',
	padding: 0,
	margin: 0,
	display: 'flex',
	flexDirection: 'column',
	gap: 8,
}

const listItemStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 14,
	padding: '12px 16px',
	background: '#fff',
	borderRadius: 12,
	border: '1px solid rgba(102, 126, 234, 0.1)',
	transition: 'all 0.2s',
}

const itemIconStyle: React.CSSProperties = {
	width: 38,
	height: 38,
	borderRadius: 10,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
	color: '#fff',
	flexShrink: 0,
}

const itemContentStyle: React.CSSProperties = {
	flex: 1,
	minWidth: 0,
}

const itemTitleStyle: React.CSSProperties = {
	fontSize: 14,
	fontWeight: 600,
	color: '#1e293b',
	marginBottom: 2,
}

const itemSubtitleStyle: React.CSSProperties = {
	fontSize: 12,
	color: '#64748b',
}

const itemMetaStyle: React.CSSProperties = {
	display: 'flex',
	gap: 6,
	alignItems: 'center',
	flexShrink: 0,
}

const actionBtnStyle: React.CSSProperties = {
	padding: '6px 12px',
	background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
	color: '#fff',
	border: 'none',
	borderRadius: 8,
	fontSize: 12,
	fontWeight: 600,
	cursor: 'pointer',
	display: 'flex',
	alignItems: 'center',
	gap: 4,
	transition: 'all 0.2s',
}

const dangerBtnStyle: React.CSSProperties = {
	...actionBtnStyle,
	background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
}

const secondBtnStyle: React.CSSProperties = {
	padding: '6px 12px',
	background: '#fff',
	color: '#64748b',
	border: '1.5px solid #e2e8f0',
	borderRadius: 8,
	fontSize: 12,
	fontWeight: 600,
	cursor: 'pointer',
	display: 'flex',
	alignItems: 'center',
	gap: 4,
	transition: 'all 0.2s',
}

const statusBadgeStyle = (variant: string): React.CSSProperties => {
	const base: React.CSSProperties = {
		display: 'inline-flex',
		alignItems: 'center',
		padding: '4px 10px',
		borderRadius: 20,
		fontSize: 11,
		fontWeight: 700,
		textTransform: 'uppercase' as const,
		letterSpacing: 0.5,
		marginTop: 8,
	}
	const variants: Record<string, React.CSSProperties> = {
		success: { ...base, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' },
		warning: { ...base, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' },
		danger: { ...base, background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff' },
		secondary: { ...base, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' },
	}
	return variants[variant] || variants.secondary
}

const safeImg = (url?: string) => {
	if (typeof url === 'string' && url.trim().length > 0) return url
	return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="%2394a3b8">No image</text></svg>'
}

const formatDateTime = (value?: string) => {
	if (!value) return '—'
	try {
		return new Date(value).toLocaleString('vi-VN')
	} catch {
		return value
	}
}

const typeIcon = (type: string) => {
	switch (type) {
		case 'video': return <Video size={18} />
		case 'document': return <FileText size={18} />
		case 'quiz': return <HelpCircle size={18} />
		default: return <BookOpen size={18} />
	}
}

// ─── Component ────────────────────────────────────────────────────────────────

const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
	isOpen,
	onClose,
	course
}) => {
	if (!course) return null

	const [materials, setMaterials] = useState<Material[]>([])
	const [materialsLoading, setMaterialsLoading] = useState(false)
	const [newMaterial, setNewMaterial] = useState<CreateMaterialRequest>({
		title: '',
		type: 'video',
		storageKey: '',
		content: '',
		displayOrder: 1,
	})
	const [uploading, setUploading] = useState(false)
	const [quizModalOpen, setQuizModalOpen] = useState(false)
	const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null)
	const [quizzes, setQuizzes] = useState<{ id: string; title: string }[]>([])
	const [quizzesLoading, setQuizzesLoading] = useState(false)

	useEffect(() => {
		if (!isOpen || !course?.id) return
		setMaterialsLoading(true)
		setQuizzesLoading(true)

		Promise.all([
			courseApi.getCourseMaterials(course.id).catch(() => ({ data: [] })),
			courseApi.getCourseQuizzes(course.id).catch(() => ({ data: [] })),
		]).then(([matRes, quizRes]) => {
			setMaterials(matRes.data ?? [])
			setQuizzes(quizRes.data ?? [])
		}).catch(() => {}).finally(() => {
			setMaterialsLoading(false)
			setQuizzesLoading(false)
		})
	}, [isOpen, course?.id])

	const handleAddMaterial = async () => {
		if (!course?.id || !newMaterial.title?.trim()) return
		try {
			const payload: CreateMaterialRequest = {
				title: newMaterial.title.trim(),
				type: newMaterial.type,
				displayOrder: newMaterial.displayOrder,
				storageKey: newMaterial.storageKey?.trim() || undefined,
				content: newMaterial.content?.trim() || undefined,
			}
			await courseApi.addMaterialToCourse(course.id, payload)
			setNewMaterial({ title: '', type: 'video', storageKey: '', content: '', displayOrder: (newMaterial.displayOrder ?? 0) + 1 })
			const res = await courseApi.getCourseMaterials(course.id)
			setMaterials(res.data ?? [])
		} catch {
			toast.error('Thêm học liệu thất bại')
		}
	}

	const handleUploadMaterialFile = async (file: File | null) => {
		if (!file || !course?.id) return
		try {
			setUploading(true)
			const res = await courseApi.uploadMaterialFile(course.id, file)
			const storageKey = (res.data?.storageKey || res.data?.url) as string
			if (storageKey) setNewMaterial(prev => ({ ...prev, storageKey }))
		} catch {
			toast.error('Tải file học liệu thất bại')
		} finally {
			setUploading(false)
		}
	}

	const moveMaterial = async (idx: number, direction: -1 | 1) => {
		const targetIdx = idx + direction
		if (targetIdx < 0 || targetIdx >= materials.length) return
		const a = materials[idx]
		const b = materials[targetIdx]
		const aOrder = a.displayOrder ?? idx + 1
		const bOrder = b.displayOrder ?? targetIdx + 1
		try {
			await Promise.all([
				courseApi.updateMaterial(a.id, { displayOrder: bOrder }),
				courseApi.updateMaterial(b.id, { displayOrder: aOrder }),
			])
			const res = await courseApi.getCourseMaterials(course.id)
			setMaterials(res.data ?? [])
		} catch {
			toast.error('Cập nhật thứ tự thất bại')
		}
	}

	const handleDeleteMaterial = async (materialId: string) => {
		try {
			await courseApi.deleteMaterial(materialId)
			const res = await courseApi.getCourseMaterials(course.id)
			setMaterials(res.data ?? [])
		} catch {
			toast.error('Xóa học liệu thất bại')
		}
	}

	const handleDeleteQuiz = async (quizId: string) => {
		if (!confirm('Xóa quiz này?')) return
		try {
			await courseApi.deleteQuiz(quizId)
			setQuizzes(prev => prev.filter(q => q.id !== quizId))
			if (selectedQuizId === quizId) setSelectedQuizId(null)
			toast.success('Đã xóa quiz')
		} catch {
			toast.error('Xóa quiz thất bại')
		}
	}

	const visibility = { draft: 'Bản nháp', published: 'Đã xuất bản', archived: 'Đã lưu trữ', suspended: 'Tạm dừng', private: 'Riêng tư' }[course.visibility] ?? course.visibility ?? '—'
	const visibilityClass = { draft: 'warning', published: 'success', archived: 'secondary', suspended: 'danger', private: 'secondary' }[course.visibility] ?? 'secondary'

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Chi tiết khóa học" maxWidth="820px">
			<div style={wrapperStyle}>

				{/* Course header card */}
				<div style={cardStyle}>
					<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
						<img
							src={safeImg(course.thumbnailUrl || course.thumbnail)}
							alt={course.title}
							style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 14, flexShrink: 0 }}
						/>
						<div style={{ flex: 1, minWidth: 0 }}>
							<div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
								{course.title || '—'}
							</div>
							<div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>
								{course.description?.slice(0, 100) || 'Chưa có mô tả'}
							</div>
							<div style={statusBadgeStyle(visibilityClass)}>{visibility}</div>
						</div>
					</div>
				</div>

				{/* Info card */}
				<div style={cardStyle}>
					<div style={sectionTitleStyle}>
						<BookOpen size={20} style={{ color: '#667eea' }} />
						Thông tin chung
					</div>
					<div style={infoGridStyle}>
						<div style={infoPairStyle}>
							<div style={infoLabelStyle}>Organization</div>
							<div style={infoValueStyle}>
								<User size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
								{course.organizationId ?? '—'}
							</div>
						</div>
						<div style={infoPairStyle}>
							<div style={infoLabelStyle}>Slug</div>
							<div style={{ ...infoValueStyle, fontFamily: 'monospace', fontSize: 13 }}>
								<Hash size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
								{course.slug || '—'}
							</div>
						</div>
						<div style={infoPairStyle}>
							<div style={infoLabelStyle}>Tạo lúc</div>
							<div style={infoValueStyle}>
								<Calendar size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
								{formatDateTime(course.createdAt)}
							</div>
						</div>
						<div style={infoPairStyle}>
							<div style={infoLabelStyle}>Cập nhật</div>
							<div style={infoValueStyle}>
								<Calendar size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
								{formatDateTime(course.updatedAt)}
							</div>
						</div>
					</div>
				</div>

				{/* Materials section */}
				<div style={cardStyle}>
					<div style={sectionTitleStyle}>
						<Layers size={20} style={{ color: '#667eea' }} />
						Học liệu ({materials.length})
					</div>

					<div style={inputRowStyle}>
						<input
							style={{ ...inputStyle, flex: '2 1 200px' }}
							placeholder="Tiêu đề học liệu"
							value={newMaterial.title}
							onChange={e => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
						/>
						<select
							style={{ ...inputStyle, width: 130 }}
							value={newMaterial.type}
							onChange={e => setNewMaterial(prev => ({ ...prev, type: e.target.value }))}
						>
							<option value="video">Video</option>
							<option value="document">Tài liệu</option>
							<option value="quiz">Quiz</option>
							<option value="text">Text</option>
						</select>
						{newMaterial.type !== 'text' && newMaterial.type !== 'quiz' && (
							<input
								type="file"
								style={{ ...inputStyle, flex: '2 1 200px' }}
								onChange={e => handleUploadMaterialFile(e.target.files?.[0] || null)}
								disabled={uploading}
							/>
						)}
						<input
							style={{ ...inputStyle, width: 140 }}
							placeholder="Storage key"
							value={newMaterial.storageKey ?? ''}
							onChange={e => setNewMaterial(prev => ({ ...prev, storageKey: e.target.value }))}
						/>
						<input
							type="number"
							style={{ ...inputStyle, width: 80 }}
							placeholder="Thứ tự"
							value={newMaterial.displayOrder ?? ''}
							onChange={e => setNewMaterial(prev => ({ ...prev, displayOrder: Number(e.target.value) || undefined }))}
						/>
						<Button variant="primary" type="button" onClick={handleAddMaterial}>
							<Plus size={14} /> Thêm
						</Button>
					</div>

					{materialsLoading ? (
						<div style={{ color: '#64748b', fontSize: 14, padding: '12px 0' }}>Đang tải...</div>
					) : materials.length === 0 ? (
						<div style={{ color: '#94a3b8', fontSize: 14, padding: '12px 0', textAlign: 'center' as const }}>
							Chưa có học liệu nào
						</div>
					) : (
						<ul style={listStyle}>
							{materials.map((m, idx) => (
								<li key={m.id} style={listItemStyle}>
									<div style={itemIconStyle}>{typeIcon(m.type)}</div>
									<div style={itemContentStyle}>
										<div style={itemTitleStyle}>{m.title}</div>
										<div style={itemSubtitleStyle}>
											{m.type} • Thứ tự {m.displayOrder ?? '-'}
											{m.storageKey ? ` • ${m.storageKey}` : ''}
										</div>
									</div>
									<div style={itemMetaStyle}>
										<button style={secondBtnStyle} onClick={() => moveMaterial(idx, -1)} title="Lên" disabled={idx === 0}>
											<ChevronUp size={14} />
										</button>
										<button style={secondBtnStyle} onClick={() => moveMaterial(idx, 1)} title="Xuống" disabled={idx === materials.length - 1}>
											<ChevronDown size={14} />
										</button>
										<button style={dangerBtnStyle} onClick={() => handleDeleteMaterial(m.id)} title="Xóa">
											<Trash2 size={13} />
										</button>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>

				{/* Quiz section */}
				<div style={cardStyle}>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
						<div style={{ ...sectionTitleStyle, marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
							<ListChecks size={20} style={{ color: '#667eea' }} />
							Quiz ({quizzes.length})
						</div>
						<Button variant="secondary" type="button" onClick={() => setQuizModalOpen(true)}>
							<Plus size={14} /> Tạo / Xem Quiz
						</Button>
					</div>

					{quizzesLoading ? (
						<div style={{ color: '#64748b', fontSize: 14, padding: '12px 0' }}>Đang tải...</div>
					) : quizzes.length === 0 ? (
						<div style={{ color: '#94a3b8', fontSize: 14, padding: '16px 0', textAlign: 'center' as const }}>
							Chưa có quiz nào. Nhấn "Tạo / Xem Quiz" để tạo bài kiểm tra đầu tiên.
						</div>
					) : (
						<ul style={listStyle}>
							{quizzes.map(q => (
								<li key={q.id} style={listItemStyle}>
									<div style={itemIconStyle}><ListChecks size={18} /></div>
									<div style={itemContentStyle}>
										<div style={itemTitleStyle}>{q.title}</div>
										<div style={itemSubtitleStyle}>Quiz</div>
									</div>
									<div style={itemMetaStyle}>
										<button
											style={secondBtnStyle}
											title="Xem chi tiết"
											onClick={() => { setSelectedQuizId(q.id); setQuizModalOpen(true) }}
										>
											<Eye size={13} />
										</button>
										<button
											style={{ ...dangerBtnStyle, padding: '6px 8px' }}
											title="Xóa"
											onClick={() => handleDeleteQuiz(q.id)}
										>
											<Trash2 size={13} />
										</button>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>

			<CourseQuizModal
				isOpen={quizModalOpen}
				onClose={() => setQuizModalOpen(false)}
				courseId={course.id}
				selectedQuizId={selectedQuizId}
				onQuizDeleted={() => {
					if (course.id) {
						courseApi.getCourseQuizzes(course.id).then(r => setQuizzes(r.data ?? [])).catch(() => {})
					}
				}}
			/>
		</Modal>
	)
}

export default CourseDetailModal
