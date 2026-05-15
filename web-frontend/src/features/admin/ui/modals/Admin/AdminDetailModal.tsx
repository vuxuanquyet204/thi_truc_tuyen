import React from 'react'
import { Users, Shield, Mail, Phone, MapPin, Calendar, Clock, User, Award } from 'lucide-react'
import Modal from '@/features/admin/ui/common/Modal'
import Badge from '@/features/admin/ui/common/Badge'
import styles from '@/pages/admin/AdminPage/AdminPage.module.css'

interface AdminDetailModalProps {
	isOpen: boolean
	onClose: () => void
	admin: any
}

const AdminDetailModal: React.FC<AdminDetailModalProps> = ({
	isOpen,
	onClose,
	admin
}) => {
	if (!admin) return null

	const getRoleLabel = (role: string) => {
		const labels: Record<string, string> = {
			super_admin: 'Super Admin',
			system_admin: 'System Admin',
			content_admin: 'Content Admin',
			user_admin: 'User Admin',
			security_admin: 'Security Admin',
			audit_admin: 'Audit Admin',
			support_admin: 'Support Admin'
		}
		return labels[role] || role
	}

	const getStatusLabel = (status: string) => {
		const labels: Record<string, string> = {
			active: 'Hoạt động',
			inactive: 'Không hoạt động',
			suspended: 'Tạm dừng',
			pending: 'Chờ duyệt',
			locked: 'Khóa'
		}
		return labels[status] || status
	}

	const getStatusVariant = (status: string) => {
		const variants: Record<string, "success" | "warning" | "danger" | "secondary"> = {
			active: 'success',
			inactive: 'secondary',
			suspended: 'warning',
			pending: 'warning',
			locked: 'danger'
		}
		return variants[status] || 'secondary'
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={admin.fullName || 'Chi tiết Admin'}
			maxWidth="900px"
		>
			<div className={styles['admin-detail-modal-content']}>
				<div className={styles['admin-detail-header']}>
					<div className={styles['admin-detail-avatar']}>
						{admin.avatar ? (
							<img src={admin.avatar} alt={admin.fullName} />
						) : (
							<Users size={48} />
						)}
					</div>
					<div className={styles['admin-detail-info']}>
						<h2 className={styles['admin-detail-title']}>{admin.fullName}</h2>
						<p className={styles['admin-detail-username']}>@{admin.username}</p>
						<div className={styles['admin-detail-meta']}>
							<div className={styles['meta-item']}>
								<Badge variant="secondary">
									{getRoleLabel(admin.role)}
								</Badge>
							</div>
							<div className={styles['meta-item']}>
								<Badge variant={getStatusVariant(admin.status)}>
									{getStatusLabel(admin.status)}
								</Badge>
							</div>
							<div className={styles['meta-item']}>
								<Shield size={16} />
								<span>{admin.isTwoFactorEnabled ? '2FA Enabled' : '2FA Disabled'}</span>
							</div>
						</div>
					</div>
				</div>

				<div className={styles['admin-detail-sections']}>
					<div className={styles['detail-section']}>
						<h3>
							<Mail size={20} />
							Thông tin liên hệ
						</h3>
						<div className={styles['contact-info']}>
							<div className={styles['contact-item']}>
								<span className={styles['contact-label']}>
									<Mail size={14} /> Email
								</span>
								<span className={styles['contact-value']}>{admin.email}</span>
							</div>
							{admin.metadata.phone && (
								<div className={styles['contact-item']}>
									<span className={styles['contact-label']}>
										<Phone size={14} /> Phone
									</span>
									<span className={styles['contact-value']}>{admin.metadata.phone}</span>
								</div>
							)}
							{admin.metadata.address && (
								<div className={styles['contact-item']}>
									<span className={styles['contact-label']}>
										<MapPin size={14} /> Address
									</span>
									<span className={styles['contact-value']}>{admin.metadata.address}</span>
								</div>
							)}
						</div>
					</div>

					<div className={styles['detail-section']}>
						<h3>
							<Shield size={20} />
							Quyền hạn ({admin.permissions.length})
						</h3>
						<div className={styles['permissions-list']}>
							{admin.permissions.map((permission: string) => (
								<Badge key={permission} variant="info">
									{permission.replace(/_/g, ' ')}
								</Badge>
							))}
						</div>
					</div>

					<div className={styles['detail-section']}>
						<h3>
							<Clock size={20} />
							Thông tin hoạt động
						</h3>
						<div className={styles['activity-info']}>
							<div className={styles['activity-item']}>
								<span className={styles['activity-label']}>
									<Clock size={14} /> Đăng nhập cuối
								</span>
								<span className={styles['activity-value']}>
									{new Date(admin.lastLoginAt).toLocaleString('vi-VN')}
								</span>
							</div>
							<div className={styles['activity-item']}>
								<span className={styles['activity-label']}>
									<User size={14} /> Tạo bởi
								</span>
								<span className={styles['activity-value']}>{admin.createdBy}</span>
							</div>
							<div className={styles['activity-item']}>
								<span className={styles['activity-label']}>
									<Calendar size={14} /> Ngày tạo
								</span>
								<span className={styles['activity-value']}>
									{new Date(admin.createdAt).toLocaleString('vi-VN')}
								</span>
							</div>
							<div className={styles['activity-item']}>
								<span className={styles['activity-label']}>
									<Calendar size={14} /> Cập nhật cuối
								</span>
								<span className={styles['activity-value']}>
									{new Date(admin.updatedAt).toLocaleString('vi-VN')}
								</span>
							</div>
						</div>
					</div>

					{admin.metadata.bio && (
						<div className={styles['detail-section']}>
							<h3>
								<User size={20} />
								Giới thiệu
							</h3>
							<p className={styles['bio-content']}>{admin.metadata.bio}</p>
						</div>
					)}

					{admin.metadata.skills && admin.metadata.skills.length > 0 && (
						<div className={styles['detail-section']}>
							<h3>
								<Award size={20} />
								Kỹ năng ({admin.metadata.skills.length})
							</h3>
							<div className={styles['skills-list']}>
								{admin.metadata.skills.map((skill: string) => (
									<Badge key={skill} variant="success">{skill}</Badge>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</Modal>
	)
}

export default AdminDetailModal
