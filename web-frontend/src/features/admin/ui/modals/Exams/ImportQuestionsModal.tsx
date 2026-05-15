import React, { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react'
import Modal from '@/features/admin/ui/common/Modal'
import Button from '@/features/admin/ui/common/primitives/Button'
import { toast } from '@/foundation/contexts/ToastContext'

interface ImportQuestionsModalProps {
	isOpen: boolean
	onClose: () => void
	onImport: (file: File, subject: string, tags: string) => Promise<{
		imported: number
		skipped: number
		errors: number
		errorDetails: string[]
	}>
}

export default function ImportQuestionsModal({
	isOpen,
	onClose,
	onImport
}: ImportQuestionsModalProps): JSX.Element {
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [subject, setSubject] = useState('')
	const [tags, setTags] = useState('')
	const [isUploading, setIsUploading] = useState(false)
	const [uploadResult, setUploadResult] = useState<any>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setSelectedFile(file)
			setUploadResult(null)
		}
	}

	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()

		// Validation
		if (!selectedFile) {
			toast.error('Vui lòng chọn file Excel')
			return
		}

		// Check file extension
		const fileName = selectedFile.name.toLowerCase()
		if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
			toast.error('File phải có định dạng .xlsx hoặc .xls')
			return
		}

		if (!subject.trim()) {
			toast.error('Vui lòng nhập tên môn học')
			return
		}

		// Validate subject length
		if (subject.trim().length < 2) {
			toast.error('Tên môn học phải có ít nhất 2 ký tự')
			return
		}

		if (subject.trim().length > 100) {
			toast.error('Tên môn học không được vượt quá 100 ký tự')
			return
		}

		// Validate tags if provided
		if (tags.trim() && tags.trim().length > 500) {
			toast.error('Tags không được vượt quá 500 ký tự')
			return
		}

		setIsUploading(true)
		try {
			const result = await onImport(selectedFile, subject.trim(), tags.trim())
			setUploadResult(result)
			
			// Reset form if successful
			if (result.errors === 0) {
				setTimeout(() => {
					handleClose()
				}, 3000)
			}
		} catch (error: any) {
			toast.error(`Lỗi khi import: ${error.message || 'Unknown error'}`)
		} finally {
			setIsUploading(false)
		}
	}

	const handleClose = () => {
		setSelectedFile(null)
		setSubject('')
		setTags('')
		setUploadResult(null)
		setIsUploading(false)
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
		onClose()
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title="Nhập câu hỏi từ Excel"
			maxWidth="700px"
			footer={
				<>
					<Button
						variant="secondary"
						onClick={handleClose}
						disabled={isUploading}
					>
						Hủy
					</Button>
					<Button
						variant="primary"
						onClick={handleSubmit}
						disabled={isUploading || !selectedFile || !subject}
					>
						{isUploading ? (
							<>
								<span className="spinner" />
								Đang import...
							</>
						) : (
							<>
								<Upload size={18} />
								Import câu hỏi
							</>
						)}
					</Button>
				</>
			}
		>
			<div className="modal-content-wrapper">
				{/* File Upload */}
				<div className="modal-form-group">
					<label className="form-label">
						<FileSpreadsheet />
						File Excel (.xlsx) <span className="required">*</span>
					</label>
					<input
						ref={fileInputRef}
						type="file"
						accept=".xlsx,.xls"
						onChange={handleFileSelect}
						style={{ display: 'none' }}
					/>
					<div
						onClick={() => fileInputRef.current?.click()}
						style={{
							border: '2px dashed var(--border)',
							borderRadius: 'var(--radius-md)',
							padding: '32px',
							textAlign: 'center',
							cursor: 'pointer',
							backgroundColor: selectedFile ? 'var(--accent)' : 'transparent',
							transition: 'all 0.2s'
						}}
					>
						{selectedFile ? (
							<>
								<FileSpreadsheet size={48} style={{ color: 'var(--primary)', margin: '0 auto 16px' }} />
								<p style={{ fontWeight: 600, marginBottom: '4px' }}>
									{selectedFile.name}
								</p>
								<p style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>
									{(selectedFile.size / 1024).toFixed(2)} KB
								</p>
							</>
						) : (
							<>
								<Upload size={48} style={{ color: 'var(--muted-foreground)', margin: '0 auto 16px' }} />
								<p style={{ fontWeight: 600, marginBottom: '4px' }}>
									Click để chọn file Excel
								</p>
								<p style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>
									Hỗ trợ .xlsx, .xls
								</p>
							</>
						)}
					</div>
				</div>

				{/* Subject */}
				<div className="modal-form-group">
					<label className="form-label">
						Môn học <span className="required">*</span>
					</label>
					<input
						type="text"
						className="form-input"
						placeholder="VD: Java, C cơ bản, C nâng cao"
						value={subject}
						onChange={(e) => setSubject(e.target.value)}
						required
					/>
					<small style={{ display: 'block', marginTop: '8px', color: 'var(--muted-foreground)', fontSize: '13px' }}>
						Tên môn học sẽ được tự động gắn tag cho tất cả câu hỏi
					</small>
				</div>

				{/* Tags */}
				<div className="modal-form-group">
					<label className="form-label">Tags (tùy chọn)</label>
					<input
						type="text"
						className="form-input"
						placeholder="VD: Java, C cơ bản, Web Development"
						value={tags}
						onChange={(e) => setTags(e.target.value)}
					/>
					<small style={{ display: 'block', marginTop: '8px', color: 'var(--muted-foreground)', fontSize: '13px' }}>
						Các tags cách nhau bằng dấu phẩy. Nếu để trống, chỉ gắn tag từ tên môn học
					</small>
				</div>

				{/* Format Guide */}
				<div style={{
					marginTop: '16px',
					padding: '16px',
					background: 'var(--accent)',
					color: 'var(--accent-foreground)',
					borderRadius: 'var(--radius-md)',
					fontSize: '13px'
				}}>
					<h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
						📋 Định dạng file Excel:
					</h4>
					<ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
						<li><strong>Cột A:</strong> STT (số thứ tự)</li>
						<li><strong>Cột B:</strong> Câu hỏi</li>
						<li><strong>Cột C:</strong> Đáp án A</li>
						<li><strong>Cột D:</strong> Đáp án B</li>
						<li><strong>Cột E:</strong> Đáp án C</li>
						<li><strong>Cột F:</strong> Đáp án D</li>
						<li><strong>Cột G:</strong> Đáp án đúng (chữ cái A/B/C/D hoặc nội dung đầy đủ)</li>
					</ul>
				</div>

				{/* Upload Result */}
				{uploadResult && (
					<div style={{
						marginTop: '16px',
						padding: '16px',
						backgroundColor: uploadResult.errors === 0 ? '#d4edda' : '#fff3cd',
						borderRadius: 'var(--radius-md)',
						border: `1px solid ${uploadResult.errors === 0 ? '#28a745' : '#ffc107'}`
					}}>
						<div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
							{uploadResult.errors === 0 ? (
								<CheckCircle size={24} style={{ color: '#28a745' }} />
							) : (
								<AlertCircle size={24} style={{ color: '#ffc107' }} />
							)}
							<h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
								Kết quả import
							</h4>
						</div>
						<div style={{ fontSize: '14px', lineHeight: '1.8' }}>
							<p style={{ margin: '4px 0' }}><strong>Đã import:</strong> {uploadResult.imported} câu hỏi</p>
							<p style={{ margin: '4px 0' }}><strong>Bỏ qua:</strong> {uploadResult.skipped} dòng</p>
							<p style={{ margin: '4px 0' }}><strong>Lỗi:</strong> {uploadResult.errors} dòng</p>
						</div>
						{uploadResult.errorDetails && uploadResult.errorDetails.length > 0 && (
							<details style={{ marginTop: '12px' }}>
								<summary style={{ cursor: 'pointer', fontWeight: 600 }}>
									Xem chi tiết lỗi
								</summary>
								<ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '13px' }}>
									{uploadResult.errorDetails.map((error: string, index: number) => (
										<li key={index}>{error}</li>
									))}
								</ul>
							</details>
						)}
					</div>
				)}
			</div>
		</Modal>
	)
}
