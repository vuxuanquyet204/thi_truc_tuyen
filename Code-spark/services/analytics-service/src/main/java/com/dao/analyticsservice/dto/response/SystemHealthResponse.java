package com.dao.analyticsservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemHealthResponse {
    private String status; // healthy, warning, critical
    private double uptime;
    private double responseTime;
    private double errorRate;
    private LocalDateTime lastUpdate;
    private java.util.List<SystemAlertResponse> alerts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SystemAlertResponse {
        private String id;
        private String type; // performance, security, error, maintenance
        private String severity; // low, medium, high, critical
        private String title;
        private String message;
        private LocalDateTime timestamp;
        private boolean resolved;
    }
}
