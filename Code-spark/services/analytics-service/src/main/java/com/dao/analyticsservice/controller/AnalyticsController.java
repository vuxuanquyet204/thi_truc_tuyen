package com.dao.analyticsservice.controller;

import com.dao.analyticsservice.dto.response.*;
import com.dao.analyticsservice.service.AnalyticsService;
import com.dao.common.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/exam-results")
    public ResponseEntity<ApiResponse<List<ExamResultResponse>>> getExamResults(
            @RequestParam(required = false) UUID examId,
            @RequestParam(required = false) UUID userId) {
        List<ExamResultResponse> results = analyticsService.getExamResults(examId, userId);
        return ResponseEntity.ok(ApiResponse.success("Exam results fetched successfully", results));
    }

    @GetMapping("/cheating-stats")
    public ResponseEntity<ApiResponse<CheatingStatsResponse>> getCheatingStats(
            @RequestParam UUID examId) {
        CheatingStatsResponse stats = analyticsService.getCheatingStats(examId);
        return ResponseEntity.ok(ApiResponse.success("Cheating statistics fetched successfully", stats));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<List<RecommendationResponse>>> getRecommendations(
            @RequestParam UUID userId) {
        List<RecommendationResponse> recommendations = analyticsService.getRecommendations(userId);
        return ResponseEntity.ok(ApiResponse.success("Recommendations fetched successfully", recommendations));
    }

    @GetMapping("/overview")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<AnalyticsOverviewResponse>> getOverview() {
        AnalyticsOverviewResponse overview = analyticsService.getAnalyticsOverview();
        return ResponseEntity.ok(ApiResponse.success("Analytics overview fetched successfully", overview));
    }

    @GetMapping("/kpis")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<KpiMetricResponse>>> getKpis() {
        List<KpiMetricResponse> kpis = analyticsService.getKpiMetrics();
        return ResponseEntity.ok(ApiResponse.success("KPIs fetched successfully", kpis));
    }

    @GetMapping("/score-trend")
    public ResponseEntity<ApiResponse<List<ScoreTrendPoint>>> getScoreTrend() {
        List<ScoreTrendPoint> trend = analyticsService.getScoreTrend();
        return ResponseEntity.ok(ApiResponse.success("Score trend fetched successfully", trend));
    }

    @GetMapping("/top-performers")
    public ResponseEntity<ApiResponse<List<TopPerformerResponse>>> getTopPerformers(
            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        List<TopPerformerResponse> performers = analyticsService.getTopPerformers(Math.min(limit, 100));
        return ResponseEntity.ok(ApiResponse.success("Top performers fetched successfully", performers));
    }

    @GetMapping("/top-courses")
    public ResponseEntity<ApiResponse<List<TopCourseResponse>>> getTopCourses(
            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        List<TopCourseResponse> courses = analyticsService.getTopCourses(Math.min(limit, 100));
        return ResponseEntity.ok(ApiResponse.success("Top courses fetched successfully", courses));
    }

    // ========== NEW ENDPOINTS FOR DASHBOARD ==========

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        DashboardResponse dashboard = analyticsService.getDashboard();
        return ResponseEntity.ok(ApiResponse.success("Dashboard data fetched successfully", dashboard));
    }

    @GetMapping("/user-growth")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<UserGrowthResponse>>> getUserGrowth(
            @RequestParam(value = "days", defaultValue = "30") int days) {
        List<UserGrowthResponse> userGrowth = analyticsService.getUserGrowth(days);
        return ResponseEntity.ok(ApiResponse.success("User growth data fetched successfully", userGrowth));
    }

    @GetMapping("/system-health")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<SystemHealthResponse>> getSystemHealth() {
        SystemHealthResponse health = analyticsService.getSystemHealth();
        return ResponseEntity.ok(ApiResponse.success("System health fetched successfully", health));
    }
}
