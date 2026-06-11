package com.erp.backend.sales.controller;


import com.erp.backend.sales.dto.SalesOrderRequestDTO;
import com.erp.backend.sales.service.SalesOrderService;
import com.erp.backend.sales.vo.ProductVO;
import com.erp.backend.sales.vo.SalesOrderAmountCheckVO;
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
    public ResponseEntity<ProductVO> findProductLotStock(@RequestParam int productId){
        ProductVO result = salesOrderService.findProductLotStocksByProductId(productId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/products/available-lots")
    public ResponseEntity<List<ProductVO>> findAvailableLotStock(@RequestParam int productId){
        List<ProductVO> item = salesOrderService.findAvailableLotStocksByProductId(productId);
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

    @GetMapping("/{salesId}/header")
    public ResponseEntity<SalesOrderVO> findSimpleOrderHeader(@PathVariable Integer salesId){
        SalesOrderVO salesOrderVO = new SalesOrderVO();
        salesOrderVO.setSoId(salesId);
        SalesOrderVO order = salesOrderService.findSalesOrderHeaderById(salesOrderVO);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/{salesId}/details")
    public ResponseEntity<SalesOrderVO> findSimpleOrderDetailList(@PathVariable Integer salesId){
        SalesOrderVO salesOrderVO = new SalesOrderVO();
        salesOrderVO.setSoId(salesId);
        SalesOrderVO order = salesOrderService.findOrderDetailListByOrderId(salesOrderVO);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{orderId}")
    public ResponseEntity<Void> makeOrder(@PathVariable int orderId,
                                           @RequestBody SalesOrderRequestDTO requestDTO){
        salesOrderService.makeOrder(requestDTO);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{orderId}")
    public ResponseEntity<SalesOrderVO> approveRequest(@PathVariable int orderId,@RequestBody SalesOrderRequestDTO requestDTO){
        SalesOrderVO salesOrderVO = new SalesOrderVO();
        salesOrderVO.setSoId(orderId);
        salesOrderVO.setAppEmployeeId(requestDTO.getEmployeeId());
        SalesOrderVO updateSalesOrder = salesOrderService.approveRequest(salesOrderVO);
        System.out.println(updateSalesOrder);
        return ResponseEntity.ok(updateSalesOrder);
    }

    @GetMapping("/check/{orderId}")
    public ResponseEntity<SalesOrderAmountCheckVO> checkView(@PathVariable int orderId){
        SalesOrderAmountCheckVO salesOrderAmountCheckVO = salesOrderService.verifyAmount(orderId);
        return ResponseEntity.ok(salesOrderAmountCheckVO);
    }
}
