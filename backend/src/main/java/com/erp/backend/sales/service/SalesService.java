package com.erp.backend.sales.service;

import com.erp.backend.sales.mapper.SalesMapper;
import com.erp.backend.sales.vo.SalesInvoiceVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SalesService {

    private final SalesMapper salesMapper;

    public List<SalesInvoiceVO> getSalesInvoiceList() {
        return salesMapper.findAllSalesInvoices();
    }

}