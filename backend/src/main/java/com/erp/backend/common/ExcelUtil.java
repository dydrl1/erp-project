package com.erp.backend.common;
import org.apache.poi.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.util.List;

public class ExcelUtil {

    public ExcelUtil(){}

    public static <T> Workbook createExcel(String title, String employeeName, List<String> headers, List<Integer> columnWidths, List<T> dataList, ExcelRowWriter<T> rowWriter) {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet(title);
        int rowIndex = 0;

        CellStyle titleStyle = workbook.createCellStyle();
        titleStyle.setAlignment(HorizontalAlignment.CENTER);
        titleStyle.setVerticalAlignment(VerticalAlignment.CENTER);

        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);

        Row titleRow = sheet.createRow(rowIndex++);
        titleRow.createCell(0).setCellValue(title);
        titleRow.getCell(0).setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, headers.size() - 1));
        titleRow.setHeightInPoints(30);

        Row employeeNameRow = sheet.createRow(rowIndex++);
        employeeNameRow.createCell(1).setCellValue("담당자");
        employeeNameRow.createCell(2).setCellValue(employeeName);

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

