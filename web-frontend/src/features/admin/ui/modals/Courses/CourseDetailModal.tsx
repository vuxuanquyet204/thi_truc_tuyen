import React, { useEffect, useState } from 'react'
import Modal from '@/features/admin/ui/common/Modal'
import Button from '@/features/admin/ui/common/primitives/Button'
import { BookOpen, Calendar, Hash, User, Layers } from 'lucide-react'
import courseApi, { type Material, type CreateMaterialRequest } from '@/features/courses/api/courseApi'
import { toast } from '@/foundation/contexts/ToastContext'
import CourseQuizModal from './CourseQuizModal'

interface CourseDetailModalProps {
	isOpen: boolean
	onClose: () => void
	course: any
}

const visibilityLabelMap: Record<string, string> = {
	draft: 'Bản nháp',
	published: 'Đã xuất bản',
	archived: 'Đã lưu trữ',
	suspended: 'Tạm dừng',
	private: 'Riêng tư'
}

const visibilityClassMap: Record<string, string> = {
	draft: 'warning',
	published: 'success',
	archived: 'secondary',
	suspended: 'danger',
	private: 'secondary'
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
		displayOrder: 1
	})
	const [uploading, setUploading] = useState(false)
	const [quizModalOpen, setQuizModalOpen] = useState(false)

	useEffect(() => {
		const loadMaterials = async () => {
			if (!course?.id) return
			setMaterialsLoading(true)
			try {
				const res = await courseApi.getCourseMaterials(course.id)
				setMaterials(res.data ?? [])
			} catch (e) {
				console.error('Load materials failed', e)
			} finally {
				setMaterialsLoading(false)
			}
		}

		if (isOpen && course?.id) {
			loadMaterials()
		}
	}, [isOpen, course?.id])

	const handleAddMaterial = async () => {
		if (!course?.id) return
		if (!newMaterial.title?.trim()) return
		try {
			const payload: CreateMaterialRequest = {
				title: newMaterial.title.trim(),
				type: newMaterial.type,
				displayOrder: newMaterial.displayOrder,
				storageKey: newMaterial.storageKey?.trim() || undefined,
				content: newMaterial.content?.trim() || undefined
			}
			await courseApi.addMaterialToCourse(course.id, payload)
			setNewMaterial({
				title: '',
				type: 'video',
				storageKey: '',
				content: '',
				displayOrder: (newMaterial.displayOrder ?? 0) + 1
			})
			const updated = await courseApi.getCourseMaterials(course.id)
			setMaterials(updated.data ?? [])
		} catch (e) {
			toast.error('Thêm học liệu thất bại')
		}
	}

	const handleUploadMaterialFile = async (file: File | null) => {
		if (!file || !course?.id) return
		try {
			setUploading(true)
			const res = await courseApi.uploadMaterialFile(course.id, file)
			const storageKey = (res.data?.storageKey || res.data?.url) as string
			if (storageKey) {
				setNewMaterial(prev => ({ ...prev, storageKey }))
			}
		} catch (e) {
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
		// Swap displayOrder (fallback to index if missing)
		const aOrder = a.displayOrder ?? idx + 1
		const bOrder = b.displayOrder ?? targetIdx + 1
		try {
			await Promise.all([
				courseApi.updateMaterial(a.id, { displayOrder: bOrder }),
				courseApi.updateMaterial(b.id, { displayOrder: aOrder })
			])
			// Reload
			const updated = await courseApi.getCourseMaterials(course.id)
			setMaterials(updated.data ?? [])
		} catch (e) {
			toast.error('Cập nhật thứ tự thất bại')
		}
	}

	const handleDeleteMaterial = async (materialId: string) => {
		try {
			await courseApi.deleteMaterial(materialId)
			const updated = await courseApi.getCourseMaterials(course.id)
			setMaterials(updated.data ?? [])
		} catch (e) {
			toast.error('Xóa học liệu thất bại')
		}
	}

	const visibility = visibilityLabelMap[course.visibility] ?? course.visibility ?? 'Không xác định'
	const visibilityClass = visibilityClassMap[course.visibility] ?? 'secondary'

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Chi tiết khóa học" maxWidth="800px">
			<div className="modal-content-wrapper">
				<div className="modal-info-card">
					<div className="card-icon">
						<img
							src={safeImg(course.thumbnailUrl || course.thumbnail)}
							alt={course.title || 'Course thumbnail'}
							style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: '16px' }}
						/>
					</div>
					<div className="card-title">{course.title || '—'}</div>
					<div className={`modal-status-badge ${visibilityClass}`} style={{ marginTop: 8 }}>
						{visibility}
					</div>
				</div>

				<div className="modal-detail-section">
					<div className="section-title">
						<BookOpen />
						<h4>Thông tin chung</h4>
					</div>
					<div className="modal-info-pairs">
						<div className="modal-info-pair">
							<div className="info-label">Organization</div>
							<div className="info-value">
								<User size={14} style={{ marginRight: 6 }} />
								{course.organizationId ?? '—'}
							</div>
						</div>
						<div className="modal-info-pair">
							<div className="info-label">Slug</div>
							<div className="info-value">
								<Hash size={14} style={{ marginRight: 6 }} />
								{course.slug || '—'}
							</div>
						</div>
						<div className="modal-info-pair">
							<div className="info-label">Tạo lúc</div>
							<div className="info-value">
								<Calendar size={14} style={{ marginRight: 6 }} />
								{formatDateTime(course.createdAt)}
							</div>
						</div>
						<div className="modal-info-pair">
							<div className="info-label">Cập nhật</div>
							<div className="info-value">
								<Calendar size={14} style={{ marginRight: 6 }} />
								{formatDateTime(course.updatedAt)}
							</div>
						</div>
					</div>
				</div>

				<div className="modal-detail-section">
					<div className="section-title">
						<BookOpen />
						<h4>Mô tả</h4>
					</div>
					<p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, margin: 0 }}>
						{course.description || 'Chưa có mô tả'}
					</p>
				</div>

				<div className="modal-detail-section">
					<div className="section-title">
						<Layers />
						<h4>Học liệu</h4>
					</div>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
						<div style={{ fontWeight: 600 }}>Quản lý học liệu</div>
						<Button variant="secondary" type="button" onClick={() => setQuizModalOpen(true)}>
							Quản trị Quiz
						</Button>
					</div>
			<div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
						<input
							type="text"
							className="form-input"
							placeholder="Tiêu đề học liệu"
							value={newMaterial.title}
							onChange={(e) => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
							style={{ minWidth: 220 }}
						/>
						<select
							className="form-input"
							value={newMaterial.type}
					onChange={(e) => setNewMaterial(prev => ({ ...prev, type: e.target.value }))}
						>
							<option value="video">Video</option>
							<option value="document">Tài liệu</option>
							<option value="quiz">Quiz</option>
							<option value="text">Text</option>
						</select>
						{newMaterial.type !== 'text' && newMaterial.type !== 'quiz' && (
							<>
								<input
									type="file"
									className="form-input"
									style={{ minWidth: 220 }}
									onChange={(e) => handleUploadMaterialFile(e.target.files?.[0] || null)}
									disabled={uploading}
								/>
							</>
						)}
						<input
					type="text"
							className="form-input"
					placeholder="Storage key (tùy chọn)"
					value={newMaterial.storageKey ?? ''}
					onChange={(e) => setNewMaterial(prev => ({ ...prev, storageKey: e.target.value }))}
					style={{ minWidth: 200 }}
				/>
				<textarea
					className="form-textarea"
					placeholder="Nội dung học liệu (tùy chọn)"
					value={newMaterial.content ?? ''}
					onChange={(e) => setNewMaterial(prev => ({ ...prev, content: e.target.value }))}
					rows={2}
					style={{ minWidth: 220 }}
						/>
						<input
							type="number"
							className="form-input"
							placeholder="Thứ tự"
					value={newMaterial.displayOrder ?? ''}
					onChange={(e) => setNewMaterial(prev => ({ ...prev, displayOrder: Number(e.target.value) || undefined }))}
							style={{ width: 100 }}
						/>
						<Button variant="primary" type="button" onClick={handleAddMaterial}>
							Thêm học liệu
						</Button>
					</div>
					{materialsLoading ? (
						<div>Đang tải học liệu...</div>
					) : materials.length === 0 ? (
						<div style={{ color: 'var(--muted-foreground)' }}>Chưa có học liệu</div>
					) : (
						<ul className="modal-list">
							{materials.map(m => (
								<li key={m.id} className="list-item">
									<div className="item-icon"><BookOpen /></div>
									<div className="item-content">
										<div className="item-title">{m.title}</div>
									<div className="item-subtitle" style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
										{m.type} • Thứ tự {m.displayOrder ?? '-'}
										{m.storageKey ? ` • Key ${m.storageKey}` : ''}
									</div>
									{m.content && (
										<div style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 4 }}>
											{m.content.length > 80 ? `${m.content.slice(0, 80)}…` : m.content}
										</div>
									)}
									</div>
									<div className="item-meta">
										<div style={{ display: 'flex', gap: 6 }}>
											<button className="modal-action-button" type="button" onClick={() => moveMaterial(materials.findIndex(x => x.id === m.id), -1)}>
												Lên
											</button>
											<button className="modal-action-button" type="button" onClick={() => moveMaterial(materials.findIndex(x => x.id === m.id), 1)}>
												Xuống
											</button>
										</div>
										<button className="modal-action-button" type="button" onClick={() => handleDeleteMaterial(m.id)}>
											Xóa
										</button>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>

				<CourseQuizModal isOpen={quizModalOpen} onClose={() => setQuizModalOpen(false)} courseId={course.id} />
			</div>
		</Modal>
	)
}

export default CourseDetailModal
