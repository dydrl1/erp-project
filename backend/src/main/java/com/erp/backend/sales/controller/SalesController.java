package com.erp.backend.sales.controller;

import com.erp.backend.common.ApiResponse;
import com.erp.backend.sales.service.SalesService;
import com.erp.backend.sales.vo.SalesInvoiceVO;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sales")
public class SalesController {

    private final SalesService salesService;

    @Operation(summary = "매출청구 조회")
    @GetMapping("/invoices")
    public ResponseEntity<ApiResponse<List<SalesInvoiceVO>>> getSalesInvoiceList() {
        return ResponseEntity.ok(
                ApiResponse.success(salesService.getSalesInvoiceList())
        );
    }

}