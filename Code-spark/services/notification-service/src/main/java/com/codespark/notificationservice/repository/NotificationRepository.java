package com.codespark.notificationservice.repository;

import com.codespark.notificationservice.entity.NotificationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, String> {

    Page<NotificationEntity> findByRecipientUserIdOrderByCreatedAtDesc(String recipientUserId, Pageable pageable);

    Page<NotificationEntity> findByRecipientUserIdAndReadOrderByCreatedAtDesc(
            String recipientUserId, boolean read, Pageable pageable);

    Page<NotificationEntity> findByRecipientUserIdAndTypeOrderByCreatedAtDesc(
            String recipientUserId, String type, Pageable pageable);

    long countByRecipientUserIdAndRead(String recipientUserId, boolean read);

    @Modifying
    @Query("UPDATE NotificationEntity n SET n.read = true WHERE n.recipientUserId = :userId AND n.read = false")
    int markAllAsRead(@Param("userId") String userId);

    @Modifying
    @Query("UPDATE NotificationEntity n SET n.read = true WHERE n.id = :id AND n.recipientUserId = :userId")
    int markAsRead(@Param("id") String id, @Param("userId") String userId);

    @Modifying
    @Query("DELETE FROM NotificationEntity n WHERE n.recipientUserId = :userId")
    int deleteAllByUserId(@Param("userId") String userId);
}
