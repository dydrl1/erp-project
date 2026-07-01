package com.erp.backend.refundItem.vo;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReturnedItemGroupVO {
    private Integer returnGroupId;
    private Integer returnId;
    private Integer salesOrderId;
    private Integer customerId;
    private String customerName;
    private Integer shipmentDetailId;
    private Integer itemCount;
    private Integer totalReturnQty;
    private String productSummary;
    private String reason;
    private String rejectReason;
    private String status;
    private Integer createdBy;
    private String createdByName;
    private LocalDateTime createdAt;
    private Integer approvedBy;
    private String approvedName;
    private LocalDateTime approvedAt;
    private LocalDateTime completedAt;
}
