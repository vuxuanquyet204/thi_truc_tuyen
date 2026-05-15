import React, { useState } from 'react'
import { GlobalSettings as GlobalSettingsType, SettingsCategory, SettingsType } from '@/types/admin'
import {
	Save,
	RefreshCw,
	Search,
	Settings as SettingsIcon,
	CheckCircle,
	X,
	Plus,
	Edit,
	Trash2
} from 'lucide-react'
import Badge from '@/features/admin/ui/common/Badge'
import styles from '@/pages/admin/AdminPage/AdminPage.module.css'

interface GlobalSettingsProps {
	settings: GlobalSettingsType[]
	onUpdateSetting: (settingId: string, value: any) => void
	onResetSetting: (settingId: string) => void
	onAddSetting: (setting: Partial<GlobalSettingsType>) => void
	onDeleteSetting: (settingId: string) => void
	loading?: boolean
}

export default function GlobalSettings({
	settings,
	onUpdateSetting,
	onResetSetting,
	onAddSetting,
	onDeleteSetting,
	loading = false
}: GlobalSettingsProps): JSX.Element {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedCategory, setSelectedCategory] = useState<SettingsCategory | 'all'>('all')
	const [showPublicOnly, setShowPublicOnly] = useState(false)
	const [editingSetting, setEditingSetting] = useState<string | null>(null)
	const [editValue, setEditValue] = useState<any>('')
	const [showAddForm, setShowAddForm] = useState(false)
	const [newSetting, setNewSetting] = useState<Partial<GlobalSettingsType>>({
		category: 'general',
		name: '',
		key: '',
		value: '',
		type: 'string',
		description: '',
		isRequired: false,
		isPublic: false
	})

	const getCategoryLabel = (category: SettingsCategory) => {
		const labels: Record<SettingsCategory, string> = {
			general: 'Tổng quan',
			security: 'Bảo mật',
			email: 'Email',
			storage: 'Lưu trữ',
			api: 'API',
			notification: 'Thông báo',
			backup: 'Sao lưu',
			maintenance: 'Bảo trì',
			integration: 'Tích hợp',
			appearance: 'Giao diện'
		}
		return labels[category] || category
	}

	const getCategoryColor = (category: SettingsCategory) => {
		const colors: Record<SettingsCategory, string> = {
			general: 'var(--primary)',
			security: 'var(--danger)',
			email: 'var(--info)',
			storage: 'var(--warning)',
			api: 'var(--success)',
			notification: 'var(--accent)',
			backup: 'var(--secondary)',
			maintenance: 'var(--warning)',
			integration: 'var(--info)',
			appearance: 'var(--primary)'
		}
		return colors[category] || 'var(--muted-foreground)'
	}

	const getTypeLabel = (type: SettingsType) => {
		const labels: Record<SettingsType, string> = {
			string: 'Chuỗi',
			number: 'Số',
			boolean: 'Boolean',
			array: 'Mảng',
			object: 'Đối tượng',
			json: 'JSON',
			url: 'URL',
			email: 'Email',
			password: 'Mật khẩu',
			file: 'File'
		}
		return labels[type] || type
	}

	const filteredSettings = settings.filter(setting => {
		const matchesSearch = !searchTerm ||
			setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
			setting.description.toLowerCase().includes(searchTerm.toLowerCase())

		const matchesCategory = selectedCategory === 'all' || setting.category === selectedCategory
		const matchesPublic = !showPublicOnly || setting.isPublic

		return matchesSearch && matchesCategory && matchesPublic
	})

	const handleEditStart = (setting: GlobalSettingsType) => {
		setEditingSetting(setting.id)
		setEditValue(setting.value)
	}

	const handleEditSave = () => {
		if (editingSetting) {
			onUpdateSetting(editingSetting, editValue)
			setEditingSetting(null)
			setEditValue('')
		}
	}

	const handleEditCancel = () => {
		setEditingSetting(null)
		setEditValue('')
	}

	const handleAddSetting = () => {
		if (newSetting.name && newSetting.key && newSetting.value !== undefined) {
			onAddSetting(newSetting)
			setNewSetting({
				category: 'general',
				name: '',
				key: '',
				value: '',
				type: 'string',
				description: '',
				isRequired: false,
				isPublic: false
			})
			setShowAddForm(false)
		}
	}

	const renderValueInput = (setting: GlobalSettingsType, value: any, onChange: (value: any) => void) => {
		switch (setting.type) {
			case 'boolean':
				return (
					<input
						type="checkbox"
						checked={Boolean(value)}
						onChange={(e) => onChange(e.target.checked)}
						className={styles['form-checkbox']}
					/>
				)
			case 'number':
				return (
					<input
						type="number"
						value={value}
						onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
						className={styles['form-input']}
						min={setting.validation?.min}
						max={setting.validation?.max}
					/>
				)
			case 'email':
				return (
					<input
						type="email"
						value={value}
						onChange={(e) => onChange(e.target.value)}
						className={styles['form-input']}
					/>
				)
			case 'url':
				return (
					<input
						type="url"
						value={value}
						onChange={(e) => onChange(e.target.value)}
						className={styles['form-input']}
					/>
				)
			case 'password':
				return (
					<input
						type="password"
						value={value}
						onChange={(e) => onChange(e.target.value)}
						className={styles['form-input']}
					/>
				)
			case 'json':
			case 'object':
				return (
					<textarea
						value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
						onChange={(e) => {
							try {
								onChange(JSON.parse(e.target.value))
							} catch {
								onChange(e.target.value)
							}
						}}
						className={styles['form-textarea']}
						rows={4}
					/>
				)
			case 'array':
				return (
					<div className={styles['array-input']}>
						<input
							type="text"
							value={Array.isArray(value) ? value.join(', ') : ''}
							onChange={(e) => onChange(e.target.value.split(',').map(item => item.trim()))}
							className={styles['form-input']}
							placeholder="Nhập các giá trị cách nhau bởi dấu phẩy"
						/>
					</div>
				)
			default:
				return (
					<input
						type="text"
						value={value}
						onChange={(e) => onChange(e.target.value)}
						className={styles['form-input']}
						minLength={setting.validation?.min}
						maxLength={setting.validation?.max}
					/>
				)
		}
	}

	const renderValueDisplay = (setting: GlobalSettingsType) => {
		const value = setting.value

		if (setting.type === 'password') {
			return '••••••••'
		}

		if (setting.type === 'boolean') {
			return (
				<Badge variant={value ? 'success' : 'secondary'}>
					{value ? 'Bật' : 'Tắt'}
				</Badge>
			)
		}

		if (setting.type === 'json' || setting.type === 'object') {
			return (
				<pre className={styles['json-display']}>
					{JSON.stringify(value, null, 2)}
				</pre>
			)
		}

		if (setting.type === 'array') {
			return (
				<div className={styles['array-display']}>
					{Array.isArray(value) ? value.map((item, index) => (
						<Badge key={index} variant="secondary">{String(item)}</Badge>
					)) : String(value)}
				</div>
			)
		}

		return String(value)
	}

	if (loading) {
		return (
			<div className={`${styles['global-settings']} ${styles['loading']}`}>
				<div className={styles['loading-spinner']}></div>
				<p>Đang tải cài đặt hệ thống...</p>
			</div>
		)
	}

	return (
		<div className={styles['global-settings']}>
			<div className={styles['settings-header']}>
				<div className={styles['settings-title']}>
					<SettingsIcon size={24} />
					<h2>Cài đặt Hệ thống</h2>
				</div>
				<div className={styles['settings-actions']}>
					<button
						className={`${styles['btn']} ${styles['btn-primary']}`}
						onClick={() => setShowAddForm(!showAddForm)}
					>
						<Plus size={16} />
						Thêm cài đặt
					</button>
				</div>
			</div>

			{showAddForm && (
				<div className={styles['add-setting-form']}>
					<h3>Thêm cài đặt mới</h3>
					<div className={styles['form-grid']}>
						<div className={styles['form-group']}>
							<label>Tên cài đặt *</label>
							<input
								type="text"
								value={newSetting.name || ''}
								onChange={(e) => setNewSetting(prev => ({ ...prev, name: e.target.value }))}
								className={styles['form-input']}
								placeholder="Tên hiển thị của cài đặt"
							/>
						</div>
						<div className={styles['form-group']}>
							<label>Key *</label>
							<input
								type="text"
								value={newSetting.key || ''}
								onChange={(e) => setNewSetting(prev => ({ ...prev, key: e.target.value }))}
								className={styles['form-input']}
								placeholder="setting.key.name"
							/>
						</div>
						<div className={styles['form-group']}>
							<label>Danh mục</label>
							<select
								value={newSetting.category || 'general'}
								onChange={(e) => setNewSetting(prev => ({ ...prev, category: e.target.value as SettingsCategory }))}
								className={styles['form-select']}
							>
								{Object.values(['general', 'security', 'email', 'storage', 'api', 'notification', 'backup', 'maintenance', 'integration', 'appearance'] as SettingsCategory[]).map(category => (
									<option key={category} value={category}>
										{getCategoryLabel(category)}
									</option>
								))}
							</select>
						</div>
						<div className={styles['form-group']}>
							<label>Kiểu dữ liệu</label>
							<select
								value={newSetting.type || 'string'}
								onChange={(e) => setNewSetting(prev => ({ ...prev, type: e.target.value as SettingsType }))}
								className={styles['form-select']}
							>
								{Object.values(['string', 'number', 'boolean', 'array', 'object', 'json', 'url', 'email', 'password', 'file'] as SettingsType[]).map(type => (
									<option key={type} value={type}>
										{getTypeLabel(type)}
									</option>
								))}
							</select>
						</div>
						<div className={styles['form-group']}>
							<label>Giá trị</label>
							{renderValueInput(newSetting as GlobalSettingsType, newSetting.value, (value) =>
								setNewSetting(prev => ({ ...prev, value }))
							)}
						</div>
						<div className={styles['form-group']}>
							<label>Mô tả</label>
							<textarea
								value={newSetting.description || ''}
								onChange={(e) => setNewSetting(prev => ({ ...prev, description: e.target.value }))}
								className={styles['form-textarea']}
								rows={3}
								placeholder="Mô tả chi tiết về cài đặt này"
							/>
						</div>
						<div className={styles['form-group']}>
							<label className={styles['checkbox-label']}>
								<input
									type="checkbox"
									checked={newSetting.isRequired || false}
									onChange={(e) => setNewSetting(prev => ({ ...prev, isRequired: e.target.checked }))}
								/>
								<span>Bắt buộc</span>
							</label>
						</div>
						<div className={styles['form-group']}>
							<label className={styles['checkbox-label']}>
								<input
									type="checkbox"
									checked={newSetting.isPublic || false}
									onChange={(e) => setNewSetting(prev => ({ ...prev, isPublic: e.target.checked }))}
								/>
								<span>Công khai</span>
							</label>
						</div>
					</div>
					<div className={styles['form-actions']}>
						<button
							className={`${styles['btn']} ${styles['btn-secondary']}`}
							onClick={() => setShowAddForm(false)}
						>
							Hủy
						</button>
						<button
							className={`${styles['btn']} ${styles['btn-primary']}`}
							onClick={handleAddSetting}
						>
							<Save size={16} />
							Thêm
						</button>
					</div>
				</div>
			)}

			<div className={styles['settings-filters']}>
				<div className={styles['search-bar']}>
					<Search size={16} />
					<input
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Tìm kiếm cài đặt..."
						className={styles['form-input']}
					/>
				</div>
				<div className={styles['filter-group']}>
					<select
						value={selectedCategory}
						onChange={(e) => setSelectedCategory(e.target.value as SettingsCategory | 'all')}
						className={styles['form-select']}
					>
						<option value="all">Tất cả danh mục</option>
						{Object.values(['general', 'security', 'email', 'storage', 'api', 'notification', 'backup', 'maintenance', 'integration', 'appearance'] as SettingsCategory[]).map(category => (
							<option key={category} value={category}>
								{getCategoryLabel(category)}
							</option>
						))}
					</select>
				</div>
				<div className={styles['filter-group']}>
					<label className={styles['checkbox-label']}>
						<input
							type="checkbox"
							checked={showPublicOnly}
							onChange={(e) => setShowPublicOnly(e.target.checked)}
						/>
						<span>Chỉ hiện công khai</span>
					</label>
				</div>
			</div>

			<div className={styles['settings-list']}>
				{filteredSettings.map((setting) => (
					<div key={setting.id} className={styles['setting-item']}>
						<div className={styles['setting-header']}>
							<div className={styles['setting-info']}>
								<div className={styles['setting-name']}>
									{setting.name}
									{setting.isRequired && (
										<Badge variant="warning" style={{ marginLeft: '8px' }}>
											Bắt buộc
										</Badge>
									)}
									{setting.isPublic && (
										<Badge variant="info" style={{ marginLeft: '4px' }}>
											Công khai
										</Badge>
									)}
								</div>
								<div className={styles['setting-key']}>{setting.key}</div>
								<div className={styles['setting-description']}>{setting.description}</div>
							</div>
							<div className={styles['setting-meta']}>
								<Badge
									variant="secondary"
									style={{ backgroundColor: getCategoryColor(setting.category) }}
								>
									{getCategoryLabel(setting.category)}
								</Badge>
								<Badge variant="secondary">
									{getTypeLabel(setting.type)}
								</Badge>
								<span className={styles['setting-version']}>v{setting.version}</span>
							</div>
						</div>

						<div className={styles['setting-content']}>
							<div className={styles['setting-value']}>
								{editingSetting === setting.id ? (
									<div className={styles['setting-edit']}>
										{renderValueInput(setting, editValue, setEditValue)}
										<div className={styles['edit-actions']}>
											<button
												className={`${styles['btn']} ${styles['btn-sm']} ${styles['btn-success']}`}
												onClick={handleEditSave}
											>
												<CheckCircle size={14} />
											</button>
											<button
												className={`${styles['btn']} ${styles['btn-sm']} ${styles['btn-secondary']}`}
												onClick={handleEditCancel}
											>
												<X size={14} />
											</button>
										</div>
									</div>
								) : (
									<div className={styles['setting-display']}>
										{renderValueDisplay(setting)}
									</div>
								)}
							</div>

							<div className={styles['setting-actions']}>
								{editingSetting !== setting.id && (
									<button
										className={`${styles['btn']} ${styles['btn-sm']} ${styles['btn-outline']}`}
										onClick={() => handleEditStart(setting)}
										title="Chỉnh sửa"
									>
										<Edit size={14} />
									</button>
								)}
								<button
									className={`${styles['btn']} ${styles['btn-sm']} ${styles['btn-outline']}`}
									onClick={() => onResetSetting(setting.id)}
									title="Đặt lại"
								>
									<RefreshCw size={14} />
								</button>
								<button
									className={`${styles['btn']} ${styles['btn-sm']} ${styles['btn-outline']} ${styles['btn-danger']}`}
									onClick={() => onDeleteSetting(setting.id)}
									title="Xóa"
								>
									<Trash2 size={14} />
								</button>
							</div>
						</div>

						<div className={styles['setting-footer']}>
							<div className={styles['setting-updated']}>
								Cập nhật bởi: {setting.updatedBy} - {new Date(setting.updatedAt).toLocaleString('vi-VN')}
							</div>
						</div>
					</div>
				))}
			</div>

			{filteredSettings.length === 0 && (
				<div className={styles['settings-empty']}>
					<SettingsIcon size={48} />
					<h3>Không có cài đặt nào</h3>
					<p>Không tìm thấy cài đặt phù hợp với bộ lọc</p>
				</div>
			)}
		</div>
	)
}
