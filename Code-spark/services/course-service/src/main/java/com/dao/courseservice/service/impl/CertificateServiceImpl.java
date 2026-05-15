package com.dao.courseservice.service.impl;

import com.dao.courseservice.dto.request.CertificateTemplateRequest;
import com.dao.courseservice.dto.request.IssuedCertificateRequest;
import com.dao.courseservice.dto.response.*;
import com.dao.courseservice.entity.Certificate;
import com.dao.courseservice.entity.CertificateTemplate;
import com.dao.courseservice.entity.Course;
import com.dao.courseservice.repository.CertificateRepository;
import com.dao.courseservice.repository.CertificateTemplateRepository;
import com.dao.courseservice.repository.CourseRepository;
import com.dao.courseservice.service.CertificateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CertificateServiceImpl implements CertificateService {

    private final CertificateTemplateRepository templateRepository;
    private final CertificateRepository certificateRepository;
    private final CourseRepository courseRepository;

    // ========== CERTIFICATE TEMPLATE METHODS ==========

    @Override
    public Page<CertificateTemplateResponse> getTemplates(int page, int size, String category, String level, UUID organizationId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<CertificateTemplate> templates = templateRepository.findWithFilters(category, level, organizationId, pageable);
        return templates.map(this::mapToTemplateResponse);
    }

    @Override
    public CertificateTemplateResponse getTemplateById(UUID id) {
        CertificateTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found: " + id));
        return mapToTemplateResponse(template);
    }

    @Override
    public CertificateTemplateResponse createTemplate(CertificateTemplateRequest request) {
        CertificateTemplate template = CertificateTemplate.builder()
                .name(request.getName())
                .description(request.getDescription())
                .organizationId(request.getOrganizationId())
                .course(request.getCourseId() != null ? courseRepository.findById(request.getCourseId()).orElse(null) : null)
                .backgroundImageUrl(request.getBackgroundImageUrl())
                .borderStyle(request.getBorderStyle())
                .logoUrl(request.getLogoUrl())
                .signatureUrl(request.getSignatureUrl())
                .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .category(request.getCategory())
                .level(request.getLevel())
                .validityPeriod(request.getValidityPeriod())
                .issuer(request.getIssuer())
                .issuerLogoUrl(request.getIssuerLogoUrl())
                .requirements(request.getRequirements())
                .templateDesign(request.getTemplateDesign())
                .metadata(request.getMetadata())
                .build();

        CertificateTemplate saved = templateRepository.save(template);
        log.info("Created certificate template: {}", saved.getId());
        return mapToTemplateResponse(saved);
    }

    @Override
    public CertificateTemplateResponse updateTemplate(UUID id, CertificateTemplateRequest request) {
        CertificateTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found: " + id));

        if (request.getName() != null) template.setName(request.getName());
        if (request.getDescription() != null) template.setDescription(request.getDescription());
        if (request.getOrganizationId() != null) template.setOrganizationId(request.getOrganizationId());
        if (request.getCourseId() != null) template.setCourse(courseRepository.findById(request.getCourseId()).orElse(null));
        if (request.getBackgroundImageUrl() != null) template.setBackgroundImageUrl(request.getBackgroundImageUrl());
        if (request.getBorderStyle() != null) template.setBorderStyle(request.getBorderStyle());
        if (request.getLogoUrl() != null) template.setLogoUrl(request.getLogoUrl());
        if (request.getSignatureUrl() != null) template.setSignatureUrl(request.getSignatureUrl());
        if (request.getIsDefault() != null) template.setIsDefault(request.getIsDefault());
        if (request.getIsActive() != null) template.setIsActive(request.getIsActive());
        if (request.getCategory() != null) template.setCategory(request.getCategory());
        if (request.getLevel() != null) template.setLevel(request.getLevel());
        if (request.getValidityPeriod() != null) template.setValidityPeriod(request.getValidityPeriod());
        if (request.getIssuer() != null) template.setIssuer(request.getIssuer());
        if (request.getIssuerLogoUrl() != null) template.setIssuerLogoUrl(request.getIssuerLogoUrl());
        if (request.getRequirements() != null) template.setRequirements(request.getRequirements());
        if (request.getTemplateDesign() != null) template.setTemplateDesign(request.getTemplateDesign());
        if (request.getMetadata() != null) template.setMetadata(request.getMetadata());

        CertificateTemplate saved = templateRepository.save(template);
        log.info("Updated certificate template: {}", saved.getId());
        return mapToTemplateResponse(saved);
    }

    @Override
    public void deleteTemplate(UUID id) {
        if (!templateRepository.existsById(id)) {
            throw new RuntimeException("Template not found: " + id);
        }
        templateRepository.deleteById(id);
        log.info("Deleted certificate template: {}", id);
    }

    @Override
    public void toggleTemplateStatus(UUID id) {
        CertificateTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found: " + id));
        template.setIsActive(!template.getIsActive());
        templateRepository.save(template);
        log.info("Toggled certificate template status: {} -> {}", id, template.getIsActive());
    }

    @Override
    public Page<CertificateTemplateResponse> getPublicTemplates(int page, int size, String category, String level) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<CertificateTemplate> templates = templateRepository.findPublicTemplates(category, level, pageable);
        return templates.map(this::mapToTemplateResponse);
    }

    @Override
    public CertificateTemplateResponse getPublicTemplateById(UUID id) {
        CertificateTemplate template = templateRepository.findById(id)
                .filter(CertificateTemplate::getIsActive)
                .orElseThrow(() -> new RuntimeException("Template not found or inactive: " + id));
        return mapToTemplateResponse(template);
    }

    // ========== ISSUED CERTIFICATE METHODS ==========

    @Override
    public Page<IssuedCertificateResponse> getIssuedCertificates(String search, String status, UUID organizationId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "issuedAt"));
        Page<Certificate> certificates;

        if (search != null && !search.isBlank()) {
            certificates = certificateRepository.searchByKeyword(search.trim(), pageable);
        } else if (status != null && organizationId != null) {
            certificates = certificateRepository.findWithFilters(status, organizationId, pageable);
        } else if (status != null) {
            certificates = certificateRepository.findByStatus(status, pageable);
        } else {
            certificates = certificateRepository.findAll(pageable);
        }

        return certificates.map(this::mapToIssuedCertificateResponse);
    }

    @Override
    public IssuedCertificateResponse getIssuedCertificateById(UUID id) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certificate not found: " + id));
        return mapToIssuedCertificateResponse(certificate);
    }

    @Override
    public IssuedCertificateResponse issueCertificate(IssuedCertificateRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found: " + request.getCourseId()));

        // Generate unique certificate number
        String certNumber = generateCertificateNumber();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = null;
        if (request.getValidityMonths() != null && request.getValidityMonths() > 0) {
            expiresAt = now.plusMonths(request.getValidityMonths());
        }

        Certificate certificate = Certificate.builder()
                .userId(request.getUserId())
                .profileId(request.getProfileId())
                .course(course)
                .templateId(request.getTemplateId())
                .recipientName(request.getRecipientName())
                .recipientEmail(request.getRecipientEmail())
                .organizationId(request.getOrganizationId())
                .organizationName(request.getOrganizationName())
                .courseName(course.getTitle())
                .certificateNumber(certNumber)
                .issuedBy(null) // Set by caller (admin user ID)
                .issuedAt(now)
                .expiresAt(expiresAt)
                .status("ACTIVE")
                .blockchainHash(request.getBlockchainHash())
                .metadata(request.getMetadata())
                .verificationUrl("/verify/" + certNumber)
                .build();

        Certificate saved = certificateRepository.save(certificate);
        log.info("Issued certificate: {} to {}", saved.getCertificateNumber(), saved.getRecipientName());
        return mapToIssuedCertificateResponse(saved);
    }

    @Override
    public IssuedCertificateResponse updateCertificateStatus(UUID id, String status) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certificate not found: " + id));
        certificate.setStatus(status.toUpperCase());
        Certificate saved = certificateRepository.save(certificate);
        log.info("Updated certificate status: {} -> {}", id, status);
        return mapToIssuedCertificateResponse(saved);
    }

    @Override
    public void deleteCertificate(UUID id) {
        if (!certificateRepository.existsById(id)) {
            throw new RuntimeException("Certificate not found: " + id);
        }
        certificateRepository.deleteById(id);
        log.info("Deleted certificate: {}", id);
    }

    // ========== STATISTICS & VERIFICATION ==========

    @Override
    public CertificateStatsResponse getStats() {
        long totalTemplates = templateRepository.count();
        long activeTemplates = templateRepository.findByIsActiveTrue().size();
        long totalIssued = certificateRepository.count();
        long activeCerts = certificateRepository.countByStatus("ACTIVE");
        long expiredCerts = certificateRepository.countByStatus("EXPIRED");
        long revokedCerts = certificateRepository.countByStatus("REVOKED");
        long pendingCerts = certificateRepository.countByStatus("PENDING");

        // Get category distribution
        List<CertificateStatsResponse.CategoryCount> byCategory = templateRepository.countByCategory().stream()
                .map(row -> CertificateStatsResponse.CategoryCount.builder()
                        .category((String) row[0])
                        .count((Long) row[1])
                        .build())
                .collect(Collectors.toList());

        // Get level distribution
        List<CertificateStatsResponse.LevelCount> byLevel = templateRepository.countByLevel().stream()
                .map(row -> CertificateStatsResponse.LevelCount.builder()
                        .level((String) row[0])
                        .count((Long) row[1])
                        .build())
                .collect(Collectors.toList());

        // Get status distribution
        List<CertificateStatsResponse.StatusCount> byStatus = certificateRepository.countByStatus().stream()
                .map(row -> CertificateStatsResponse.StatusCount.builder()
                        .status((String) row[0])
                        .count((Long) row[1])
                        .build())
                .collect(Collectors.toList());

        return CertificateStatsResponse.builder()
                .totalTemplates(totalTemplates)
                .activeTemplates(activeTemplates)
                .totalIssued(totalIssued)
                .activeCertificates(activeCerts)
                .expiredCertificates(expiredCerts)
                .revokedCertificates(revokedCerts)
                .pendingCertificates(pendingCerts)
                .totalRecipients(certificateRepository.findAll().stream()
                        .map(Certificate::getUserId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet())
                        .size())
                .totalOrganizations(certificateRepository.findAll().stream()
                        .map(Certificate::getOrganizationId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet())
                        .size())
                .averageValidityPeriod(12.0) // Default
                .mostPopularCategory(!byCategory.isEmpty() ? byCategory.get(0).getCategory() : null)
                .mostPopularLevel(!byLevel.isEmpty() ? byLevel.get(0).getLevel() : null)
                .certificatesByCategory(byCategory)
                .certificatesByLevel(byLevel)
                .certificatesByStatus(byStatus)
                .monthlyIssuance(Collections.emptyList())
                .build();
    }

    @Override
    public CertificateVerificationResponse verifyCertificate(String certificateNumber) {
        Optional<Certificate> certificateOpt = certificateRepository.findByCertificateNumber(certificateNumber);

        if (certificateOpt.isEmpty()) {
            return CertificateVerificationResponse.builder()
                    .isValid(false)
                    .message("Certificate not found")
                    .build();
        }

        Certificate cert = certificateOpt.get();
        boolean isValid = "ACTIVE".equals(cert.getStatus()) &&
                (cert.getExpiresAt() == null || cert.getExpiresAt().isAfter(LocalDateTime.now()));

        return CertificateVerificationResponse.builder()
                .isValid(isValid)
                .certificateId(cert.getId())
                .certificateNumber(cert.getCertificateNumber())
                .recipientName(cert.getRecipientName())
                .courseName(cert.getCourseName())
                .issuedAt(cert.getIssuedAt())
                .expiresAt(cert.getExpiresAt())
                .status(cert.getStatus())
                .message(isValid ? "Certificate is valid" : "Certificate is " + cert.getStatus().toLowerCase())
                .build();
    }

    // ========== HELPER METHODS ==========

    private String generateCertificateNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = String.format("%06d", new Random().nextInt(999999));
        return "CERT-" + timestamp + "-" + random;
    }

    private CertificateTemplateResponse mapToTemplateResponse(CertificateTemplate template) {
        return CertificateTemplateResponse.builder()
                .id(template.getId())
                .organizationId(template.getOrganizationId())
                .courseId(template.getCourse() != null ? template.getCourse().getId() : null)
                .courseName(template.getCourse() != null ? template.getCourse().getTitle() : null)
                .name(template.getName())
                .description(template.getDescription())
                .backgroundImageUrl(template.getBackgroundImageUrl())
                .borderStyle(template.getBorderStyle())
                .logoUrl(template.getLogoUrl())
                .signatureUrl(template.getSignatureUrl())
                .isDefault(template.getIsDefault())
                .isActive(template.getIsActive())
                .category(template.getCategory())
                .level(template.getLevel())
                .validityPeriod(template.getValidityPeriod())
                .issuer(template.getIssuer())
                .issuerLogoUrl(template.getIssuerLogoUrl())
                .requirements(template.getRequirements())
                .templateDesign(template.getTemplateDesign())
                .metadata(template.getMetadata())
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }

    private IssuedCertificateResponse mapToIssuedCertificateResponse(Certificate certificate) {
        return IssuedCertificateResponse.builder()
                .id(certificate.getId())
                .templateId(certificate.getTemplateId())
                .templateName(certificate.getTemplateName())
                .userId(certificate.getUserId())
                .recipientId(certificate.getUserId() != null ? certificate.getUserId().toString() : null)
                .recipientName(certificate.getRecipientName())
                .recipientEmail(certificate.getRecipientEmail())
                .organizationId(certificate.getOrganizationId())
                .organizationName(certificate.getOrganizationName())
                .courseId(certificate.getCourse() != null ? certificate.getCourse().getId() : null)
                .courseName(certificate.getCourseName())
                .certificateNumber(certificate.getCertificateNumber())
                .issuedBy(certificate.getIssuedBy() != null ? certificate.getIssuedBy().toString() : null)
                .issuedAt(certificate.getIssuedAt())
                .expiresAt(certificate.getExpiresAt())
                .status(certificate.getStatus())
                .verificationCode(certificate.getCertificateNumber())
                .verificationUrl(certificate.getVerificationUrl())
                .blockchainHash(certificate.getBlockchainHash())
                .downloadUrl(certificate.getDownloadUrl())
                .viewUrl(certificate.getViewUrl())
                .metadata(certificate.getMetadata())
                .createdAt(certificate.getCreatedAt())
                .updatedAt(certificate.getUpdatedAt())
                .build();
    }
}
