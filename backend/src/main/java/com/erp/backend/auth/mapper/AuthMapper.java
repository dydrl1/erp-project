package com.erp.backend.auth.mapper;

import com.erp.backend.auth.dto.SignupRequestDto;

import com.erp.backend.employee.vo.EmployeeVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AuthMapper {

    EmployeeVO findEmployeeByLoginId(String loginId);
    EmployeeVO findEmployeeByEmpId(Long empId);

    boolean existsEmployeeByLoginId(String loginId);
    // 관리자(MANAGER)의 직원 등록
    void insertEmployee(@Param("dto") SignupRequestDto dto, @Param("encodedPassword") String encodedPassword);
}