package com.erp.backend.refundItem.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReturnRejectRequestVO {
    private Integer returnGroupId;
    private long approveBy;
    private String rejectReason;
}
