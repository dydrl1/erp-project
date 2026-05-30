package com.erp.backend.auth.mapper;

import com.erp.backend.auth.dto.LoginRequestDto;
import org.apache.ibatis.annotations.Mapper;
import java.util.Map;

@Mapper
public interface AuthMapper {
    Map<String, Object> findEmployeeByLoginId(String loginId);
}