package com.erp.backend.disposal.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DisposalTargetVO {
    private int inventoryLotId;
    private int productId;
    private int currentQty;
    private String status;
    private String productCode;
    private String productName;
    private String lotNo;
    private LocalDateTime expiryDate;
}
