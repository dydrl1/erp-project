package com.erp.backend.auth.service;

import com.erp.backend.auth.dto.ChangePasswordRequestDto;
import com.erp.backend.auth.dto.LoginRequestDto;
import com.erp.backend.auth.dto.LoginResponseDto;
import com.erp.backend.auth.dto.SignupRequestDto;
import com.erp.backend.auth.jwt.JwtTokenProvider;
import com.erp.backend.auth.mapper.AuthMapper;
import com.erp.backend.auth.mapper.RefreshTokenMapper;
import com.erp.backend.auth.vo.RefreshTokenVO;
import com.erp.backend.common.CustomException;
import com.erp.backend.common.EmployeeStatus;
import com.erp.backend.common.ErrorCode;
import com.erp.backend.employee.vo.EmployeeVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

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
        EmployeeVO employee = authMapper.findEmployeeByLoginId(requestDto.getLoginId());

        if (employee == null) {
            throw new CustomException(ErrorCode.LOGIN_FAILED);
        }

        // 비밀번호 검증
        if (!passwordEncoder.matches(requestDto.getPassword(), employee.getPassword())) {
            throw new CustomException(ErrorCode.LOGIN_FAILED);
        }

        // 계정 상태 검증 (비밀번호 검증 후에 해야 계정 존재 여부가 노출되지 않음)
        if (EmployeeStatus.PENDING.name().equals(employee.getStatus())) {
            throw new CustomException(ErrorCode.ACCOUNT_PENDING);
        }
        if (EmployeeStatus.INACTIVE.name().equals(employee.getStatus())) {
            throw new CustomException(ErrorCode.ACCOUNT_INACTIVE);
        }
        if (!EmployeeStatus.ACTIVE.name().equals(employee.getStatus())) {
            throw new CustomException(ErrorCode.ACCOUNT_REJECTED);
        }

        Long empId = employee.getEmpId();
        String role = employee.getRoleCode();
        String deptCode = employee.getDeptCode();

        // 토큰 생성
        String accessToken = jwtTokenProvider.generateAccessToken(empId, deptCode, role);
        String refreshToken = jwtTokenProvider.generateRefreshToken(empId);

        // Refresh Token DB 저장
        refreshTokenMapper.saveRefreshToken(jwtTokenProvider.getTokenId(refreshToken), empId,
                LocalDateTime.now().plus(refreshTokenExpiration, ChronoUnit.MILLIS));

        return buildResponse(employee, accessToken, refreshToken);
    }

    // 2. 회원 가입
    @Transactional
    public void signup(SignupRequestDto dto) {
        if (authMapper.existsEmployeeByLoginId(dto.getLoginId())) {
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
        EmployeeVO employee = authMapper.findEmployeeByEmpId(empId);
        if (employee == null) {
            throw new CustomException(ErrorCode.EMPLOYEE_NOT_FOUND);
        }

        String role = employee.getRoleCode();
        String deptCode = employee.getDeptCode();
        String newAccessToken = jwtTokenProvider.generateAccessToken(empId, deptCode, role);
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
        RefreshTokenVO stored = refreshTokenMapper.findByJwtId(jwtId);
        if (stored != null)
            refreshTokenMapper.deleteByJwtId(jwtId);

    }

    // 5. 비밀번호 변경
    @Transactional
    public void changePassword(Long empId, ChangePasswordRequestDto dto) {
        EmployeeVO employee = authMapper.findEmployeeByEmpId(empId);
        if (employee == null) {
            throw new CustomException(ErrorCode.EMPLOYEE_NOT_FOUND);
        }

        // 1) 현재 비밀번호 확인
        if (!passwordEncoder.matches(dto.getCurrentPassword(), employee.getPassword())) {
            throw new CustomException(ErrorCode.PASSWORD_MISMATCH);
        }

        // 2) 새 비밀번호와 확인 일치 여부
        if (!dto.getNewPassword().equals(dto.getCheckNewPassword())) {
            throw new CustomException(ErrorCode.PASSWORD_CONFIRM_MISMATCH);
        }

        // 3) 기존 비밀번호와 동일한지 확인
        if (passwordEncoder.matches(dto.getNewPassword(), employee.getPassword())) {
            throw new CustomException(ErrorCode.SAME_AS_CURRENT_PASSWORD);
        }

        authMapper.updatePassword(empId, passwordEncoder.encode(dto.getNewPassword()));
    }

    // 6. 응답 DTO 빌더
    private LoginResponseDto buildResponse(EmployeeVO employee, String accessToken, String refreshToken) {
        return LoginResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .empId(employee.getEmpId())
                .loginId((employee.getLoginId()))
                .empName(employee.getEmpName())
                .role(employee.getRoleCode())
                .deptId(employee.getDeptId())
                .build();
    }
}