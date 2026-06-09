package com.erp.backend.sales.service;

import com.erp.backend.sales.mapper.SalesMapper;
import com.erp.backend.sales.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SalesService {

    private final SalesMapper salesMapper;

    // 매출청구 조회
    public List<SalesInvoiceVO> getSalesInvoiceList(
            String status, String startDate, String endDate) {
        Map<String, Object> params = new HashMap<>();
        params.put("status", status);
        params.put("startDate", startDate);
        params.put("endDate", endDate);
        return salesMapper.findAllSalesInvoices(params);
    }

    // 매입청구 조회
    public List<PurchaseInvoiceVO> getPurchaseInvoiceList(
            String status, String startDate, String endDate) {
        Map<String, Object> params = new HashMap<>();
        params.put("status", status);
        params.put("startDate", startDate);
        params.put("endDate", endDate);
        return salesMapper.findAllPurchaseInvoices(params);
    }

    // 미수금/매출채권 조회
    public List<AccountReceivableVO> getAccountReceivableList(
            String status, String startDate, String endDate) {
        Map<String, Object> params = new HashMap<>();
        params.put("status", status);
        params.put("startDate", startDate);
        params.put("endDate", endDate);
        return salesMapper.findAllAccountReceivables(params);
    }

    // 미지급금/매입채무 조회
    public List<AccountPayableVO> getAccountPayableList(
            String status, String startDate, String endDate) {
        Map<String, Object> params = new HashMap<>();
        params.put("status", status);
        params.put("startDate", startDate);
        params.put("endDate", endDate);
        return salesMapper.findAllAccountPayables(params);
    }

    // 수금내역 조회
    public List<PaymentVO> getPaymentList(
            String startDate, String endDate) {
        Map<String, Object> params = new HashMap<>();
        params.put("startDate", startDate);
        params.put("endDate", endDate);
        return salesMapper.findAllPayments(params);
    }

    // 손익정산 조회
    public List<SettlementVO> getSettlementList(
            String startDate, String endDate) {
        Map<String, Object> params = new HashMap<>();
        params.put("startDate", startDate);
        params.put("endDate", endDate);
        return salesMapper.findAllSettlements(params);
    }

    // 매출청구 상세조회
    public SalesInvoiceVO getSalesInvoice(Long salesInvoiceId) {
        return salesMapper.findSalesInvoiceById(salesInvoiceId);
    }

    // 매입청구 상세조회
    public PurchaseInvoiceVO getPurchaseInvoice(Long purchaseInvoiceId) {
        return salesMapper.findPurchaseInvoiceById(purchaseInvoiceId);
    }

    // 미수금 상세조회
    public AccountReceivableVO getAccountReceivable(Long arId) {
        return salesMapper.findAccountReceivableById(arId);
    }

    // 미지급금 상세조회
    public AccountPayableVO getAccountPayable(Long apId) {
        return salesMapper.findAccountPayableById(apId);
    }

    // 수금내역 상세조회
    public PaymentVO getPayment(Long paymentId) {
        return salesMapper.findPaymentById(paymentId);
    }

    // 손익정산 상세조회
    public SettlementVO getSettlement(Long settlementId) {
        return salesMapper.findSettlementById(settlementId);
    }
}