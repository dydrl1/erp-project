package com.erp.backend.sales.controller;


import com.erp.backend.sales.service.SalesOrderService;
import com.erp.backend.sales.vo.ProductLotStockVO;
import com.erp.backend.sales.vo.SalesOrderVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales-order")

public class SalesOrderController {

    private final SalesOrderService salesOrderService;

    @Autowired
    public SalesOrderController(SalesOrderService salesOrderService){
        this.salesOrderService = salesOrderService;
    }

    @GetMapping("/products/lot-stock")
    public ResponseEntity<ProductLotStockVO> findProductLotStock(@RequestParam int productId){
        ProductLotStockVO result = salesOrderService.findProductLotStocksByProductId(productId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/products/available-lots")
    public ResponseEntity<List<ProductLotStockVO>> findAvailableLotStock(@RequestParam int productId){
        List<ProductLotStockVO> item = salesOrderService.findAvailableLotStocksByProductId(productId);
        return ResponseEntity.ok(item);
    }

    @GetMapping("/requested/status")
    public ResponseEntity<List<SalesOrderVO>> findRequestOrder(@RequestParam int salesOrderId){
        List<SalesOrderVO> orders = salesOrderService.findRequestOrderById(salesOrderId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/status")
    public ResponseEntity<List<SalesOrderVO>> findAllOrderStatus(){
        List<SalesOrderVO> orders = salesOrderService.findAllOrderStatusList();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/header")
    public ResponseEntity<SalesOrderVO> findSimpleOrderHeader(@RequestParam int soId, @RequestParam int customerId,@RequestParam int reqEmployeeId,@RequestParam int apprEmployeeId ){
        SalesOrderVO salesOrderVO = new SalesOrderVO();
        salesOrderVO.setSoId(soId);
        salesOrderVO.setCustomerId(customerId);
        salesOrderVO.setReqEmployeeId(reqEmployeeId);
        salesOrderVO.setApproveEmpId(apprEmployeeId);
        SalesOrderVO order = salesOrderService.findOrderHeaderById(salesOrderVO);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/details") //리팩토링필요
    public ResponseEntity<SalesOrderVO> findSimpleOrderDetailList(@RequestParam int soId, @RequestParam int customerId,@RequestParam int reqEmployeeId,@RequestParam int apprEmployeeId ){
        SalesOrderVO salesOrderVO = new SalesOrderVO();
        salesOrderVO.setSoId(soId);
        salesOrderVO.setCustomerId(customerId);
        salesOrderVO.setReqEmployeeId(reqEmployeeId);
        salesOrderVO.setApproveEmpId(apprEmployeeId);
        SalesOrderVO order = salesOrderService.findOrderDetailListByOrderId(salesOrderVO);
        return ResponseEntity.ok(order);
    }

//    @GetMapping("/order-detail/{detail}")
//    public ResponseEntity<Integer> checkOrderDetailExist(@PathVariable int detail){
//        return ResponseEntity.ok(salesOrderService.existsRequestedOrderDetail(detail));
//    }
}
