import React from 'react'
import Modal from '@/features/admin/ui/common/Modal'
import { FileText, X, Hash, Calendar, User, Tag, Link } from 'lucide-react'
import { AdminDocument } from '@/features/admin/hooks'

interface DocumentDetailModalProps {
	isOpen: boolean
	onClose: () => void
	document: AdminDocument | null
}

const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
	isOpen,
	onClose,
	document
}) => {
	if (!document) return null

	if (!isOpen) return null

	const metadata = document.metadata as Record<string, unknown>
	const keywords = Array.isArray(metadata?.keywords) ? metadata.keywords as string[] : []
	const licenseValue = String(metadata?.license || 'N/A')
	const languageValue = String(metadata?.language || 'N/A')
	const versionValue = String(metadata?.version || '1.0')
	const categoryValue = String(metadata?.category || 'N/A')

	return (
		<div className="modal-overlay-modern">
			<div className="modal-container-modern document-detail-modal">
				<div className="modal-header-modern">
					<div className="modal-title-modern">
						<FileText size={36} />
						<h2>{document.title || 'Chi tiết tài liệu'}</h2>
					</div>
					<button className="modal-close" onClick={onClose}>
						<X size={22} />
					</button>
				</div>

				<div className="modal-content-modern">
					<div className="modal-content-wrapper">
						{/* Document Header Info */}
						<div className="modal-info-card">
							<div className="card-icon">
								<FileText />
							</div>
							<div className="card-title">{document.title}</div>
							<div className="card-description">Tài liệu đã đăng ký bản quyền</div>
							<div className="card-value">
								<span className={`modal-status-badge ${document.status === 'verified' ? 'success' : document.status === 'pending' ? 'warning' : 'danger'}`}>
									{document.status === 'verified' ? 'Đã xác minh' : 
									 document.status === 'pending' ? 'Chờ xác minh' : 'Có tranh chấp'}
								</span>
							</div>
						</div>

						{/* Basic Information */}
						<div className="modal-detail-section">
							<div className="section-title">
								<User />
								<h4>Thông tin cơ bản</h4>
							</div>
							<div className="modal-info-pairs">
								<div className="modal-info-pair">
									<div className="info-label">Tác giả</div>
									<div className="info-value">{document.author}</div>
								</div>
								<div className="modal-info-pair">
									<div className="info-label">Ngày đăng ký</div>
									<div className="info-value">{new Date(document.registrationDate).toLocaleString('vi-VN')}</div>
								</div>
							</div>
						</div>

						{/* Description */}
						<div className="modal-detail-section">
							<div className="section-title">
								<FileText />
								<h4>Mô tả</h4>
							</div>
							<p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
								{document.description}
							</p>
						</div>

						{/* Blockchain Information */}
						<div className="modal-detail-section">
							<div className="section-title">
								<Hash />
								<h4>Thông tin Blockchain</h4>
							</div>
							<div className="modal-info-pairs">
								<div className="modal-info-pair">
									<div className="info-label">Hash</div>
									<div className="info-value" style={{ fontFamily: 'monospace', fontSize: '13px' }}>
										{document.hash || document.documentHash}
									</div>
								</div>
								<div className="modal-info-pair">
									<div className="info-label">Blockchain Hash</div>
									<div className="info-value" style={{ fontFamily: 'monospace', fontSize: '13px' }}>
										{document.blockchainHash || 'N/A'}
									</div>
								</div>
								{document.transactionHash && (
									<div className="modal-info-pair">
										<div className="info-label">Transaction Hash</div>
										<div className="info-value" style={{ fontFamily: 'monospace', fontSize: '13px' }}>
											{document.transactionHash}
										</div>
									</div>
								)}
								{document.blockNumber !== undefined && (
									<div className="modal-info-pair">
										<div className="info-label">Block Number</div>
										<div className="info-value">{document.blockNumber.toLocaleString()}</div>
									</div>
								)}
								{document.gasUsed && (
									<div className="modal-info-pair">
										<div className="info-label">Gas Used</div>
										<div className="info-value">{document.gasUsed}</div>
									</div>
								)}
							</div>
						</div>

						{/* Metadata */}
						<div className="modal-detail-section">
							<div className="section-title">
								<Tag />
								<h4>Metadata</h4>
							</div>
							<div className="modal-info-pairs">
								<div className="modal-info-pair">
									<div className="info-label">Danh mục</div>
									<div className="info-value">{categoryValue}</div>
								</div>
								<div className="modal-info-pair">
									<div className="info-label">Ngôn ngữ</div>
									<div className="info-value">{languageValue}</div>
								</div>
								<div className="modal-info-pair">
									<div className="info-label">Phiên bản</div>
									<div className="info-value">{versionValue}</div>
								</div>
								<div className="modal-info-pair">
									<div className="info-label">Giấy phép</div>
									<div className="info-value">{licenseValue}</div>
								</div>
							</div>
							{keywords.length > 0 && (
								<div style={{ marginTop: '16px' }}>
									<div style={{ fontSize: '13px', fontWeight: '600', color: '#667eea', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
										Từ khóa
									</div>
									<div className="modal-tags">
										{keywords.map((keyword: string, index: number) => (
											<span key={index} className="modal-tag">{keyword}</span>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default DocumentDetailModal
