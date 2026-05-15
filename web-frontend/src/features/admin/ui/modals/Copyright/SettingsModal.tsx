import React from 'react'
import Modal from '@/features/admin/ui/common/Modal'
import { Settings, RefreshCw, Save, Network, Shield, CheckCircle, Database, Zap, Clock, Percent } from 'lucide-react'

interface SettingsModalProps {
	isOpen: boolean
	onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({
	isOpen,
	onClose
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Cài đặt bản quyền"
			footer={
				<>
					<button
						type="button"
						className="btn btn-secondary"
						onClick={onClose}
					>
						<RefreshCw size={18} />
						Đặt lại mặc định
					</button>
					<button
						type="button"
						className="btn btn-primary"
					>
						<Save size={18} />
						Lưu cài đặt
					</button>
				</>
			}
		>
			<div className="modal-content-wrapper">
				<div className="modal-form-section">
					<div className="section-title">
						<Network />
						<h4>Cài đặt Blockchain</h4>
					</div>
					
					<div className="modal-form-group">
						<label className="form-label">
							<Network />
							Mạng Blockchain
						</label>
						<select defaultValue="mainnet" className="form-select">
							<option value="mainnet">Ethereum Mainnet</option>
							<option value="testnet">Ethereum Testnet</option>
							<option value="polygon">Polygon</option>
							<option value="bsc">BSC</option>
						</select>
					</div>
					
					<div className="modal-form-group">
						<label className="form-label">
							<Zap />
							Gas Price Multiplier
						</label>
						<input 
							type="number" 
							defaultValue="1.2" 
							step="0.1" 
							min="1" 
							max="3" 
							className="form-input"
						/>
					</div>
					
					<div className="modal-checkbox-group">
						<div className="checkbox-item">
							<label className="checkbox-label">
								<input type="checkbox" defaultChecked />
								<span>Backup to IPFS</span>
							</label>
						</div>
					</div>
				</div>
				
				<div className="modal-form-section">
					<div className="section-title">
						<Shield />
						<h4>Cài đặt xác minh</h4>
					</div>
					
					<div className="modal-checkbox-group">
						<div className="checkbox-item">
							<label className="checkbox-label">
								<input type="checkbox" defaultChecked />
								<span>Tự động xác minh</span>
							</label>
						</div>
					</div>
					
					<div className="modal-form-group">
						<label className="form-label">
							<Percent />
							Ngưỡng xác minh
						</label>
						<input 
							type="number" 
							defaultValue="90" 
							min="0" 
							max="100" 
							className="form-input"
						/>
					</div>
					
					<div className="modal-form-group">
						<label className="form-label">
							<Clock />
							Thời gian giải quyết tranh chấp
						</label>
						<input 
							type="number" 
							defaultValue="7" 
							min="1" 
							max="30" 
							className="form-input"
						/>
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default SettingsModal
