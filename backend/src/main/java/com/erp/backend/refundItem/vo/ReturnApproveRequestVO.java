package com.erp.backend.refundItem.vo;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ReturnApproveRequestVO {
    private Integer returnGroupId;
    private long approveBy;
}
