package com.erp.backend.refundItem.mapper;

import com.erp.backend.refundItem.vo.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.security.core.parameters.P;

import java.math.BigDecimal;
import java.util.List;

@Mapper
public interface RefundItemMapper {

    Integer getCurrentSeqReturnRequestId();
    Integer getCurrentSeqForReturnRequestGroupId();
    Integer findRefundableItemStatus(int shipmentDetailId);
    List<SalesOrderRefundVO> existSalesOrder(Integer salesOrderId);
    List<ReturnedItemRequestVO> findReturnRequestTarget (int itemId);
    Integer insertReturnRequest(ReturnedItemRequestVO returnedItemRequestVO);
    List<ReturnedItemRequestVO> findReturnRequestsByGroupId(int returnGroupId);
    Integer approveReturnRequest(@Param("returnGroupId")int retundGroupId,@Param("approvedBy")long approvedBy);
    Integer rejectReturnRequest(@Param("returnGroupId")int retundGroupId,@Param("rejectReason")String rejectReason);
    Integer restoreLotStock(@Param("returnQty") int returnQty, @Param("inventoryLotId") int  inventoryLotId);
    Integer insertStockMovement(@Param("stmvSeq")int stmvSeq,@Param("empId")long empId,@Param("returnId")int returnId);
    ReturnedItemVO verifyShippedQtyAndReturnedQty(@Param("returnId") int returnId);
    BigDecimal calculateReturnedRequestAmount(int returnGroupId);
    Integer modifyBalance(@Param("salesOrderId")Integer salesOrderId,@Param("returnGroupId")int returnGroupId);
    Integer updateReturnRequestStatus(int returnGroupId);
    List<ReturnedItemVO> findAllReturnItem(@Param("offset") int offset, @Param("size") int size, @Param("status") String status, @Param("salesOrderId") Integer salesOrderId, @Param("returnGroupId") Integer returnGroupId);
    List<ReturnedItemVO> findCountsByStatus();
    Integer findCountsForReturnRequest(String status, Integer salesOrderId);
    List<ReturnedItemGroupVO> findReturnItemGroupList(@Param("status") String status, @Param("salesOrderId") Integer salesOrderId, @Param("offset") int offset, @Param("size") int size);
    Integer findCountsForReturnItemGroup(@Param("status") String status, @Param("salesOrderId") Integer salesOrderId);
    ReturnSummaryVO findReturnFinanceSummary(Integer returnGroupId);
}
