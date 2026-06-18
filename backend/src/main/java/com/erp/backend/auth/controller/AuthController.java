package com.erp.backend.auth.controller;

import com.erp.backend.auth.dto.LoginRequestDto;
import com.erp.backend.auth.dto.LoginResponseDto;
import com.erp.backend.auth.dto.RefreshTokenRequestDto;
import com.erp.backend.auth.dto.SignupRequestDto;
import com.erp.backend.auth.service.AuthService;
import com.erp.backend.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "인증", description = "로그인·토큰 관련 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "로그인")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDto>> login(
            @Valid @RequestBody LoginRequestDto requestDto) {
        LoginResponseDto response = authService.login(requestDto);
        return ResponseEntity.ok(ApiResponse.success("로그인 성공", response));
    }

    @Operation(summary = "회원 가입")
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Void>> signup(@Valid @RequestBody SignupRequestDto dto) {
        authService.signup(dto);
        return ResponseEntity.ok(ApiResponse.success("회원 가입 성공", null));
    }

    @Operation(summary = "액세스 토큰 재발급")
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponseDto>> refreshToken(
            @Valid @RequestBody RefreshTokenRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success("토큰 재발급 성공",
                authService.refreshToken(dto.getRefreshToken())));
    }

    @Operation(summary = "로그아웃")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@Valid @RequestBody RefreshTokenRequestDto dto) {
        authService.logout(dto.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("로그아웃 성공", null));
    }
}