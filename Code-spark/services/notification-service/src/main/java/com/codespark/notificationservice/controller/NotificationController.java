package com.codespark.notificationservice.controller;

import com.codespark.notificationservice.client.IdentityServiceClient;
import com.codespark.notificationservice.dto.*;
import com.codespark.notificationservice.service.NotificationService;
import com.codespark.notificationservice.sse.SseEmitterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final IdentityServiceClient identityClient;
    private final SseEmitterRegistry registry;
    private final NotificationService notificationService;

    private static final String PERM_NOTIFICATION_STREAM = "NOTIFICATION.STREAM";

    /**
     * Tao ket noi Server-Sent Events (SSE) de nhan thong bao real-time.
     *
     * @param headers Headers cua request, chua token xac thuc.
     * @return ResponseEntity chua SseEmitter de client dang ky nhan su kien.
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<SseEmitter> stream(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) String gatewayUserId,
            @RequestParam(value = "token", required = false) String queryToken) {

        // Authenticated via API Gateway (X-User-Id present) — trust gateway
        if (StringUtils.hasText(gatewayUserId)) {
            try {
                SseEmitter emitter = registry.register(gatewayUserId);
                return ResponseEntity.ok(emitter);
            } catch (Exception e) {
                log.error("SSE gateway auth failed: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        }

        // Authenticated via query token (EventSource fallback for frontend)
        if (StringUtils.hasText(queryToken)) {
            try {
                ApiResponse<Map<String, Object>> res = identityClient.validateToken(queryToken);
                if (res == null || !res.isSuccess() || res.getData() == null) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }
                Object userIdObj = res.getData().get("userId");
                if (userIdObj == null) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }

                ApiResponse<Boolean> perm = identityClient.checkPermission(queryToken, PERM_NOTIFICATION_STREAM);
                if (perm == null || !Boolean.TRUE.equals(perm.getData())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }

                String userId = String.valueOf(userIdObj);
                SseEmitter emitter = registry.register(userId);
                return ResponseEntity.ok(emitter);
            } catch (Exception e) {
                log.error("SSE query token auth failed: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        }

        // Direct call (no gateway X-User-Id, no query token) — validate Authorization header
        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7);
        try {
            ApiResponse<Map<String, Object>> res = identityClient.validateToken(token);
            if (res == null || !res.isSuccess() || res.getData() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            Object userIdObj = res.getData().get("userId");
            if (userIdObj == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            ApiResponse<Boolean> perm = identityClient.checkPermission(token, PERM_NOTIFICATION_STREAM);
            if (perm == null || !Boolean.TRUE.equals(perm.getData())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            String userId = String.valueOf(userIdObj);
            SseEmitter emitter = registry.register(userId);
            return ResponseEntity.ok(emitter);
        } catch (Exception e) {
            log.error("SSE auth failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * Lay danh sach thong bao cua nguoi dung hien tai (phan trang).
     * Co the loc theo type hoac trang thai read.
     */
    @GetMapping("/list")
    public ResponseEntity<ApiResponse<NotificationPageDto>> getNotificationsList(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean read) {

        String userId = validateAndGetUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<NotificationPageDto>builder()
                            .success(false)
                            .message("Unauthorized")
                            .build());
        }

        NotificationPageDto result = notificationService.getNotifications(userId, page, size, type, read);
        return ResponseEntity.ok(ApiResponse.<NotificationPageDto>builder()
                .success(true)
                .data(result)
                .build());
    }

    /**
     * Lay danh sach thong bao cua nguoi dung hien tai (phan trang).
     * Co the loc theo type hoac trang thai read.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<NotificationPageDto>> getNotifications(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean read) {

        String userId = validateAndGetUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<NotificationPageDto>builder()
                            .success(false)
                            .message("Unauthorized")
                            .build());
        }

        NotificationPageDto result = notificationService.getNotifications(userId, page, size, type, read);
        return ResponseEntity.ok(ApiResponse.<NotificationPageDto>builder()
                .success(true)
                .data(result)
                .build());
    }

    /**
     * Lay so luong thong bao chua doc cua nguoi dung hien tai.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {

        String userId = validateAndGetUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<Map<String, Long>>builder()
                            .success(false)
                            .message("Unauthorized")
                            .build());
        }

        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.<Map<String, Long>>builder()
                .success(true)
                .data(Map.of("count", count))
                .build());
    }

    /**
     * Danh dau mot thong bao la da doc.
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> markAsRead(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable String id) {

        String userId = validateAndGetUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<Map<String, Boolean>>builder()
                            .success(false)
                            .message("Unauthorized")
                            .build());
        }

        boolean updated = notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(ApiResponse.<Map<String, Boolean>>builder()
                .success(true)
                .data(Map.of("success", updated))
                .build());
    }

    /**
     * Danh dau tat ca thong bao la da doc.
     */
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> markAllAsRead(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {

        String userId = validateAndGetUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<Map<String, Integer>>builder()
                            .success(false)
                            .message("Unauthorized")
                            .build());
        }

        int count = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.<Map<String, Integer>>builder()
                .success(true)
                .data(Map.of("count", count))
                .build());
    }

    /**
     * Xoa mot thong bao.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> deleteNotification(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathVariable String id) {

        String userId = validateAndGetUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<Map<String, Boolean>>builder()
                            .success(false)
                            .message("Unauthorized")
                            .build());
        }

        notificationService.deleteOne(id, userId);
        return ResponseEntity.ok(ApiResponse.<Map<String, Boolean>>builder()
                .success(true)
                .data(Map.of("success", true))
                .build());
    }

    /**
     * Xoa tat ca thong bao cua nguoi dung hien tai.
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<Map<String, Integer>>> deleteAllNotifications(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {

        String userId = validateAndGetUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<Map<String, Integer>>builder()
                            .success(false)
                            .message("Unauthorized")
                            .build());
        }

        int count = notificationService.deleteAll(userId);
        return ResponseEntity.ok(ApiResponse.<Map<String, Integer>>builder()
                .success(true)
                .data(Map.of("count", count))
                .build());
    }

    /**
     * Gui thong bao den mot nguoi dung (Kafka producer via REST).
     * Frontend goi endpoint nay de gui notification den user khac qua Kafka.
     */
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<NotificationDto>> sendNotification(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestBody SendNotificationRequest request) {

        String userId = validateAndGetUserId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<NotificationDto>builder()
                            .success(false)
                            .message("Unauthorized")
                            .build());
        }

        // Gui qua Kafka de notification-service chu yen nhan va dispatch
        NotificationMessage message = NotificationMessage.builder()
                .recipientUserId(request.getRecipientUserId())
                .title(request.getTitle())
                .content(request.getContent())
                .type(request.getType() != null ? request.getType() : "INFO")
                .severity(request.getSeverity() != null ? request.getSeverity() : "low")
                .data(request.getData())
                .build();

        NotificationDto saved = notificationService.save(message);

        return ResponseEntity.ok(ApiResponse.<NotificationDto>builder()
                .success(true)
                .data(saved)
                .message("Notification sent")
                .build());
    }

    private String validateAndGetUserId(String authHeader) {
        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        try {
            ApiResponse<Map<String, Object>> res = identityClient.validateToken(token);
            if (res == null || !res.isSuccess() || res.getData() == null) {
                return null;
            }
            Object userIdObj = res.getData().get("userId");
            return userIdObj != null ? String.valueOf(userIdObj) : null;
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return null;
        }
    }
}
