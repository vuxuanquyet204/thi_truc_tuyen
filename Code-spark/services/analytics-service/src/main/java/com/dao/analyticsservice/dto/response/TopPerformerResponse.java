package com.dao.analyticsservice.dto.response;

import java.util.Map;
import java.util.UUID;

public record TopPerformerResponse(
        UUID id,
        String name,
        String type, // 'course' | 'instructor' | 'student'
        double value,
        String unit,
        double growth,
        String avatar,
        Map<String, Object> metadata
) {
    public TopPerformerResponse(UUID id, String name, double averageScore, long attempts) {
        this(id, name, "student", averageScore, "diem", 0.0, null, Map.of("averageScore", averageScore, "attempts", attempts));
    }
}
