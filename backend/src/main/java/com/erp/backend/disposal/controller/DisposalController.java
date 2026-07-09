package com.erp.backend.disposal.controller;

import com.erp.backend.common.ApiResponse;
import com.erp.backend.disposal.service.DisposalService;
import com.erp.backend.disposal.vo.DisposalRequestVO;
import com.erp.backend.disposal.vo.DisposalTargetVO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/disposals")
@RequiredArgsConstructor
public class DisposalController {

    private final DisposalService disposalService;

//    @PostMapping
//    public ResponseEntity<ApiResponse<Integer>> requestDisposal(@RequestBody DisposalRequestVO request) {
//        int disposalId = disposalService.requestDisposal(request.getReason(), request.getEmpId(), request.getDisposalQty(), request.getInventoryLotId());
//        return ResponseEntity.ok(ApiResponse.success("폐기 요청이 등록되었습니다.", disposalId));
//    }

    @GetMapping("/targets")
    public ApiResponse<List<DisposalTargetVO>> findDisposalTargets() {
        return ApiResponse.success(disposalService.findDisposalTargets());
    }

    @PatchMapping("/{disposalId}/approve")
    public ResponseEntity<ApiResponse<Void>> approveDisposal(@PathVariable int disposalId,
                                                             @AuthenticationPrincipal long empId) {
        disposalService.approveDisposal(empId, disposalId);
        return ResponseEntity.ok(ApiResponse.success("폐기 요청이 승인되었습니다.", null));
    }

    @PatchMapping("/{disposalId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectDisposal(@PathVariable int disposalId,
                                                            @RequestBody DisposalRequestVO request) {
        disposalService.rejectDisposal(disposalId, request.getReason());
        return ResponseEntity.ok(ApiResponse.success("폐기 요청이 반려되었습니다.", null));
    }

    @PostMapping("/process")
    public ResponseEntity<ApiResponse<Boolean>> processDisposal(@RequestBody DisposalRequestVO request, @AuthenticationPrincipal long empId) {
        disposalService.processDisposal(request,empId);
        return ResponseEntity.ok(ApiResponse.success("폐기 처리가 완료되었습니다.", null));
    }
}
