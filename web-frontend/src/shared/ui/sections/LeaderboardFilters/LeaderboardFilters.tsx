import React from 'react';
import { LeaderboardFiltersProps } from '../../../../foundation/types/leaderboard';

export default function LeaderboardFilters({ 
  filters, 
  onFiltersChange, 
  countries 
}: LeaderboardFiltersProps): JSX.Element {

  const handleHackersChange = (value: 'all' | 'friends') => {
    onFiltersChange({ hackers: value });
  };

  const handleFilterByChange = (value: 'hacker' | 'country' | 'company' | 'school' | null) => {
    onFiltersChange({ filterBy: value });
  };

  const handleCountryChange = (value: string) => {
    onFiltersChange({ country: value === '' ? undefined : value as any });
  };

  const handleCompanyChange = (value: string) => {
    onFiltersChange({ company: value === '' ? undefined : value });
  };

  const handleSchoolChange = (value: string) => {
    onFiltersChange({ school: value === '' ? undefined : value });
  };

  const handleHackerNameChange = (value: string) => {
    onFiltersChange({ hackerName: value === '' ? undefined : value });
  };

  return (
    <div style={{
      width: '280px',
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      height: 'fit-content',
      position: 'sticky',
      top: '100px',
      zIndex: 10,
      boxShadow: 'var(--shadow-lg)'
    }}>
      {/* HACKERS Section */}
      <div style={{
        marginBottom: '32px'
      }}>
        <h3 style={{
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--muted-foreground)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          margin: '0 0 16px 0'
        }}>
          HACKERS
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {[
            { value: 'all', label: 'All' },
            { value: 'friends', label: 'Friends' }
          ].map((option) => (
            <label
              key={option.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'var(--foreground)'
              }}
            >
              <input
                type="radio"
                name="hackers"
                value={option.value}
                checked={filters.hackers === option.value}
                onChange={(e) => handleHackersChange(e.target.value as 'all' | 'friends')}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: 'var(--primary)'
                }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* FILTER BY Section */}
      <div style={{
        marginBottom: '32px'
      }}>
        <h3 style={{
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--muted-foreground)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          margin: '0 0 16px 0'
        }}>
          FILTER BY
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {[
            { value: 'hacker', label: 'Hacker' },
            { value: 'country', label: 'Country' },
            { value: 'company', label: 'Company' },
            { value: 'school', label: 'School' }
          ].map((option) => (
            <label
              key={option.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'var(--foreground)'
              }}
            >
              <input
                type="radio"
                name="filterBy"
                value={option.value}
                checked={filters.filterBy === option.value}
                onChange={(e) => handleFilterByChange(e.target.value as any)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: 'var(--primary)'
                }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Dynamic Filter Inputs */}
      {filters.filterBy && (
        <div style={{
          marginBottom: '32px'
        }}>
          <h3 style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--muted-foreground)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: '0 0 16px 0'
          }}>
            {filters.filterBy.toUpperCase()}
          </h3>
          
          {filters.filterBy === 'hacker' && (
            <input
              type="text"
              placeholder="Enter hacker name..."
              value={filters.hackerName || ''}
              onChange={(e) => handleHackerNameChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--foreground)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          )}
          
          {filters.filterBy === 'country' && (
            <select
              value={filters.country || ''}
              onChange={(e) => handleCountryChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--foreground)',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Select country...</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          )}
          
          {filters.filterBy === 'company' && (
            <input
              type="text"
              placeholder="Enter company name..."
              value={filters.company || ''}
              onChange={(e) => handleCompanyChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--foreground)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          )}
          
          {filters.filterBy === 'school' && (
            <input
              type="text"
              placeholder="Enter school name..."
              value={filters.school || ''}
              onChange={(e) => handleSchoolChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--foreground)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          )}
        </div>
      )}

      {/* Information Text */}
      <div style={{
        padding: '16px',
        background: 'var(--muted)',
        borderRadius: 'var(--radius-md)',
        fontSize: '13px',
        color: 'var(--muted-foreground)',
        lineHeight: 1.5
      }}>
        <p style={{
          margin: '0 0 8px 0'
        }}>
          Your contest score for each track is calculated based on your performance in all of the contests within that domain.
        </p>
        <a
          href="#"
          style={{
            color: 'var(--primary)',
            textDecoration: 'none',
            fontWeight: 500
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          Learn more about scoring →
        </a>
      </div>
    </div>
  );
}
