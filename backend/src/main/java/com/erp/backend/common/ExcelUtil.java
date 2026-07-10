package com.erp.backend.common;
import org.apache.poi.*;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.util.List;

public class ExcelUtil {

    public ExcelUtil(){}

    public static <T>Workbook createExcel(String title, List<String> headers,List<Integer> columnWidths,List<T> dataList,ExcelRowWriter<T> rowWriter){
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet(title);
        int rowIndex = 0;

        Row titleRow = sheet.createRow(rowIndex++);
        titleRow.createCell(0).setCellValue(title);

        Row headerRow = sheet.createRow(rowIndex++);
        for(int i=0;i<headers.size();i++){
            headerRow.createCell(i).setCellValue(headers.get(i));
        }

        for(T data:dataList){
            Row row = sheet.createRow(rowIndex++);
            rowWriter.write(row,data);
        }

        for(int i=0;i<columnWidths.size();i++){
            sheet.setColumnWidth(i,columnWidths.get(i));
        }
        return workbook;
    }
}

