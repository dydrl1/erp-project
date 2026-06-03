package com.erp.backend.inventory.mapper;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface PurchaseOrderMapper {

    // 공급처 목록 조회
    List<Map<String, Object>> findAllSuppliers();
}
