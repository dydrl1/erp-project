package com.erp.backend.sales.mapper;
import com.erp.backend.sales.vo.*;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface SalesOrderMapper {
    int existsRequestedOrderWithDetail(int salesOrderId);
    List<SalesOrderVO> findAllSalesOrders(String status);
    List<ProductVO> findProductLotsById(int productId);
    ProductVO findActiveProduct(int productId);
    int findAvailableQtyByProductId(int productId);
    List<ProductVO> findAvailableProductLotsByProductId(int productId);
    List<SalesOrderVO> findRequestOrderById(int salesOrderId);
    List<SalesOrderVO> findAllOrderStatus();
    SalesOrderVO findOrderHeaderById(int soId);
    List<SalesOrderDetailVO> findOrderDetailListByOrderId(int soId);
    SalesOrderVO findSalesOrder(int soId);
    int makeSalesOrder(SalesOrderVO salesOrderVO);
    int makeSalesOrderDetail(SalesOrderDetailVO salesOrderDetailVO);
    int currentSalesOrderSeq();
    int currentSalesOrderDetailSeq();
    int approveRequest(SalesOrderVO salesOrderVO);
    SalesOrderAmountCheckVO verifySalesOrderTotal(int salesOrderId);
    List<ItemLotVO> findAvailableLotByProductId(int productId);
}
