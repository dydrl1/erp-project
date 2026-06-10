package com.erp.backend.sales.vo;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SalesOrderVO {
    Integer soId;
    Integer customerId;
    String customerName;
    Integer reqEmployeeId;
    String reqEmployeeName;
    Integer approveEmpId;
    String appEmployeeName;
    LocalDate orderDate;
    LocalDate approveDate;
    String status;
    BigDecimal totalAmount;
    String memo;
    LocalDate createdAt;
    LocalDate updatedAt;
    Integer orderQty;
}
