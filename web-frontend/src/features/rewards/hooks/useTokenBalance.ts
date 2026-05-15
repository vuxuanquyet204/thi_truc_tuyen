import { useState, useEffect, useCallback } from 'react';
import { getBalance, getHistory, withdrawTokens, type HistoryResponse, type WithdrawTokenRequest } from '@/features/rewards/api';
import { useAppSelector } from '@/foundation/store/hooks';

interface TokenHistoryItem {
  id: number | string;
  studentId: number;
  amount: number;
  type: 'grant' | 'spend' | 'withdraw';
  reasonCode?: string;
  relatedId?: number | string;
  createdAt: string;
  transaction_type: 'EARN' | 'SPEND';
}

export function useTokenBalance() {
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.id;

  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<TokenHistoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const itemsPerPage = 10;

  const fetchBalance = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getBalance(userId);
      setBalance(response.balance || 0);
    } catch (err: any) {
      console.error('Error fetching balance:', err);
      setError(err.message || 'Không thể tải số dư token');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (page: number = 1) => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response: HistoryResponse = await getHistory(userId, page, itemsPerPage);

      const dataArray = (response as any).rewards || response.transactions || [];
      const mappedHistory: TokenHistoryItem[] = dataArray.map((item: any): TokenHistoryItem => {
        const transactionType = item.transaction_type || 'EARN';
        let type: 'grant' | 'spend' | 'withdraw' = 'grant';

        if (transactionType === 'SPEND') {
          type = item.reasonCode === 'WITHDRAW' ? 'withdraw' : 'spend';
        }

        return {
          id: item.id,
          studentId: item.studentId || userId,
          amount: item.tokensAwarded || item.amount || 0,
          type,
          reasonCode: item.reasonCode,
          relatedId: item.relatedId,
          createdAt: item.awardedAt || item.createdAt,
          transaction_type: transactionType
        };
      });

      setHistory(mappedHistory);

      const totalItemsCount = (response as any).totalItems || response.total || mappedHistory.length;
      const currentPageNum = (response as any).currentPage || response.page || page;
      const totalPagesNum = (response as any).totalPages || Math.ceil(totalItemsCount / itemsPerPage);

      setCurrentPage(currentPageNum);
      setTotalPages(totalPagesNum);
      setTotalItems(totalItemsCount);
    } catch (err: any) {
      console.error('Error fetching history:', err);
      setError(err.message || 'Không thể tải lịch sử giao dịch');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (amount: number, toAddress: string): Promise<{ success: boolean; message: string; txHash?: string }> => {
    if (!userId) {
      return { success: false, message: 'Vui lòng đăng nhập' };
    }

    if (amount <= 0) {
      return { success: false, message: 'Số lượng token phải lớn hơn 0' };
    }

    if (amount > balance) {
      return { success: false, message: 'Số dư không đủ' };
    }

    if (!toAddress || !toAddress.startsWith('0x')) {
      return { success: false, message: 'Địa chỉ ví không hợp lệ' };
    }

    setWithdrawing(true);
    setError(null);

    try {
      const request: WithdrawTokenRequest = {
        studentId: userId,
        amount,
        toAddress
      };

      const response = await withdrawTokens(request);

      await Promise.all([
        fetchBalance(),
        fetchHistory(currentPage)
      ]);

      return {
        success: true,
        message: response.message || 'Rút token thành công',
        txHash: response.transactionHash
      };
    } catch (err: any) {
      console.error('Error withdrawing tokens:', err);
      const errorMessage = err.message || 'Không thể rút token';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setWithdrawing(false);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchHistory(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const refresh = async () => {
    await Promise.all([
      fetchBalance(),
      fetchHistory(currentPage)
    ]);
  };

  useEffect(() => {
    if (userId) {
      fetchBalance();
      fetchHistory(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    balance,
    history,
    currentPage,
    totalPages,
    totalItems,
    loading,
    error,
    withdrawing,
    fetchBalance,
    fetchHistory,
    handleWithdraw,
    goToPage,
    nextPage,
    previousPage,
    refresh
  };
}
