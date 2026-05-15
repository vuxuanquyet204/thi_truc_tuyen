// Leaderboard Types
export interface LeaderboardEntry {
  id: string;
  hackerName: string;
  rank: number;
  country: CountryCode;
  countryName: string;
  score: number;
  algorithms: AlgorithmScores;
  contests: ContestScores;
  profileUrl?: string;
  avatarUrl?: string;
}

export interface AlgorithmScores {
  o1: number;
  ologN: number;
  oN: number;
  oN2: number;
  o2N: number;
}

export interface ContestScores {
  totalContests: number;
  completedContests: number;
  averageScore: number;
  bestRank: number;
}

export type CountryCode = 
  | 'BY' // Belarus
  | 'JP' // Japan
  | 'RU' // Russia
  | 'LV' // Latvia
  | 'US' // USA
  | 'CL' // Chile
  | 'CA' // Canada
  | 'CN' // China
  | 'IN' // India
  | 'BR' // Brazil
  | 'DE' // Germany
  | 'FR' // France
  | 'GB' // UK
  | 'AU' // Australia
  | 'KR' // South Korea
  | 'SG' // Singapore
  | 'NL' // Netherlands
  | 'SE' // Sweden
  | 'FI' // Finland
  | 'NO' // Norway
  | 'DK' // Denmark
  | 'CH' // Switzerland
  | 'AT' // Austria
  | 'BE' // Belgium
  | 'PL' // Poland
  | 'CZ' // Czech Republic
  | 'HU' // Hungary
  | 'IT' // Italy
  | 'ES' // Spain
  | 'PT' // Portugal
  | 'GR' // Greece
  | 'RO' // Romania
  | 'BG' // Bulgaria
  | 'HR' // Croatia
  | 'SK' // Slovakia
  | 'SI' // Slovenia
  | 'EE' // Estonia
  | 'LT' // Lithuania
  | 'LV' // Latvia
  | 'IE' // Ireland
  | 'IS' // Iceland
  | 'LU' // Luxembourg
  | 'MT' // Malta
  | 'CY' // Cyprus
  | 'VN' // Vietnam
  | 'UNKNOWN'; // Unknown/Unselected

export interface CountryInfo {
  code: CountryCode;
  name: string;
  flag: string;
}

export interface LeaderboardFilters {
  hackers: 'all' | 'friends';
  filterBy: 'hacker' | 'country' | 'company' | 'school' | null;
  country?: CountryCode;
  company?: string;
  school?: string;
  hackerName?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  pagination: PaginationInfo;
  filters: LeaderboardFilters;
}

export interface TabOption {
  id: string;
  label: string;
  isActive: boolean;
  disabled?: boolean;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  totalItems: number;
}

export interface TabsProps {
  tabs: TabOption[];
  onTabChange: (tabId: string) => void;
}

export interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  showAlgorithmScores?: boolean;
  showContestScores?: boolean;
}

export interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  showAlgorithmScores?: boolean;
  showContestScores?: boolean;
  sortBy?: 'rank' | 'score' | 'country' | 'hacker';
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string) => void;
}

export interface LeaderboardFiltersProps {
  filters: LeaderboardFilters;
  onFiltersChange: (filters: Partial<LeaderboardFilters>) => void;
  countries: CountryInfo[];
}

// Performance metrics for algorithms
export interface PerformanceMetrics {
  o1: {
    label: 'O(1)';
    description: 'Constant Time';
    color: string;
  };
  ologN: {
    label: 'O(logN)';
    description: 'Logarithmic Time';
    color: string;
  };
  oN: {
    label: 'O(N)';
    description: 'Linear Time';
    color: string;
  };
  oN2: {
    label: 'O(N²)';
    description: 'Quadratic Time';
    color: string;
  };
  o2N: {
    label: 'O(2^N)';
    description: 'Exponential Time';
    color: string;
  };
}

// Table column configuration
export interface TableColumn {
  key: string;
  label: string;
  sortable: boolean;
  align: 'left' | 'center' | 'right';
  width?: string;
  className?: string;
}

// Sort configuration
export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

// API Response types
export interface LeaderboardResponse {
  data: LeaderboardEntry[];
  pagination: PaginationInfo;
  filters: LeaderboardFilters;
  metadata: {
    lastUpdated: string;
    totalParticipants: number;
    activeContests: number;
  };
}

// Filter options
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

export interface FilterSection {
  title: string;
  type: 'radio' | 'checkbox' | 'select' | 'search';
  options: FilterOption[];
  selectedValue?: string | string[];
  onChange: (value: string | string[]) => void;
}

// Stats and analytics
export interface LeaderboardStats {
  totalParticipants: number;
  averageScore: number;
  topScore: number;
  countriesRepresented: number;
  activeUsers: number;
  newUsersThisMonth: number;
}
