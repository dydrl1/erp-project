package com.erp.backend.sales.service;

import com.erp.backend.common.CustomException;
import com.erp.backend.common.ErrorCode;
import com.erp.backend.sales.Util.OrderStatus;
import com.erp.backend.sales.dto.SalesOrderRequestDTO;
import com.erp.backend.sales.mapper.SalesOrderMapper;
import com.erp.backend.sales.vo.ProductVO;
import com.erp.backend.sales.vo.SalesOrderAmountCheckVO;
import com.erp.backend.sales.vo.SalesOrderDetailVO;
import com.erp.backend.sales.vo.SalesOrderVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalesOrderService {

    private final SalesOrderMapper salesOrderMapper;
    public ProductVO findProductLotStocksByProductId(int productId){
        return salesOrderMapper.findProductLotStocksByProductId(productId);
    }
    public List<ProductVO> findAvailableLotStocksByProductId(int productId){
        return salesOrderMapper.findAvailableLotStocksByProductId(productId);
    }
    public List<SalesOrderVO> findRequestOrderById(int salesOrderId){
        return salesOrderMapper.findRequestOrderById(salesOrderId);
    }
    public List<SalesOrderVO> findAllOrderStatusList(){
        return salesOrderMapper.findAllOrderStatusList();
    }
    public SalesOrderVO findSalesOrderHeaderById(SalesOrderVO salesOrderVO){
        return salesOrderMapper.findOrderHeaderById(salesOrderVO);
    }
    public SalesOrderVO findOrderDetailListByOrderId(SalesOrderVO salesOrderVO){
        SalesOrderVO order = salesOrderMapper.findOrderHeaderById(salesOrderVO);
        if (order == null) {
            return null;
        }
        List<SalesOrderDetailVO> details = salesOrderMapper.findOrderDetailListByOrderId(salesOrderVO);
        order.setDetailList(details);
        return order;
    }

    @Transactional
    public void makeOrder(SalesOrderRequestDTO requestDTO){
        int orderId = salesOrderMapper.currentSalesOrderSeq();
        SalesOrderVO salesOrderVO = new SalesOrderVO();
        salesOrderVO.setSoId(orderId);
        salesOrderVO.setCustomerId(requestDTO.getCustomerId());
        salesOrderVO.setReqEmployeeId(requestDTO.getEmployeeId());
        salesOrderVO.setTotalAmount(requestDTO.getAmount());
        salesOrderVO.setOrderDate(LocalDateTime.now());
        salesOrderVO.setStatus(OrderStatus.REQUESTED.name());
        ProductVO productVO = salesOrderMapper.checkProductById(requestDTO.getProductId());
        if(requestDTO.getOrderQty() < salesOrderMapper.checkAvailableLot(productVO.getProductId())){
            throw new CustomException(ErrorCode.SALES_NOT_AVAILABLE_STOCK);
        }
        int result = salesOrderMapper.makeSalesOrder(salesOrderVO);
        if (result == 1){
            int detailId = salesOrderMapper.currentSalesOrderDetailSeq();
            SalesOrderDetailVO salesOrderDetailVO = new SalesOrderDetailVO();
            salesOrderDetailVO.setSoDetailId(detailId);
            salesOrderDetailVO.setSoId(orderId);
            salesOrderDetailVO.setProductId(requestDTO.getProductId());
            salesOrderDetailVO.setOrderQty(requestDTO.getOrderQty());
            salesOrderDetailVO.setUnitPrice(productVO.getStandardSalesPrice());
            salesOrderDetailVO.setAmount(productVO.getStandardSalesPrice().multiply(BigDecimal.valueOf(requestDTO.getOrderQty())));
            salesOrderMapper.makeSalesOrderDetail(salesOrderDetailVO);
        }
    }

    @Transactional
    public SalesOrderVO approveRequest(SalesOrderVO salesOrderVO){
        SalesOrderAmountCheckVO salesOrderAmountCheckVO;
        salesOrderAmountCheckVO=verifyAmount(salesOrderVO.getSoId());
        if(!salesOrderAmountCheckVO.amountMatched()){
            throw new CustomException(ErrorCode.SALES_NOT_AMOUNT_MATCHED);
        }
        salesOrderVO.setStatus(OrderStatus.APPROVED.name());
        salesOrderVO.setApproveDate(LocalDateTime.now());
        if(salesOrderMapper.approveRequest(salesOrderVO)!=1){
            throw new CustomException(ErrorCode.SALES_APPROVE_FAILED);
        }
        return salesOrderMapper.findOrderHeaderById(salesOrderVO);
    }

    public SalesOrderAmountCheckVO verifyAmount(int salesId){
        return salesOrderMapper.verifySalesOrderTotal(salesId);
    }

    public int existsRequestedOrderDetail(int salesOrderId){
        return salesOrderMapper.existsRequestedOrderDetail(salesOrderId);
    }
}
