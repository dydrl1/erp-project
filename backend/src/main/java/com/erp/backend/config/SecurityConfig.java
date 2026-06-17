package com.erp.backend.config;

import com.erp.backend.auth.jwt.JwtAuthFilter;
import com.erp.backend.auth.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 비밀번호 변경은 로그인 상태에서만 허용 (permitAll 보다 먼저 선언)
                        .requestMatchers(HttpMethod.PATCH, "/api/auth/password").authenticated()
                        // 로그인·토큰 재발급은 인증 없이 허용
                        .requestMatchers("/api/auth/**").permitAll()
                        // Swagger 허용
                        .requestMatchers("/swagger-ui/**", "/api-docs/**").permitAll()
                        // 부서 조회는 회원가입 폼에서 필요하므로 인증 없이 허용
                        .requestMatchers(HttpMethod.GET, "/api/departments/**").permitAll()
                        // ADMIN, MANAGER 전용
                        .requestMatchers("/api/admin/**").hasAnyRole("MANAGER","ADMIN")
                        // 나머지는 인증 필요
                        .anyRequest().authenticated())
                .addFilterBefore(new JwtAuthFilter(jwtTokenProvider),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    static RoleHierarchy roleHierarchy() {
        return RoleHierarchyImpl.fromHierarchy("ROLE_ADMIN > ROLE_MANAGER > ROLE_EMPLOYEE");
    }
}