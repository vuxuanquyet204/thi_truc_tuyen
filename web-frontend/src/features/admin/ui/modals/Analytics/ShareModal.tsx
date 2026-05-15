import React from 'react'
import { Share2 } from 'lucide-react'
import Modal from '@/features/admin/ui/common/Modal'

interface ShareModalProps {
	isOpen: boolean
	onClose: () => void
}

const ShareModal: React.FC<ShareModalProps> = ({
	isOpen,
	onClose
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Chia sẻ báo cáo"
		>
			<div className="share-content">
				<div className="share-section">
					<h4>Chia sẻ qua liên kết</h4>
					<div className="share-link">
						<input 
							type="text" 
							value="https://analytics.example.com/report/12345" 
							readOnly 
							className="share-input"
						/>
						<button className="btn btn-secondary">
							<Share2 className="w-4 h-4" />
							Copy
						</button>
					</div>
				</div>
				<div className="share-section">
					<h4>Chia sẻ qua email</h4>
					<div className="share-email">
						<input 
							type="email" 
							placeholder="Nhập email người nhận..." 
							className="share-input"
						/>
						<button className="btn btn-primary">
							Gửi email
						</button>
					</div>
				</div>
				<div className="share-section">
					<h4>Tùy chọn chia sẻ</h4>
					<div className="share-options">
						<label className="share-option">
							<input type="checkbox" defaultChecked />
							<span>Cho phép xem công khai</span>
						</label>
						<label className="share-option">
							<input type="checkbox" />
							<span>Yêu cầu đăng nhập</span>
						</label>
						<label className="share-option">
							<input type="checkbox" />
							<span>Hết hạn sau 7 ngày</span>
						</label>
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default ShareModal
