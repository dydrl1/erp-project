package com.erp.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class BackendApplication {
    /**
     * ERP 백엔드를 시작하고 스케줄 작업을 활성화한다.
     * 상품 동기화 실행 시점은 application.yml의 월간 cron 설정으로 제어한다.
     */
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
