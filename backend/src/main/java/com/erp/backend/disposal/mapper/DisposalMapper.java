package com.erp.backend.disposal.mapper;

import com.erp.backend.disposal.vo.DisposalDetailVO;
import com.erp.backend.disposal.vo.DisposalTargetVO;
import com.erp.backend.shipment.vo.StockMovementVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface DisposalMapper {
    Integer getCurrentDisposalSeq();

    Integer getCurrentDisposalDetailSeq();

    Integer insertDisposal(@Param("disposalId") int disposalId, @Param("reason") String reason, @Param("empId") long empId);

    List<DisposalTargetVO> findDisposalTargets();

    String findDisposalStatus(int disposalId);

    Integer insertDisposalDetail(DisposalDetailVO disposalDetailVO);

    Integer approveDisposalRequest(@Param("approvedBy") long empId, @Param("disposalId") int disposalId);

    Integer rejectDisposalRequest(@Param("rejectReason") String rejectReason, @Param("disposalId") int disposalId);

    Integer completeDisposal(int disposalId);

    DisposalTargetVO findInventoryLotForUpdate(int inventoryLotId);

    Integer reduceLotStock(@Param("disposalQty") int disposalQty, @Param("inventoryLotId") int inventoryLotId);

    Integer insertStockMovement(@Param("stmvSeq") int stmvSeq, @Param("disposalDetailId") int disposalDetailId, @Param("stockMovement") StockMovementVO stockMovementVO);

    List<DisposalDetailVO> findDisposalDetails(int disposalId);

    Integer updateInventoryLotStatus(int inventoryLotId);
}
