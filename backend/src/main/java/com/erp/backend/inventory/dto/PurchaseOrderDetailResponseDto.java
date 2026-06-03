package com.erp.backend.inventory.dto;

import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class PurchaseOrderDetailResponseDto {

    private Long poDetailId;
    private Long productId;
    private String productName;
    private String productCode;
    private String unit;
    private Integer orderQty;
    private BigDecimal unitPrice;
    private BigDecimal amount;
}
