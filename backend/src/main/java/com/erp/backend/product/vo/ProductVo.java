package com.erp.backend.product.vo;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class ProductVo {
    private Long productId; //내부DB 상품 PK
    private String productCode; //상품코드 (식약처 ITEM_SEQ 매핑) -- api 의약품 품목허가정보
    private String productName; //상품명 -- api 의약품 품목허가정보
    private String makerName; // 제조사 및 판매사  -- api 의약품 품목허가정보
    private String unit; // 포장 단위(수량/EA,BOX 등) -- api 의약품 상세정보
    private BigDecimal standardPurchasePrice; // 기준 매입단가
    private BigDecimal standardSalePrice; // 기준 판매 단가
    private String isPrescription; // 전문 의약품 여부 -- api 의약품 품목허가정보
    private String storageType; // 상품 보관 형태 -- api 의약품 상세정보
    private String status; // 상품 사용 상태 -- api 의약품 품목허가정보
    private LocalDateTime createdAt; // 상품생성일자
    private LocalDateTime updatedAt; // 의약품 수정일자 -- api 의약품 품목허가정보

}
