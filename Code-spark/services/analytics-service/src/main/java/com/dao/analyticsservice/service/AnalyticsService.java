package com.dao.analyticsservice.service;

import com.dao.analyticsservice.dto.response.*;
import java.util.List;
import java.util.UUID;

public interface AnalyticsService {
    List<ExamResultResponse> getExamResults(UUID examId, UUID userId);
    CheatingStatsResponse getCheatingStats(UUID examId);
    List<RecommendationResponse> getRecommendations(UUID userId);
    AnalyticsOverviewResponse getAnalyticsOverview();
    List<KpiMetricResponse> getKpiMetrics();
    List<ScoreTrendPoint> getScoreTrend();
    List<TopPerformerResponse> getTopPerformers(int limit);
    List<TopCourseResponse> getTopCourses(int limit);

    // Dashboard endpoints
    DashboardResponse getDashboard();
    List<UserGrowthResponse> getUserGrowth(int days);
    SystemHealthResponse getSystemHealth();
}
