package com.erp.backend.disposal.service;

import com.erp.backend.common.CustomException;
import com.erp.backend.common.ErrorCode;
import com.erp.backend.disposal.mapper.DisposalMapper;
import com.erp.backend.disposal.vo.DisposalDetailVO;
import com.erp.backend.disposal.vo.DisposalRequestVO;
import com.erp.backend.disposal.vo.DisposalTargetVO;
import com.erp.backend.disposal.vo.DisposalVO;
import com.erp.backend.shipment.mapper.ShipmentMapper;
import com.erp.backend.shipment.vo.StockMovementVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DisposalService {

    private final DisposalMapper disposalMapper;
    private final ShipmentMapper shipmentMapper;

    private int getDisposalSeq() {
        return disposalMapper.getCurrentDisposalSeq();
    }

    private int getDisposalDetailSeq() {
        return disposalMapper.getCurrentDisposalDetailSeq();
    }

    public String findDisposalStatus(int disposalId) {
        return disposalMapper.findDisposalStatus(disposalId);
    }

    private void insertDisposal(int disposalSeq, String reason, long empId) {
        int result = disposalMapper.insertDisposal(disposalSeq, reason, empId);
        if (result != 1) {
            throw new CustomException(ErrorCode.NOT_FOUND);//요청헤더 생성 실패
        }
    }

    public List<DisposalTargetVO> findDisposalTargets() {
        return disposalMapper.findDisposalTargets();
    }

    private DisposalDetailVO insertDisposalDetail(
            int disposalId,
            DisposalTargetVO lot,
            int disposalQty,
            String reason
    ) {
        int disposalDetailId = getDisposalDetailSeq();

        if (disposalDetailId <= 0) {
            throw new CustomException(ErrorCode.NOT_FOUND); // 폐기 상세 SEQ 조회 실패
        }

        DisposalDetailVO disposalDetail = new DisposalDetailVO();
        disposalDetail.setDisposalDetailId(disposalDetailId);
        disposalDetail.setDisposalId(disposalId);
        disposalDetail.setInventoryLotId(lot.getInventoryLotId());
        disposalDetail.setProductId(lot.getProductId());
        disposalDetail.setDisposalQty(disposalQty);
        disposalDetail.setReason(reason);

        int result = disposalMapper.insertDisposalDetail(disposalDetail);

        if (result != 1) {
            throw new CustomException(ErrorCode.NOT_FOUND); // 폐기 상세 생성 실패
        }

        return disposalDetail;
    }

    public void approveDisposal(long empId, int disposalId) {
        int result = disposalMapper.approveDisposalRequest(empId, disposalId);
        if (result != 1) {
            throw new CustomException(ErrorCode.NOT_FOUND);//폐기 승인요청 실패
        }
    }

    public void rejectDisposal(int disposalId, String reason) {
        int result = disposalMapper.rejectDisposalRequest(reason, disposalId);
        if (result != 1) {
            throw new CustomException(ErrorCode.NOT_FOUND);//폐기 승인 거절 실패
        }
    }

    public Integer completeDisposal(int disposalId) {
        return disposalMapper.completeDisposal(disposalId);
    }

    public DisposalTargetVO findInventoryLot(int inventoryLotId) {
        return disposalMapper.findInventoryLotForUpdate(inventoryLotId);
    }

    public Integer reduceLotStock(int disposalQty, int inventoryLotId) {
        return disposalMapper.reduceLotStock(disposalQty, inventoryLotId);
    }

    public Integer updateInventoryLotStatus(int inventoryLotId) {
        return disposalMapper.updateInventoryLotStatus(inventoryLotId);
    }

    public List<DisposalDetailVO> findDisposalDetail(int disposalId) {
        return disposalMapper.findDisposalDetails(disposalId);
    }

//    @Transactional
//    public int requestDisposal(String reason, long empId, int disposalQty, int inventoryLotId) {
//        int disposalId = getDisposalSeq();
//        insertDisposal(disposalId, reason, empId);
//        insertDisposalDetail(reason, disposalId, disposalQty, inventoryLotId);
//        return disposalId;
//    }

    // 기존 승인형 폐기 플로우 보관용 메서드.
    // 현재 즉시 폐기 처리 흐름에서는 사용하지 않음.
    @Transactional
    public boolean processApprovedDisposalLegacy(long empId, int disposalId) {
        String status = findDisposalStatus(disposalId);
        if (!"APPROVED".equals(status)) {
            throw new CustomException(ErrorCode.NOT_FOUND);//상태에 맞는 제품으 존재하지 않음
        }
        List<DisposalDetailVO> disposalDetails = findDisposalDetail(disposalId);
        if (disposalDetails == null || disposalDetails.isEmpty()) {
            throw new CustomException(ErrorCode.NOT_FOUND);//상세목록 가져오기 실패
        }
        for (DisposalDetailVO disposalDetail : disposalDetails) {
            DisposalTargetVO map = findInventoryLot(disposalDetail.getInventoryLotId());
            int inventoryLotId = disposalDetail.getInventoryLotId();
            if (map == null) {
                throw new CustomException(ErrorCode.NOT_FOUND);//로트에 해당하는 아이템이 없음
            }
            int disposalQty = disposalDetail.getDisposalQty();
            int beforeQty = map.getCurrentQty();
            int afterQty = beforeQty - disposalQty;
            if (afterQty < 0) {
                throw new CustomException(ErrorCode.NOT_FOUND);//폐기 차감 후 수가 잘못됨
            }
            int reduced = reduceLotStock(disposalQty, inventoryLotId);
            if (reduced != 1) {
                throw new CustomException(ErrorCode.NOT_FOUND);//폐기 재고 차감 실패
            }
            int stmvSeq = shipmentMapper.currentStockMovementSeq();
            StockMovementVO stockMovement = new StockMovementVO();
            stockMovement.setInventoryLotId(inventoryLotId);
            stockMovement.setBeforeQty(beforeQty);
            stockMovement.setQuantity(disposalQty);
            stockMovement.setAfterQty(afterQty);
            stockMovement.setEmployeeId(empId);
            int insertedMovement = disposalMapper.insertStockMovement(stmvSeq, disposalDetail.getDisposalDetailId(), stockMovement);
            if (insertedMovement != 1) {
                throw new CustomException(ErrorCode.NOT_FOUND);//재고변동이력실패
            }
            Integer changedStatus = updateInventoryLotStatus(inventoryLotId);
            if (changedStatus != 1) {
                throw new CustomException(ErrorCode.NOT_FOUND);//상태변경실패
            }
        }
        Integer result = completeDisposal(disposalId);
        if (result != 1) {
            throw new CustomException(ErrorCode.NOT_FOUND);//폐기완료상태변경실패
        }
        return true;
    }

    @Transactional
    public void processDisposal(DisposalRequestVO request,long empId) {
        if (request.getInventoryLotId() == null || request.getInventoryLotId().isEmpty()) {
//            throw new CustomException(ErrorCode.INVALID_REQUEST);
        }
        if (request.getReason() == null || request.getReason().isBlank()) {
//            throw new CustomException(ErrorCode.INVALID_REQUEST);
        }
        int disposalId = getDisposalSeq();
        if(disposalId<=0){
            throw new CustomException(ErrorCode.NOT_FOUND);
        }
        DisposalVO disposal = new DisposalVO();
        disposal.setDisposalId(disposalId);
        disposal.setReason(request.getReason());
        disposal.setCreatedBy(empId);
        insertDisposal(disposal.getDisposalId(),disposal.getReason(),disposal.getCreatedBy());
        for (Integer inventoryLotId : request.getInventoryLotId()) {
            DisposalTargetVO lot = findInventoryLot(inventoryLotId);
            if (lot == null) {
//                throw new CustomException(ErrorCode.INVALID_DISPOSAL_TARGET);
            }
            int beforeQty = lot.getCurrentQty();
            int disposalQty = beforeQty;
            int afterQty = beforeQty - disposalQty;
            if(afterQty < 0) {
//                throw new CustomException(ErrorCode.NOT_FOUND);
            }
            DisposalDetailVO detail = insertDisposalDetail(disposalId,lot,disposalQty,disposal.getReason());
            int updated = reduceLotStock(disposalQty, inventoryLotId);
            if (updated != 1) {
//                throw new CustomException(ErrorCode.DISPOSAL_FAILED);
            }
            int stmvSeq = shipmentMapper.currentStockMovementSeq();
            StockMovementVO stockMovement = new StockMovementVO();
            stockMovement.setInventoryLotId(inventoryLotId);
            stockMovement.setBeforeQty(beforeQty);
            stockMovement.setQuantity(disposalQty);
            stockMovement.setAfterQty(afterQty);
            stockMovement.setEmployeeId(empId);
            int insertedMovement = disposalMapper.insertStockMovement(stmvSeq, detail.getDisposalDetailId(), stockMovement);
            if (insertedMovement != 1) {
                throw new CustomException(ErrorCode.NOT_FOUND);//재고변동이력실패
            }
            Integer changedStatus = updateInventoryLotStatus(inventoryLotId);
            if (changedStatus != 1) {
                throw new CustomException(ErrorCode.NOT_FOUND);//상태변경실패
            }
        }
        Integer result = completeDisposal(disposalId);
        if (result != 1) {
            throw new CustomException(ErrorCode.NOT_FOUND);//폐기완료상태변경실패
        }
    }
}
