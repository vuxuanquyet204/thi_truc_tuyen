package com.dao.courseservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "cm_certificate_templates", indexes = {
    @Index(name = "idx_cm_cert_templates_org", columnList = "organization_id"),
    @Index(name = "idx_cm_cert_templates_course", columnList = "course_id"),
    @Index(name = "idx_cm_cert_templates_default", columnList = "organization_id, is_default"),
    @Index(name = "idx_cm_cert_templates_category", columnList = "category"),
    @Index(name = "idx_cm_cert_templates_level", columnList = "level"),
    @Index(name = "idx_cm_cert_templates_active", columnList = "is_active")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "background_image_url", columnDefinition = "TEXT")
    private String backgroundImageUrl;

    @Column(name = "border_style", length = 100)
    private String borderStyle;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "signature_url", columnDefinition = "TEXT")
    private String signatureUrl;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean isDefault = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // ========== NEW FIELDS TO MATCH FRONTEND ==========
    @Column(length = 50)
    private String category; // course_completion, skill_assessment, professional_development, etc.

    @Column(length = 50)
    private String level; // beginner, intermediate, advanced, expert, master

    @Column(name = "validity_period")
    private Integer validityPeriod; // months

    @Column(length = 255)
    private String issuer;

    @Column(name = "issuer_logo_url", columnDefinition = "TEXT")
    private String issuerLogoUrl;

    @Column(columnDefinition = "TEXT")
    private String requirements; // JSON string of CertificateRequirement[]

    @Column(columnDefinition = "TEXT")
    private String templateDesign; // JSON string of TemplateDesign

    @Column(columnDefinition = "TEXT")
    private String metadata; // JSON string of CertificateMetadata

    // ========== TIMESTAMPS ==========
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
