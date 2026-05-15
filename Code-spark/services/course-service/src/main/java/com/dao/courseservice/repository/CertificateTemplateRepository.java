package com.dao.courseservice.repository;

import com.dao.courseservice.entity.CertificateTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CertificateTemplateRepository extends JpaRepository<CertificateTemplate, UUID> {

    List<CertificateTemplate> findByOrganizationId(UUID organizationId);

    Optional<CertificateTemplate> findByOrganizationIdAndIsDefaultTrue(UUID organizationId);

    List<CertificateTemplate> findByIsActiveTrue();

    Page<CertificateTemplate> findByIsActiveTrue(Pageable pageable);

    // Search by name or description
    @Query("SELECT ct FROM CertificateTemplate ct WHERE ct.isActive = true AND " +
           "(LOWER(ct.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(ct.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<CertificateTemplate> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // Filter by category
    List<CertificateTemplate> findByIsActiveTrueAndCategory(String category);

    // Filter by level
    List<CertificateTemplate> findByIsActiveTrueAndLevel(String level);

    // Combined filter
    @Query("SELECT ct FROM CertificateTemplate ct WHERE ct.isActive = true " +
           "AND (:category IS NULL OR ct.category = :category) " +
           "AND (:level IS NULL OR ct.level = :level) " +
           "AND (:organizationId IS NULL OR ct.organizationId = :organizationId)")
    Page<CertificateTemplate> findWithFilters(
            @Param("category") String category,
            @Param("level") String level,
            @Param("organizationId") UUID organizationId,
            Pageable pageable);

    // Count by category
    @Query("SELECT ct.category, COUNT(ct) FROM CertificateTemplate ct WHERE ct.isActive = true GROUP BY ct.category")
    List<Object[]> countByCategory();

    // Count by level
    @Query("SELECT ct.level, COUNT(ct) FROM CertificateTemplate ct WHERE ct.isActive = true GROUP BY ct.level")
    List<Object[]> countByLevel();

    // Public templates: active only, filter by category/level
    @Query("SELECT ct FROM CertificateTemplate ct WHERE ct.isActive = true " +
           "AND (:category IS NULL OR ct.category = :category) " +
           "AND (:level IS NULL OR ct.level = :level)")
    Page<CertificateTemplate> findPublicTemplates(
            @Param("category") String category,
            @Param("level") String level,
            Pageable pageable);
}
