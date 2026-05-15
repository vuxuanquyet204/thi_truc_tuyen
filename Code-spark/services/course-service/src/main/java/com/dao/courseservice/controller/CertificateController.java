package com.dao.courseservice.controller;

import com.dao.courseservice.dto.request.CertificateTemplateRequest;
import com.dao.courseservice.dto.request.IssuedCertificateRequest;
import com.dao.courseservice.dto.response.*;
import com.dao.courseservice.service.CertificateService;
import com.dao.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    // ========== PUBLIC CERTIFICATE TEMPLATE ENDPOINTS (No auth required) ==========

    @GetMapping("/templates/public")
    public ResponseEntity<ApiResponse<Page<CertificateTemplateResponse>>> getPublicTemplates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level) {
        Page<CertificateTemplateResponse> templates = certificateService.getPublicTemplates(page, size, category, level);
        return ResponseEntity.ok(ApiResponse.success("Templates fetched successfully", templates));
    }

    @GetMapping("/templates/public/{id}")
    public ResponseEntity<ApiResponse<CertificateTemplateResponse>> getPublicTemplateById(@PathVariable UUID id) {
        CertificateTemplateResponse template = certificateService.getPublicTemplateById(id);
        return ResponseEntity.ok(ApiResponse.success("Template fetched successfully", template));
    }

    // ========== CERTIFICATE TEMPLATE ENDPOINTS (ADMIN only) ==========

    @GetMapping("/templates")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Page<CertificateTemplateResponse>>> getTemplates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) UUID organizationId) {
        Page<CertificateTemplateResponse> templates = certificateService.getTemplates(page, size, category, level, organizationId);
        return ResponseEntity.ok(ApiResponse.success("Templates fetched successfully", templates));
    }

    @GetMapping("/templates/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<CertificateTemplateResponse>> getTemplateById(@PathVariable UUID id) {
        CertificateTemplateResponse template = certificateService.getTemplateById(id);
        return ResponseEntity.ok(ApiResponse.success("Template fetched successfully", template));
    }

    @PostMapping("/templates")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<CertificateTemplateResponse>> createTemplate(
            @Valid @RequestBody CertificateTemplateRequest request) {
        CertificateTemplateResponse template = certificateService.createTemplate(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Template created successfully", template));
    }

    @PutMapping("/templates/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<CertificateTemplateResponse>> updateTemplate(
            @PathVariable UUID id,
            @Valid @RequestBody CertificateTemplateRequest request) {
        CertificateTemplateResponse template = certificateService.updateTemplate(id, request);
        return ResponseEntity.ok(ApiResponse.success("Template updated successfully", template));
    }

    @DeleteMapping("/templates/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTemplate(@PathVariable UUID id) {
        certificateService.deleteTemplate(id);
        return ResponseEntity.ok(ApiResponse.success("Template deleted successfully", null));
    }

    @PatchMapping("/templates/{id}/toggle")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<CertificateTemplateResponse>> toggleTemplateStatus(@PathVariable UUID id) {
        certificateService.toggleTemplateStatus(id);
        CertificateTemplateResponse template = certificateService.getTemplateById(id);
        return ResponseEntity.ok(ApiResponse.success("Template status toggled successfully", template));
    }

    // ========== ISSUED CERTIFICATE ENDPOINTS ==========

    @GetMapping("/issued")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Page<IssuedCertificateResponse>>> getIssuedCertificates(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID organizationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<IssuedCertificateResponse> certificates = certificateService.getIssuedCertificates(
                search, status, organizationId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Certificates fetched successfully", certificates));
    }

    @GetMapping("/issued/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<IssuedCertificateResponse>> getIssuedCertificateById(@PathVariable UUID id) {
        IssuedCertificateResponse certificate = certificateService.getIssuedCertificateById(id);
        return ResponseEntity.ok(ApiResponse.success("Certificate fetched successfully", certificate));
    }

    @PostMapping("/issued")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<IssuedCertificateResponse>> issueCertificate(
            @Valid @RequestBody IssuedCertificateRequest request) {
        IssuedCertificateResponse certificate = certificateService.issueCertificate(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Certificate issued successfully", certificate));
    }

    @PatchMapping("/issued/{id}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<IssuedCertificateResponse>> updateCertificateStatus(
            @PathVariable UUID id,
            @RequestParam String status) {
        IssuedCertificateResponse certificate = certificateService.updateCertificateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Certificate status updated successfully", certificate));
    }

    @DeleteMapping("/issued/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCertificate(@PathVariable UUID id) {
        certificateService.deleteCertificate(id);
        return ResponseEntity.ok(ApiResponse.success("Certificate deleted successfully", null));
    }

    // ========== STATISTICS & VERIFICATION ENDPOINTS ==========

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<CertificateStatsResponse>> getStats() {
        CertificateStatsResponse stats = certificateService.getStats();
        return ResponseEntity.ok(ApiResponse.success("Stats fetched successfully", stats));
    }

    @GetMapping("/verify/{certificateNumber}")
    public ResponseEntity<ApiResponse<CertificateVerificationResponse>> verifyCertificate(
            @PathVariable String certificateNumber) {
        CertificateVerificationResponse result = certificateService.verifyCertificate(certificateNumber);
        return ResponseEntity.ok(ApiResponse.success("Verification result", result));
    }

    // Public endpoint for users to view their certificates
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<IssuedCertificateResponse>>> getMyCertificates(
            @RequestParam UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<IssuedCertificateResponse> certificates =
                certificateService.getIssuedCertificates(null, "ACTIVE", null, page, size);
        return ResponseEntity.ok(ApiResponse.success("My certificates fetched successfully", certificates));
    }
}
