package com.dao.examservice.dto.request;

import java.util.List;
import java.util.Set;

public class QuestionSearchRequest {
    public Set<String> tags;
    public Integer minDifficulty;
    public Integer maxDifficulty;

    public List<String> getTagsAsList() {
        return tags == null ? List.of() : List.copyOf(tags);
    }
}
