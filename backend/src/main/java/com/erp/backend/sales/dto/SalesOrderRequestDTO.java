package com.erp.backend.sales.dto;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SalesOrderRequestDTO {
    private int productId;
    private int customerId;
    private int employeeId;
    private BigDecimal amount;
    private String memo;
    private Integer orderQty;
}
