package com.dao.courseservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateStatsResponse {
    private long totalTemplates;
    private long activeTemplates;
    private long totalIssued;
    private long activeCertificates;
    private long expiredCertificates;
    private long revokedCertificates;
    private long pendingCertificates;
    private long totalRecipients;
    private long totalOrganizations;
    private double averageValidityPeriod;
    private String mostPopularCategory;
    private String mostPopularLevel;
    private java.util.List<CategoryCount> certificatesByCategory;
    private java.util.List<LevelCount> certificatesByLevel;
    private java.util.List<StatusCount> certificatesByStatus;
    private java.util.List<MonthlyCount> monthlyIssuance;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryCount {
        private String category;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LevelCount {
        private String level;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusCount {
        private String status;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyCount {
        private String month;
        private long count;
    }
}
