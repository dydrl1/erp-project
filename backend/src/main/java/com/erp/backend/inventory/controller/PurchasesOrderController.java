package com.erp.backend.inventory.controller;

import com.erp.backend.common.ApiResponse;
import com.erp.backend.inventory.service.PurchaseOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Tag(name="발주 관리", description = "사입 발주 등록·승인·반려 API")
@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
public class PurchasesOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @Operation(summary = "공급처 목록 조회")
    @GetMapping("/suppliers")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSuppliers() {
        return ResponseEntity.ok(
                ApiResponse.success(purchaseOrderService.getSuppliers()));
    }
}
