package com.erp.backend.refundItem.vo;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class ReturnSummaryVO {
    private Integer returnGroupId;
    private Integer customerId;
    private String customerName;
    private Integer salesOrderId;
    private BigDecimal refundTotalAmount;
    private LocalDateTime completedAt;
    private String status;
    private String empName;
}
