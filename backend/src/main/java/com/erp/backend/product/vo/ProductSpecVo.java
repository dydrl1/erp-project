package com.erp.backend.product.vo;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ProductSpecVo {
    private Long specId; // 상세 분류 PK
    private String specName;    // 상품분류 -- api 의약품 품목허가정보
    private String description;    // 상품설명 -- api 의약품 상세정보
    private String productCode;    // 상품코드 -- api 의약품 품목허가정보
    private String useYn;    // 사용여부 -- api 의약품 품목허가정보
    private LocalDateTime createdAt;    // 생성일

}
