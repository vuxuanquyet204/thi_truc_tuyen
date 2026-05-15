package com.codespark.notificationservice.service;

import com.codespark.notificationservice.dto.*;
import com.codespark.notificationservice.entity.NotificationEntity;
import com.codespark.notificationservice.repository.NotificationRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public NotificationDto save(NotificationMessage message) {
        NotificationEntity entity = NotificationEntity.builder()
                .recipientUserId(message.getRecipientUserId())
                .title(message.getTitle())
                .content(message.getContent())
                .type(message.getType() != null ? message.getType() : "INFO")
                .severity(message.getSeverity() != null ? message.getSeverity() : "low")
                .data(toJson(message.getData()))
                .createdAt(message.getCreatedAt() != null ? message.getCreatedAt() : Instant.now())
                .read(false)
                .build();

        NotificationEntity saved = repository.save(entity);
        return toDto(saved);
    }

    public NotificationPageDto getNotifications(String userId, int page, int size, String type, Boolean read) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationEntity> entityPage;

        if (type != null && !type.isBlank()) {
            entityPage = repository.findByRecipientUserIdAndTypeOrderByCreatedAtDesc(userId, type, pageable);
        } else if (read != null) {
            entityPage = repository.findByRecipientUserIdAndReadOrderByCreatedAtDesc(userId, read, pageable);
        } else {
            entityPage = repository.findByRecipientUserIdOrderByCreatedAtDesc(userId, pageable);
        }

        long unreadCount = repository.countByRecipientUserIdAndRead(userId, false);

        return NotificationPageDto.builder()
                .notifications(entityPage.getContent().stream().map(this::toDto).toList())
                .total((int) entityPage.getTotalElements())
                .page(page)
                .size(size)
                .unreadCount((int) unreadCount)
                .build();
    }

    @Transactional
    public boolean markAsRead(String id, String userId) {
        return repository.markAsRead(id, userId) > 0;
    }

    @Transactional
    public int markAllAsRead(String userId) {
        return repository.markAllAsRead(userId);
    }

    @Transactional
    public int deleteAll(String userId) {
        return repository.deleteAllByUserId(userId);
    }

    @Transactional
    public int deleteOne(String id, String userId) {
        long countBefore = repository.count();
        repository.deleteById(id);
        long countAfter = repository.count();
        return (int) (countBefore - countAfter);
    }

    public long getUnreadCount(String userId) {
        return repository.countByRecipientUserIdAndRead(userId, false);
    }

    private NotificationDto toDto(NotificationEntity entity) {
        return NotificationDto.builder()
                .id(entity.getId())
                .recipientUserId(entity.getRecipientUserId())
                .title(entity.getTitle())
                .content(entity.getContent())
                .type(entity.getType())
                .severity(entity.getSeverity())
                .data(fromJson(entity.getData()))
                .createdAt(entity.getCreatedAt())
                .read(entity.isRead())
                .build();
    }

    private String toJson(Map<String, Object> data) {
        if (data == null) return null;
        try {
            return objectMapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize notification data: {}", e.getMessage());
            return null;
        }
    }

    private Object fromJson(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, Object.class);
        } catch (JsonProcessingException e) {
            return json;
        }
    }
}
