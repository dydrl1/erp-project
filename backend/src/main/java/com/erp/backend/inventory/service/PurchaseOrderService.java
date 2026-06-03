package com.erp.backend.inventory.service;

import com.erp.backend.inventory.mapper.PurchaseOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderMapper purchaseOrderMapper;

    // 공급처 목록 조회
    public List<Map<String, Object>> getSuppliers(){
        return purchaseOrderMapper.findAllSuppliers();
    }
}
