import React from 'react'
import { CourseFilters } from '@/types/course'
import SearchBar from '@/features/admin/ui/common/SearchBar'
import '@/features/admin/ui/common/styles/courses.css'
import { Filter, SortAsc, SortDesc } from 'lucide-react'

interface CourseFilterBarProps {
	filters: CourseFilters
	onFilterChange: (key: keyof CourseFilters, value: any) => void
	onClearFilters: () => void
}

const visibilityOptions = [
	{ value: 'all', label: 'Tất cả trạng thái' },
	{ value: 'draft', label: 'Bản nháp' },
	{ value: 'private', label: 'Riêng tư' },
	{ value: 'published', label: 'Đã xuất bản' },
	{ value: 'archived', label: 'Đã lưu trữ' },
	{ value: 'suspended', label: 'Tạm dừng' }
]

const sortByOptions = [
	{ value: 'title', label: 'Tên khóa học' },
	{ value: 'createdAt', label: 'Ngày tạo' },
	{ value: 'updatedAt', label: 'Ngày cập nhật' }
]

export default function CourseFilterBar({ filters, onFilterChange, onClearFilters }: CourseFilterBarProps): JSX.Element {
	const hasActiveFilters =
		filters.search !== '' ||
		filters.visibility !== 'all' ||
		filters.organizationId !== 'all' ||
		filters.sortBy !== 'title' ||
		filters.sortOrder !== 'asc'

	return (
		<div className="course-filter-bar">
			<div className="filter-section">
				<SearchBar
					value={filters.search}
					onChange={(value) => onFilterChange('search', value)}
					placeholder="Tìm kiếm khóa học theo tên hoặc mô tả"
				/>
			</div>

			<div className="filter-section">
				<div className="filter-group">
					<label className="filter-label">Trạng thái</label>
					<select
						className="form-input"
						value={filters.visibility}
						onChange={(event) => onFilterChange('visibility', event.target.value as CourseFilters['visibility'])}
					>
						{visibilityOptions.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>

				<div className="filter-group">
					<label className="filter-label">Organization ID</label>
					<input
						type="text"
						className="form-input"
						placeholder="Tất cả"
						value={filters.organizationId === 'all' ? '' : filters.organizationId}
						onChange={(event) => {
							const value = event.target.value.trim()
							onFilterChange('organizationId', value.length === 0 ? 'all' : value)
						}}
					/>
				</div>
			</div>

			<div className="filter-section">
				<div className="filter-group">
					<label className="filter-label">Sắp xếp theo</label>
					<select
						className="form-input"
						value={filters.sortBy}
						onChange={(event) => onFilterChange('sortBy', event.target.value as CourseFilters['sortBy'])}
					>
						{sortByOptions.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>

				<button
					className={`btn btn-icon btn-sm ${filters.sortOrder === 'asc' ? 'btn-primary' : 'btn-secondary'}`}
					onClick={() => onFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
					title={`Sắp xếp ${filters.sortOrder === 'asc' ? 'tăng dần' : 'giảm dần'}`}
				>
					{filters.sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
				</button>
			</div>

			<div className="filter-section">
				{hasActiveFilters && (
					<button className="btn btn-secondary btn-sm" onClick={onClearFilters}>
						<Filter size={16} />
						Xóa bộ lọc
					</button>
				)}
			</div>
		</div>
	)
}
