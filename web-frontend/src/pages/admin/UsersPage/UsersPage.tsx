import React, { useState, useRef } from 'react'
import { Plus, Download, Upload, FileDown } from 'lucide-react'
import { SearchBar } from '@/features/admin/ui/common'
import Pagination from '@/shared/ui/molecules/Pagination'
import { UserTable } from '@/features/admin/ui/users'
import { AddUserModal, DeleteUserModal, ImportUserModal, EditUserModal } from '@/features/admin/ui/modals'
import { useUsers } from '@/features/admin/hooks'
import { User } from '@/foundation/types'
import { exportUsersToExcel, importUsersFromExcel, downloadExcelTemplate } from '@/features/users/utils'
import '@/features/admin/ui/common/styles/common.css'
import '@/features/admin/ui/common/styles/FormStyles.css'
import { toast } from '@/foundation/contexts/ToastContext'

export default function UsersPage(): JSX.Element {
	const {
		users,
		allUsers,
		filters,
		updateFilter,
		currentPage,
		setCurrentPage,
		totalPages,
		totalItems,
		itemsPerPage,
		sortKey,
		sortOrder,
		handleSort,
		deleteUser,
		toggleUserStatus,
		updateUser,
		addUser,
		loading,
		error
	} = useUsers()

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
	const [userToDelete, setUserToDelete] = useState<User | null>(null)
	const [isEditModalOpen, setIsEditModalOpen] = useState(false)
	const [userToEdit, setUserToEdit] = useState<User | null>(null)
	const [isAddModalOpen, setIsAddModalOpen] = useState(false)
	const [isImportModalOpen, setIsImportModalOpen] = useState(false)
	const [importFile, setImportFile] = useState<File | null>(null)
	const [importPreview, setImportPreview] = useState<Partial<User>[]>([])
	const fileInputRef = useRef<HTMLInputElement>(null)

	// Xử lý chỉnh sửa user
	const handleEdit = (user: User) => {
		setUserToEdit(user)
		setIsEditModalOpen(true)
	}

	// Xử lý xóa user
	const handleDelete = (user: User) => {
		setUserToDelete(user)
		setIsDeleteModalOpen(true)
	}

	// Xác nhận xóa
	const confirmDelete = async () => {
		if (userToDelete) {
			try {
				await deleteUser(userToDelete.id)
				setIsDeleteModalOpen(false)
				setUserToDelete(null)
			} catch (error) {
				console.error('loi:', error)
			}
		}
	}

	// Xử lý toggle status
	const handleToggleStatus = async (user: User) => {
		try {
			await toggleUserStatus(user.id)
		} catch (error) {
			console.error('loi:', error)
		}
	}

	// Xử lý thêm user mới
	const handleAddUser = async (userData: Partial<User>) => {
		try {
			await addUser(userData as Omit<User, 'id' | 'createdAt'>)
			setIsAddModalOpen(false)
		} catch (error) {
			console.error('loi:', error)
		}
	}

	// Xử lý cập nhật user
	const handleUpdateUser = async (userData: Partial<User>) => {
		if (userToEdit) {
			try {
				const updatedUser: User = {
					...userToEdit,
					...userData
				}
				await updateUser(updatedUser)
				setIsEditModalOpen(false)
				setUserToEdit(null)
			} catch (error) {
				console.error('loi:', error)
			}
		}
	}

	// Xử lý export Excel
	const handleExportExcel = () => {
		exportUsersToExcel(allUsers)
	}

	// Xử lý import Excel
	const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		setImportFile(file)
		
		try {
			const users = await importUsersFromExcel(file)
			setImportPreview(users)
			setIsImportModalOpen(true)
		} catch (error) {
			toast.error('Lỗi khi đọc file Excel. Vui lòng kiểm tra lại file.')
			console.error(error)
		}
	}

	// Xác nhận import
	const confirmImport = async () => {
		try {
			for (const userData of importPreview) {
				await addUser(userData as Omit<User, 'id' | 'createdAt'>)
			}
			setIsImportModalOpen(false)
			setImportFile(null)
			setImportPreview([])
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		} catch (error) {
			console.error('loi:', error)
		}
	}

	// Download template
	const handleDownloadTemplate = () => {
		downloadExcelTemplate()
	}

	return (
		<div style={{ padding: '24px' }}>
			{/* Header */}
			<div style={{ marginBottom: '24px' }}>
				<h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0' }}>
					Quản lý Người dùng
				</h1>
				<p style={{ color: 'var(--muted-foreground)', margin: 0 }}>
					Quản lý tài khoản người dùng trong hệ thống
				</p>
			</div>

			{/* Actions Bar */}
			<div style={{ 
				display: 'flex', 
				justifyContent: 'space-between', 
				alignItems: 'center',
				marginBottom: '24px',
				gap: '16px',
				flexWrap: 'wrap'
			}}>
				<SearchBar
					value={filters.search}
					onChange={(value) => updateFilter('search', value)}
					placeholder="Tìm kiếm theo tên, email, số điện thoại..."
				/>

				<div style={{ display: 'flex', gap: '12px' }}>
					<input
						ref={fileInputRef}
						type="file"
						accept=".xlsx,.xls"
						style={{ display: 'none' }}
						onChange={handleImportFile}
					/>
					<button 
						className="btn btn-secondary"
						onClick={() => fileInputRef.current?.click()}
					>
						<Upload size={18} />
						Nhập dữ liệu
					</button>
					<button 
						className="btn btn-secondary"
						onClick={handleExportExcel}
					>
						<Download size={18} />
						Xuất Excel
					</button>
					<button 
						className="btn btn-primary"
						onClick={() => setIsAddModalOpen(true)}
					>
						<Plus size={18} />
						Thêm người dùng
					</button>
				</div>
			</div>

			{/* Error Message */}
			{error && (
				<div style={{
					padding: '12px 16px',
					background: 'var(--destructive)',
					color: 'white',
					borderRadius: 'var(--radius-md)',
					marginBottom: '16px',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center'
				}}>
					<span>{error}</span>
					<button
						onClick={() => window.location.reload()}
						style={{
							background: 'rgba(255,255,255,0.2)',
							border: 'none',
							color: 'white',
							padding: '4px 12px',
							borderRadius: '4px',
							cursor: 'pointer'
						}}
					>
						Refresh
					</button>
				</div>
			)}

			{/* Filters */}
			<div className="filters-container">
				<div className="filter-group">
					<label className="filter-label">Vai trò</label>
					<select
						className="filter-select"
						value={filters.role}
						onChange={(e) => updateFilter('role', e.target.value)}
					>
						<option value="all">Tất cả vai trò</option>
						<option value="admin">Quản trị viên</option>
						<option value="teacher">Giảng viên</option>
						<option value="student">Học viên</option>
						<option value="user">Người dùng</option>
					</select>
				</div>

				<div className="filter-group">
					<label className="filter-label">Trạng thái</label>
					<select
						className="filter-select"
						value={filters.status}
						onChange={(e) => updateFilter('status', e.target.value)}
					>
						<option value="all">Tất cả trạng thái</option>
						<option value="active">Hoạt động</option>
						<option value="inactive">Không hoạt động</option>
						<option value="suspended">Bị khóa</option>
					</select>
				</div>

				<div className="filter-group">
					<label className="filter-label">Kết quả</label>
					<div style={{ 
						padding: '8px 12px',
						background: 'var(--muted)',
						borderRadius: 'var(--radius-md)',
						fontSize: '14px',
						fontWeight: 500
					}}>
						Tìm thấy {totalItems} người dùng
					</div>
				</div>
			</div>

			{/* Table */}
			<div style={{ 
				background: 'var(--card)',
				borderRadius: 'var(--radius-lg)',
				boxShadow: 'var(--shadow-sm)',
				overflow: 'hidden'
			}}>
				<UserTable
					users={users}
					loading={loading}
					onEdit={handleEdit}
					onDelete={handleDelete}
					onToggleStatus={handleToggleStatus}
					onSort={handleSort}
					sortKey={sortKey}
					sortOrder={sortOrder}
				/>
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
					totalItems={totalItems}
					itemsPerPage={itemsPerPage}
				/>
			)}

			{/* Delete Modal */}
			<DeleteUserModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				onConfirm={confirmDelete}
				user={userToDelete}
			/>

			{/* Add User Modal */}
			<AddUserModal
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen(false)}
				onSave={handleAddUser}
			/>

			{/* Import Preview Modal */}
			<ImportUserModal
				isOpen={isImportModalOpen}
				onClose={() => {
					setIsImportModalOpen(false)
					setImportPreview([])
					setImportFile(null)
				}}
				onConfirm={confirmImport}
				onDownloadTemplate={handleDownloadTemplate}
				importFile={importFile}
				importPreview={importPreview}
			/>

			{/* Edit Modal */}
			<EditUserModal
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				onSave={handleUpdateUser}
				user={userToEdit}
			/>
		</div>
	)
}
