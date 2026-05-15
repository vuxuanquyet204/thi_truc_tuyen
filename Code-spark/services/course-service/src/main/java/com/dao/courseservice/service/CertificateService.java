package com.dao.courseservice.service;

import com.dao.courseservice.dto.request.CertificateTemplateRequest;
import com.dao.courseservice.dto.request.IssuedCertificateRequest;
import com.dao.courseservice.dto.response.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface CertificateService {

    // CertificateTemplate CRUD
    Page<CertificateTemplateResponse> getTemplates(int page, int size, String category, String level, UUID organizationId);
    CertificateTemplateResponse getTemplateById(UUID id);
    CertificateTemplateResponse createTemplate(CertificateTemplateRequest request);
    CertificateTemplateResponse updateTemplate(UUID id, CertificateTemplateRequest request);
    void deleteTemplate(UUID id);
    void toggleTemplateStatus(UUID id);

    // Public CertificateTemplate (no auth)
    Page<CertificateTemplateResponse> getPublicTemplates(int page, int size, String category, String level);
    CertificateTemplateResponse getPublicTemplateById(UUID id);

    // IssuedCertificate CRUD
    Page<IssuedCertificateResponse> getIssuedCertificates(String search, String status, UUID organizationId, int page, int size);
    IssuedCertificateResponse getIssuedCertificateById(UUID id);
    IssuedCertificateResponse issueCertificate(IssuedCertificateRequest request);
    IssuedCertificateResponse updateCertificateStatus(UUID id, String status);
    void deleteCertificate(UUID id);

    // Statistics & Verification
    CertificateStatsResponse getStats();
    CertificateVerificationResponse verifyCertificate(String certificateNumber);
}
