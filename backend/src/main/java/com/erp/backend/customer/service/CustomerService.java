package com.erp.backend.customer.service;

import com.erp.backend.common.CustomException;
import com.erp.backend.common.ErrorCode;
import com.erp.backend.customer.dto.CustomerCreateRequestDto;
import com.erp.backend.customer.dto.CustomerResponseDto;
import com.erp.backend.customer.dto.CustomerUpdateRequestDto;
import com.erp.backend.customer.mapper.CustomerMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerMapper customerMapper;

    // ---------- 거래처 등록 ----------
    @Transactional
    public void createCustomer(CustomerCreateRequestDto dto) {

        // 사업자번호 중복 확인 (입력된 경우만)
        if (dto.getBusinessNo() != null && !dto.getBusinessNo().isBlank()) {
            int count = customerMapper.countByBusinessNo(dto.getBusinessNo());
            if (count > 0) {
                throw new CustomException(ErrorCode.DUPLICATE_BUSINESS_NO);
            }
        }

        Map<String, Object> params = new HashMap<>();
        params.put("customerName", dto.getCustomerName());
        params.put("customerType", dto.getCustomerType());
        params.put("businessNo", dto.getBusinessNo());
        params.put("creditLimit", dto.getCreditLimit() != null ? dto.getCreditLimit() : BigDecimal.ZERO);
        params.put("phone", dto.getPhone());
        params.put("address", dto.getAddress());

        customerMapper.insertCustomer(params);
    }

    // ---------- 거래처 목록 조회 ----------
    public List<CustomerResponseDto> getCustomers(String customerType, String status, String keyword) {
        Map<String, Object> params = new HashMap<>();
        params.put("customerType", customerType);
        params.put("status", status);
        params.put("keyword", keyword);
        return customerMapper.findAllCustomers(params);
    }

    // ---------- 거래처 상세 조회 ----------
    public CustomerResponseDto getCustomerById(Long customerId) {
        CustomerResponseDto customer = customerMapper.findCustomerById(customerId);
        if (customer == null) {
            throw new CustomException(ErrorCode.CUSTOMER_NOT_FOUND);
        }
        return customer;
    }

    // ---------- 거래처 수정 ----------
    @Transactional
    public void updateCustomer(Long customerId, @Valid CustomerUpdateRequestDto dto) {
        // 존재 여부 확인
        CustomerResponseDto existing = customerMapper.findCustomerById(customerId);
        if (existing == null) {
            throw new CustomException(ErrorCode.CUSTOMER_NOT_FOUND);
        }

        Map<String, Object> params = new HashMap<>();
        params.put("customerId", customerId);
        params.put("customerName", dto.getCustomerName());
        params.put("customerType", dto.getCustomerType());
        params.put("businessNo", dto.getBusinessNo());
        params.put("creditLimit", dto.getCreditLimit() != null ? dto.getCreditLimit() : BigDecimal.ZERO);
        params.put("phone", dto.getPhone());
        params.put("address", dto.getAddress());
        params.put("status", "ACTIVE");

        customerMapper.updateCustomer(params);
    }
}