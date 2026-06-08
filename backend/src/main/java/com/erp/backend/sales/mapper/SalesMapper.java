package com.erp.backend.sales.mapper;

import com.erp.backend.sales.vo.AccountReceivableVO;
import com.erp.backend.sales.vo.SalesInvoiceVO;
import com.erp.backend.sales.vo.PaymentVO;
import com.erp.backend.sales.vo.PurchaseInvoiceVO;
import com.erp.backend.sales.vo.AccountPayableVO;
import com.erp.backend.sales.vo.SettlementVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface SalesMapper {
    // 매출청구 (Sales Invoice)
    List<SalesInvoiceVO> findAllSalesInvoices();

    // 매출채권 (Account Receivable)
    List<AccountReceivableVO> findAllAccountReceivables();

    // 입금관리 (Payment)
    List<PaymentVO> findAllPayments();

    // 매입청구 (Purchase Invoice)
    List<PurchaseInvoiceVO> findAllPurchaseInvoices();

    // 매입채무 (Account Payable)
    List<AccountPayableVO> findAllAccountPayables();

    // 손익정산 (Settlement)
    List<SettlementVO> findAllSettlements();

}