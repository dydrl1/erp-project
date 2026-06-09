package com.erp.backend.auth.mapper;

import java.time.LocalDateTime;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface RefreshTokenMapper {

    void saveRefreshToken(@Param("jwtId") String jwtId, @Param("empId") Long empId,
            @Param("expiresAt") LocalDateTime expiresAt);

    Map<String, Object> findByJwtId(String jwtId);

    void deleteByJwtId(String jwtId);
}
