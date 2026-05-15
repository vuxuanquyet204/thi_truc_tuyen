package com.dao.analyticsservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private AnalyticsOverviewResponse stats;
    private List<UserGrowthPoint> userGrowth;
    private List<CourseCategoryStat> courseCategories;
    private List<RecentActivityResponse> recentActivities;
    private List<TopPerformerResponse> topPerformers;
    private SystemHealthResponse systemHealth;
    private ChartDataWrapper chartData;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserGrowthPoint {
        private LocalDateTime date;
        private long totalUsers;
        private long newUsers;
        private long activeUsers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseCategoryStat {
        private String category;
        private long courses;
        private long enrollments;
        private double revenue;
        private String color;
        private String icon;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivityResponse {
        private String id;
        private String type;
        private String title;
        private String description;
        private String user;
        private String course;
        private LocalDateTime timestamp;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartDataWrapper {
        private ChartData userGrowthChart;
        private ChartData courseCategoriesChart;
        private ChartData revenueTrendChart;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartData {
        private List<String> labels;
        private List<ChartDataset> datasets;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartDataset {
        private String label;
        private List<Number> data;
        private List<String> backgroundColor;
        private List<String> borderColor;
        private int borderWidth;
        private boolean fill;
        private double tension;
    }
}
