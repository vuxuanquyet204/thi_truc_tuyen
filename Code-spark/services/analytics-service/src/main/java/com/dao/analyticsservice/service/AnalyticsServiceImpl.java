package com.dao.analyticsservice.service;

import com.dao.analyticsservice.client.CourseServiceClient;
import com.dao.analyticsservice.client.IdentityServiceClient;
import com.dao.analyticsservice.dto.client.CourseSummaryDto;
import com.dao.analyticsservice.dto.client.PageResponse;
import com.dao.analyticsservice.dto.client.UserSummaryDto;
import com.dao.analyticsservice.dto.response.*;
import com.dao.analyticsservice.entity.ExamResult;
import com.dao.analyticsservice.entity.ProctoringEvent;
import com.dao.analyticsservice.repository.ExamResultRepository;
import com.dao.analyticsservice.repository.ProctoringEventRepository;
import com.dao.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsServiceImpl implements AnalyticsService {

    private final ExamResultRepository examResultRepository;
    private final ProctoringEventRepository proctoringEventRepository;
    private final IdentityServiceClient identityServiceClient;
    private final CourseServiceClient courseServiceClient;

    private static final String[] CHART_COLORS = {
        "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
        "#ef4444", "#ec4899", "#06b6d4", "#84cc16"
    };

    private static final String[] EMOJI_ICONS = {
        "\uD83C\uDF10", "\uD83D\uDCF1", "\uD83D\uDCCA",
        "\uD83E\uDD16", "\u2699\uFE0F", "\uD83C\uDFA8",
        "\uD83D\uDD13", "\uD83D\uDD12"
    };

    @Override
    public List<ExamResultResponse> getExamResults(UUID examId, UUID userId) {
        List<ExamResult> results;
        if (examId != null) {
            results = examResultRepository.findByExamId(examId);
        } else if (userId != null) {
            results = examResultRepository.findByUserId(userId);
        } else {
            return Collections.emptyList();
        }

        if (results == null) {
            return Collections.emptyList();
        }

        return results.stream()
                .map(this::mapToExamResultResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CheatingStatsResponse getCheatingStats(UUID examId) {
        List<ProctoringEvent> events = proctoringEventRepository.findByExamId(examId);

        long suspiciousEventsCount = events.stream()
                .filter(event -> event.getEventType() != null &&
                                 event.getEventType().toLowerCase().contains("suspicious"))
                .count();

        Map<String, Long> eventTypeDistribution = events.stream()
                .collect(Collectors.groupingBy(ProctoringEvent::getEventType, Collectors.counting()));

        double cheatingRiskScore = events.isEmpty() ? 0 : (double) suspiciousEventsCount / events.size();

        return new CheatingStatsResponse(
                examId,
                (long) events.size(),
                suspiciousEventsCount,
                eventTypeDistribution,
                cheatingRiskScore
        );
    }

    @Override
    public List<RecommendationResponse> getRecommendations(UUID userId) {
        try {
            ApiResponse<PageResponse<CourseSummaryDto>> coursesResponse = courseServiceClient.getCourses(0, 5);
            if (coursesResponse != null && coursesResponse.isSuccess() && coursesResponse.getData() != null) {
                return coursesResponse.getData().getContent().stream()
                        .map(course -> new RecommendationResponse(
                                course.id() != null ? course.id() : new UUID(0, 0),
                                course.title(),
                                "Recommended based on popularity",
                                0.8
                        ))
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.warn("Error fetching course recommendations: {}", e.getMessage());
        }

        return Collections.emptyList();
    }

    @Override
    public AnalyticsOverviewResponse getAnalyticsOverview() {
        try {
            long totalExamSubmissions = examResultRepository.count();
            long distinctExams = examResultRepository.countDistinctByExamIdIsNotNull();
            long activeLearners = examResultRepository.countDistinctByUserIdIsNotNull();
            Double averageScore = Optional.ofNullable(examResultRepository.findAverageScore()).orElse(0.0);

            long totalUsers = 0;
            long totalCourses = 0;

            try {
                totalUsers = fetchUsers().size();
            } catch (Exception e) {
                log.warn("Error fetching users: {}", e.getMessage());
            }

            try {
                totalCourses = fetchTotalCourses();
            } catch (Exception e) {
                log.warn("Error fetching courses: {}", e.getMessage());
            }

            // Calculate "today" metrics
            LocalDateTime todayStart = LocalDate.now().atStartOfDay();
            LocalDateTime todayEnd = todayStart.plusDays(1);
            LocalDateTime yesterdayStart = todayStart.minusDays(1);

            long examsTakenToday = examResultRepository.countExamAttemptsBetween(todayStart, todayEnd);

            // Get previous period for growth rates
            LocalDateTime weekAgo = LocalDate.now().minusDays(7).atStartOfDay();
            LocalDateTime twoWeeksAgo = LocalDate.now().minusDays(14).atStartOfDay();

            long currentPeriodExams = examResultRepository.countExamAttemptsBetween(weekAgo, todayStart);
            long previousPeriodExams = examResultRepository.countExamAttemptsBetween(twoWeeksAgo, weekAgo);

            return AnalyticsOverviewResponse.builder()
                    .totalUsers(totalUsers)
                    .activeUsers(activeLearners)
                    .totalCourses(totalCourses)
                    .totalExams(distinctExams)
                    .totalExamSubmissions(totalExamSubmissions)
                    .averageScore(round(averageScore))
                    .newUsersToday(0) // Will be populated when identity service provides this
                    .activeUsersToday(activeLearners)
                    .newCoursesToday(0)
                    .examsTakenToday(examsTakenToday)
                    .totalEnrollments(0)
                    .enrollmentsToday(0)
                    .totalRevenue(0.0)
                    .revenueToday(0.0)
                    .userGrowthRate(round(calculateChangePercentage(previousPeriodExams, currentPeriodExams)))
                    .courseGrowthRate(0.0)
                    .enrollmentGrowthRate(0.0)
                    .revenueGrowthRate(0.0)
                    .build();
        } catch (Exception e) {
            log.error("Error in getAnalyticsOverview: ", e);
            return AnalyticsOverviewResponse.builder()
                    .totalUsers(0)
                    .activeUsers(0)
                    .totalCourses(0)
                    .totalExams(0)
                    .totalExamSubmissions(0)
                    .averageScore(0.0)
                    .newUsersToday(0)
                    .activeUsersToday(0)
                    .newCoursesToday(0)
                    .examsTakenToday(0)
                    .totalEnrollments(0)
                    .enrollmentsToday(0)
                    .totalRevenue(0.0)
                    .revenueToday(0.0)
                    .userGrowthRate(0.0)
                    .courseGrowthRate(0.0)
                    .enrollmentGrowthRate(0.0)
                    .revenueGrowthRate(0.0)
                    .build();
        }
    }

    @Override
    public List<KpiMetricResponse> getKpiMetrics() {
        AnalyticsOverviewResponse overview = getAnalyticsOverview();

        LocalDateTime last7Days = LocalDateTime.now().minusDays(7);
        LocalDateTime previous7Days = LocalDateTime.now().minusDays(14);

        long last7DaysAttempts = examResultRepository.countExamAttemptsBetween(previous7Days, last7Days);
        long previous7DaysAttempts = examResultRepository.countExamAttemptsBetween(
                LocalDateTime.now().minusDays(14),
                LocalDateTime.now().minusDays(7));

        double attemptChange = calculateChangePercentage(previous7DaysAttempts, last7DaysAttempts);

        Double lastWeekAvgScore = examResultRepository.findAverageScoreBetween(
                LocalDate.now().minusDays(7).atStartOfDay(),
                LocalDate.now().atStartOfDay());
        Double prevWeekAvgScore = examResultRepository.findAverageScoreBetween(
                LocalDate.now().minusDays(14).atStartOfDay(),
                LocalDate.now().minusDays(7).atStartOfDay());

        double scoreChange = calculateChangePercentage(
                prevWeekAvgScore != null ? prevWeekAvgScore : 0.0,
                lastWeekAvgScore != null ? lastWeekAvgScore : 0.0);

        double activeRate = overview.getTotalUsers() == 0
                ? 0
                : round(((double) overview.getActiveUsers() / overview.getTotalUsers()) * 100.0);

        return List.of(
                KpiMetricResponse.builder()
                        .id("kpi-active-users")
                        .title("Người dùng hoạt động")
                        .unit("learner")
                        .value(overview.getActiveUsers())
                        .changePercentage(activeRate)
                        .trend(determineTrend(activeRate, 50))
                        .build(),
                KpiMetricResponse.builder()
                        .id("kpi-average-score")
                        .title("Điểm trung bình")
                        .unit("điểm")
                        .value(overview.getAverageScore())
                        .changePercentage(scoreChange)
                        .trend(determineTrend(scoreChange, 0))
                        .build(),
                KpiMetricResponse.builder()
                        .id("kpi-exam-attempts")
                        .title("Lượt thi trong 7 ngày")
                        .unit("attempt")
                        .value(last7DaysAttempts)
                        .changePercentage(attemptChange)
                        .trend(determineTrend(attemptChange, 0))
                        .build()
        );
    }

    @Override
    public List<ScoreTrendPoint> getScoreTrend() {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(29);

        List<Object[]> results = examResultRepository.getScoreTrendByDate(
                start.atStartOfDay(),
                today.plusDays(1).atStartOfDay());

        return start.datesUntil(today.plusDays(1))
                .map(date -> {
                    double avg = 0.0;
                    long count = 0;
                    for (Object[] row : results) {
                        if (row[0] != null && row[0].toString().equals(date.toString())) {
                            avg = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
                            count = row[2] != null ? ((Number) row[2]).longValue() : 0L;
                            break;
                        }
                    }
                    return new ScoreTrendPoint(date, round(avg), count);
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<TopPerformerResponse> getTopPerformers(int limit) {
        List<Object[]> results = examResultRepository.getUserStatisticsGrouped(PageRequest.of(0, limit));

        return results.stream()
                .map(row -> {
                    UUID userUuid = (UUID) row[0];
                    Double avgScore = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
                    Long attempts = row[2] != null ? ((Number) row[2]).longValue() : 0L;

                    String displayName = "Unknown User";
                    try {
                        Long userIdLong = userUuid.getMostSignificantBits();
                        ApiResponse<UserSummaryDto> userResponse = identityServiceClient.getUserById(userIdLong);
                        if (userResponse != null && userResponse.isSuccess() && userResponse.getData() != null) {
                            UserSummaryDto user = userResponse.getData();
                            String name = user.firstName() + (user.lastName() != null ? " " + user.lastName() : "");
                            displayName = (!name.trim().isEmpty()) ? name : "User " + userIdLong;
                        }
                    } catch (Exception e) {
                        log.warn("Error fetching user {}: {}", userUuid, e.getMessage());
                    }

                    return new TopPerformerResponse(userUuid, displayName, avgScore, attempts);
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<TopCourseResponse> getTopCourses(int limit) {
        List<Object[]> results = examResultRepository.getExamStatisticsGrouped(PageRequest.of(0, limit));

        return results.stream()
                .map(row -> {
                    UUID courseId = (UUID) row[0];
                    Double avgScore = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
                    Long attempts = row[2] != null ? ((Number) row[2]).longValue() : 0L;

                    String title = "Khóa học " + courseId;
                    try {
                        ApiResponse<CourseSummaryDto> courseResponse = courseServiceClient.getCourseById(courseId);
                        if (courseResponse != null && courseResponse.isSuccess() && courseResponse.getData() != null) {
                            title = courseResponse.getData().title() != null ?
                                    courseResponse.getData().title() : title;
                        }
                    } catch (Exception e) {
                        log.warn("Error fetching course {}: {}", courseId, e.getMessage());
                    }

                    return new TopCourseResponse(courseId, title, attempts, round(avgScore));
                })
                .collect(Collectors.toList());
    }

    // ========== NEW DASHBOARD METHODS ==========

    @Override
    public DashboardResponse getDashboard() {
        AnalyticsOverviewResponse stats = getAnalyticsOverview();
        List<UserGrowthResponse> userGrowth = getUserGrowth(30);
        List<TopPerformerResponse> topPerformers = getTopPerformers(5);
        SystemHealthResponse systemHealth = getSystemHealth();

        // Build course categories (placeholder - can be enhanced with real course data)
        List<DashboardResponse.CourseCategoryStat> courseCategories = buildCourseCategories();

        // Build recent activities (placeholder - can be enhanced with real activity data)
        List<DashboardResponse.RecentActivityResponse> recentActivities = buildRecentActivities();

        List<DashboardResponse.UserGrowthPoint> userGrowthPoints = userGrowth.stream()
                .map(ug -> DashboardResponse.UserGrowthPoint.builder()
                        .date(ug.getDate())
                        .totalUsers(ug.getTotalUsers())
                        .newUsers(ug.getNewUsers())
                        .activeUsers(ug.getActiveUsers())
                        .build())
                .toList();

        // Build chart data
        DashboardResponse.ChartDataWrapper chartData = buildChartData(userGrowth, courseCategories);

        return DashboardResponse.builder()
                .stats(stats)
                .userGrowth(userGrowthPoints)
                .courseCategories(courseCategories)
                .recentActivities(recentActivities)
                .topPerformers(topPerformers)
                .systemHealth(systemHealth)
                .chartData(chartData)
                .build();
    }

    @Override
    public List<UserGrowthResponse> getUserGrowth(int days) {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(days);

        List<Object[]> results = examResultRepository.getScoreTrendByDate(
                start.atStartOfDay(),
                today.plusDays(1).atStartOfDay());

        Map<String, Long> dateMap = new HashMap<>();
        for (Object[] row : results) {
            if (row[0] != null) {
                String dateStr = row[0].toString();
                long count = row[2] != null ? ((Number) row[2]).longValue() : 0L;
                dateMap.put(dateStr, count);
            }
        }

        long runningTotal = 0;
        List<UserGrowthResponse> growthList = new ArrayList<>();

        for (LocalDate date = start; !date.isAfter(today); date = date.plusDays(1)) {
            String dateStr = date.toString();
            long dailyCount = dateMap.getOrDefault(dateStr, 0L);
            runningTotal += dailyCount;

            growthList.add(UserGrowthResponse.builder()
                    .date(date.atStartOfDay())
                    .totalUsers(runningTotal)
                    .newUsers(dailyCount)
                    .activeUsers(dailyCount)
                    .build());
        }

        return growthList;
    }

    @Override
    public SystemHealthResponse getSystemHealth() {
        // Simulate system health based on current data
        // In production, this would check actual service statuses
        double errorRate = 0.0;
        double responseTime = 0.0;

        try {
            List<Object[]> recentResults = examResultRepository.getScoreTrendByDate(
                    LocalDateTime.now().minusHours(1),
                    LocalDateTime.now());

            if (recentResults.isEmpty()) {
                errorRate = 0.0;
            }
        } catch (Exception e) {
            log.warn("Error calculating system health: {}", e.getMessage());
            errorRate = 5.0;
            responseTime = 500.0;
        }

        String status = errorRate < 1.0 ? "healthy" : errorRate < 5.0 ? "warning" : "critical";

        return SystemHealthResponse.builder()
                .status(status)
                .uptime(99.5)
                .responseTime(responseTime > 0 ? responseTime : 0.15)
                .errorRate(round(errorRate))
                .lastUpdate(LocalDateTime.now())
                .alerts(Collections.emptyList())
                .build();
    }

    // ========== HELPER METHODS ==========

    private List<DashboardResponse.CourseCategoryStat> buildCourseCategories() {
        List<DashboardResponse.CourseCategoryStat> categories = new ArrayList<>();
        String[] defaultCategories = {
            "Programming", "Data Science", "Web Development",
            "Mobile Development", "Cloud Computing", "AI & ML", "DevOps", "Security"
        };

        for (int i = 0; i < defaultCategories.length; i++) {
            categories.add(DashboardResponse.CourseCategoryStat.builder()
                    .category(defaultCategories[i])
                    .courses(0)
                    .enrollments(0)
                    .revenue(0.0)
                    .color(CHART_COLORS[i % CHART_COLORS.length])
                    .icon(EMOJI_ICONS[i % EMOJI_ICONS.length])
                    .build());
        }
        return categories;
    }

    private List<DashboardResponse.RecentActivityResponse> buildRecentActivities() {
        // Return empty list - will be populated when identity/course services provide activity feed
        return Collections.emptyList();
    }

    private DashboardResponse.ChartDataWrapper buildChartData(
            List<UserGrowthResponse> userGrowth,
            List<DashboardResponse.CourseCategoryStat> courseCategories) {

        // User growth chart
        List<String> userGrowthLabels = userGrowth.stream()
                .map(ug -> ug.getDate().format(DateTimeFormatter.ofPattern("MM/dd")))
                .collect(Collectors.toList());

        DashboardResponse.ChartDataset userGrowthDataset = DashboardResponse.ChartDataset.builder()
                .label("Tổng người dùng")
                .data(userGrowth.stream().<Number>map(ug -> ug.getTotalUsers()).collect(Collectors.toList()))
                .backgroundColor(List.of("rgba(59, 130, 246, 0.1)"))
                .borderColor(List.of("rgba(59, 130, 246, 1)"))
                .borderWidth(2)
                .fill(true)
                .tension(0.4)
                .build();

        DashboardResponse.ChartDataset newUsersDataset = DashboardResponse.ChartDataset.builder()
                .label("Người dùng mới")
                .data(userGrowth.stream().<Number>map(ug -> ug.getNewUsers()).collect(Collectors.toList()))
                .backgroundColor(List.of("rgba(16, 185, 129, 0.1)"))
                .borderColor(List.of("rgba(16, 185, 129, 1)"))
                .borderWidth(2)
                .fill(false)
                .tension(0.4)
                .build();

        DashboardResponse.ChartData userGrowthChart = DashboardResponse.ChartData.builder()
                .labels(userGrowthLabels)
                .datasets(List.of(userGrowthDataset, newUsersDataset))
                .build();

        // Course categories chart
        List<String> categoryLabels = courseCategories.stream()
                .map(DashboardResponse.CourseCategoryStat::getCategory)
                .collect(Collectors.toList());

        List<Number> categoryCoursesData = courseCategories.stream().map(c -> c.getCourses()).collect(Collectors.toList());
        List<String> categoryBgColors = courseCategories.stream().map(c -> c.getColor() + "40").collect(Collectors.toList());
        List<String> categoryBorderColors = courseCategories.stream().map(DashboardResponse.CourseCategoryStat::getColor).collect(Collectors.toList());

        DashboardResponse.ChartDataset categoryDataset = DashboardResponse.ChartDataset.builder()
                .label("Số khóa học")
                .data(categoryCoursesData)
                .backgroundColor(categoryBgColors)
                .borderColor(categoryBorderColors)
                .borderWidth(2)
                .fill(true)
                .tension(0.4)
                .build();

        DashboardResponse.ChartData courseCategoriesChart = DashboardResponse.ChartData.builder()
                .labels(categoryLabels)
                .datasets(List.of(categoryDataset))
                .build();

        // Revenue trend chart (placeholder)
        DashboardResponse.ChartDataset revenueDataset = DashboardResponse.ChartDataset.builder()
                .label("Doanh thu (LEARN)")
                .data(userGrowthLabels.stream().<Number>map(l -> 0).collect(Collectors.toList()))
                .backgroundColor(List.of("rgba(245, 158, 11, 0.1)"))
                .borderColor(List.of("rgba(245, 158, 11, 1)"))
                .borderWidth(2)
                .fill(true)
                .tension(0.4)
                .build();

        DashboardResponse.ChartData revenueTrendChart = DashboardResponse.ChartData.builder()
                .labels(userGrowthLabels)
                .datasets(List.of(revenueDataset))
                .build();

        return DashboardResponse.ChartDataWrapper.builder()
                .userGrowthChart(userGrowthChart)
                .courseCategoriesChart(courseCategoriesChart)
                .revenueTrendChart(revenueTrendChart)
                .build();
    }

    private List<UserSummaryDto> fetchUsers() {
        ApiResponse<List<UserSummaryDto>> response = identityServiceClient.getAllUsers();
        if (response == null || !response.isSuccess() || response.getData() == null) {
            return List.of();
        }
        return response.getData();
    }

    private long fetchTotalCourses() {
        ApiResponse<PageResponse<CourseSummaryDto>> response = courseServiceClient.getCourses(0, 1);
        if (response == null || !response.isSuccess() || response.getData() == null) {
            return 0;
        }
        return response.getData().getTotalElements();
    }

    private double calculateChangePercentage(double previous, double current) {
        if (previous <= 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return round(((current - previous) / previous) * 100.0);
    }

    private String determineTrend(double value, double baseline) {
        if (value > baseline) return "up";
        if (value < baseline) return "down";
        return "stable";
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private ExamResultResponse mapToExamResultResponse(ExamResult examResult) {
        return new ExamResultResponse(
                examResult.getId(),
                examResult.getExamId(),
                examResult.getSubmissionId(),
                examResult.getUserId(),
                examResult.getScore(),
                examResult.getCreatedAt()
        );
    }
}
