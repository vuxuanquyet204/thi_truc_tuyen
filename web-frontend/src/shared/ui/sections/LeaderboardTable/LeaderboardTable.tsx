import React from 'react';
import LeaderboardRow from '../../molecules/LeaderboardRow';
import Pagination from '../../molecules/Pagination';
import { LeaderboardTableProps } from '../../../../foundation/types/leaderboard';
import { ChevronUp, ChevronDown } from 'lucide-react';
import styles from './LeaderboardTable.module.css';

export default function LeaderboardTable({
  entries,
  pagination,
  onPageChange,
  onItemsPerPageChange,
  showAlgorithmScores = true,
  showContestScores = false,
  sortBy,
  sortOrder = 'desc',
  onSort
}: LeaderboardTableProps): JSX.Element {

  const handleSort = (column: string) => {
    if (onSort) {
      onSort(column);
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ChevronUp style={{ width: '14px', height: '14px', opacity: 0.3 }} />;
    }
    return sortOrder === 'asc' 
      ? <ChevronUp style={{ width: '14px', height: '14px' }} />
      : <ChevronDown style={{ width: '14px', height: '14px' }} />;
  };

  const getSortButtonStyle = (column: string, align: 'left' | 'center' | 'right') => {
    const baseStyle = {
      background: 'transparent',
      border: 'none',
      color: 'var(--foreground)',
      fontSize: '12px',
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      cursor: 'pointer',
      transition: 'all var(--transition-normal)',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '12px 8px',
      textAlign: align as any
    };

    if (sortBy === column) {
      return {
        ...baseStyle,
        color: 'var(--primary)'
      };
    }

    return baseStyle;
  };

  return (
    <div className={styles.tableWrapper}>
      {/* Table */}
      <div className={styles.tableScrollContainer}>
        <table className={styles.table}>
          {/* Table Header */}
          <thead>
            <tr style={{
              borderBottom: '2px solid var(--border)',
              background: 'linear-gradient(135deg, var(--muted) 0%, var(--background) 100%)',
              position: 'relative'
            }}>
              {/* HACKER Column */}
              <th style={{
                padding: '18px 12px',
                textAlign: 'left',
                minWidth: '250px',
                position: 'relative'
              }}>
                <button
                  onClick={() => handleSort('hacker')}
                  style={getSortButtonStyle('hacker', 'left')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(var(--primary-rgb), 0.1)';
                    e.currentTarget.style.borderRadius = 'var(--radius-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  HACKER
                  {getSortIcon('hacker')}
                </button>
              </th>

              {/* Algorithm Score Columns */}
              {showAlgorithmScores && (
                <>
                  <th style={{
                    padding: '16px 8px',
                    textAlign: 'center',
                    minWidth: '80px'
                  }}>
                    <button
                      onClick={() => handleSort('o1')}
                      style={getSortButtonStyle('o1', 'center')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--background)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      O(1)
                      {getSortIcon('o1')}
                    </button>
                  </th>
                  <th style={{
                    padding: '16px 8px',
                    textAlign: 'center',
                    minWidth: '80px'
                  }}>
                    <button
                      onClick={() => handleSort('ologN')}
                      style={getSortButtonStyle('ologN', 'center')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--background)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      O(logN)
                      {getSortIcon('ologN')}
                    </button>
                  </th>
                  <th style={{
                    padding: '16px 8px',
                    textAlign: 'center',
                    minWidth: '80px'
                  }}>
                    <button
                      onClick={() => handleSort('oN')}
                      style={getSortButtonStyle('oN', 'center')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--background)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      O(N)
                      {getSortIcon('oN')}
                    </button>
                  </th>
                  <th style={{
                    padding: '16px 8px',
                    textAlign: 'center',
                    minWidth: '80px'
                  }}>
                    <button
                      onClick={() => handleSort('oN2')}
                      style={getSortButtonStyle('oN2', 'center')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--background)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      O(N²)
                      {getSortIcon('oN2')}
                    </button>
                  </th>
                  <th style={{
                    padding: '16px 8px',
                    textAlign: 'center',
                    minWidth: '80px'
                  }}>
                    <button
                      onClick={() => handleSort('o2N')}
                      style={getSortButtonStyle('o2N', 'center')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--background)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      O(2^N)
                      {getSortIcon('o2N')}
                    </button>
                  </th>
                </>
              )}

              {/* Contest Score Columns */}
              {showContestScores && (
                <>
                  <th style={{
                    padding: '16px 8px',
                    textAlign: 'center',
                    minWidth: '80px'
                  }}>
                    <button
                      onClick={() => handleSort('totalContests')}
                      style={getSortButtonStyle('totalContests', 'center')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--background)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      TOTAL
                      {getSortIcon('totalContests')}
                    </button>
                  </th>
                  <th style={{
                    padding: '16px 8px',
                    textAlign: 'center',
                    minWidth: '80px'
                  }}>
                    <button
                      onClick={() => handleSort('completedContests')}
                      style={getSortButtonStyle('completedContests', 'center')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--background)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      COMPLETED
                      {getSortIcon('completedContests')}
                    </button>
                  </th>
                  <th style={{
                    padding: '16px 8px',
                    textAlign: 'center',
                    minWidth: '80px'
                  }}>
                    <button
                      onClick={() => handleSort('averageScore')}
                      style={getSortButtonStyle('averageScore', 'center')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--background)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      AVG SCORE
                      {getSortIcon('averageScore')}
                    </button>
                  </th>
                  <th style={{
                    padding: '16px 8px',
                    textAlign: 'center',
                    minWidth: '80px'
                  }}>
                    <button
                      onClick={() => handleSort('bestRank')}
                      style={getSortButtonStyle('bestRank', 'center')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--background)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      BEST RANK
                      {getSortIcon('bestRank')}
                    </button>
                  </th>
                </>
              )}

              {/* RANK Column (if not showing algorithm scores) */}
              {!showAlgorithmScores && (
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  minWidth: '100px'
                }}>
                  <button
                    onClick={() => handleSort('rank')}
                    style={getSortButtonStyle('rank', 'left')}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--background)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    RANK
                    {getSortIcon('rank')}
                  </button>
                </th>
              )}

              {/* COUNTRY Column */}
              <th style={{
                padding: '16px 12px',
                textAlign: 'left',
                minWidth: '120px'
              }}>
                <button
                  onClick={() => handleSort('country')}
                  style={getSortButtonStyle('country', 'left')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--background)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  COUNTRY
                  {getSortIcon('country')}
                </button>
              </th>

              {/* SCORE Column */}
              <th style={{
                padding: '16px 12px',
                textAlign: 'right',
                minWidth: '100px'
              }}>
                <button
                  onClick={() => handleSort('score')}
                  style={getSortButtonStyle('score', 'right')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--background)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  SCORE
                  {getSortIcon('score')}
                </button>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {entries.map((entry) => (
              <LeaderboardRow
                key={entry.id}
                entry={entry}
                showAlgorithmScores={showAlgorithmScores}
                showContestScores={showContestScores}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
        totalItems={pagination.totalItems}
      />
    </div>
  );
}
