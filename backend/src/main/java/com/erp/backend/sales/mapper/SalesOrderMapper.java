package com.erp.backend.sales.mapper;
import com.erp.backend.sales.vo.ProductLotStockVO;
import com.erp.backend.sales.vo.SalesOrderVO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface SalesOrderMapper {
    ProductLotStockVO findProductLotStocksByProductId(int productId);
    List<ProductLotStockVO> findAvailableLotStocksByProductId(int productId);
    List<SalesOrderVO> findRequestOrderById(int salesOrderId);
    List<SalesOrderVO> findAllOrderStatusList();
    SalesOrderVO findOrderHeaderById(SalesOrderVO salesOrderVO);
    SalesOrderVO findOrderDetailListByOrderId(SalesOrderVO salesOrderVO);
    int existsRequestedOrderDetail(int salesOrderId);
}
