package com.dao.courseservice.repository;

import com.dao.courseservice.entity.Certificate;
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
public interface CertificateRepository extends JpaRepository<Certificate, UUID> {

    List<Certificate> findByUserId(UUID userId);

    List<Certificate> findByProfileId(UUID profileId);

    @Query("SELECT c FROM Certificate c WHERE c.course.id = :courseId")
    List<Certificate> findByCourseId(@Param("courseId") UUID courseId);

    Optional<Certificate> findByCertificateNumber(String certificateNumber);

    boolean existsByCertificateNumber(String certificateNumber);

    @Query("SELECT c FROM Certificate c WHERE c.userId = :userId AND c.status = 'ACTIVE'")
    List<Certificate> findActiveByUserId(@Param("userId") UUID userId);

    @Query("SELECT c FROM Certificate c WHERE c.profileId = :profileId AND c.status = 'ACTIVE'")
    Page<Certificate> findActiveByProfileId(@Param("profileId") UUID profileId, Pageable pageable);

    @Query("SELECT c FROM Certificate c WHERE c.userId = :userId AND c.course.id = :courseId AND c.status = 'ACTIVE'")
    boolean existsActiveByUserIdAndCourseId(@Param("userId") UUID userId, @Param("courseId") UUID courseId);

    @Query("SELECT c FROM Certificate c LEFT JOIN FETCH c.skills WHERE c.id = :id")
    Optional<Certificate> findByIdWithSkills(@Param("id") UUID id);

    // ========== ADMIN QUERIES ==========
    Page<Certificate> findAll(Pageable pageable);

    Page<Certificate> findByStatus(String status, Pageable pageable);

    Page<Certificate> findByOrganizationId(UUID organizationId, Pageable pageable);

    // Search by recipient name, certificate number, or organization name
    @Query("SELECT c FROM Certificate c WHERE " +
           "LOWER(c.recipientName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.certificateNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.organizationName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Certificate> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // Combined filter
    @Query("SELECT c FROM Certificate c WHERE " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:organizationId IS NULL OR c.organizationId = :organizationId)")
    Page<Certificate> findWithFilters(
            @Param("status") String status,
            @Param("organizationId") UUID organizationId,
            Pageable pageable);

    // Statistics
    @Query("SELECT c.status, COUNT(c) FROM Certificate c GROUP BY c.status")
    List<Object[]> countByStatus();

    @Query("SELECT COUNT(c) FROM Certificate c WHERE c.status = :status")
    long countByStatus(@Param("status") String status);
}
