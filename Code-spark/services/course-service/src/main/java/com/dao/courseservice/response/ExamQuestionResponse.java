package com.dao.courseservice.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties(ignoreUnknown = true)
public class ExamQuestionResponse {
    private UUID id;
    private String type;
    private String content;
    private Integer difficulty;
    private String explanation;
    private Integer score;
    private String text;
    private Instant createdAt;
    private Instant updatedAt;
    private List<ExamQuestionOptionResponse> options;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ExamQuestionOptionResponse {
        private UUID id;
        private String content;
        private boolean isCorrect;
    }
}
