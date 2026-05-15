package com.dao.courseservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateTemplateRequest {

    @NotBlank(message = "Template name is required")
    private String name;

    private String description;

    private UUID organizationId;

    private UUID courseId;

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

    private String requirements; // JSON string

    private String templateDesign; // JSON string

    private String metadata; // JSON string
}
