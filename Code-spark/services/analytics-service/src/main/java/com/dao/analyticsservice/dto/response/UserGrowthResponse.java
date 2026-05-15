package com.dao.analyticsservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserGrowthResponse {
    private LocalDateTime date;
    private long totalUsers;
    private long newUsers;
    private long activeUsers;
}
