package com.codespark.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendNotificationRequest {
    private String recipientUserId;
    private String title;
    private String content;
    private String type;
    private String severity;
    private Map<String, Object> data;
}
