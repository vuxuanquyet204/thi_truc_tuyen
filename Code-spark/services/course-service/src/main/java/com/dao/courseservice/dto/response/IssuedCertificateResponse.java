package com.dao.courseservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssuedCertificateResponse {
    private UUID id;
    private UUID templateId;
    private String templateName;
    private UUID userId;
    private String recipientId;
    private String recipientName;
    private String recipientEmail;
    private UUID organizationId;
    private String organizationName;
    private UUID courseId;
    private String courseName;
    private String certificateNumber;
    private String issuedBy;
    private LocalDateTime issuedAt;
    private LocalDateTime expiresAt;
    private String status;
    private String verificationCode;
    private String verificationUrl;
    private String blockchainHash;
    private String downloadUrl;
    private String viewUrl;
    private String metadata;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
