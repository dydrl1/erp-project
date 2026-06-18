package com.erp.backend.auth.mapper;

import java.time.LocalDateTime;

import com.erp.backend.auth.vo.RefreshTokenVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface RefreshTokenMapper {

    void saveRefreshToken(@Param("jwtId") String jwtId, @Param("empId") Long empId,
            @Param("expiresAt") LocalDateTime expiresAt);

    RefreshTokenVo findByJwtId(String jwtId);

    void deleteByJwtId(String jwtId);
}
