package com.dao.analyticsservice.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {
    private UUID courseId;
    private String courseTitle;
    private String reason;
    private Double confidenceScore;
}
