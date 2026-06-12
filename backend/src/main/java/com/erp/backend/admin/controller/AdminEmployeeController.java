package com.erp.backend.admin.controller;

import com.erp.backend.admin.service.AdminEmployeeService;
import com.erp.backend.common.ApiResponse;
import com.erp.backend.employee.dto.EmployeeResponseDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name="관리자", description = "사원 승인 관련 API(ADMIN 전용)")
@RequiredArgsConstructor
@RequestMapping("/api/admin/employees")
@RestController
public class AdminEmployeeController {

    private final AdminEmployeeService adminEmployeeService;


    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<EmployeeResponseDto>>> listPendingEmp() {
        return ResponseEntity.ok(ApiResponse.success(adminEmployeeService.getPendingEmployees()));
    }

    @PostMapping("/{empId}/approve")
    public ResponseEntity<ApiResponse<Void>> approve(@PathVariable Long empId) {
        adminEmployeeService.approve(empId);
        return ResponseEntity.ok(ApiResponse.success("사원 가입 승인 완료", null));
    }

    @PostMapping("/{empId}/reject")
    public ResponseEntity<ApiResponse<Void>> reject(@PathVariable Long empId){
        adminEmployeeService.reject(empId);
        return ResponseEntity.ok(ApiResponse.success("사원 가입 승인 거절", null));
    }
}
