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
public class CertificateTemplateResponse {
    private UUID id;
    private UUID organizationId;
    private UUID courseId;
    private String courseName;
    private String name;
    private String description;
    private String backgroundImageUrl;
    private String borderStyle;
    private String logoUrl;
    private String signatureUrl;
    private Boolean isDefault;
    private Boolean isActive;
    private String category;
    private String level;
    private Integer validityPeriod;
    private String issuer;
    private String issuerLogoUrl;
    private String requirements;
    private String templateDesign;
    private String metadata;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
