import React, { useState, useEffect, useCallback } from 'react';
import Tabs from '@/shared/ui/molecules/Tabs';
import LeaderboardTable from '@/shared/ui/sections/LeaderboardTable';
import LeaderboardFilters from '@/shared/ui/sections/LeaderboardFilters';
import {
  LeaderboardEntry,
  LeaderboardFilters as LeaderboardFiltersType,
  PaginationInfo,
  TabOption,
  SortConfig,
  CountryInfo,
} from '@/foundation/types/leaderboard';
import styles from './LeaderboardPage.module.css';
import { Users, Trophy, TrendingUp } from 'lucide-react';
import { fetchLeaderboard } from '@/features/rewards/api';

const countries: CountryInfo[] = [
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'UNKNOWN', name: 'Unknown', flag: '🌐' },
];

const mockTabs: TabOption[] = [
  { id: 'algorithms', label: 'Algorithms', isActive: false },
  { id: 'contests', label: 'Contests', isActive: false, disabled: true },
];

export default function LeaderboardPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<string>('algorithms');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 20,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState<LeaderboardFiltersType>({
    hackers: 'all',
    filterBy: null,
    country: undefined,
    company: undefined,
    school: undefined,
    hackerName: undefined,
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: 'score',
    direction: 'desc',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    if (activeTab !== 'algorithms') return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchLeaderboard({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        sortBy: sortConfig.column === 'score' ? 'score'
          : sortConfig.column === 'totalEarned' ? 'totalEarned'
          : 'totalSpent',
        sortOrder: sortConfig.direction,
        country: filters.country,
        hackerName: filters.hackerName,
      });

      setEntries(data.entries);
      setPagination(data.pagination);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load leaderboard data';
      setError(message);
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, pagination.currentPage, pagination.itemsPerPage, sortConfig, filters.country, filters.hackerName]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleFiltersChange = (newFilters: Partial<LeaderboardFiltersType>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    // Reset to page 1 when filters change so new results are visible
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    console.log('Filters changed:', updatedFilters);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage,
      currentPage: 1,
    }));
  };

  const handleSort = (column: string) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const tabs: TabOption[] = mockTabs.map(tab => ({
    ...tab,
    isActive: tab.id === activeTab,
    disabled: tab.id === 'contests',
  }));

  const showAlgorithmScores = activeTab === 'algorithms';
  const showContestScores = activeTab === 'contests';

  return (
    <div className={styles.leaderboardPage}>
      <div className={styles.container}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            <Trophy className={styles.pageTitleIcon} />
            Bang Xep Hang
          </h1>
          <p className={styles.pageDescription}>
            Canh tranh voi nhung lap trinh vien xuat sac nhat tu khap noi tren the gioi
          </p>
        </div>

        {/* Stats Banner */}
        <div className={styles.statsBanner}>
          <div className={styles.statItem}>
            <Users className={styles.statIcon} />
            <span className={styles.statValue}>{pagination.totalItems}</span>
            <span className={styles.statLabel}>Nguoi tham gia</span>
          </div>
          <div className={styles.statItem}>
            <Trophy className={styles.statIcon} />
            <span className={styles.statValue}>{mockTabs.length}</span>
            <span className={styles.statLabel}>Cuoc thi</span>
          </div>
          <div className={styles.statItem}>
            <TrendingUp className={styles.statIcon} />
            <span className={styles.statValue}>{loading ? '...' : 'Live'}</span>
            <span className={styles.statLabel}>Trang thai</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} onTabChange={handleTabChange} />

        {/* Error State */}
        {error && (
          <div className={styles.errorBanner}>
            <p>{error}</p>
            <button onClick={loadLeaderboard} className={styles.retryButton}>
              Thu lai
            </button>
          </div>
        )}

        {/* Main Content Grid */}
        <div className={styles.contentGrid}>
          {/* Leaderboard Table */}
          <div className={styles.tableContainer}>
            <LeaderboardTable
              entries={entries}
              pagination={pagination}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              showAlgorithmScores={showAlgorithmScores}
              showContestScores={showContestScores}
              sortBy={sortConfig.column as any}
              sortOrder={sortConfig.direction}
              onSort={handleSort}
            />
          </div>

          {/* Filters Sidebar */}
          <LeaderboardFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            countries={countries}
          />
        </div>
      </div>
    </div>
  );
}
