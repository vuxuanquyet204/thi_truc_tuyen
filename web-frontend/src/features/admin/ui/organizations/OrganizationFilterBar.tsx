import React from 'react'
import { OrganizationFilters, OrganizationType, OrganizationStatus, OrganizationSize, SubscriptionPlan, SubscriptionStatus, VerificationStatus } from '@/types/organization'
import { Search, Filter, X, Building2, Users, Globe, Calendar } from 'lucide-react'
import Dropdown from '@/features/admin/ui/common/Dropdown'
import '@/features/admin/ui/common/styles/common.css'
import '@/features/admin/ui/common/styles/organizations.css'

interface OrganizationFilterBarProps {
	filters: OrganizationFilters
	updateFilter: (key: keyof OrganizationFilters, value: any) => void
	onClearFilters: () => void
	organizations: any[] // For getting unique values
}

const OrganizationFilterBar: React.FC<OrganizationFilterBarProps> = ({
	filters,
	updateFilter,
	onClearFilters,
	organizations
}) => {
	// Get unique values for dropdowns
	const uniqueIndustries = Array.from(new Set(organizations.map(org => org.industry))).sort()
	const uniqueCountries = Array.from(new Set(organizations.map(org => org.country))).sort()
	const uniqueCities = Array.from(new Set(organizations.map(org => org.city))).sort()

	const organizationTypes: { value: OrganizationType | 'all'; label: string }[] = [
		{ value: 'all', label: 'Tất cả loại' },
		{ value: 'university', label: 'Đại học' },
		{ value: 'college', label: 'Cao đẳng' },
		{ value: 'school', label: 'Trường học' },
		{ value: 'training_center', label: 'Trung tâm đào tạo' },
		{ value: 'corporate', label: 'Doanh nghiệp' },
		{ value: 'ngo', label: 'Tổ chức phi lợi nhuận' },
		{ value: 'government', label: 'Cơ quan nhà nước' },
		{ value: 'startup', label: 'Startup' },
		{ value: 'enterprise', label: 'Tập đoàn' },
		{ value: 'other', label: 'Khác' }
	]

	const organizationStatuses: { value: OrganizationStatus | 'all'; label: string }[] = [
		{ value: 'all', label: 'Tất cả trạng thái' },
		{ value: 'active', label: 'Hoạt động' },
		{ value: 'inactive', label: 'Không hoạt động' },
		{ value: 'suspended', label: 'Tạm dừng' },
		{ value: 'pending', label: 'Chờ duyệt' },
		{ value: 'archived', label: 'Lưu trữ' }
	]

	const organizationSizes: { value: OrganizationSize | 'all'; label: string }[] = [
		{ value: 'all', label: 'Tất cả quy mô' },
		{ value: 'startup', label: '1-10 nhân viên' },
		{ value: 'small', label: '11-50 nhân viên' },
		{ value: 'medium', label: '51-200 nhân viên' },
		{ value: 'large', label: '201-1000 nhân viên' },
		{ value: 'enterprise', label: '1000+ nhân viên' }
	]

	const subscriptionPlans: { value: SubscriptionPlan | 'all'; label: string }[] = [
		{ value: 'all', label: 'Tất cả gói' },
		{ value: 'free', label: 'Miễn phí' },
		{ value: 'basic', label: 'Cơ bản' },
		{ value: 'professional', label: 'Chuyên nghiệp' },
		{ value: 'enterprise', label: 'Doanh nghiệp' },
		{ value: 'custom', label: 'Tùy chỉnh' }
	]

	const subscriptionStatuses: { value: SubscriptionStatus | 'all'; label: string }[] = [
		{ value: 'all', label: 'Tất cả trạng thái gói' },
		{ value: 'active', label: 'Hoạt động' },
		{ value: 'expired', label: 'Hết hạn' },
		{ value: 'cancelled', label: 'Đã hủy' },
		{ value: 'pending', label: 'Chờ duyệt' },
		{ value: 'trial', label: 'Dùng thử' }
	]

	const verificationStatuses: { value: VerificationStatus | 'all'; label: string }[] = [
		{ value: 'all', label: 'Tất cả xác minh' },
		{ value: 'verified', label: 'Đã xác minh' },
		{ value: 'pending', label: 'Chờ xác minh' },
		{ value: 'rejected', label: 'Từ chối' },
		{ value: 'not_verified', label: 'Chưa xác minh' }
	]

	const booleanOptions = [
		{ value: 'all', label: 'Tất cả' },
		{ value: true, label: 'Có' },
		{ value: false, label: 'Không' }
	]

	const hasActiveFilters = () => {
		return (
			filters.search ||
			filters.type !== 'all' ||
			filters.status !== 'all' ||
			filters.size !== 'all' ||
			filters.subscriptionPlan !== 'all' ||
			filters.subscriptionStatus !== 'all' ||
			filters.verificationStatus !== 'all' ||
			filters.industry !== 'all' ||
			filters.country !== 'all' ||
			filters.city !== 'all' ||
			filters.isActive !== 'all' ||
			filters.isVerified !== 'all' ||
			filters.isPremium !== 'all' ||
			filters.createdFrom ||
			filters.createdTo ||
			filters.employeesFrom ||
			filters.employeesTo ||
			filters.revenueFrom ||
			filters.revenueTo
		)
	}

	return (
		<div className="organization-filter-bar">
			<div className="filters-container">
				{/* Search */}
				<div className="search-bar">
					<Search size={18} />
					<input
						type="text"
						placeholder="Tìm kiếm tổ chức..."
						value={filters.search}
						onChange={(e) => updateFilter('search', e.target.value)}
						className="search-input"
					/>
				</div>

				{/* Quick Filters */}
				<div className="quick-filters">
					<Dropdown
						value={filters.type}
						onChange={(value) => updateFilter('type', value)}
						options={organizationTypes}
						placeholder="Loại tổ chức"
						icon={<Building2 size={16} />}
					/>

					<Dropdown
						value={filters.status}
						onChange={(value) => updateFilter('status', value)}
						options={organizationStatuses}
						placeholder="Trạng thái"
						icon={<Globe size={16} />}
					/>

					<Dropdown
						value={filters.size}
						onChange={(value) => updateFilter('size', value)}
						options={organizationSizes}
						placeholder="Quy mô"
						icon={<Users size={16} />}
					/>

					<Dropdown
						value={filters.subscriptionPlan}
						onChange={(value) => updateFilter('subscriptionPlan', value)}
						options={subscriptionPlans}
						placeholder="Gói đăng ký"
						icon={<Calendar size={16} />}
					/>
				</div>

				{/* Advanced Filters Toggle */}
				<div className="advanced-filters-toggle">
					<button
						className="btn btn-outline btn-sm"
						onClick={() => updateFilter('showAdvanced', !filters.showAdvanced)}
					>
						<Filter size={16} />
						Bộ lọc nâng cao
					</button>
				</div>

				{/* Clear Filters */}
				{hasActiveFilters() && (
					<button className="btn btn-outline btn-sm" onClick={onClearFilters}>
						<X size={16} />
						Xóa bộ lọc
					</button>
				)}
			</div>

			{/* Advanced Filters */}
			{filters.showAdvanced && (
				<div className="advanced-filters">
					<div className="advanced-filters-grid">
						<div className="filter-group">
							<label>Trạng thái gói đăng ký</label>
							<Dropdown
								value={filters.subscriptionStatus}
								onChange={(value) => updateFilter('subscriptionStatus', value)}
								options={subscriptionStatuses}
								placeholder="Chọn trạng thái gói"
							/>
						</div>

						<div className="filter-group">
							<label>Trạng thái xác minh</label>
							<Dropdown
								value={filters.verificationStatus}
								onChange={(value) => updateFilter('verificationStatus', value)}
								options={verificationStatuses}
								placeholder="Chọn trạng thái xác minh"
							/>
						</div>

						<div className="filter-group">
							<label>Ngành</label>
							<Dropdown
								value={filters.industry}
								onChange={(value) => updateFilter('industry', value)}
								options={[
									{ value: 'all', label: 'Tất cả ngành' },
									...uniqueIndustries.map(industry => ({ value: industry, label: industry }))
								]}
								placeholder="Chọn ngành"
							/>
						</div>

						<div className="filter-group">
							<label>Quốc gia</label>
							<Dropdown
								value={filters.country}
								onChange={(value) => updateFilter('country', value)}
								options={[
									{ value: 'all', label: 'Tất cả quốc gia' },
									...uniqueCountries.map(country => ({ value: country, label: country }))
								]}
								placeholder="Chọn quốc gia"
							/>
						</div>

						<div className="filter-group">
							<label>Thành phố</label>
							<Dropdown
								value={filters.city}
								onChange={(value) => updateFilter('city', value)}
								options={[
									{ value: 'all', label: 'Tất cả thành phố' },
									...uniqueCities.map(city => ({ value: city, label: city }))
								]}
								placeholder="Chọn thành phố"
							/>
						</div>

						<div className="filter-group">
							<label>Tổ chức hoạt động</label>
							<Dropdown
								value={filters.isActive}
								onChange={(value) => updateFilter('isActive', value)}
								options={booleanOptions}
								placeholder="Chọn trạng thái"
							/>
						</div>

						<div className="filter-group">
							<label>Đã xác minh</label>
							<Dropdown
								value={filters.isVerified}
								onChange={(value) => updateFilter('isVerified', value)}
								options={booleanOptions}
								placeholder="Chọn trạng thái"
							/>
						</div>

						<div className="filter-group">
							<label>Premium</label>
							<Dropdown
								value={filters.isPremium}
								onChange={(value) => updateFilter('isPremium', value)}
								options={booleanOptions}
								placeholder="Chọn trạng thái"
							/>
						</div>
					</div>

					<div className="date-range-filters">
						<div className="filter-group">
							<label>Từ ngày tạo</label>
							<input
								type="date"
								value={filters.createdFrom || ''}
								onChange={(e) => updateFilter('createdFrom', e.target.value)}
								className="form-input"
							/>
						</div>

						<div className="filter-group">
							<label>Đến ngày tạo</label>
							<input
								type="date"
								value={filters.createdTo || ''}
								onChange={(e) => updateFilter('createdTo', e.target.value)}
								className="form-input"
							/>
						</div>
					</div>

					<div className="number-range-filters">
						<div className="filter-group">
							<label>Số nhân viên từ</label>
							<input
								type="number"
								value={filters.employeesFrom || ''}
								onChange={(e) => updateFilter('employeesFrom', parseInt(e.target.value) || undefined)}
								className="form-input"
								placeholder="0"
							/>
						</div>

						<div className="filter-group">
							<label>Số nhân viên đến</label>
							<input
								type="number"
								value={filters.employeesTo || ''}
								onChange={(e) => updateFilter('employeesTo', parseInt(e.target.value) || undefined)}
								className="form-input"
								placeholder="10000"
							/>
						</div>

						<div className="filter-group">
							<label>Doanh thu từ (VND)</label>
							<input
								type="number"
								value={filters.revenueFrom || ''}
								onChange={(e) => updateFilter('revenueFrom', parseInt(e.target.value) || undefined)}
								className="form-input"
								placeholder="0"
							/>
						</div>

						<div className="filter-group">
							<label>Doanh thu đến (VND)</label>
							<input
								type="number"
								value={filters.revenueTo || ''}
								onChange={(e) => updateFilter('revenueTo', parseInt(e.target.value) || undefined)}
								className="form-input"
								placeholder="1000000000"
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default OrganizationFilterBar
