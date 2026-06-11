package com.erp.backend.auth.mapper;

import com.erp.backend.auth.dto.SignupRequestDto;

import com.erp.backend.employee.vo.EmployeeVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AuthMapper {

    EmployeeVO findEmployeeByLoginId(String loginId);
    EmployeeVO findEmployeeByEmpId(Long empId);

    void insertEmployee(@Param("dto") SignupRequestDto dto, @Param("encodedPassword") String encodedPassword);
}