package com.erp.backend.common;

import org.apache.poi.ss.usermodel.Row;

@FunctionalInterface
public interface ExcelRowWriter<T>{
    void write(Row row, T data);
}