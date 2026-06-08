package com.erp.backend.sales.vo;

import java.math.BigDecimal;
import java.time.LocalDate;

public class SalesInvoiceVO {

    private Integer salesInvoiceId; // 매출청구 ID (PK)
    private Integer soId; // 수주번호 Sales Order
    private Integer customerId; // 거래처 ID
    private LocalDate issueDate; // 청구서 발행일
    private BigDecimal totalAmount; // 총 청구금액
    private String status; // 청구 상태
    private LocalDate createdAt; // 생성일자

    public Integer getSalesInvoiceId() {
        return salesInvoiceId;
    }

    public void setSalesInvoiceId(Integer salesInvoiceId) {
        this.salesInvoiceId = salesInvoiceId;
    }

    public Integer getSoId() {
        return soId;
    }

    public void setSoId(Integer soId) {
        this.soId = soId;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
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