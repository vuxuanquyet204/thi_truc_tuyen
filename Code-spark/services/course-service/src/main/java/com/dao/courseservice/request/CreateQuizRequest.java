package com.dao.courseservice.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.UUID;

@Data
public class CreateQuizRequest {
    @NotBlank(message = "Quiz title cannot be blank")
    private String title;

    private String description;

    private Integer timeLimitMinutes;

    private String subject;

    @Min(value = 1, message = "Số câu hỏi phải từ 1 trở lên")
    private Integer questionCount;
}