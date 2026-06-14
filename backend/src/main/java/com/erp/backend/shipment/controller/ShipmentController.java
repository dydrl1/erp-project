package com.erp.backend.shipment.controller;

import com.erp.backend.sales.dto.SalesOrderRequestDTO;
import com.erp.backend.sales.vo.SalesOrderDetailVO;
import com.erp.backend.shipment.service.ShipmentService;
import com.erp.backend.shipment.vo.ShipmentDetailVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipment")
public class ShipmentController {

    private final ShipmentService shipmentService;

    @Autowired
    public ShipmentController(ShipmentService shipmentService){
        this.shipmentService = shipmentService;
    }

    @GetMapping("/")
    public ResponseEntity<Integer> testMethod(){
        return ResponseEntity.ok(shipmentService.testMapper());
    }

    @PostMapping("/testController/{salesId}")
    public ResponseEntity<Void> testControllerAPI(@RequestBody SalesOrderRequestDTO request, @PathVariable int salesId){
        SalesOrderDetailVO salesOrderDetailVO = new SalesOrderDetailVO();
        salesOrderDetailVO.setSoId(salesId);
        salesOrderDetailVO.setProductId(request.getProductId());
        salesOrderDetailVO.setOrderQty(request.getOrderQty());
//        shipmentService.allocateLots(salesOrderDetailVO);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{shipmentId}/detail")
    public ResponseEntity<List<ShipmentDetailVO>> findDetails(@PathVariable int shipmentId){
        return ResponseEntity.ok(shipmentService.findShipmentDetails(shipmentId));
    }

    @PostMapping("/process")
    public ResponseEntity<Void> processShipment(@RequestParam Integer salesOrderId,@RequestParam Integer employeeId){
        shipmentService.processShipment(salesOrderId,employeeId);
        return ResponseEntity.ok().build();
    }
}
