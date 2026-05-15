import React from 'react'
import '@/features/admin/ui/common/styles/table.css'

interface TableColumn {
	key: string
	label: string
	sortable?: boolean
	width?: string
	render?: (value: any, row: any) => React.ReactNode
}

interface TableProps {
	columns: TableColumn[]
	data: any[]
	loading?: boolean
	onSort?: (key: string) => void
	sortKey?: string
	sortOrder?: 'asc' | 'desc'
}

export default function Table({ 
	columns, 
	data, 
	loading = false,
	onSort,
	sortKey,
	sortOrder 
}: TableProps): JSX.Element {
	
	const handleSort = (column: TableColumn) => {
		if (column.sortable && onSort) {
			onSort(column.key)
		}
	}

	if (loading) {
		return (
			<div className="admin-table-empty">
				<div className="admin-table-empty-icon">⏳</div>
				<div className="admin-table-empty-text">Đang tải dữ liệu...</div>
			</div>
		)
	}

	if (data.length === 0) {
		return (
			<div className="admin-table-empty">
				<div className="admin-table-empty-icon">📭</div>
				<div className="admin-table-empty-text">Không có dữ liệu</div>
			</div>
		)
	}

	return (
		<table className="admin-table">
			<thead>
				<tr>
					{columns.map((column) => (
						<th
							key={column.key}
							className={column.sortable ? 'sortable' : ''}
							style={{ width: column.width }}
							onClick={() => handleSort(column)}
						>
							<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
								{column.label}
								{column.sortable && sortKey === column.key && (
									<span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
								)}
							</div>
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{data.map((row, index) => (
					<tr key={row.id || index}>
						{columns.map((column) => (
							<td key={column.key}>
								{column.render 
									? column.render(row[column.key], row)
									: row[column.key]
								}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	)
}
