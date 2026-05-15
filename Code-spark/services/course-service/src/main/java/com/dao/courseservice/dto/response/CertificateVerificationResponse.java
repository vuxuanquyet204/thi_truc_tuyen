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
public class CertificateVerificationResponse {
    private boolean isValid;
    private UUID certificateId;
    private String certificateNumber;
    private String recipientName;
    private String courseName;
    private LocalDateTime issuedAt;
    private LocalDateTime expiresAt;
    private String status;
    private String message;
}
