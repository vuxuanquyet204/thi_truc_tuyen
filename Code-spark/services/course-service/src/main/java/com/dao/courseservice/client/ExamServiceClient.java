package com.dao.courseservice.client;

import com.dao.courseservice.response.ExamListResponse;
import com.dao.courseservice.response.ExamQuestionResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

@FeignClient(
    name = "exam-service",
    url = "${app.services.exam-service.url}"
)
public interface ExamServiceClient {

    @GetMapping("/exams")
    Page<ExamListResponse> getExams(Pageable pageable);

    @GetMapping("/exams/{id}")
    ExamListResponse getExamById(@PathVariable("id") UUID id);

    @GetMapping("/exams/{id}/questions-with-options")
    List<ExamQuestionResponse> getExamQuestionsWithOptions(@PathVariable("id") UUID examId);

    @GetMapping("/exams/questions/search")
    List<ExamQuestionResponse> searchQuestions(
            @RequestParam(required = false) List<String> tags,
            @RequestParam(required = false) Integer minDifficulty,
            @RequestParam(required = false) Integer maxDifficulty,
            @RequestParam(defaultValue = "1000") int limit
    );
}
