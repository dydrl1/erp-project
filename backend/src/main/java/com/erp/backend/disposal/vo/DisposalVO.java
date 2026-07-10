package com.erp.backend.disposal.vo;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class DisposalVO {
    private Integer disposalId;
    private String disposalName;
    private String status;
    private long createdBy;
    private LocalDateTime createdAt;
    private long approvedBy;
    private LocalDateTime approvedAt;
    private LocalDateTime completedAt;
    private String reason;
}
