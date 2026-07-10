package com.erp.backend.refundItem.service;

import com.erp.backend.common.CustomException;
import com.erp.backend.common.ErrorCode;
import com.erp.backend.common.PageResponse;
import com.erp.backend.refundItem.mapper.RefundItemMapper;
import com.erp.backend.refundItem.vo.*;
import com.erp.backend.shipment.mapper.ShipmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RefundItemService {

    private final RefundItemMapper refundItemMapper;
    private final ShipmentMapper shipmentMapper;

    private Integer getCurrentSeqForReturnRequestId() {
        return refundItemMapper.getCurrentSeqReturnRequestId();
    }

    private Integer getCurrentSeqReturnRequestGroupId() {
        return refundItemMapper.getCurrentSeqForReturnRequestGroupId();
    }

    public Integer checkReturnableItemAmount(int shipmentDetailId) {
        return refundItemMapper.findRefundableItemStatus(shipmentDetailId);
    }

    private List<SalesOrderRefundVO> existSalesOrder(Integer salesOrderId) {
        return refundItemMapper.existSalesOrder(salesOrderId);
    }

    public List<ReturnedItemRequestVO> findReturnRequestTarget(Integer salesOrderId) {
        return refundItemMapper.findReturnRequestTarget(salesOrderId);
    }

    public List<ReturnedItemRequestVO> findReturnRequestsByGroupId(int returnGroupId) {
        return refundItemMapper.findReturnRequestsByGroupId(returnGroupId);
    }

    public int findCountsForReturnRequest(String status, Integer salesOrderId) {
        return refundItemMapper.findCountsForReturnRequest(status, salesOrderId);
    }

    public PageResponse<ReturnedItemVO> findAllReturnItem(int page, int size, String status, Integer salesOrderId, Integer returnGroupId) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(size, 1);
        int offset = (safePage - 1) * safeSize;
        List<ReturnedItemVO> list = refundItemMapper.findAllReturnItem(offset, safeSize, status, salesOrderId, returnGroupId);
        int total = findCountsForReturnRequest(status, salesOrderId);
        return new PageResponse<>(list, safeSize, total, safePage);
    }

    public Map<String, Integer> getCountByStatus() {
        List<ReturnedItemVO> counts = refundItemMapper.findCountsByStatus();
        Map<String, Integer> result = new HashMap<>();
        for (ReturnedItemVO count : counts) {
            result.put(count.getStatus(), count.getCount());
        }
        return result;
    }

    public PageResponse<ReturnedItemGroupVO> findAllReturnGroups(String status, Integer salesOrderId, int page, int size) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(size, 1);
        int offset = (safePage - 1) * safeSize;
        List<ReturnedItemGroupVO> list = refundItemMapper.findReturnItemGroupList(status, salesOrderId, offset, safeSize);
        Integer total = refundItemMapper.findCountsForReturnItemGroup(status, salesOrderId);
        return new PageResponse<>(list, safeSize, total, safePage);
    }


    @Transactional
    public int requestReturn(List<ReturnedItemRequestVO> returnRequests, long empId) {
        if (returnRequests == null || returnRequests.isEmpty()) {
            throw new CustomException(ErrorCode.RETURN_REQUEST_FAILED);
        }
        Integer soId = returnRequests.get(0).getSalesOrderId();
        if (soId == null || soId <= 0) {
            throw new CustomException(ErrorCode.RETURN_SALES_ORDER_NOT_FOUND);
        }
        if (existSalesOrder(soId).isEmpty()) {
            throw new CustomException(ErrorCode.RETURN_SALES_ORDER_NOT_FOUND);
        }
        boolean differentOrder = returnRequests.stream().anyMatch(item -> !soId.equals(item.getSalesOrderId()));
        if (differentOrder) {
            throw new CustomException(ErrorCode.RETURN_DIFFERENT_SALES_ORDER_INCLUDED);
        }
        List<ReturnedItemRequestVO> targets = findReturnRequestTarget(soId);
        if (targets.isEmpty()) {
            throw new CustomException(ErrorCode.RETURN_TARGET_NOT_FOUND);
        }
        int returnedGroupId = getCurrentSeqReturnRequestGroupId();
        for (ReturnedItemRequestVO item : returnRequests) {
            ReturnedItemRequestVO target = targets.stream().filter(returnedItem -> returnedItem.getShipmentDetailId()
                            .equals(item.getShipmentDetailId()))
                    .findFirst()
                    .orElseThrow(() -> new CustomException(ErrorCode.RETURN_TARGET_NOT_FOUND));
            Integer returnQty = item.getReturnQty();
            if (returnQty == null || returnQty <= 0) {
                throw new CustomException(ErrorCode.RETURN_QTY_ERROR);
            }
            Integer returnableQty = checkReturnableItemAmount(target.getShipmentDetailId());
            if (returnableQty == null || returnableQty <= 0) {
                throw new CustomException(ErrorCode.RETURN_TARGET_NOT_FOUND);
            }
            if (returnQty > returnableQty) {
                throw new CustomException(ErrorCode.RETURN_QTY_ERROR);
            }
            item.setReturnId(getCurrentSeqForReturnRequestId());
            item.setReturnGroupId(returnedGroupId);
            item.setSalesOrderId(soId);
            item.setSoDetailId(target.getSoDetailId());
            item.setShipmentDetailId(target.getShipmentDetailId());
            item.setInventoryLotId(target.getInventoryLotId());
            item.setProductId(target.getProductId());
            item.setCreatedBy(empId);
            int inserted = refundItemMapper.insertReturnRequest(item);
            if (inserted != 1) {
                throw new CustomException(ErrorCode.RETURN_PROCESS_FAILED);
            }
        }
        return returnedGroupId;
    }

    @Transactional
    public boolean rejectReturn(int returnGroupId, String rejectReason) {
        if (rejectReason == null || rejectReason.isBlank()) {
            throw new CustomException(ErrorCode.REJECT_REASON_REQUIRED);
        }
        List<ReturnedItemRequestVO> requests = getRequestedReturnGroup(returnGroupId);
        int updated = refundItemMapper.rejectReturnRequest(returnGroupId, rejectReason);
        if (updated != requests.size()) {
            throw new CustomException(ErrorCode.RETURN_REJECTION_FAILED);
        }
        return true;
    }

    private List<ReturnedItemRequestVO> getRequestedReturnGroup(int returnGroupId) {
        List<ReturnedItemRequestVO> requests =
                findReturnRequestsByGroupId(returnGroupId);
        if (requests == null || requests.isEmpty()) {
            throw new CustomException(ErrorCode.RETURN_REQUEST_NOT_FOUND);
        }
        boolean notRequested = requests.stream()
                .anyMatch(item ->
                        !"REQUESTED".equals(item.getStatus()));
        if (notRequested) {
            throw new CustomException(ErrorCode.RETURN_REQUEST_NOT_REQUESTED);
        }
        return requests;
    }

    @Transactional
    public boolean approveReturn(int returnGroupId, long approvedBy) {
        getRequestedReturnGroup(returnGroupId);
        List<ReturnedItemRequestVO> requests = findReturnRequestsByGroupId(returnGroupId);
        int updated = refundItemMapper.approveReturnRequest(returnGroupId, approvedBy);
        if (updated != requests.size()) {
            throw new CustomException(ErrorCode.RETURN_APPROVAL_FAILED);
        }
        return true;
    }

    private boolean verifyReturnedItemRequest(int returnId) {
        ReturnedItemVO returnedItem = refundItemMapper.verifyShippedQtyAndReturnedQty(returnId);
        if (returnedItem == null || returnedItem.getOutQty() == null || returnedItem.getReturnedQty() == null) {
            throw new CustomException(ErrorCode.RETURN_QUANTITY_MISMATCH);
        }
        return returnedItem.getReturnedQty() <= returnedItem.getOutQty();
    }

    private void insertStockMovement(long empId, int returnId) {
        int smvSeq = shipmentMapper.currentStockMovementSeq();
        int result = refundItemMapper.insertStockMovement(smvSeq,empId,returnId);
        if (result != 1) {
            throw new CustomException(ErrorCode.RETURN_PROCESS_FAILED);
        }
    }

    private BigDecimal processRefund(Integer soId, int returnGroupId) {
        BigDecimal refundTotal = refundItemMapper.calculateReturnedRequestAmount(returnGroupId);
        if (refundTotal == null || refundTotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CustomException(ErrorCode.RETURN_INVALID_REFUND_AMOUNT);
        }
        int updated = refundItemMapper.modifyBalance(soId, returnGroupId);
        if (updated != 1) {
            throw new CustomException(ErrorCode.RETURN_SALES_ORDER_BALANCE_UPDATE_FAILED);
        }
        return refundTotal;
    }

    @Transactional
    public BigDecimal completeReturn(int returnGroupId, long empId) {
        List<ReturnedItemRequestVO> requestItems =
                findReturnRequestsByGroupId(returnGroupId);
        if (requestItems == null || requestItems.isEmpty()) {
            throw new CustomException(ErrorCode.RETURN_REQUEST_NOT_FOUND);
        }
        boolean notApproved = requestItems.stream()
                .anyMatch(item -> !"APPROVED".equals(item.getStatus()));
        if (notApproved) {
            throw new CustomException(ErrorCode.RETURN_REQUEST_NOT_APPROVED);
        }
        Integer soId = requestItems.get(0).getSalesOrderId();
        for (ReturnedItemRequestVO requestItem : requestItems) {
            int restored = refundItemMapper.restoreLotStock(requestItem.getReturnQty(), requestItem.getInventoryLotId());
            if (restored != 1) {
                throw new CustomException(ErrorCode.RETURN_PROCESS_FAILED);
            }
            insertStockMovement(empId, requestItem.getReturnId());
            if (!verifyReturnedItemRequest(requestItem.getReturnId())) {
                throw new CustomException(ErrorCode.RETURN_QUANTITY_MISMATCH);
            }
        }
        BigDecimal refundTotal = processRefund(soId, returnGroupId);
        int updated = refundItemMapper.updateReturnRequestStatus(returnGroupId);
        if (updated != requestItems.size()) {
            throw new CustomException(ErrorCode.RETURN_PROCESS_FAILED);
        }
        return refundTotal;
    }

    public ReturnSummaryVO findReturnSummary(int returnGroupId) {
        ReturnSummaryVO summary = refundItemMapper.findReturnFinanceSummary(returnGroupId);
        if(summary == null){
            throw new CustomException(ErrorCode.RETURN_REQUEST_FAILED);
        }
        if(!"COMPLETED".equals(summary.getStatus())){
            throw new CustomException(ErrorCode.RETURN_REQUEST_NOT_COMPLETED);
        }
        if(summary.getSalesOrderId() == null){
            throw new CustomException(ErrorCode.RETURN_SALES_ORDER_NOT_FOUND);
        }
        if(summary.getRefundTotalAmount()==null||summary.getRefundTotalAmount().compareTo(BigDecimal.ZERO)<=0){
            throw new CustomException(ErrorCode.RETURN_INVALID_REFUND_AMOUNT);
        }
        return summary;
    }
}
