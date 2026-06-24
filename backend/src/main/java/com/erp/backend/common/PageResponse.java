package com.erp.backend.common;

import lombok.Getter;
import java.util.List;

@Getter
public class PageResponse<T> {
    private final List<T> list;
    private final int size;
    private final int total;
    private final int totalPage;

    public PageResponse(List<T> list, int size, int total, int totalPage) {
        this.list = list;
        this.size = size;
        this.total = total;
        this.totalPage = (total + size - 1) / size;}
    
}
