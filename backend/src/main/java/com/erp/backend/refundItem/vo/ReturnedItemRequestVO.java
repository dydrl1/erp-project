package com.erp.backend.refundItem.vo;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReturnedItemRequestVO {
    private Integer returnId;
    private Integer returnGroupId;
    private Integer customerId;
    private Integer salesOrderId;
    private Integer soDetailId;
    private Integer shipmentDetailId;
    private Integer productId;
    private String productCode;
    private String productName;
    private Integer inventoryLotId;
    private String lotNo;
    private Integer returnQty;
    private String reason;
    private String status;
    private Integer alreadyReturnQty;
    private Integer returnableQty;
    private long createdBy;
}
