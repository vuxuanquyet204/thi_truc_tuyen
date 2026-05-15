package com.dao.courseservice.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssuedCertificateRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotNull(message = "Profile ID is required")
    private UUID profileId;

    @NotNull(message = "Course ID is required")
    private UUID courseId;

    private UUID templateId;

    @NotBlank(message = "Recipient name is required")
    private String recipientName;

    @Email(message = "Invalid email format")
    private String recipientEmail;

    private UUID organizationId;

    private String organizationName;

    private String courseName;

    private String blockchainHash;

    private Integer validityMonths;

    private String metadata; // JSON string
}
