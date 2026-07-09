package com.erp.backend.disposal.vo;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DisposalRequestVO {
    private String reason;
    private long empId;
    private Integer disposalQty;
    private List<Integer> inventoryLotId;
}
