package com.erp.backend.sales.vo;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PurchaseInvoiceVO {

    private Integer purchaseInvoiceId; // 매입청구 ID (PK)
    private Integer poId; // 발주 ID (FK)
    private Integer supplierId; // 공급처 ID
    private LocalDate issueDate; // 매입청구 발행일
    private BigDecimal totalAmount; // 총 매입금액
    private String status; // 매입청구 상태
    private LocalDate createdAt; // 생성일자

    public Integer getPurchaseInvoiceId() {
        return purchaseInvoiceId;
    }

    public void setPurchaseInvoiceId(Integer purchaseInvoiceId) {
        this.purchaseInvoiceId = purchaseInvoiceId;
    }

    public Integer getPoId() {
        return poId;
    }

    public void setPoId(Integer poId) {
        this.poId = poId;
    }

    public Integer getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Integer supplierId) {
        this.supplierId = supplierId;
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