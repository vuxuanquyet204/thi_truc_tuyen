import React from 'react';
import { LeaderboardRowProps, CountryInfo } from '@/foundation/types';
import { Trophy, Medal, Award } from 'lucide-react';

const COUNTRY_MAP: CountryInfo[] = [
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

const getCountryByCode = (code: string): CountryInfo | undefined =>
  COUNTRY_MAP.find(c => c.code === code);

const formatScore = (score: number): string =>
  score >= 1000 ? `${(score / 1000).toFixed(1)}k` : String(score);

const formatRank = (rank: number): string =>
  rank > 100 ? `${rank}+` : String(rank);

export default function LeaderboardRow({
  entry,
  showAlgorithmScores = true,
  showContestScores = false
}: LeaderboardRowProps): JSX.Element {

  const countryInfo = getCountryByCode(entry.country);

  // Get rank badge/medal for top 3
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return <Trophy style={{ width: '20px', height: '20px', color: 'var(--medal-gold)', marginRight: '8px' }} />;
    } else if (rank === 2) {
      return <Medal style={{ width: '20px', height: '20px', color: 'var(--medal-silver)', marginRight: '8px' }} />;
    } else if (rank === 3) {
      return <Award style={{ width: '20px', height: '20px', color: 'var(--medal-bronze)', marginRight: '8px' }} />;
    }
    return null;
  };

  // Get background color for top 3
  const getRowBackground = (rank: number) => {
    if (rank === 1) return 'var(--rank-gold-bg)';
    if (rank === 2) return 'var(--rank-silver-bg)';
    if (rank === 3) return 'var(--rank-bronze-bg)';
    return 'transparent';
  };

  const generateAvatar = (name: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['var(--primary)', 'var(--accent)', 'var(--primary)', 'var(--accent)', 'var(--primary)', 'var(--accent)', 'var(--primary)', 'var(--accent)'];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return { initials, color: colors[colorIndex] };
  };

  const avatar = generateAvatar(entry.hackerName);

  return (
    <tr style={{
      borderBottom: '1px solid var(--border)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      background: getRowBackground(entry.rank),
      position: 'relative'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = entry.rank <= 3
        ? getRowBackground(entry.rank)
        : 'var(--muted)';
      e.currentTarget.style.transform = 'scale(1.01)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      e.currentTarget.style.zIndex = '1';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = getRowBackground(entry.rank);
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.zIndex = 'auto';
    }}
    >
      {/* Hacker Name */}
      <td style={{
        padding: '16px 12px',
        textAlign: 'left',
        verticalAlign: 'middle'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Rank with Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            minWidth: '50px'
          }}>
            {getRankBadge(entry.rank)}
            <span style={{
              fontSize: entry.rank <= 3 ? '16px' : '14px',
              fontWeight: entry.rank <= 3 ? 700 : 600,
              color: entry.rank <= 3 ? 'var(--foreground)' : 'var(--muted-foreground)'
            }}>
              {formatRank(entry.rank)}
            </span>
          </div>

          {/* Avatar */}
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: avatar.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600,
            fontSize: '14px',
            flexShrink: 0,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {avatar.initials}
          </div>

          {/* Hacker Name */}
          <a
            href={entry.profileUrl || '#'}
            style={{
              fontSize: entry.rank <= 3 ? '15px' : '14px',
              fontWeight: entry.rank <= 3 ? 600 : 500,
              color: 'var(--foreground)',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'color var(--transition-normal)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--foreground)';
            }}
          >
            {entry.hackerName}
          </a>
        </div>
      </td>

      {/* Algorithm Scores */}
      {showAlgorithmScores && (
        <>
          <td style={{
            padding: '16px 8px',
            textAlign: 'center',
            verticalAlign: 'middle',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--foreground)'
          }}>
            <span style={{
              display: 'inline-block',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--muted)',
              minWidth: '32px'
            }}>
              {entry.algorithms.o1}
            </span>
          </td>
          <td style={{
            padding: '16px 8px',
            textAlign: 'center',
            verticalAlign: 'middle',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--foreground)'
          }}>
            <span style={{
              display: 'inline-block',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--muted)',
              minWidth: '32px'
            }}>
              {entry.algorithms.ologN}
            </span>
          </td>
          <td style={{
            padding: '16px 8px',
            textAlign: 'center',
            verticalAlign: 'middle',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--foreground)'
          }}>
            <span style={{
              display: 'inline-block',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--muted)',
              minWidth: '32px'
            }}>
              {entry.algorithms.oN}
            </span>
          </td>
          <td style={{
            padding: '16px 8px',
            textAlign: 'center',
            verticalAlign: 'middle',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--foreground)'
          }}>
            <span style={{
              display: 'inline-block',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--muted)',
              minWidth: '32px'
            }}>
              {entry.algorithms.oN2}
            </span>
          </td>
          <td style={{
            padding: '16px 8px',
            textAlign: 'center',
            verticalAlign: 'middle',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--foreground)'
          }}>
            <span style={{
              display: 'inline-block',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--muted)',
              minWidth: '32px'
            }}>
              {entry.algorithms.o2N}
            </span>
          </td>
        </>
      )}

      {/* Contest Scores */}
      {showContestScores && (
        <>
          <td style={{
            padding: '16px 8px',
            textAlign: 'center',
            verticalAlign: 'middle',
            fontSize: '12px',
            color: 'var(--muted-foreground)'
          }}>
            {entry.contests.totalContests}
          </td>
          <td style={{
            padding: '16px 8px',
            textAlign: 'center',
            verticalAlign: 'middle',
            fontSize: '12px',
            color: 'var(--muted-foreground)'
          }}>
            {entry.contests.completedContests}
          </td>
          <td style={{
            padding: '16px 8px',
            textAlign: 'center',
            verticalAlign: 'middle',
            fontSize: '12px',
            color: 'var(--muted-foreground)'
          }}>
            {entry.contests.averageScore.toFixed(1)}
          </td>
          <td style={{
            padding: '16px 8px',
            textAlign: 'center',
            verticalAlign: 'middle',
            fontSize: '12px',
            color: 'var(--muted-foreground)'
          }}>
            {entry.contests.bestRank}
          </td>
        </>
      )}

      {/* Rank (if not showing algorithm scores) */}
      {!showAlgorithmScores && (
        <td style={{
          padding: '16px 12px',
          textAlign: 'left',
          verticalAlign: 'middle',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--foreground)'
        }}>
          {formatRank(entry.rank)}
        </td>
      )}

      {/* Country */}
      <td style={{
        padding: '16px 12px',
        textAlign: 'left',
        verticalAlign: 'middle'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{
            fontSize: '20px',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
          }}>
            {countryInfo?.flag || '❓'}
          </span>
          <span style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--foreground)'
          }}>
            {countryInfo?.name || entry.countryName}
          </span>
        </div>
      </td>

      {/* Score */}
      <td style={{
        padding: '16px 12px',
        textAlign: 'right',
        verticalAlign: 'middle'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          background: entry.rank <= 3
            ? 'var(--primary-light)'
            : 'var(--muted)',
          fontWeight: 700,
          fontSize: entry.rank <= 3 ? '15px' : '14px',
          color: entry.rank <= 3 ? 'var(--primary)' : 'var(--foreground)'
        }}>
          {formatScore(entry.score)}
        </div>
      </td>
    </tr>
  );
}
