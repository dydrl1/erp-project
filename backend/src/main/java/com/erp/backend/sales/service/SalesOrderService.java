package com.erp.backend.sales.service;

import com.erp.backend.sales.mapper.SalesOrderMapper;
import com.erp.backend.sales.vo.ProductLotStockVO;
import com.erp.backend.sales.vo.SalesOrderVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SalesOrderService {

    private final SalesOrderMapper salesOrderMapper;
    public ProductLotStockVO findProductLotStocksByProductId(int producId){
        return salesOrderMapper.findProductLotStocksByProductId(producId);
    }
    public List<ProductLotStockVO> findAvailableLotStocksByProductId(int productId){
        return salesOrderMapper.findAvailableLotStocksByProductId(productId);
    }
    public List<SalesOrderVO> findRequestOrderById(int salesOrderId){
        return salesOrderMapper.findRequestOrderById(salesOrderId);
    }
    public List<SalesOrderVO> findAllOrderStatusList(){
        return salesOrderMapper.findAllOrderStatusList();
    }
    public SalesOrderVO findOrderHeaderById(SalesOrderVO salesOrderVO){
        return salesOrderMapper.findOrderHeaderById(salesOrderVO);
    }
    public SalesOrderVO findOrderDetailListByOrderId(SalesOrderVO salesOrderVO){
        return salesOrderMapper.findOrderDetailListByOrderId(salesOrderVO);
    }
    public int existsRequestedOrderDetail(int salesOrderId){
        return salesOrderMapper.existsRequestedOrderDetail(salesOrderId);
    }

}
