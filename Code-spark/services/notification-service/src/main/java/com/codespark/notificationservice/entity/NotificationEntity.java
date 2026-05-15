package com.codespark.notificationservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "notifications",
       indexes = {
           @Index(name = "idx_notification_recipient", columnList = "recipientUserId"),
           @Index(name = "idx_notification_created", columnList = "createdAt DESC"),
           @Index(name = "idx_notification_read", columnList = "recipientUserId, read")
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String recipientUserId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private String type;

    private String severity;

    @Column(columnDefinition = "TEXT")
    private String data;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean read = false;
}
