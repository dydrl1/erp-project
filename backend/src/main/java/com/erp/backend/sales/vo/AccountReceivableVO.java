package com.erp.backend.sales.vo;

import java.math.BigDecimal;
import java.time.LocalDate;

public class AccountReceivableVO {

    private Integer arId; // 매출채권 ID (PK)
    private Integer customerId; // 거래처 ID
    private Integer salesInvoiceId; // 매출청구 ID (FK)
    private BigDecimal totalAmount; // 총 청구금액
    private BigDecimal paidAmount; // 입금된 금액
    private BigDecimal remainAmount; // 남은 미수금
    private LocalDate dueDate; // 입금 예정일
    private String status; // 미수금 상태
    private LocalDate createdAt; // 생성일자

    public Integer getArId() {
        return arId;
    }

    public void setArId(Integer arId) {
        this.arId = arId;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public Integer getSalesInvoiceId() {
        return salesInvoiceId;
    }

    public void setSalesInvoiceId(Integer salesInvoiceId) {
        this.salesInvoiceId = salesInvoiceId;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public BigDecimal getRemainAmount() {
        return remainAmount;
    }

    public void setRemainAmount(BigDecimal remainAmount) {
        this.remainAmount = remainAmount;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }

}