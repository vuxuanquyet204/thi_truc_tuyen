import React, { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import {
	Gift,
	Wallet,
	AlertTriangle,
	Coins,
	Copy,
	ExternalLink,
	AlertCircle,
	Zap,
	Shield,
	Plug,
	ShoppingBag,
	Clock
} from 'lucide-react';
import TokenHistoryTable from '@/shared/ui/molecules/TokenHistoryTable';
import { useTokenBalance } from '@/features/rewards/hooks';
import {
	connectWallet,
	formatAddress,
	getCurrentWallet,
	getTokenBalance as getOnchainTokenBalance,
	getETHBalance as getNativeBalance,
	isMetaMaskInstalled,
	isRewardTokenConfigured,
	transferTokens,
	estimateTokenTransferCost,
	onAccountsChanged,
	onChainChanged,
	removeAccountsListener,
	removeChainListener
} from '@/features/blockchain/services/walletService';
import { useAppSelector } from '@/foundation/store/hooks';
import { getLinkedWallet, linkWallet as linkWalletAddress, type LinkedWalletResponse, getGifts, type GiftItem } from '@/features/rewards/api';
import styles from './RewardPage.module.css';

interface ToastMessage {
	type: 'success' | 'error' | 'info';
	message: string;
	detail?: string;
}

const TOKEN_SYMBOL = import.meta.env.VITE_REWARD_TOKEN_SYMBOL || 'LEARN';
const NETWORK_NAME = import.meta.env.VITE_REWARD_TOKEN_NETWORK_NAME || 'Polygon';
const REQUIRED_CHAIN_ID = (import.meta.env.VITE_REWARD_TOKEN_CHAIN_ID || '0x89').toLowerCase();
const DEPOSIT_ADDRESS = import.meta.env.VITE_REWARD_TOKEN_DEPOSIT_ADDRESS || '0x000000000000000000000000000000000000dEaD';
const ESCROW_CONTRACT_ADDRESS = import.meta.env.VITE_REWARD_TOKEN_ESCROW_ADDRESS || '0x0000000000000000000000000000000000000000';
const MIN_WITHDRAW_AMOUNT = Number(import.meta.env.VITE_REWARD_MIN_WITHDRAW_AMOUNT ?? 100);
const WITHDRAW_GAS_TOKEN = import.meta.env.VITE_REWARD_GAS_TOKEN || 'ETH';
const ZERO_ADDRESS_REGEX = /^0x0{40}$/i;
const isDepositAddressConfigured = /^0x[a-fA-F0-9]{40}$/.test(DEPOSIT_ADDRESS) && !ZERO_ADDRESS_REGEX.test(DEPOSIT_ADDRESS);

export default function RewardPage(): JSX.Element {
	const navigate = useNavigate();
	const { user } = useAppSelector((state) => state.auth);
	const {
		balance,
		history,
		currentPage,
		totalPages,
		totalItems,
		loading,
		error,
		handleWithdraw,
		goToPage,
		nextPage,
		previousPage,
		refresh
	} = useTokenBalance();

	const [walletAddress, setWalletAddress] = useState<string | null>(null);
	const [walletChainId, setWalletChainId] = useState<string | null>(null);
	const [onchainBalance, setOnchainBalance] = useState<string>('0');
	const [ethBalance, setEthBalance] = useState<string>('0');
	const [withdrawAddress, setWithdrawAddress] = useState<string>('');
	const [withdrawAmount, setWithdrawAmount] = useState<string>('');
	const [withdrawNote, setWithdrawNote] = useState<ToastMessage | null>(null);
	const [submittingWithdraw, setSubmittingWithdraw] = useState(false);
	const [depositAmount, setDepositAmount] = useState<string>('');
	const [depositNote, setDepositNote] = useState<ToastMessage | null>(null);
	const [submittingDeposit, setSubmittingDeposit] = useState(false);
	const [depositGasEstimate, setDepositGasEstimate] = useState<{
		feeEth: string;
		gasCostWei: bigint;
		gasLimit: string;
		gasPriceGwei: string | null;
	} | null>(null);
	const [estimatingDepositGas, setEstimatingDepositGas] = useState(false);
	const [depositGasError, setDepositGasError] = useState<string | null>(null);
	const [toast, setToast] = useState<ToastMessage | null>(null);
	const [activeStoreTab, setActiveStoreTab] = useState<'store' | 'history'>('store');
	const [linkedWallet, setLinkedWallet] = useState<LinkedWalletResponse | null>(null);
	const [loadingWalletLink, setLoadingWalletLink] = useState(false);
	const [storeItems, setStoreItems] = useState<GiftItem[]>([]);
	const [loadingStoreItems, setLoadingStoreItems] = useState(false);
	const [storeError, setStoreError] = useState<string | null>(null);
	const displayWalletAddress = linkedWallet?.address || walletAddress;

	const isWalletConnected = Boolean(walletAddress);
	const isCorrectNetwork = useMemo(() => {
		if (!walletChainId) return true;
		return walletChainId.toLowerCase() === REQUIRED_CHAIN_ID;
	}, [walletChainId]);

	const metamaskInstalled = isMetaMaskInstalled();
	const rewardTokenConfigured = isRewardTokenConfigured();
	const canSubmitDeposit = isWalletConnected && isCorrectNetwork && rewardTokenConfigured && isDepositAddressConfigured;
	const depositHelperMessage = !metamaskInstalled
		? 'Bạn cần cài đặt MetaMask để nạp token.'
		: !isWalletConnected
			? 'Hãy kết nối ví MetaMask trước khi thực hiện giao dịch nạp.'
			: !isCorrectNetwork
				? `Chuyển MetaMask sang mạng ${NETWORK_NAME} để tiếp tục.`
				: !rewardTokenConfigured
					? 'Hệ thống chưa cấu hình hợp đồng phần thưởng.'
					: 'Sau khi giao dịch được xác nhận, số dư nội bộ sẽ tự động cộng vào tài khoản của bạn.';
	const depositAddressDisplay = isDepositAddressConfigured ? DEPOSIT_ADDRESS : 'Chưa cấu hình';
	const formattedOnchainBalance = useMemo(() => {
		const numeric = Number(onchainBalance);
		if (Number.isNaN(numeric)) {
			return '0';
		}
		return numeric.toLocaleString(undefined, { maximumFractionDigits: 6 });
	}, [onchainBalance]);
	const formattedEthBalance = useMemo(() => {
		const numeric = Number(ethBalance);
		if (Number.isNaN(numeric)) {
			return '0';
		}
		return numeric.toLocaleString(undefined, { maximumFractionDigits: 6 });
	}, [ethBalance]);
	const formattedDepositFee = useMemo(() => {
		if (!depositGasEstimate) return null;
		const numeric = Number(depositGasEstimate.feeEth);
		if (Number.isNaN(numeric)) {
			return depositGasEstimate.feeEth;
		}
		if (numeric === 0) {
			return '≈0';
		}
		if (numeric < 0.000001) {
			return numeric.toExponential(2);
		}
		return numeric.toFixed(6);
	}, [depositGasEstimate]);

	useEffect(() => {
		const loadStorePreview = async () => {
			setLoadingStoreItems(true);
			setStoreError(null);
			try {
				const items = await getGifts();
				setStoreItems(items.slice(0, 4));
			} catch (storeLoadError: any) {
				console.error('Failed to load store items:', storeLoadError);
				setStoreError(storeLoadError?.message || 'Không thể tải danh sách quà tặng');
			} finally {
				setLoadingStoreItems(false);
			}
		};

		void loadStorePreview();
	}, []);

	useEffect(() => {
		if (!user) return;

		const fetchLinkedWallet = async () => {
			setLoadingWalletLink(true);
			try {
				const result = await getLinkedWallet();
				if (result) {
					setLinkedWallet(result);
					setWalletAddress(result.address);
					setWithdrawAddress(result.address);
				}
			} catch (walletError: any) {
				console.error('Failed to fetch linked wallet:', walletError);
				if (walletError?.message && !walletError.message.includes('404') && !walletError.message.includes('No wallet linked')) {
					console.warn('Wallet API error (non-critical):', walletError.message);
				}
			} finally {
				setLoadingWalletLink(false);
			}
		};

		void fetchLinkedWallet();
	}, [user?.id]);

	useEffect(() => {
		const loadWalletState = async () => {
			try {
				const [address] = await Promise.all([getCurrentWallet()]);
				if (address) {
					setWalletAddress(address);
					setWithdrawAddress(address);
					if (linkedWallet === null && user) {
						await persistWalletLink(address, { silent: true });
					}
				} else if (metamaskInstalled && linkedWallet) {
					console.log('Đã có linked wallet, đang yêu cầu kết nối MetaMask...');
					try {
						const connectedAddress = await connectWallet();
						if (connectedAddress) {
							setWalletAddress(connectedAddress);
							setWithdrawAddress(connectedAddress);
						}
					} catch (autoConnectError) {
						console.log('User chưa cho phép kết nối tự động MetaMask');
					}
				}
			} catch (walletError) {
				console.error('Failed to load wallet state:', walletError);
			}

			if (metamaskInstalled) {
				try {
					const chainId = await (window as any).ethereum?.request?.({ method: 'eth_chainId' });
					if (chainId) {
						setWalletChainId(chainId);
					}
				} catch (chainError) {
					console.error('Failed to load chain id:', chainError);
				}
			}
		};

		loadWalletState();
	}, [metamaskInstalled, user, linkedWallet]);

	useEffect(() => {
		const updateOnchainBalance = async () => {
			if (!walletAddress || !isCorrectNetwork || !rewardTokenConfigured) {
				setOnchainBalance('0');
				setEthBalance('0');
				return;
			}

			try {
				const [balanceValue, nativeBalanceValue] = await Promise.all([
					getOnchainTokenBalance(walletAddress),
					getNativeBalance(walletAddress)
				]);
				setOnchainBalance(balanceValue);
				setEthBalance(nativeBalanceValue);
			} catch (balanceError: any) {
				console.error('Failed to fetch on-chain balance:', balanceError);
				if (balanceError?.code === 'BAD_DATA' || balanceError?.message?.includes('could not decode')) {
					console.warn('Smart contract chưa được deploy hoặc địa chỉ không đúng. On-chain balance sẽ hiển thị 0.');
				}
				setOnchainBalance('0');
				setEthBalance('0');
			}
		};

		void updateOnchainBalance();
	}, [walletAddress, walletChainId, isCorrectNetwork, rewardTokenConfigured]);

	const persistWalletLink = async (address: string, options?: { silent?: boolean }) => {
		if (!address || !user) return;

		try {
			setLoadingWalletLink(true);
			const response = await linkWalletAddress(address);
			setLinkedWallet(response);
			setWithdrawAddress(response.address);
			if (!options?.silent) {
				setToast({
					type: 'success',
					message: 'Đã lưu địa chỉ ví',
					detail: `Ví ${formatAddress(response.address)} đã được liên kết với tài khoản của bạn.`
				});
			}
		} catch (persistError: any) {
			console.error('Failed to link wallet address:', persistError);
			if (!options?.silent) {
				setToast({
					type: 'error',
					message: 'Không thể lưu địa chỉ ví',
					detail: persistError?.message || 'Vui lòng thử lại sau.'
				});
			}
		} finally {
			setLoadingWalletLink(false);
		}
	};

	useEffect(() => {
		if (!metamaskInstalled) return;

		const handleAccounts = (accounts: string[]) => {
			const nextAccount = accounts[0] ?? null;
			setWalletAddress(nextAccount);
			if (nextAccount) {
				setWithdrawAddress(nextAccount);
				void Promise.all([
					getOnchainTokenBalance(nextAccount),
					getNativeBalance(nextAccount)
				])
					.then(([tokenBalance, nativeBalance]) => {
						setOnchainBalance(tokenBalance);
						setEthBalance(nativeBalance);
					})
					.catch(() => {
						setOnchainBalance('0');
						setEthBalance('0');
					});
				void persistWalletLink(nextAccount, { silent: true });
			} else {
				setOnchainBalance('0');
				setEthBalance('0');
			}
		};

		const handleChain = (chainId: string) => {
			setWalletChainId(chainId);
		};

		onAccountsChanged(handleAccounts);
		onChainChanged(handleChain);

		return () => {
			removeAccountsListener(handleAccounts);
			removeChainListener(handleChain);
		};
	}, [metamaskInstalled]);

	useEffect(() => {
		let cancelled = false;

		const runEstimate = async () => {
			if (
				!isWalletConnected ||
				!isCorrectNetwork ||
				!rewardTokenConfigured ||
				!isDepositAddressConfigured
			) {
				setDepositGasEstimate(null);
				setDepositGasError(null);
				return;
			}

			const trimmedAmount = depositAmount.trim();
			const amountNumber = Number(trimmedAmount);
			if (!trimmedAmount || Number.isNaN(amountNumber) || amountNumber <= 0) {
				setDepositGasEstimate(null);
				setDepositGasError(null);
				return;
			}

			try {
				setEstimatingDepositGas(true);
				setDepositGasError(null);
				const estimate = await estimateTokenTransferCost(DEPOSIT_ADDRESS, trimmedAmount);
				if (cancelled) {
					return;
				}

				const feeEth = estimate.gasCostWei > 0n ? ethers.formatEther(estimate.gasCostWei) : '0';
				const gasPriceGwei = estimate.gasPriceWei ? ethers.formatUnits(estimate.gasPriceWei, 'gwei') : null;

				setDepositGasEstimate({
					feeEth,
					gasCostWei: estimate.gasCostWei,
					gasLimit: estimate.gasLimit.toString(),
					gasPriceGwei
				});
			} catch (estimateError: any) {
				if (cancelled) {
					return;
				}
				console.error('Failed to estimate token transfer cost:', estimateError);
				setDepositGasEstimate(null);
				setDepositGasError(
					estimateError?.message || 'Không thể ước tính phí gas. Vui lòng kiểm tra lại MetaMask.'
				);
			} finally {
				if (!cancelled) {
					setEstimatingDepositGas(false);
				}
			}
		};

		void runEstimate();

		return () => {
			cancelled = true;
		};
	}, [
		depositAmount,
		isWalletConnected,
		isCorrectNetwork,
		rewardTokenConfigured,
		isDepositAddressConfigured,
		walletAddress
	]);

	const handleConnectWallet = async () => {
		if (!metamaskInstalled) {
			setToast({
				type: 'error',
				message: 'MetaMask chưa được cài đặt',
				detail: 'Bạn cần cài đặt MetaMask để kết nối ví.'
			});
			return;
		}

		try {
			const address = await connectWallet();
			if (address) {
				setWalletAddress(address);
				setWithdrawAddress(address);
				const chainId = await (window as any).ethereum?.request?.({ method: 'eth_chainId' });
				if (chainId) {
					setWalletChainId(chainId);
				}
				setToast({
					type: 'success',
					message: 'Kết nối ví thành công',
					detail: `Ví ${formatAddress(address)} đã được kết nối.`
				});
				await persistWalletLink(address);
			}
		} catch (walletError: any) {
			setToast({
				type: 'error',
				message: walletError?.message || 'Không thể kết nối ví',
				detail: walletError?.code === 4001 ? 'Bạn đã từ chối yêu cầu kết nối.' : undefined
			});
		}
	};

	const handleCopy = async (value: string, label: string) => {
		try {
			await navigator.clipboard.writeText(value);
			setToast({
				type: 'success',
				message: `Đã sao chép ${label}`
			});
		} catch (copyError) {
			setToast({
				type: 'error',
				message: 'Không thể sao chép',
				detail: 'Vui lòng sao chép thủ công.'
			});
		}
	};

	const handleDepositSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setDepositNote(null);

		if (!isDepositAddressConfigured) {
			setDepositNote({
				type: 'error',
				message: 'Địa chỉ nạp chưa được cấu hình',
				detail: 'Vui lòng liên hệ quản trị viên để cấu hình địa chỉ nạp token.'
			});
			return;
		}

		if (!rewardTokenConfigured) {
			setDepositNote({
				type: 'error',
				message: 'Token contract chưa sẵn sàng',
				detail: 'Hệ thống chưa cấu hình hợp đồng phần thưởng. Vui lòng thử lại sau.'
			});
			return;
		}

		if (!metamaskInstalled) {
			setDepositNote({
				type: 'error',
				message: 'MetaMask chưa được cài đặt',
				detail: 'Bạn cần cài đặt MetaMask để thực hiện nạp token.'
			});
			return;
		}

		if (!isWalletConnected || !walletAddress) {
			setDepositNote({
				type: 'error',
				message: 'Ví MetaMask chưa được kết nối',
				detail: 'Vui lòng kết nối ví trước khi nạp token.'
			});
			await handleConnectWallet();
			return;
		}

		if (!isCorrectNetwork) {
			setDepositNote({
				type: 'error',
				message: 'Sai mạng blockchain',
				detail: `Vui lòng chuyển MetaMask sang mạng ${NETWORK_NAME} trước khi nạp token.`
			});
			return;
		}

		const amountValue = depositAmount.trim();
		const amountNumber = Number(amountValue);

		if (!amountValue || Number.isNaN(amountNumber) || amountNumber <= 0) {
			setDepositNote({
				type: 'error',
				message: 'Số lượng không hợp lệ',
				detail: 'Vui lòng nhập số lượng token muốn nạp lớn hơn 0.'
			});
			return;
		}

		let amountWei: bigint;
		let walletTokenBalanceWei: bigint;

		try {
			amountWei = ethers.parseEther(amountValue);
			walletTokenBalanceWei =
				onchainBalance && Number(onchainBalance) > 0 ? ethers.parseEther(onchainBalance) : 0n;
		} catch (parseError) {
			console.error('Failed to parse deposit amount', parseError);
			setDepositNote({
				type: 'error',
				message: 'Số lượng không hợp lệ',
				detail: 'Vui lòng nhập định dạng số thập phân hợp lệ cho số lượng token.'
			});
			return;
		}

		if (walletTokenBalanceWei < amountWei) {
			setDepositNote({
				type: 'error',
				message: 'Số dư on-chain không đủ',
				detail: `Ví hiện có ${formattedOnchainBalance} ${TOKEN_SYMBOL}.`
			});
			return;
		}

		if (depositGasEstimate?.gasCostWei && depositGasEstimate.gasCostWei > 0n) {
			try {
				const nativeBalanceWei = ethers.parseEther(ethBalance || '0');
				if (nativeBalanceWei < depositGasEstimate.gasCostWei) {
					const requiredFee =
						formattedDepositFee ?? depositGasEstimate.feeEth ?? '0';
					setDepositNote({
						type: 'error',
						message: `Không đủ ${WITHDRAW_GAS_TOKEN} để trả phí gas`,
						detail: `Cần khoảng ${requiredFee} ${WITHDRAW_GAS_TOKEN} trong ví để gửi giao dịch này.`
					});
					return;
				}
			} catch (nativeBalanceError) {
				console.error('Failed to parse native balance:', nativeBalanceError);
			}
		}

		setSubmittingDeposit(true);
		try {
			if (walletAddress) {
				await persistWalletLink(walletAddress, { silent: true });
			}

			const txHash = await transferTokens(DEPOSIT_ADDRESS, amountValue);

			setDepositNote({
				type: 'success',
				message: 'Nạp token thành công',
				detail: `Giao dịch đã được gửi thành công. Tx hash: ${txHash}. Số dư nội bộ sẽ được cộng khi giao dịch được xác nhận trên blockchain.`
			});
			setDepositAmount('');
			setToast({
				type: 'success',
				message: 'Nạp token thành công',
				detail: `Transaction hash: ${txHash}. Số dư sẽ được cập nhật sau khi giao dịch được xác nhận.`
			});

			window.setTimeout(() => {
				void refresh();
			}, 6000);
		} catch (depositError: any) {
			const detailMessage =
				depositError?.code === 4001 || depositError?.code === 'ACTION_REJECTED'
					? 'Bạn đã từ chối giao dịch trong MetaMask.'
					: depositError?.message || 'Không thể thực hiện giao dịch nạp token.';
			setDepositNote({
				type: 'error',
				message: 'Không thể nạp token',
				detail: detailMessage
			});
		} finally {
			setSubmittingDeposit(false);
		}
	};

	const handleWithdrawSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setWithdrawNote(null);

		const amountNumber = Number(withdrawAmount);
		if (!amountNumber || Number.isNaN(amountNumber) || amountNumber <= 0) {
			setWithdrawNote({
				type: 'error',
				message: 'Số lượng không hợp lệ',
				detail: 'Vui lòng nhập số lượng token muốn rút.'
			});
			return;
		}

		if (amountNumber < MIN_WITHDRAW_AMOUNT) {
			setWithdrawNote({
				type: 'error',
				message: `Rút tối thiểu ${MIN_WITHDRAW_AMOUNT} ${TOKEN_SYMBOL}`,
				detail: 'Hãy tăng số lượng token để tránh giao dịch nhỏ lẻ.'
			});
			return;
		}

		if (amountNumber > balance) {
			setWithdrawNote({
				type: 'error',
				message: 'Số dư nội bộ không đủ',
				detail: `Bạn chỉ có thể rút tối đa ${balance.toLocaleString()} ${TOKEN_SYMBOL}.`
			});
			return;
		}

		if (!withdrawAddress || !/^0x[a-fA-F0-9]{40}$/.test(withdrawAddress)) {
			setWithdrawNote({
				type: 'error',
				message: 'Địa chỉ ví không hợp lệ',
				detail: 'Địa chỉ ví cần bắt đầu bằng 0x và có 42 ký tự.'
			});
			return;
		}

		setSubmittingWithdraw(true);
		try {
			const response = await handleWithdraw(amountNumber, withdrawAddress);
			if (response.success) {
				setWithdrawNote({
					type: 'success',
					message: 'Yêu cầu rút token đã được ghi nhận',
					detail: response.message
				});
				setWithdrawAmount('');
				const txHash = (response as any).transactionHash || (response as any).txHash;
				if (txHash) {
					setToast({
						type: 'success',
						message: 'Rút token thành công',
						detail: `Tx hash: ${txHash}`
					});
				} else {
					setToast({
						type: 'success',
						message: 'Rút token thành công',
						detail: response.message || ''
					});
				}
				window.setTimeout(() => {
					void refresh();
				}, 1500);
			} else {
				setWithdrawNote({
					type: 'error',
					message: 'Không thể rút token',
					detail: response.message
				});
			}
		} catch (withdrawError: any) {
			setWithdrawNote({
				type: 'error',
				message: 'Có lỗi xảy ra',
				detail: withdrawError?.message || 'Không thể gửi yêu cầu rút token.'
			});
		} finally {
			setSubmittingWithdraw(false);
		}
	};

	useEffect(() => {
		if (!toast) return;
		const timeout = window.setTimeout(() => setToast(null), 4000);
		return () => window.clearTimeout(timeout);
	}, [toast]);

	const renderToast = () => {
		if (!toast) return null;
		const toastClass =
			toast.type === 'success'
				? styles.toastSuccess
				: toast.type === 'error'
					? styles.toastError
					: styles.toastInfo;
		return (
			<div className={`${styles.toast} ${toastClass}`}>
				<div className={styles.toastMessage}>{toast.message}</div>
				{toast.detail && <div className={styles.toastDetail}>{toast.detail}</div>}
			</div>
		);
	};

	const renderDepositNote = () => {
		if (!depositNote) return null;
		const noteClass =
			depositNote.type === 'success'
				? styles.noteSuccess
				: depositNote.type === 'error'
					? styles.noteError
					: styles.noteInfo;
		return (
			<div className={`${styles.note} ${noteClass}`}>
				<div className={styles.noteMessage}>{depositNote.message}</div>
				{depositNote.detail && <div className={styles.noteDetail}>{depositNote.detail}</div>}
			</div>
		);
	};

	const renderWithdrawNote = () => {
		if (!withdrawNote) return null;
		const noteClass =
			withdrawNote.type === 'success'
				? styles.noteSuccess
				: withdrawNote.type === 'error'
					? styles.noteError
					: styles.noteInfo;
		return (
			<div className={`${styles.note} ${styles.withdrawNote} ${noteClass}`}>
				<div className={styles.noteMessage}>{withdrawNote.message}</div>
				{withdrawNote.detail && <div className={styles.noteDetail}>{withdrawNote.detail}</div>}
			</div>
		);
	};

	return (
		<div className={styles.page}>
			{/* Header */}
			<div className={styles.header}>
				<div className={styles.headerContent}>
					<h1 className={styles.headerTitle}>
						<Gift size={36} className={styles.headerTitleIcon} />
						Token Hub
					</h1>
					<p className={styles.headerSubtitle}>
						Quản lý số dư off-chain, kết nối ví MetaMask và rút token về blockchain an toàn.
					</p>
				</div>
				<div className={styles.headerActions}>
					<div className={styles.balanceBadge}>
						<Coins size={18} className={styles.balanceBadgeIcon} />
						Số dư nội bộ:
						<span className={styles.balanceBadgeValue}>
							{balance.toLocaleString()} {TOKEN_SYMBOL}
						</span>
					</div>
					<button
						onClick={handleConnectWallet}
						disabled={loadingWalletLink}
						className={`${styles.connectButton} ${
							isWalletConnected ? styles.connectButtonConnected : styles.connectButtonNotConnected
						}`}
					>
						{isWalletConnected ? <Wallet size={18} /> : <Plug size={18} />}
						{loadingWalletLink
							? 'Đang lưu...'
							: isWalletConnected
								? formatAddress(walletAddress ?? '')
								: 'Kết nối MetaMask'}
					</button>
				</div>
			</div>

			{/* Network warning */}
			<div className={styles.networkCardsGrid}>
				<div className={styles.networkCard}>
					<div className={styles.networkCardHeader}>
						<Shield size={20} className={styles.networkCardIcon} />
						<div className={styles.networkCardTitle}>Thông tin mạng hỗ trợ</div>
					</div>
					<div className={styles.networkCardContent}>
						Chỉ sử dụng mạng <strong>{NETWORK_NAME}</strong> cho mọi giao dịch nạp/rút. Gửi token sai mạng có thể gây mất tài sản vĩnh viễn.
					</div>
					<button
						onClick={() => handleCopy(ESCROW_CONTRACT_ADDRESS, 'địa chỉ hợp đồng escrow')}
						className={styles.networkCardButton}
					>
						<span>Escrow contract: {formatAddress(ESCROW_CONTRACT_ADDRESS)}</span>
						<Copy size={16} />
					</button>
					{isWalletConnected && !isCorrectNetwork && (
						<div className={styles.networkWarning}>
							<AlertTriangle size={16} className={styles.networkWarningIcon} />
							<div>
								<div style={{ fontWeight: 600 }}>Sai mạng kết nối</div>
								<div>Vui lòng chuyển MetaMask sang mạng {NETWORK_NAME} trước khi thực hiện giao dịch.</div>
							</div>
						</div>
					)}
				</div>

				<div className={styles.networkCard}>
					<div className={styles.networkCardHeader}>
						<Wallet size={20} className={styles.networkCardIcon} />
						<div className={styles.networkCardTitle}>Trạng thái ví MetaMask</div>
					</div>
					<div className={styles.networkInfoGrid}>
						<div className={styles.networkInfoItem}>
							<span className={styles.networkInfoLabel}>Ví liên kết:</span>{' '}
							{displayWalletAddress ? formatAddress(displayWalletAddress) : 'Chưa kết nối'}
						</div>
						<div className={styles.networkInfoItem}>
							<span className={styles.networkInfoLabel}>Số dư on-chain:</span>{' '}
							{isCorrectNetwork ? `${formattedOnchainBalance} ${TOKEN_SYMBOL}` : '--'}
						</div>
						<div className={styles.networkInfoItem}>
							<span className={styles.networkInfoLabel}>
								{WITHDRAW_GAS_TOKEN} để trả gas:
							</span>{' '}
							{isCorrectNetwork ? `${formattedEthBalance} ${WITHDRAW_GAS_TOKEN}` : '--'}
						</div>
						<div className={styles.networkInfoItem}>
							<span className={styles.networkInfoLabel}>Phí gas ước tính:</span>{' '}
							{estimatingDepositGas
								? 'Đang ước tính...'
								: depositGasEstimate && formattedDepositFee
									? `~${formattedDepositFee} ${WITHDRAW_GAS_TOKEN}`
									: depositGasError
										? 'Không thể ước tính'
										: '--'}
						</div>
					</div>
					<button
						onClick={refresh}
						className={styles.refreshButton}
					>
						<Zap size={16} />
						Làm mới dữ liệu
					</button>
				</div>
			</div>

			{/* Deposit & Withdraw */}
			<div className={styles.depositWithdrawGrid}>
				{/* Deposit Card */}
				<div className={`${styles.card} ${styles.depositCard}`}>
					<div className={styles.depositCardBackground} />
					<div className={styles.depositCardContent}>
						<div className={styles.cardHeader}>
							<h2 className={styles.cardTitle}>
								<ShoppingBag size={22} className={styles.cardTitleIcon} />
								Nạp token vào quỹ
							</h2>
						</div>
						<p className={styles.cardDescription}>
							Gửi {TOKEN_SYMBOL} từ ví cá nhân vào địa chỉ nạp dưới đây. Chỉ dùng mạng {NETWORK_NAME}.
						</p>
						<form onSubmit={handleDepositSubmit} className={styles.form}>
							<div className={styles.formGroup}>
								<label className={styles.formLabel}>Số lượng token muốn nạp</label>
								<input
									type="number"
									min="0"
									step="0.0001"
									inputMode="decimal"
									autoComplete="off"
									value={depositAmount}
									onChange={(event) => setDepositAmount(event.target.value)}
									disabled={submittingDeposit || !rewardTokenConfigured || !isDepositAddressConfigured}
									placeholder="Ví dụ: 50"
									className={styles.formInput}
								/>
							</div>
							<div className={styles.formActions}>
								<button
									type="submit"
									disabled={!canSubmitDeposit || submittingDeposit}
									className={`${styles.formButton} ${
										!canSubmitDeposit ? styles.formButtonDisabled : styles.formButtonPrimary
									}`}
								>
									{submittingDeposit ? 'Đang gửi giao dịch...' : 'Nạp token'}
								</button>
								{!isWalletConnected && (
									<button
										type="button"
										onClick={handleConnectWallet}
										className={`${styles.formButton} ${styles.formButtonSecondary}`}
									>
										Kết nối MetaMask
									</button>
								)}
							</div>
							<div className={styles.formHelper}>
								<span>{depositHelperMessage}</span>
								{estimatingDepositGas && <span>Đang ước tính phí gas...</span>}
								{!estimatingDepositGas && depositGasEstimate && formattedDepositFee && (
									<span>
										Phí gas ước tính cho giao dịch này: ~{formattedDepositFee} {WITHDRAW_GAS_TOKEN} (gas limit ≈{' '}
										{depositGasEstimate.gasLimit})
									</span>
								)}
								{!estimatingDepositGas && depositGasError && (
									<span className={styles.formHelperError}>{depositGasError}</span>
								)}
							</div>
						</form>
						{renderDepositNote()}
					</div>
					<div className={styles.depositWarning}>
						<AlertTriangle size={18} className={styles.depositWarningIcon} />
						<div className={styles.depositWarningText}>
							Chỉ nạp {TOKEN_SYMBOL} trên mạng {NETWORK_NAME}. Gửi token trên bất kỳ mạng nào khác có thể dẫn đến mất tài sản vĩnh viễn.
						</div>
					</div>
					<div className={styles.depositAddressContainer}>
						<div>
							<div className={styles.depositAddressLabel}>Deposit Address</div>
							<div className={styles.depositAddressValue}>{depositAddressDisplay}</div>
						</div>
						<button
							type="button"
							onClick={() => {
								if (isDepositAddressConfigured) {
									void handleCopy(DEPOSIT_ADDRESS, 'địa chỉ nạp token');
								}
							}}
							disabled={!isDepositAddressConfigured}
							className={styles.depositAddressCopyButton}
						>
							<Copy size={16} />
						</button>
					</div>
					<div className={styles.depositQRContainer}>
						<div className={styles.depositQRImage}>
							<img
								src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(DEPOSIT_ADDRESS)}`}
								alt="Deposit QR"
							/>
						</div>
						<div className={styles.depositInstructions}>
							<div className={styles.depositInstructionsTitle}>Hướng dẫn nạp</div>
							<ol className={styles.depositInstructionsList}>
								<li className={styles.depositInstructionsListItem}>Mở MetaMask hoặc ví non-custodial của bạn.</li>
								<li className={styles.depositInstructionsListItem}>Chọn mạng {NETWORK_NAME} và token {TOKEN_SYMBOL}.</li>
								<li className={styles.depositInstructionsListItem}>Quét QR hoặc dán địa chỉ trên, nhập số lượng và gửi.</li>
								<li className={styles.depositInstructionsListItem}>Chờ 1-2 phút, số dư nội bộ sẽ được cộng khi giao dịch xác nhận.</li>
							</ol>
						</div>
					</div>
					<div className={styles.depositFooter}>
						Lịch sử nạp sẽ tự động đồng bộ từ blockchain khi listener phát hiện giao dịch thành công.
					</div>
				</div>

				{/* Withdraw Card */}
				<div className={styles.card}>
					<div>
						<h2 className={styles.cardTitle}>
							<Wallet size={22} className={styles.cardTitleIcon} />
							Rút token ra ví on-chain
						</h2>
						<p className={styles.cardDescription}>
							Claim token từ quỹ escrow về ví của bạn. Yêu cầu phải trả phí gas bằng {WITHDRAW_GAS_TOKEN}.
						</p>
					</div>
					<div className={styles.withdrawStatsGrid}>
						<div className={styles.withdrawStatCard}>
							<div className={styles.withdrawStatLabel}>Số dư nội bộ (có thể rút)</div>
							<div className={styles.withdrawStatValue}>
								{balance.toLocaleString()} {TOKEN_SYMBOL}
							</div>
						</div>
						<div className={styles.withdrawStatCard}>
							<div className={styles.withdrawStatLabel}>Số dư trên ví MetaMask</div>
							<div className={styles.withdrawStatValue}>
								{isCorrectNetwork ? `${Number(onchainBalance).toLocaleString()} ${TOKEN_SYMBOL}` : '--'}
							</div>
						</div>
					</div>
					<form onSubmit={handleWithdrawSubmit} className={styles.withdrawForm}>
						<div className={styles.formGroup}>
							<label className={styles.formLabel}>Số lượng token</label>
							<input
								type="number"
								min={MIN_WITHDRAW_AMOUNT}
								step="1"
								value={withdrawAmount}
								onChange={(event) => setWithdrawAmount(event.target.value)}
								placeholder={`Nhập từ ${MIN_WITHDRAW_AMOUNT} ${TOKEN_SYMBOL}`}
								className={styles.formInput}
							/>
						</div>
						<div className={styles.formGroup}>
							<label className={styles.formLabel}>Địa chỉ ví nhận</label>
							<input
								type="text"
								value={withdrawAddress}
								onChange={(event) => setWithdrawAddress(event.target.value)}
								placeholder="0x..."
								className={`${styles.formInput} ${styles.formInputMonospace}`}
							/>
							<div className={styles.withdrawWarning}>
								<AlertCircle size={14} className={styles.withdrawWarningIcon} />
								Giao dịch blockchain không thể hoàn tác. Kiểm tra kỹ địa chỉ trước khi xác nhận.
							</div>
						</div>
						<button
							type="submit"
							disabled={submittingWithdraw || !isWalletConnected || !isCorrectNetwork}
							className={styles.withdrawFormButton}
						>
							{submittingWithdraw ? (
								<>
									<span className={styles.loadingSpinner} />
									Đang xử lý...
								</>
							) : (
								'Gửi yêu cầu rút'
							)}
						</button>
						<div className={styles.withdrawFormHelper}>
							<div className={styles.withdrawFormHelperItem}>- Rút tối thiểu: {MIN_WITHDRAW_AMOUNT} {TOKEN_SYMBOL}</div>
							<div className={styles.withdrawFormHelperItem}>- Cần ~0.002 {WITHDRAW_GAS_TOKEN} để trả phí mạng (ước lượng).</div>
							<div className={styles.withdrawFormHelperItem}>- Backend sẽ ký thông điệp off-chain, bạn xác nhận giao dịch trên MetaMask.</div>
						</div>
						{renderWithdrawNote()}
					</form>
				</div>
			</div>

			{/* Reward Spending Section */}
			<div className={`${styles.card} ${styles.storeSection}`}>
				<div className={styles.storeHeader}>
					<div className={styles.storeHeaderContent}>
						<h2 className={styles.storeTitle}>
							<ShoppingBag size={22} className={styles.storeTitleIcon} />
							Đổi quà bằng token
						</h2>
						<p className={styles.storeDescription}>
							Giao dịch đổi quà diễn ra 100% off-chain để đảm bảo tốc độ và trải nghiệm tốt nhất.
						</p>
					</div>
					<div className={styles.storeTabs}>
						<button
							onClick={() => setActiveStoreTab('store')}
							className={`${styles.storeTab} ${
								activeStoreTab === 'store' ? styles.storeTabActive : styles.storeTabInactive
							}`}
						>
							Cửa hàng
						</button>
						<button
							onClick={() => setActiveStoreTab('history')}
							className={`${styles.storeTab} ${
								activeStoreTab === 'history' ? styles.storeTabActive : styles.storeTabInactive
							}`}
						>
							Lịch sử đổi quà
						</button>
					</div>
				</div>
				{activeStoreTab === 'store' ? (
					<div className={styles.storeItemsGrid}>
						{loadingStoreItems ? (
							<div className={styles.storeLoadingState}>
								Đang tải danh sách quà tặng...
							</div>
						) : storeError ? (
							<div className={styles.storeErrorState}>
								{storeError}
							</div>
						) : storeItems.length === 0 ? (
							<div className={styles.storeEmptyState}>
								Chưa có phần thưởng nào sẵn sàng. Quay lại sau nhé!
							</div>
						) : (
							storeItems.map((item) => (
								<div key={item.id} className={styles.storeItem}>
									<div className={styles.storeItemImage}>
										{item.imageUrl ? (
											<img src={item.imageUrl} alt={item.name} />
										) : (
											<Gift size={36} style={{ color: 'var(--muted-foreground)' }} />
										)}
									</div>
									<div className={styles.storeItemContent}>
										<div className={styles.storeItemName}>{item.name}</div>
										<div className={styles.storeItemDescription}>{item.description}</div>
									</div>
									<div className={styles.storeItemFooter}>
										<div className={styles.storeItemPrice}>
											{(item.tokenPrice ?? 0).toLocaleString()} {TOKEN_SYMBOL}
										</div>
										<div className={styles.storeItemStock}>Còn {item.stockQuantity ?? 0}</div>
									</div>
									<button
										onClick={() => navigate('/user/rewards/store')}
										className={styles.storeItemButton}
									>
										Đi tới đổi quà
										<ExternalLink size={14} />
									</button>
								</div>
							))
						)}
					</div>
				) : (
					<div className={styles.storeHistoryEmpty}>
						<Clock size={32} className={styles.storeHistoryEmptyIcon} />
						<div className={styles.storeHistoryEmptyTitle}>Lịch sử đổi quà</div>
						<div className={styles.storeHistoryEmptyText}>
							Các giao dịch đổi quà sẽ xuất hiện tại đây ngay sau khi backend hoàn tất xử lý phiếu quà tặng.
						</div>
						<button
							onClick={() => navigate('/user/rewards/store')}
							className={styles.storeHistoryEmptyButton}
						>
							Quản lý đơn đổi quà
							<ArrowRightIcon />
						</button>
					</div>
				)}
			</div>

			{/* Token history */}
			<div className={`${styles.card} ${styles.historySection}`}>
				<div className={styles.historyHeader}>
					<div className={styles.historyHeaderContent}>
						<h2 className={styles.historyTitle}>
							<Clock size={22} className={styles.historyTitleIcon} />
							Lịch sử giao dịch token
						</h2>
						<p className={styles.historyDescription}>
							Thống kê đầy đủ các lần thưởng, rút và tiêu dùng token trong hệ thống.
						</p>
					</div>
					<div className={styles.historyBadge}>
						{totalItems} giao dịch
					</div>
				</div>
				<TokenHistoryTable
					history={history}
					loading={loading}
					currentPage={currentPage}
					totalPages={totalPages}
					totalItems={totalItems}
					onPageChange={goToPage}
					onPrevious={previousPage}
					onNext={nextPage}
				/>
				{error && (
					<div className={styles.historyError}>
						<AlertTriangle size={16} className={styles.historyErrorIcon} />
						{error}
					</div>
				)}
			</div>

			{renderToast()}
		</div>
	);
}

function ArrowRightIcon(): JSX.Element {
	return (
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M5 12h14" />
			<path d="M13 5l7 7-7 7" />
		</svg>
	);
}
