package com.erp.backend.refundItem.vo;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReturnedItemVO {
    private Integer returnId;
    private Integer returnGroupId;
    private Integer salesOrderId;
    private Integer shipmentDetailId;
    private Integer productId;
    private String productName;
    private Integer inventoryLotId;
    private String lotNo;
    private Integer returnedQty;
    private String reason;
    private Integer customerId;
    private String customerName;
    private Integer outQty;
    private String status;
    private Integer createdBy;
    private String createdByName;
    private LocalDateTime createdAt;
    private Integer approvedBy;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private LocalDateTime completedAt;
    private String rejectReason;
    private Integer itemCount;
    private Integer totalReturnQty;
    private Integer returnQty;
    //페이징용 카운트
    private Integer count;
}
