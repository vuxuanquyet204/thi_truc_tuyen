package com.dao.examservice.dto.response;

import com.dao.examservice.entity.Question;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class QuestionWithOptionsResponse {
    public UUID id;
    public Question.QuestionType type;
    public String content;
    public Integer difficulty;
    public String explanation;
    public Integer score;
    public String text;
    public Instant createdAt;
    public Instant updatedAt;
    public List<OptionResponse> options;
    
    public static class OptionResponse {
        public UUID id;
        public String content;
        public boolean isCorrect;
        
        public OptionResponse() {}
        
        public OptionResponse(UUID id, String content, boolean isCorrect) {
            this.id = id;
            this.content = content;
            this.isCorrect = isCorrect;
        }
    }
}
