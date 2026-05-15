package com.dao.analyticsservice.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.util.List;

@Value
@Builder
public class AnalyticsOverviewResponse {
    long totalUsers;
    long activeUsers;
    long totalCourses;
    long totalExams;
    long totalExamSubmissions;
    double averageScore;
    long newUsersToday;
    long activeUsersToday;
    long newCoursesToday;
    long examsTakenToday;
    long totalEnrollments;
    long enrollmentsToday;
    double totalRevenue;
    double revenueToday;
    double userGrowthRate;
    double courseGrowthRate;
    double enrollmentGrowthRate;
    double revenueGrowthRate;
}
