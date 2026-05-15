import React, { useState, useCallback } from 'react'
import {
	Upload,
	FileText,
	AlertCircle,
	CheckCircle,
	X,
	Loader2,
	Search,
	Shield,
	AlertTriangle,
} from 'lucide-react'
import { useCopyright } from '@/features/copyright/hooks'
import styles from './CheckDuplicatePage.module.css'

interface SimilarDocument {
	id: number | string
	filename: string
	similarityScore: number
	matchedSections?: string[]
	details?: any
}

interface SimilarityResult {
	isSimilar: boolean
	similarityScore?: number
	similarDocuments: SimilarDocument[]
	threshold: number
	totalDocumentsChecked: number
	message: string
}

export default function CheckDuplicatePage(): JSX.Element {
	const { checkSimilarity } = useCopyright()

	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [isChecking, setIsChecking] = useState(false)
	const [result, setResult] = useState<SimilarityResult | null>(null)
	const [error, setError] = useState<string | null>(null)

	const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			setSelectedFile(file)
			setResult(null)
			setError(null)
		}
	}, [])

	const handleCheck = useCallback(async () => {
		if (!selectedFile) {
			setError('Vui lòng chọn file để kiểm tra')
			return
		}

		setIsChecking(true)
		setError(null)
		setResult(null)

		try {
			const response = await checkSimilarity(selectedFile)

			if (response.similarityInfo) {
				const mappedResult: SimilarityResult = {
					isSimilar: response.similarityInfo.isSimilar || false,
					similarityScore: response.similarityInfo.similarityScore || 0,
					similarDocuments: (response.similarityInfo.similarDocuments || []).map((doc: any) => ({
						id: typeof doc.id === 'string' ? parseInt(doc.id) || 0 : doc.id,
						filename: doc.filename,
						similarityScore: doc.similarityScore || 0,
						matchedSections: doc.matchedSections,
						details: doc.details,
					})),
					threshold: response.similarityInfo.threshold || 0.7,
					totalDocumentsChecked: response.similarityInfo.totalDocumentsChecked || 0,
					message: response.similarityInfo.message || '',
				}
				setResult(mappedResult)
			} else {
				setError('Không thể kiểm tra tương đồng. Vui lòng thử lại.')
			}
		} catch (err: any) {
			console.error('Check similarity failed:', err)
			setError(err.message || 'Đã xảy ra lỗi khi kiểm tra tài liệu')
		} finally {
			setIsChecking(false)
		}
	}, [selectedFile, checkSimilarity])

	const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		const file = e.dataTransfer.files?.[0]
		if (file) {
			setSelectedFile(file)
			setResult(null)
			setError(null)
		}
	}, [])

	const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
	}, [])

	const resetForm = useCallback(() => {
		setSelectedFile(null)
		setResult(null)
		setError(null)
	}, [])

	const getSimilarityColor = useCallback((score: number): string => {
		if (score >= 0.9) return '#ef4444'
		if (score >= 0.7) return '#f97316'
		if (score >= 0.5) return '#eab308'
		return '#22c55e'
	}, [])

	const getSimilarityLabel = useCallback((score: number): string => {
		if (score >= 0.9) return 'Rất cao'
		if (score >= 0.7) return 'Cao'
		if (score >= 0.5) return 'Trung bình'
		return 'Thấp'
	}, [])

	return (
		<div className={styles.page}>
			<div className={styles.container}>
				<div className={styles.header}>
					<div className={styles.iconContainer}>
						<Search size={32} />
					</div>
					<div>
						<h1>Kiểm tra tài liệu trùng lặp</h1>
						<p>Tải lên tài liệu để kiểm tra độ tương đồng với tài liệu đã có trong hệ thống</p>
					</div>
				</div>

				<div className={styles.uploadSection}>
					<div
						className={`${styles.dropZone} ${selectedFile ? styles.hasFile : ''}`}
						onDrop={handleDrop}
						onDragOver={handleDragOver}
					>
						{selectedFile ? (
							<div className={styles.selectedFile}>
								<FileText size={48} />
								<div className={styles.fileInfo}>
									<h3>{selectedFile.name}</h3>
									<p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
								</div>
								<button
									className={styles.removeButton}
									onClick={resetForm}
									disabled={isChecking}
								>
									<X size={20} />
								</button>
							</div>
						) : (
							<div className={styles.dropZoneContent}>
								<Upload size={48} />
								<h3>Kéo thả file vào đây hoặc click để chọn</h3>
								<p>Hỗ trợ: PDF, DOCX, TXT (Tối đa 10MB)</p>
								<input
									type="file"
									accept=".pdf,.docx,.doc,.txt"
									onChange={handleFileSelect}
									style={{ display: 'none' }}
									id="fileInput"
								/>
								<label htmlFor="fileInput" className={styles.uploadButton}>
									<Upload size={20} />
									Chọn file
								</label>
							</div>
						)}
					</div>

					{selectedFile && !result && (
						<button
							className={styles.checkButton}
							onClick={handleCheck}
							disabled={isChecking}
						>
							{isChecking ? (
								<>
									<Loader2 className={styles.spinner} />
									Đang kiểm tra...
								</>
							) : (
								<>
									<Search size={20} />
									Kiểm tra tương đồng
								</>
							)}
						</button>
					)}
				</div>

				{error && (
					<div className={styles.errorAlert}>
						<AlertCircle size={20} />
						<span>{error}</span>
					</div>
				)}

				{result && (
					<div className={styles.results}>
						<div
							className={`${styles.resultHeader} ${
								result.isSimilar ? styles.warning : styles.success
							}`}
						>
							{result.isSimilar ? (
								<>
									<AlertTriangle size={24} />
									<div>
										<h2>Phát hiện nội dung tương đồng</h2>
										<p>
											Tài liệu có độ tương đồng{' '}
											{(result.similarityScore! * 100).toFixed(1)}% với tài liệu đã có
										</p>
									</div>
								</>
							) : (
								<>
									<CheckCircle size={24} />
									<div>
										<h2>Không phát hiện tài liệu trùng lặp</h2>
										<p>Tài liệu này là độc nhất, có thể đăng ký bản quyền</p>
									</div>
								</>
							)}
						</div>

						<div className={styles.resultStats}>
							<div className={styles.statItem}>
								<span className={styles.statLabel}>Tài liệu đã kiểm tra</span>
								<span className={styles.statValue}>{result.totalDocumentsChecked}</span>
							</div>
							<div className={styles.statItem}>
								<span className={styles.statLabel}>Ngưỡng cảnh báo</span>
								<span className={styles.statValue}>
									{(result.threshold * 100).toFixed(0)}%
								</span>
							</div>
							{result.similarityScore !== undefined && (
								<div className={styles.statItem}>
									<span className={styles.statLabel}>Độ tương đồng cao nhất</span>
									<span
										className={styles.statValue}
										style={{ color: getSimilarityColor(result.similarityScore) }}
									>
										{(result.similarityScore * 100).toFixed(1)}%
									</span>
								</div>
							)}
						</div>

						{result.similarDocuments && result.similarDocuments.length > 0 && (
							<div className={styles.similarDocuments}>
								<h3>Tài liệu tương tự ({result.similarDocuments.length})</h3>
								<div className={styles.documentsList}>
									{result.similarDocuments.map((doc, index) => (
										<div key={index} className={styles.documentCard}>
											<div className={styles.documentHeader}>
												<FileText size={20} />
												<div className={styles.documentInfo}>
													<h4>{doc.filename}</h4>
													<p>ID: {doc.id}</p>
												</div>
												<div
													className={styles.similarityBadge}
													style={{
														backgroundColor: getSimilarityColor(doc.similarityScore),
														color: 'white',
													}}
												>
													{(doc.similarityScore * 100).toFixed(1)}% -{' '}
													{getSimilarityLabel(doc.similarityScore)}
												</div>
											</div>

											{doc.matchedSections && doc.matchedSections.length > 0 && (
												<div className={styles.matchedSections}>
													<h5>Phần nội dung tương đồng:</h5>
													<ul>
														{doc.matchedSections.map((section, idx) => (
															<li key={idx}>{section}</li>
														))}
													</ul>
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						)}

						<div className={styles.actions}>
							<button className={styles.secondaryButton} onClick={resetForm}>
								<X size={20} />
								Kiểm tra file khác
							</button>
							{!result.isSimilar && (
								<button className={styles.primaryButton}>
									<Shield size={20} />
									Đăng ký bản quyền
								</button>
							)}
						</div>
					</div>
				)}

				<div className={styles.infoSection}>
					<h3>Cách hoạt động</h3>
					<div className={styles.infoGrid}>
						<div className={styles.infoCard}>
							<div className={styles.infoNumber}>1</div>
							<h4>Tải lên tài liệu</h4>
							<p>Chọn file cần kiểm tra từ máy tính của bạn</p>
						</div>
						<div className={styles.infoCard}>
							<div className={styles.infoNumber}>2</div>
							<h4>Hệ thống phân tích</h4>
							<p>So sánh với tất cả tài liệu đã đăng ký trong hệ thống</p>
						</div>
						<div className={styles.infoCard}>
							<div className={styles.infoNumber}>3</div>
							<h4>Nhận kết quả</h4>
							<p>Xem độ tương đồng và các tài liệu tương tự</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
