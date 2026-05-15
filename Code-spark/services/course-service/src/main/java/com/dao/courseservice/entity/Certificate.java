package com.dao.courseservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "cm_certificates", indexes = {
    @Index(name = "idx_cm_cert_user", columnList = "user_id"),
    @Index(name = "idx_cm_cert_profile", columnList = "profile_id"),
    @Index(name = "idx_cm_cert_course", columnList = "course_id"),
    @Index(name = "idx_cm_cert_number", columnList = "certificate_number"),
    @Index(name = "idx_cm_cert_status", columnList = "status"),
    @Index(name = "idx_cm_cert_template", columnList = "template_id"),
    @Index(name = "idx_cm_cert_org", columnList = "organization_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "profile_id", nullable = false)
    private UUID profileId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "certificate_number", nullable = false, unique = true, length = 100)
    private String certificateNumber;

    @Column(name = "issued_by")
    private UUID issuedBy;

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "verification_url", columnDefinition = "TEXT")
    private String verificationUrl;

    @Column(name = "credential_id", length = 255)
    private String credentialId;

    @Column(columnDefinition = "TEXT")
    private String metadata;

    // ========== NEW FIELDS ==========
    @Column(name = "template_id")
    private UUID templateId;

    @Column(name = "template_name")
    private String templateName;

    @Column(name = "recipient_name")
    private String recipientName;

    @Column(name = "recipient_email")
    private String recipientEmail;

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(name = "organization_name")
    private String organizationName;

    @Column(name = "course_name")
    private String courseName;

    @Column(name = "blockchain_hash", columnDefinition = "TEXT")
    private String blockchainHash;

    @Column(name = "download_url", columnDefinition = "TEXT")
    private String downloadUrl;

    @Column(name = "view_url", columnDefinition = "TEXT")
    private String viewUrl;

    // ========== TIMESTAMPS ==========
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "certificate", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<CertificateIssuance> issuances = new HashSet<>();

    @OneToMany(mappedBy = "certificate", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<CertificateSkill> skills = new HashSet<>();

    public UUID getCourseId() {
        return course == null ? null : course.getId();
    }
}
