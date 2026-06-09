package com.erp.backend.auth.mapper;

import com.erp.backend.auth.dto.LoginRequestDto;
import com.erp.backend.auth.dto.SignupRequestDto;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Map;

@Mapper
public interface AuthMapper {

    Map<String, Object> findEmployeeByLoginId(String loginId);
    Map<String, Object> findEmployeeByEmpId(Long empId);

    void insertEmployee(@Param("dto") SignupRequestDto dto, @Param("encodedPassword") String encodedPassword);
}