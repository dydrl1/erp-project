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

        CellStyle employeeStyle = workbook.createCellStyle();
        employeeStyle.setAlignment(HorizontalAlignment.CENTER);
        employeeStyle.setVerticalAlignment(VerticalAlignment.CENTER);

        Row employeeNameRow = sheet.createRow(rowIndex++);

        int employeeLabelColumn = headers.size() - 2;
        int employeeNameColumn = headers.size() - 1;

        Cell employeeLabelCell = employeeNameRow.createCell(employeeLabelColumn);
        employeeLabelCell.setCellValue("담당자");
        employeeLabelCell.setCellStyle(employeeStyle);

        Cell employeeNameCell = employeeNameRow.createCell(employeeNameColumn);
        employeeNameCell.setCellValue(employeeName);
        employeeNameCell.setCellStyle(employeeStyle);

        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        headerStyle.setFillForegroundColor(
                IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex()
        );
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);

        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);

        Row headerRow = sheet.createRow(rowIndex++);
        headerRow.setHeightInPoints(22);
        for(int i=0;i<headers.size();i++){
            headerRow.createCell(i).setCellValue(headers.get(i));
            headerRow.getCell(i).setCellStyle(headerStyle);
        }

        for(T data:dataList){
            Row row = sheet.createRow(rowIndex++);
            rowWriter.write(row,data);
        }

        for(int i=0;i<columnWidths.size();i++){
            sheet.setColumnWidth(i,columnWidths.get(i));
        }
        sheet.setDisplayGridlines(false);
        return workbook;
    }
}

