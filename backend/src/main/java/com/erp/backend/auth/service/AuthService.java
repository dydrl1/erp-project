package com.erp.backend.auth.service;

import com.erp.backend.auth.dto.LoginRequestDto;
import com.erp.backend.auth.dto.LoginResponseDto;
import com.erp.backend.auth.dto.SignupRequestDto;
import com.erp.backend.auth.jwt.JwtTokenProvider;
import com.erp.backend.auth.mapper.AuthMapper;
import com.erp.backend.auth.mapper.RefreshTokenMapper;
import com.erp.backend.common.CustomException;
import com.erp.backend.common.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthMapper authMapper;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenMapper refreshTokenMapper;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    // 1. 로그인
    public LoginResponseDto login(LoginRequestDto requestDto) {
        // 사원 조회
        Map<String, Object> employee = authMapper.findEmployeeByLoginId(requestDto.getLoginId());

        if (employee == null) {
            throw new CustomException(ErrorCode.LOGIN_FAILED);
        }

        // 비밀번호 검증
        if (!passwordEncoder.matches(requestDto.getPassword(),
                (String) employee.get("PASSWORD"))) {
            throw new CustomException(ErrorCode.LOGIN_FAILED);
        }

        Long empId = ((Number) employee.get("EMP_ID")).longValue();
        String role = (String) employee.get("ROLE");

        // 토큰 생성
        String accessToken = jwtTokenProvider.generateAccessToken(empId, role);
        String refreshToken = jwtTokenProvider.generateRefreshToken(empId);

        // Refresh Token DB 저장
        refreshTokenMapper.saveRefreshToken(jwtTokenProvider.getTokenId(refreshToken), empId,
                LocalDateTime.now().plus(refreshTokenExpiration, ChronoUnit.MILLIS));

        return buildResponse(employee, accessToken, refreshToken);
    }

    // 2. 회원 가입
    @Transactional
    public void signup(SignupRequestDto dto) {
        if (authMapper.findEmployeeByLoginId(dto.getLoginId()) != null) {
            throw new CustomException(ErrorCode.EMPLOYEE_ALREADY_EXISTS);
        }
        authMapper.insertEmployee(dto, passwordEncoder.encode(dto.getPassword()));
    }

    // 3. 토큰 재발급
    public LoginResponseDto refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new CustomException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        if (!"refresh".equals(jwtTokenProvider.getTokenType(refreshToken))) {
            throw new CustomException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        String jwtId = jwtTokenProvider.getTokenId(refreshToken);
        if (refreshTokenMapper.findByJwtId(jwtId) == null) {
            throw new CustomException(ErrorCode.REFRESH_TOKEN_INVALID);
        }
        refreshTokenMapper.deleteByJwtId(jwtId); // 오래된 Refresh Token 삭제

        Long empId = jwtTokenProvider.getEmpId(refreshToken);
        Map<String, Object> employee = authMapper.findEmployeeByEmpId(empId);
        if (employee == null) {
            throw new CustomException(ErrorCode.EMPLOYEE_NOT_FOUND);
        }

        String role = (String) employee.get("ROLE");
        String newAccessToken = jwtTokenProvider.generateAccessToken(empId, role);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(empId);

        refreshTokenMapper.saveRefreshToken(
                jwtTokenProvider.getTokenId(newRefreshToken),
                empId,
                LocalDateTime.now().plus(refreshTokenExpiration, ChronoUnit.MILLIS));

        return buildResponse(employee, newAccessToken, newRefreshToken);
    }

    // 4. 로그아웃 (Refresh Token 삭제 - Access Token은 만료될 때까지 유지)
    public void logout(String refreshToken) {

        // 1) Refresh Token 유효성 검사
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new CustomException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        String jwtId = jwtTokenProvider.getTokenId(refreshToken);

        // 2) 타입 체크
        if (!"refresh".equals(jwtTokenProvider.getTokenType(refreshToken))) {
            throw new CustomException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        // 3) JTI로 DB에 저장된 Refresh Token 조회 -> 있으면 삭제
        Map<String, Object> stored = refreshTokenMapper.findByJwtId(jwtId);
        if (stored != null)
            refreshTokenMapper.deleteByJwtId(jwtId);

    }

    // 5. 응답 DTO 빌더
    private LoginResponseDto buildResponse(Map<String, Object> employee, String accessToken, String refreshToken) {
        return LoginResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .empId(((Number) employee.get("EMP_ID")).longValue())
                .loginId((String) employee.get("LOGIN_ID"))
                .empName((String) employee.get("EMP_NAME"))
                .role((String) employee.get("ROLE"))
                .deptId(((Number) employee.get("DEPT_ID")).longValue())
                .build();
    }
}