import React from 'react';
import { ContestSection as ContestSectionType } from '@/types/contest';
import SectionHeader from '@/shared/ui/molecules/SectionHeader/SectionHeader';
import ContestListItem from '@/shared/ui/molecules/ContestListItem/ContestListItem';
import ContestCard from '@/shared/ui/molecules/ContestCard/ContestCard';
import styles from './ContestSection.module.css';

interface ContestSectionProps {
  section: ContestSectionType;
  onContestActionClick?: (contest: any) => void;
  onViewAllClick?: (section: ContestSectionType) => void;
}

const ContestSection: React.FC<ContestSectionProps> = ({
  section,
  onContestActionClick,
  onViewAllClick
}) => {
  const handleViewAllClick = () => {
    if (onViewAllClick) {
      onViewAllClick(section);
    }
  };

  const renderContests = () => {
    if (section.layout === 'list') {
      return (
        <div className={styles.contestList}>
          {section.contests.map((contest) => (
            <ContestListItem
              key={contest.id}
              contest={contest}
              onActionClick={onContestActionClick}
            />
          ))}
        </div>
      );
    } else {
      return (
        <div className={styles.contestGrid}>
          {section.contests.map((contest) => (
            <ContestCard
              key={contest.id}
              contest={contest}
              onActionClick={onContestActionClick}
            />
          ))}
        </div>
      );
    }
  };

  return (
    <div className={styles.contestSection}>
      <SectionHeader
        title={section.title}
        showViewAll={section.showViewAll}
        viewAllLink={section.viewAllLink}
        onViewAllClick={handleViewAllClick}
      />
      
      {section.contests.length > 0 ? (
        renderContests()
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Không có cuộc thi nào</p>
        </div>
      )}
    </div>
  );
};

export default ContestSection;
