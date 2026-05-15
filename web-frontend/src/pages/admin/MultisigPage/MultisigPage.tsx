import React, { FormEvent, Fragment } from 'react'
import {
	AlertCircle,
	CheckCircle2,
	ClipboardList,
	FilePlus2,
	Link2,
	ListChecks,
	Play,
	RefreshCw,
	Search,
	Send,
	ShieldCheck,
	Users,
	Wallet,
} from 'lucide-react'
import { useMultisig } from '@/features/blockchain/hooks'
import { formatWeiToEth } from '@/features/blockchain/utils/multisig'
import '@/features/admin/ui/common/styles/common.css'
import '@/features/admin/ui/common/styles/FormStyles.css'
import '@/features/admin/ui/common/styles/table.css'
import '@/features/admin/ui/common/styles/multisig.css'

const MultisigPage = (): JSX.Element => {
	const {
		alertState,
		createLoading,
		linkLoading,
		loadingWallet,
		transactionsLoading,
		submitLoading,
		confirmLoading,
		executeLoading,
		credentialLoading,
		allWalletsLoading,
		availableUsersLoading,
		createForm,
		setCreateForm,
		linkForm,
		setLinkForm,
		transactionForm,
		setTransactionForm,
		walletIdInput,
		setWalletIdInput,
		activeWalletId,
		wallet,
		trackedWallets,
		allWallets,
		availableUsers,
		transactions,
		lastSyncedAt,
		ownerCredential,
		setOwnerCredential,
		useManualInput,
		setUseManualInput,
		selectedUserIds,
		setSelectedUserIds,
		confirmKeys,
		setConfirmKeys,
		transactionFilters,
		setTransactionFilters,
		pendingTransactions,
		executedTransactions,
		filteredTransactions,
		totalWalletValue,
		readyToExecuteCount,
		usedUserIds,
		availableUsersForSelection,
		latestLoadedWallet,
		handleCreateWallet,
		handleLinkWallet,
		handleLoadWallet,
		handleSelectTrackedWallet,
		handleSubmitTransaction,
		handleConfirmTransaction,
		handleExecuteTransaction,
		handleGetOwnerCredential,
		handleRefresh,
	} = useMultisig()

	return (
		<div className="multisig-page">
			<div className="multisig-header">
				<div>
					<h1>
						<ShieldCheck size={28} />
						<span style={{ marginLeft: 8 }}>Quản lý Multisig</span>
					</h1>
					<p>
						Tạo, liên kết và giám sát ví multisig dành cho admin. Theo dõi trạng thái xác nhận,
						thực thi giao dịch và bảo đảm đủ chủ sở hữu ký duyệt trước khi đẩy lên blockchain.
					</p>
					{wallet && latestLoadedWallet?.lastLoadedAt && (
						<p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 8 }}>
							Lần đồng bộ gần nhất:{' '}
							{lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : 'Chưa có dữ liệu'} — Ví đang
							chọn được tải lúc {new Date(latestLoadedWallet.lastLoadedAt).toLocaleString()}
						</p>
					)}
				</div>

				<div className="multisig-actions">
					<button
						className="btn btn-secondary"
						type="button"
						onClick={handleRefresh}
						disabled={loadingWallet || transactionsLoading || !activeWalletId}
					>
						<RefreshCw size={16} />
						Làm mới dữ liệu
					</button>
				</div>
			</div>

			{alertState && (
				<div className={`multisig-alert ${alertState.type}`}>
					<AlertCircle size={18} style={{ marginTop: 2 }} />
					<div>
						<div style={{ fontWeight: 600 }}>{alertState.message}</div>
						{alertState.details && (
							<div style={{ opacity: 0.8, fontSize: 13 }}>{alertState.details}</div>
						)}
					</div>
				</div>
			)}

			<div className="multisig-grid">
				<div className="multisig-card">
					<h2>
						<FilePlus2 size={18} />
						Tạo ví multisig mới
					</h2>
					<form className="form-grid" onSubmit={handleCreateWallet}>
						<div className="form-group">
							<label className="form-label">Tên ví</label>
							<input
								className="form-input"
								type="text"
								value={createForm.name}
								onChange={(event) =>
									setCreateForm((prev) => ({ ...prev, name: event.target.value }))
								}
								placeholder="Ví điều hành DAO"
								required
							/>
						</div>
						<div className="form-group">
							<label className="form-label">Ngưỡng chữ ký (threshold)</label>
							<input
								className="form-input"
								type="number"
								min={1}
								value={createForm.threshold}
								onChange={(event) =>
									setCreateForm((prev) => ({
										...prev,
										threshold: Number(event.target.value),
									}))
								}
								required
							/>
						</div>
						<div className="form-group form-group-full">
							<label className="form-label">Mô tả</label>
							<textarea
								className="form-textarea"
								value={createForm.description}
								onChange={(event) =>
									setCreateForm((prev) => ({ ...prev, description: event.target.value }))
								}
								placeholder="Ghi chú nội bộ cho đội vận hành (tuỳ chọn)"
							/>
						</div>
						<div className="form-group form-group-full">
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
								<label className="form-label">Chọn người dùng làm chủ sở hữu</label>
								<button
									type="button"
									className="btn btn-sm"
									onClick={() => {
										setUseManualInput(!useManualInput)
										setSelectedUserIds([])
										setCreateForm(prev => ({ ...prev, ownerUserIdsText: '' }))
									}}
									style={{
										fontSize: 12,
										padding: '4px 8px',
										border: '1px solid var(--border)',
										background: 'var(--background)',
										color: 'var(--foreground)',
										borderRadius: 4,
										cursor: 'pointer'
									}}
								>
									{useManualInput ? 'Chọn từ danh sách' : 'Nhập thủ công'}
								</button>
							</div>

							{useManualInput ? (
								<textarea
									className="form-textarea"
									style={{ fontFamily: 'var(--font-mono)' }}
									value={createForm.ownerUserIdsText}
									onChange={(event) =>
										setCreateForm((prev) => ({ ...prev, ownerUserIdsText: event.target.value }))
									}
									placeholder={'1\n2\n3'}
									required
								/>
							) : (
								<>
									{availableUsersLoading ? (
										<div style={{ padding: '12px', textAlign: 'center', color: 'var(--muted-foreground)' }}>
											Đang tải danh sách người dùng...
										</div>
									) : availableUsersForSelection.length === 0 ? (
										<div style={{ padding: '12px', textAlign: 'center', color: 'var(--muted-foreground)' }}>
											{availableUsers.length === 0 ? (
												<>
											Không thể tải danh sách người dùng từ identity-service.{' '}
											<button
												type="button"
												className="btn-link"
												onClick={() => setUseManualInput(true)}
												style={{
													fontSize: 12,
													color: 'var(--primary)',
													textDecoration: 'underline',
													background: 'none',
													border: 'none',
													cursor: 'pointer',
													padding: 0
												}}
											>
												Nhập thủ công ID
											</button>
												</>
											) : (
												<>
													Tất cả người dùng đã được sử dụng trong các ví đang theo dõi.{' '}
													<button
														type="button"
														className="btn-link"
														onClick={() => setUseManualInput(true)}
														style={{
															fontSize: 12,
															color: 'var(--primary)',
															textDecoration: 'underline',
															background: 'none',
															border: 'none',
															cursor: 'pointer',
															padding: 0
														}}
													>
														Nhập thủ công ID
													</button>
												</>
											)}
										</div>
									) : (
										<div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 6, padding: '8px' }}>
											{availableUsersForSelection.map((user) => (
												<label
													key={user.id}
													style={{
														display: 'flex',
														alignItems: 'center',
														padding: '6px 8px',
														marginBottom: 4,
														borderRadius: 4,
														cursor: 'pointer',
														background: selectedUserIds.includes(user.id) ? 'var(--accent)' : 'transparent',
														transition: 'background 0.2s',
													}}
												>
													<input
														type="checkbox"
														checked={selectedUserIds.includes(user.id)}
														onChange={(e) => {
															if (e.target.checked) {
																setSelectedUserIds(prev => [...prev, user.id])
															} else {
																setSelectedUserIds(prev => prev.filter(id => id !== user.id))
															}
														}}
														style={{ marginRight: 8 }}
													/>
													<div>
														<strong>
															{user.firstName && user.lastName
																? `${user.firstName} ${user.lastName}`.trim()
																: user.firstName || user.lastName || user.username || `User ${user.id}`
															}
														</strong>
														<span style={{ fontSize: 12, color: 'var(--muted-foreground)', marginLeft: 8 }}>
															ID: {user.id}
														</span>
													</div>
												</label>
											))}
										</div>
									)}
								</>
							)}

							<div className="form-hint">
								Chọn người dùng sẽ làm chủ sở hữu ví. Service Account sẽ được tự động thêm.
								{!useManualInput && selectedUserIds.length > 0 && (
									<span style={{ marginLeft: 8, fontWeight: 500 }}>
										Đã chọn: {selectedUserIds.length} người dùng
									</span>
								)}
							</div>
						</div>
						<div className="form-group form-group-full" style={{ marginTop: 8 }}>
							<button
								type="submit"
								className="btn btn-primary"
								disabled={createLoading}
								style={{ width: '100%', justifyContent: 'center' }}
							>
								{createLoading ? 'Đang tạo...' : 'Tạo ví mới'}
							</button>
						</div>
					</form>
				</div>

				<div className="multisig-card">
					<h2>
						<Link2 size={18} />
						Liên kết ví hiện có
					</h2>
					<form className="form-grid" onSubmit={handleLinkWallet}>
						<div className="form-group">
							<label className="form-label">Tên hiển thị</label>
							<input
								className="form-input"
								type="text"
								value={linkForm.name}
								onChange={(event) =>
									setLinkForm((prev) => ({ ...prev, name: event.target.value }))
								}
								placeholder="Ví cộng đồng"
								required
							/>
						</div>
						<div className="form-group">
							<label className="form-label">Địa chỉ contract</label>
							<input
								className="form-input"
								type="text"
								value={linkForm.contractAddress}
								onChange={(event) =>
									setLinkForm((prev) => ({ ...prev, contractAddress: event.target.value }))
								}
								placeholder="0x1234..."
								required
							/>
						</div>
						<div className="form-group form-group-full">
							<label className="form-label">Mô tả</label>
							<textarea
								className="form-textarea"
								value={linkForm.description}
								onChange={(event) =>
									setLinkForm((prev) => ({ ...prev, description: event.target.value }))
								}
								placeholder="Thông tin quản trị, ghi chú backup key..."
							/>
						</div>
						<div className="form-group form-group-full">
							<label className="form-label">Danh sách ID người dùng (tuỳ chọn)</label>
							<textarea
								className="form-textarea"
								style={{ fontFamily: 'var(--font-mono)' }}
								value={linkForm.ownerUserIdsText}
								onChange={(event) =>
									setLinkForm((prev) => ({ ...prev, ownerUserIdsText: event.target.value }))
								}
								placeholder={'1,2,3'}
							/>
							<div className="form-hint">
								Nếu muốn gán private key cho người dùng, nhập ID người dùng (ngăn cách bởi dấu phẩy).
							</div>
						</div>
						<div className="form-group form-group-full" style={{ marginTop: 8 }}>
							<button
								type="submit"
								className="btn btn-primary"
								disabled={linkLoading}
								style={{ width: '100%', justifyContent: 'center' }}
							>
								{linkLoading ? 'Đang liên kết...' : 'Liên kết ví'}
							</button>
						</div>
					</form>
				</div>

				<div className="multisig-card">
					<h2>
						<Wallet size={18} />
						Quản lý ví đang theo dõi
					</h2>
					<form onSubmit={handleLoadWallet}>
						<div className="form-group">
							<label className="form-label">ID ví (UUID)</label>
							<input
								className="form-input"
								type="text"
								value={walletIdInput}
								onChange={(event) => setWalletIdInput(event.target.value)}
								placeholder="Nhập ID ví để tải dữ liệu"
							/>
							<div className="form-hint">
								Sao chép ID từ hệ thống backend hoặc chọn ví sẵn có ở bên dưới.
							</div>
						</div>
						<button
							type="submit"
							className="btn btn-secondary"
							style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
							disabled={loadingWallet}
						>
							{loadingWallet ? 'Đang tải...' : 'Tải ví theo ID'}
						</button>
					</form>

					<div className="multisig-tracked">
						<div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
							<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
								<ListChecks size={16} />
								<strong>Ví được theo dõi gần đây</strong>
							</div>
							{allWalletsLoading && (
								<div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted-foreground)' }}>
									<RefreshCw size={12} className="spinning" />
									Đang tải...
								</div>
							)}
						</div>
						{trackedWallets.length === 0 ? (
							<div className="multisig-empty">Chưa có ví nào được lưu để theo dõi.</div>
						) : (
							<div className="multisig-tracked-list">
							 {trackedWallets.map((item) => (
									<button
										type="button"
										key={item.id}
										className={`multisig-tracked-item ${
											item.id === activeWalletId ? 'active' : ''
										}`}
										onClick={() => handleSelectTrackedWallet(item.id)}
									>
										<strong>{item.name || 'Chưa đặt tên'}</strong>
										<span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
											ID: {item.id}
										</span>
										<span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
											User IDs: {item.ownerUserIds?.join(', ') || 'N/A'}
										</span>
										<span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
											Chủ sở hữu: {item.owners?.length ?? 0} • Threshold: {item.threshold}
										</span>
									</button>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			{wallet ? (
				<>
					<div className="multisig-grid">
						<div className="multisig-card">
							<h2>
								<Users size={18} />
								Tổng quan ví
							</h2>
							<div className="multisig-summary-grid">
								<div className="multisig-summary-card">
									<div className="multisig-summary-label">Chủ sở hữu</div>
									<div className="multisig-summary-value">{wallet.owners?.length ?? 0}</div>
									<div className="multisig-summary-extra">Địa chỉ yêu cầu ký duyệt</div>
								</div>
								<div className="multisig-summary-card">
									<div className="multisig-summary-label">Threshold</div>
									<div className="multisig-summary-value">{wallet.threshold}</div>
									<div className="multisig-summary-extra">Số chữ ký tối thiểu</div>
								</div>
								<div className="multisig-summary-card">
									<div className="multisig-summary-label">Đang chờ</div>
									<div className="multisig-summary-value">{pendingTransactions.length}</div>
									<div className="multisig-summary-extra">
										{readyToExecuteCount} giao dịch đủ chữ ký
									</div>
								</div>
								<div className="multisig-summary-card">
									<div className="multisig-summary-label">Tổng giá trị</div>
									<div className="multisig-summary-value">{totalWalletValue} ETH</div>
									<div className="multisig-summary-extra">
										Tính theo tổng giá trị giao dịch đã ghi nhận
									</div>
								</div>
							</div>
						</div>

						<div className="multisig-card multisig-owners">
							<h2>
								<ShieldCheck size={18} />
								Danh sách owners
							</h2>
							<div className="multisig-owner-list">
								{wallet.owners?.map((owner) => (
									<span key={owner} className="multisig-owner">
										{owner}
									</span>
								))}
							</div>
							{wallet.ownerDetails && wallet.ownerDetails.length > 0 && (
								<div style={{ marginTop: 16 }}>
									<h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--foreground)' }}>
										Chi tiết chủ sở hữu (từ backend)
									</h4>
									{wallet.ownerDetails.map((detail, idx) => (
										<div
											key={idx}
											style={{
												background: 'var(--muted)',
												padding: '8px 12px',
												borderRadius: 6,
												marginBottom: 8,
												fontFamily: 'var(--font-mono)',
												fontSize: 12,
											}}
										>
											<div>ID: {detail.userId}</div>
											<div>
												Tên: {detail.identity?.firstName && detail.identity?.lastName
													? `${detail.identity.firstName} ${detail.identity.lastName}`.trim()
													: detail.identity?.firstName || detail.identity?.lastName || detail.identity?.username || '(chưa có tên)'
												}
											</div>
											<div>Address: {detail.address}</div>
											{detail.privateKeyMasked && (
												<div>Private Key: {detail.privateKeyMasked}</div>
											)}
										</div>
									))}
								</div>
							)}
							{wallet.onChainWarning && (
								<div className="multisig-owner-warning">
									<strong>Cảnh báo:</strong> {wallet.onChainWarning}
								</div>
							)}
							{wallet.onChainError && (
								<div className="multisig-owner-warning" style={{ background: '#fee2e2' }}>
									<strong>Lỗi đồng bộ on-chain:</strong> {wallet.onChainError}
								</div>
							)}
							<div style={{ marginTop: 16 }}>
								<button
									type="button"
									className="btn btn-secondary"
									onClick={handleGetOwnerCredential}
									disabled={credentialLoading || !activeWalletId}
									style={{ fontSize: 13 }}
								>
									{credentialLoading ? 'Đang lấy...' : 'Lấy credential của tôi'}
								</button>
								{ownerCredential && (
									<div
										style={{
											marginTop: 12,
											padding: '12px',
											background: '#f0f9ff',
											border: '1px solid #0ea5e9',
											borderRadius: 6,
											fontSize: 12,
											fontFamily: 'var(--font-mono)',
										}}
									>
										<div style={{ fontWeight: 600, marginBottom: 8 }}>Credential của bạn:</div>
										<div>ID: {ownerCredential.userId}</div>
										<div>Address: {ownerCredential.address}</div>
										<div>Private Key: {ownerCredential.privateKey}</div>
										{(ownerCredential.identity?.firstName || ownerCredential.identity?.lastName || ownerCredential.identity?.username) && (
											<div>
												Tên: {ownerCredential.identity?.firstName && ownerCredential.identity?.lastName
													? `${ownerCredential.identity.firstName} ${ownerCredential.identity.lastName}`.trim()
													: ownerCredential.identity?.firstName || ownerCredential.identity?.lastName || ownerCredential.identity?.username
												}
											</div>
										)}
									</div>
								)}
							</div>
						</div>

						<div className="multisig-card">
							<h2>
								<Send size={18} />
								Đề xuất giao dịch mới
							</h2>
							<form className="form-grid" onSubmit={handleSubmitTransaction}>
								<div className="form-group">
									<label className="form-label">Địa chỉ nhận</label>
									<input
										className="form-input"
										type="text"
										value={transactionForm.destination}
										onChange={(event) =>
											setTransactionForm((prev) => ({
												...prev,
												destination: event.target.value,
											}))
										}
										placeholder="0xNgườiNhận..."
										required
									/>
								</div>
								<div className="form-group">
									<label className="form-label">Số lượng (ETH)</label>
									<input
										className="form-input"
										type="number"
										min="0"
										step="any"
										value={transactionForm.value}
										onChange={(event) =>
											setTransactionForm((prev) => ({
												...prev,
												value: event.target.value,
											}))
										}
										placeholder="0.5"
										required
									/>
								</div>
								<div className="form-group form-group-full">
									<label className="form-label">Mô tả / ghi chú (tuỳ chọn)</label>
									<input
										className="form-input"
										type="text"
										value={transactionForm.description}
										onChange={(event) =>
											setTransactionForm((prev) => ({
												...prev,
												description: event.target.value,
											}))
										}
										placeholder="Chi trả nhà cung cấp, hoàn phí..."
									/>
								</div>
								<div className="form-group form-group-full">
									<label className="form-label">Dữ liệu bổ sung (hex)</label>
									<textarea
										className="form-textarea"
										style={{ fontFamily: 'var(--font-mono)', minHeight: 100 }}
										value={transactionForm.data}
										onChange={(event) =>
											setTransactionForm((prev) => ({
												...prev,
												data: event.target.value,
											}))
										}
										placeholder="0x"
									/>
								</div>
								<div className="form-group form-group-full" style={{ display: 'flex', gap: 8 }}>
									<button
										type="submit"
										className="btn btn-primary"
										disabled={submitLoading}
										style={{ flex: 1, justifyContent: 'center' }}
									>
										{submitLoading ? 'Đang tạo...' : 'Đề xuất giao dịch'}
									</button>
									<button
										type="button"
										className="btn btn-secondary"
										onClick={() =>
											setTransactionForm({
												destination: '',
												value: '',
												data: '',
												description: '',
											})
										}
									>
										Xoá biểu mẫu
									</button>
								</div>
							</form>
						</div>
					</div>

					<div className="multisig-card">
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
							<h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
								<Wallet size={18} />
								Giao dịch chờ xử lý ({pendingTransactions.length})
							</h2>
							<button
								type="button"
								className="btn btn-secondary btn-sm"
								onClick={() => activeWalletId && handleRefresh()}
								disabled={transactionsLoading || !activeWalletId}
							>
								<RefreshCw size={16} />
								Làm mới
							</button>
						</div>
						{transactionsLoading ? (
							<div className="multisig-empty">Đang tải danh sách giao dịch...</div>
						) : pendingTransactions.length === 0 ? (
							<div className="multisig-empty">Không có giao dịch nào đang chờ.</div>
						) : (
							<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
								{pendingTransactions.map((tx) => (
									<div
										key={tx.id}
										style={{
											border: '1px solid var(--border)',
											borderRadius: 12,
											padding: 16,
											background: 'var(--background)',
										}}
									>
										<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
											<div>
												<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
													<strong>#{tx.txIndexOnChain}</strong>
													<span
														className={`badge ${
															tx.status === 'confirmed'
																? 'badge-info'
																: 'badge-secondary'
														}`}
													>
														{tx.status === 'confirmed' ? 'Đủ chữ ký' : tx.status}
													</span>
													{(tx.confirmations?.length || 0) >= wallet.threshold && (
														<span className="badge badge-success">Sẵn sàng thực thi</span>
													)}
												</div>
												<div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>
													ID: {tx.id}
												</div>
												{tx.txHash && (
													<div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
														TX Hash: {tx.txHash}
													</div>
												)}
											</div>
										</div>
										<div
											style={{
												display: 'grid',
												gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
												gap: 12,
												marginBottom: 12,
											}}
										>
											<div>
												<div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 4 }}>Gửi tới</div>
												<div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{tx.destination}</div>
											</div>
											<div>
												<div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 4 }}>Giá trị</div>
												<div>{formatWeiToEth(tx.value || '0')} ETH</div>
											</div>
											<div>
												<div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 4 }}>Lượt xác nhận</div>
												<div>
													<span className="badge badge-secondary">
														{tx.confirmations?.length || 0}/{wallet.threshold}
													</span>
												</div>
											</div>
										</div>
										{tx.confirmations && tx.confirmations.length > 0 && (
											<div style={{ marginBottom: 12, padding: 12, background: 'var(--muted)', borderRadius: 8 }}>
												<div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 8 }}>
													Đã xác nhận bởi ({tx.confirmations.length}):
												</div>
												<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
													{tx.confirmations.map((addr, idx) => (
														<span
															key={idx}
															style={{
																fontFamily: 'var(--font-mono)',
																fontSize: 12,
																padding: '4px 8px',
																background: 'var(--background)',
																borderRadius: 4,
															}}
														>
															{addr}
														</span>
													))}
												</div>
											</div>
										)}
										{tx.data && tx.data !== '0x' && (
											<div style={{ marginBottom: 12 }}>
												<div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 6 }}>Dữ liệu bổ sung</div>
												<pre className="multisig-data" style={{ fontSize: 12, padding: 8 }}>{tx.data}</pre>
											</div>
										)}
										<div
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: 12,
												padding: 16,
												background: 'var(--muted)',
												borderRadius: 8,
											}}
										>
											<div style={{ flex: '1 1 200px' }}>
												<label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: 'var(--muted-foreground)' }}>
													Private key để xác nhận (tuỳ chọn)
												</label>
												<input
													type="password"
													className="form-input"
													value={confirmKeys[tx.id] || ''}
													onChange={(event) =>
														setConfirmKeys((prev) => ({
															...prev,
															[tx.id]: event.target.value,
														}))
													}
													placeholder="Nếu bỏ trống sẽ dùng Service Account"
													style={{ width: '100%' }}
												/>
											</div>
											<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
												<button
													type="button"
													className="btn btn-primary btn-sm"
													onClick={() => handleConfirmTransaction(tx.id)}
													disabled={confirmLoading[tx.id] || tx.status === 'executed'}
												>
													<CheckCircle2 size={16} />
													{confirmLoading[tx.id] ? 'Đang xác nhận...' : 'Xác nhận'}
												</button>
												<button
													type="button"
													className="btn btn-secondary btn-sm"
													onClick={() => handleExecuteTransaction(tx.id)}
													disabled={
														executeLoading[tx.id] ||
														(tx.confirmations?.length || 0) < wallet.threshold ||
														tx.status === 'executed'
													}
												>
													<Play size={16} />
													{executeLoading[tx.id] ? 'Đang thực thi...' : 'Thực thi giao dịch'}
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					<div className="multisig-card">
						<div className="multisig-filters">
							<div>
								<h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
									<ClipboardList size={18} />
									Danh sách giao dịch ({filteredTransactions.length})
								</h2>
								<p style={{ margin: '4px 0 0', color: 'var(--muted-foreground)', fontSize: 13 }}>
									Theo dõi trạng thái xác nhận và thực thi đối với từng giao dịch multisig
								</p>
							</div>
							<div className="filter-controls">
								<div className="search-bar" style={{ maxWidth: 280 }}>
									<input
										type="search"
										placeholder="Tìm theo ID, TX hash, địa chỉ..."
										value={transactionFilters.search}
										onChange={(event) =>
											setTransactionFilters((prev) => ({
												...prev,
												search: event.target.value,
											}))
										}
									/>
									<Search className="search-bar-icon" size={16} />
								</div>
								<select
									className="form-select"
									value={transactionFilters.status}
									onChange={(event) =>
										setTransactionFilters((prev) => ({
											...prev,
											status: event.target.value as typeof transactionFilters.status,
										}))
									}
								>
									<option value="all">Tất cả trạng thái</option>
									<option value="submitted">Đã gửi</option>
									<option value="confirmed">Đủ chữ ký</option>
									<option value="executed">Đã thực thi</option>
									<option value="failed">Thất bại</option>
								</select>
							</div>
						</div>

						{transactionsLoading ? (
							<div className="multisig-empty">Đang tải giao dịch...</div>
						) : filteredTransactions.length === 0 ? (
							<div className="multisig-empty">
								Không có giao dịch nào khớp bộ lọc hiện tại. Thử thay đổi bộ lọc hoặc tạo giao dịch
								mới.
							</div>
						) : (
							<table className="admin-table">
								<thead>
									<tr>
										<th>#</th>
										<th>Địa chỉ nhận</th>
										<th>Giá trị (ETH)</th>
										<th>Xác nhận</th>
										<th>Trạng thái</th>
										<th>Hành động</th>
									</tr>
								</thead>
								<tbody>
									{filteredTransactions.map((tx) => (
										<Fragment key={tx.id}>
											<tr>
												<td>#{tx.txIndexOnChain}</td>
												<td style={{ fontFamily: 'var(--font-mono)' }}>{tx.destination}</td>
												<td>{formatWeiToEth(tx.value || '0')}</td>
												<td>
													<span className="badge badge-secondary">
														{tx.confirmations?.length || 0}/{wallet.threshold}
													</span>
												</td>
												<td>
													<span
														className={`badge ${
															tx.status === 'executed'
																? 'badge-success'
																: tx.status === 'failed'
																? 'badge-danger'
																: tx.status === 'confirmed'
																? 'badge-info'
																: 'badge-secondary'
														}`}
													>
														{tx.status}
													</span>
												</td>
												<td>
													<div className="multisig-transaction-actions">
														<div className="multisig-transaction-key" style={{ flex: '1 1 200px' }}>
															<label>Private key (tuỳ chọn)</label>
															<input
																type="password"
																className="form-input"
																value={confirmKeys[tx.id] || ''}
																onChange={(event) =>
																	setConfirmKeys((prev) => ({
																		...prev,
																		[tx.id]: event.target.value,
																	}))
																}
																placeholder="Nếu bỏ trống sẽ dùng Service Account"
															/>
														</div>
														<button
															type="button"
															className="btn btn-primary btn-sm"
															onClick={() => handleConfirmTransaction(tx.id)}
															disabled={confirmLoading[tx.id]}
														>
															<CheckCircle2 size={16} />
															{confirmLoading[tx.id] ? 'Đang xác nhận' : 'Xác nhận'}
														</button>
														<button
															type="button"
															className="btn btn-secondary btn-sm"
															onClick={() => handleExecuteTransaction(tx.id)}
															disabled={
																executeLoading[tx.id] ||
																(tx.confirmations?.length || 0) < wallet.threshold ||
																tx.status === 'executed'
															}
														>
															<Play size={16} />
															{executeLoading[tx.id] ? 'Đang thực thi' : 'Thực thi'}
														</button>
													</div>
												</td>
											</tr>
											{(tx.txHash || (tx.data && tx.data !== '0x')) && (
												<tr>
													<td colSpan={6}>
														<div
															style={{
																display: 'grid',
																gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
																gap: 12,
																alignItems: 'flex-start',
															}}
														>
															<div>
																<div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
																	ID giao dịch
																</div>
																<div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
																	{tx.id}
																</div>
															</div>
															<div>
																<div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
																	TX hash on-chain
																</div>
																<div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
																	{tx.txHash || '—'}
																</div>
															</div>
															<div>
																<div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
																	Cập nhật gần nhất
																</div>
																<div style={{ fontSize: 13 }}>
																	{tx.updatedAt
																		? new Date(tx.updatedAt).toLocaleString()
																		: '—'}
																</div>
															</div>
														</div>
														{tx.data && tx.data !== '0x' && (
															<div style={{ marginTop: 12 }}>
																<div
																	style={{
																		fontSize: 12,
																		color: 'var(--muted-foreground)',
																		marginBottom: 6,
																	}}
																>
																	Dữ liệu bổ sung
																</div>
																<pre className="multisig-data">{tx.data}</pre>
															</div>
														)}
													</td>
												</tr>
											)}
										</Fragment>
									))}
								</tbody>
							</table>
						)}
					</div>

					<div className="multisig-card">
						<h2 style={{ marginBottom: 16 }}>
							<CheckCircle2 size={18} style={{ marginRight: 8 }} />
							Giao dịch đã hoàn tất ({executedTransactions.length})
						</h2>
						{executedTransactions.length === 0 ? (
							<div className="multisig-empty">Chưa có giao dịch nào được thực thi.</div>
						) : (
							<table className="admin-table">
								<thead>
									<tr>
										<th>#</th>
										<th>ID</th>
										<th>TX Hash</th>
										<th>Giá trị (ETH)</th>
										<th>Thời gian cập nhật</th>
									</tr>
								</thead>
								<tbody>
									{executedTransactions.map((tx) => (
										<tr key={tx.id}>
											<td>#{tx.txIndexOnChain}</td>
											<td style={{ fontFamily: 'var(--font-mono)' }}>{tx.id}</td>
											<td style={{ fontFamily: 'var(--font-mono)' }}>{tx.txHash || '—'}</td>
											<td>{formatWeiToEth(tx.value || '0')}</td>
											<td>{tx.updatedAt ? new Date(tx.updatedAt).toLocaleString() : '—'}</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>
				</>
			) : (
				<div className="multisig-card">
					<h2 style={{ marginBottom: 16 }}>
						<Wallet size={18} style={{ marginRight: 8 }} />
						Chưa có ví nào được chọn
					</h2>
					<p style={{ color: 'var(--muted-foreground)', marginBottom: 16 }}>
						Sử dụng một trong các biểu mẫu phía trên để tạo, liên kết hoặc tải ví multisig hiện có.
						Giao diện quản lý chi tiết sẽ xuất hiện ngay khi bạn chọn được một ví hợp lệ.
					</p>
				</div>
			)}
		</div>
	)
}

export default MultisigPage
