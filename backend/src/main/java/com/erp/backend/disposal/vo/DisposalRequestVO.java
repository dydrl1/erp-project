package com.erp.backend.disposal.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DisposalRequestVO {
    private String reason;
    private long empId;
    private int disposalQty;
    private int inventoryLotId;
}
