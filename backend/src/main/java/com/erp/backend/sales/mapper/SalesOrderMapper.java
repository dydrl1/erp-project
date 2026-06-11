package com.erp.backend.sales.mapper;
import com.erp.backend.sales.vo.ProductVO;
import com.erp.backend.sales.vo.SalesOrderAmountCheckVO;
import com.erp.backend.sales.vo.SalesOrderDetailVO;
import com.erp.backend.sales.vo.SalesOrderVO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface SalesOrderMapper {
    ProductVO findProductLotStocksByProductId(int productId);
    ProductVO checkProductById(int productId);
    Integer checkAvailableLot(int productId);
    List<ProductVO> findAvailableLotStocksByProductId(int productId);
    List<SalesOrderVO> findRequestOrderById(int salesOrderId);
    List<SalesOrderVO> findAllOrderStatusList();
    SalesOrderVO findOrderHeaderById(SalesOrderVO salesOrderVO);
    List<SalesOrderDetailVO> findOrderDetailListByOrderId(SalesOrderVO salesOrderVO);
    int existsRequestedOrderDetail(int salesOrderId);
    int makeSalesOrder(SalesOrderVO salesOrderVO);
    int makeSalesOrderDetail(SalesOrderDetailVO salesOrderDetailVO);
    int currentSalesOrderSeq();
    int currentSalesOrderDetailSeq();
    int approveRequest(SalesOrderVO salesOrderVO);
    SalesOrderAmountCheckVO verifySalesOrderTotal(int salesOrderId);
}
