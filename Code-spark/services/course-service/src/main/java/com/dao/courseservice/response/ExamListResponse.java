package com.dao.courseservice.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ExamListResponse {
    private UUID id;
    private UUID courseId;
    private String title;
    private String description;
    private Instant startAt;
    private Instant endAt;
    private Integer durationMinutes;
    private Integer passScore;
    private Integer maxAttempts;
    private Integer totalQuestions;
    private Integer assignedQuestionCount;
    private UUID createdBy;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
    private List<String> tags;
}
