package com.erp.backend.refundItem.controller;

import com.erp.backend.common.ApiResponse;
import com.erp.backend.common.PageResponse;
import com.erp.backend.refundItem.service.RefundItemService;
import com.erp.backend.refundItem.vo.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.tags.Tags;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/return-item")
@RequiredArgsConstructor
@Tag(name = "반품",description = "반품 관련 API")
public class RefundItemController {

    private final RefundItemService refundItemService;

    @GetMapping("/paging")
    public ResponseEntity<ApiResponse<PageResponse<ReturnedItemVO>>> findAllReturnItems(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "salesOrderId", required = false) Integer salesOrderId,
            @RequestParam(value = "returnGroupId", required = false) Integer returnGroupId

    ) {
        PageResponse<ReturnedItemVO> result = refundItemService.findAllReturnItem(page, size, status, salesOrderId, returnGroupId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/status-count")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> getCountByStatus() {
        Map<String, Integer> result = refundItemService.getCountByStatus();
        return ResponseEntity.ok(ApiResponse.success("상태별 갯수", result));
    }

    @GetMapping("/groups/paging")
    public ResponseEntity<ApiResponse<PageResponse<ReturnedItemGroupVO>>> findAllReturnItemGroups(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "salesOrderId", required = false) Integer salesOrderId
    ) {
        PageResponse<ReturnedItemGroupVO> result = refundItemService.findAllReturnGroups(status, salesOrderId, page, size);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/targets/{salesOrderId}")
    public ResponseEntity<ApiResponse<List<ReturnedItemRequestVO>>> findReturnTargets(@PathVariable int salesOrderId) {
        List<ReturnedItemRequestVO> result = refundItemService.findReturnRequestTarget(salesOrderId);
        if (result != null && !result.isEmpty()){
            return ResponseEntity.ok(ApiResponse.success(result.size() + " 의 건이 조회되었습니다",result));
        }
        return ResponseEntity.ok(ApiResponse.fail("조회 실패"));
    }

    @GetMapping("/returnable-qty/{shipmentDetailId}")
    public ResponseEntity<ApiResponse<Integer>> findReturnableQty(@PathVariable int shipmentDetailId) {
        int result = refundItemService.checkReturnableItemAmount(shipmentDetailId);
        if (result > 0) {
            return ResponseEntity.ok(ApiResponse.success(result+" 개가 반품가능합니다",result));
        }
        return ResponseEntity.ok(ApiResponse.fail("반품 가능 개수 없음"));
    }

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<Integer>> requestReturn(@RequestBody List<ReturnedItemRequestVO> requestItems, @AuthenticationPrincipal long empId) {
        int returnGroupId = refundItemService.requestReturn(requestItems, empId);
        if (returnGroupId > 0) {
            return ResponseEntity.ok(ApiResponse.success(returnGroupId+"반품그룹번호",returnGroupId));
        }
        return ResponseEntity.ok(ApiResponse.fail(""));
    }

    @PutMapping("/{returnGroupId}/approve")
    public ResponseEntity<ApiResponse<Void>> approveReturn(@PathVariable int returnGroupId, @AuthenticationPrincipal long empId) {
        if(refundItemService.approveReturn(returnGroupId, empId)){
            return ResponseEntity.ok(ApiResponse.success("요청승인",null));
        }
        return ResponseEntity.ok(ApiResponse.fail("실패"));
    }

    @PutMapping("/{returnGroupId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectReturn(@PathVariable int returnGroupId, @RequestBody ReturnRejectRequestVO rejectRequest) {
        if(refundItemService.rejectReturn(returnGroupId, rejectRequest.getRejectReason())){
            return ResponseEntity.ok(ApiResponse.success("반품 거절",null));
        }
        return ResponseEntity.ok(ApiResponse.fail("실패"));
    }

    @PutMapping("/{returnGroupId}/complete")
    public ResponseEntity<ApiResponse<BigDecimal>> completeReturn(@PathVariable int returnGroupId, @AuthenticationPrincipal long empId) {
        BigDecimal refundAmount = refundItemService.completeReturn(returnGroupId, empId);
        if (refundAmount != null && refundAmount.compareTo(BigDecimal.ZERO) > 0) {
            return ResponseEntity.ok(ApiResponse.success(refundAmount + "반품 금액",refundAmount));
        }
        return ResponseEntity.ok(ApiResponse.fail(null));
    }

    @GetMapping("/groups/{returnGroupId}")
    public ResponseEntity<ApiResponse<List<ReturnedItemRequestVO>>> findReturnRequestGroup(@PathVariable int returnGroupId) {
        List<ReturnedItemRequestVO> details = refundItemService.findReturnRequestsByGroupId(returnGroupId);
        if (details != null && !details.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success(details));
        }
        return ResponseEntity.ok(ApiResponse.fail("조회 실패"));
    }

    @GetMapping("/groups/{returnGroupId}/finance-summary")
    public ResponseEntity<ApiResponse<ReturnSummaryVO>> financeSummary(@PathVariable int returnGroupId) {
        return ResponseEntity.ok(ApiResponse.success(refundItemService.findReturnSummary(returnGroupId)));
    }
}