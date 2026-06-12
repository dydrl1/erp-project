-- =====================================================================
-- 시드 데이터 (개발/시연용)
-- 계정 / 비밀번호 :
--   admin  : admin1234!    (시스템 관리자, ACTIVE)
--   jypark : manager1234!  (영업관리부 매니저, ACTIVE)
--   jhlee  : emp1234!      (물류관리부 사원, ACTIVE)
--   sachoi : emp1234!      (영업관리부 사원, PENDING — 승인 대기 데모용)
--   su123  : emp1234!      (인사부 사원, PENDING - 승인 거절 데모용)
--   mkjung : emp1234!      (경영지원부 사원, REJECTED — 거절 데모용)
-- =====================================================================

-- 1. 부서
INSERT INTO DEPARTMENT (DEPT_ID, DEPT_CODE, DEPT_NAME, DESCRIPTION, USE_YN, CREATED_AT)
VALUES (SEQ_DEP_ID.NEXTVAL, 'DEPT_SAL', '영업관리부',
        '약국/병원 거래처 주문 접수 및 수금 관리', 'Y', TO_DATE('2024-01-02','YYYY-MM-DD'));

INSERT INTO DEPARTMENT (DEPT_ID, DEPT_CODE, DEPT_NAME, DESCRIPTION, USE_YN, CREATED_AT)
VALUES (SEQ_DEP_ID.NEXTVAL, 'DEPT_LOG', '물류관리부',
        '의약품 발주, 입고, 재고, 출고 관리', 'Y', TO_DATE('2024-01-02','YYYY-MM-DD'));

INSERT INTO DEPARTMENT (DEPT_ID, DEPT_CODE, DEPT_NAME, DESCRIPTION, USE_YN, CREATED_AT)
VALUES (SEQ_DEP_ID.NEXTVAL, 'DEPT_FIN', '경영지원부',
        '정산, 여신 한도 관리, 손익 분석', 'Y', TO_DATE('2024-01-02','YYYY-MM-DD'));

INSERT INTO DEPARTMENT (DEPT_ID, DEPT_CODE, DEPT_NAME, DESCRIPTION, USE_YN, CREATED_AT)
VALUES (SEQ_DEP_ID.NEXTVAL, 'DEPT_HR', '인사부',
        '직원 계정 발급, 인사 정보 및 근태 관리', 'Y', TO_DATE('2024-01-02','YYYY-MM-DD'));

-- 2. 사원
-- 시스템 관리자 (경영지원부)
INSERT INTO EMPLOYEE (EMP_ID, LOGIN_ID, PASSWORD, EMP_NAME, PHONE, EMAIL, DEPT_ID, ROLE_CODE, STATUS, HIRE_DATE, CREATED_AT)
VALUES (EMP_SEQ.NEXTVAL, 'admin',
        '$2a$10$kxPFE1ZkuRiVNbfzGIpPmuMfx1pX6Qah74uSujJbBCLA2PnLC0yYC',
        '김성훈', '010-3825-1147', 'shkim@hanbitpharm.co.kr',
        (SELECT DEPT_ID FROM DEPARTMENT WHERE DEPT_CODE = 'DEPT_FIN'),
        'ADMIN', 'ACTIVE', TO_DATE('2021-03-02','YYYY-MM-DD'), SYSDATE);

-- 영업관리부 매니저
INSERT INTO EMPLOYEE (EMP_ID, LOGIN_ID, PASSWORD, EMP_NAME, PHONE, EMAIL, DEPT_ID, ROLE_CODE, STATUS, HIRE_DATE, CREATED_AT)
VALUES (EMP_SEQ.NEXTVAL, 'jypark',
        '$2a$10$xonNmp7/DoD.MOCHCXbtOuNU74ZiuObNLLjVos6joKdmkvm89.QA.',
        '박지연', '010-7264-3391', 'jypark@hanbitpharm.co.kr',
        (SELECT DEPT_ID FROM DEPARTMENT WHERE DEPT_CODE = 'DEPT_SAL'),
        'MANAGER', 'ACTIVE', TO_DATE('2022-07-01','YYYY-MM-DD'), SYSDATE);

-- 물류관리부 사원 (승인 완료)
INSERT INTO EMPLOYEE (EMP_ID, LOGIN_ID, PASSWORD, EMP_NAME, PHONE, EMAIL, DEPT_ID, ROLE_CODE, STATUS, HIRE_DATE, CREATED_AT)
VALUES (EMP_SEQ.NEXTVAL, 'jhlee',
        '$2a$10$ZQD5z3RVMKuV/xS6j9Q/T.ZM751lDYSug2oIXQfxOYR7aRjcHqhHi',
        '이준호', '010-5118-9027', 'jhlee@hanbitpharm.co.kr',
        (SELECT DEPT_ID FROM DEPARTMENT WHERE DEPT_CODE = 'DEPT_LOG'),
        'EMPLOYEE', 'ACTIVE', TO_DATE('2023-11-13','YYYY-MM-DD'), SYSDATE);

-- 영업관리부 신규 입사자 (승인 대기/승인 확인 — 관리자 승인 화면 데모용)
INSERT INTO EMPLOYEE (EMP_ID, LOGIN_ID, PASSWORD, EMP_NAME, PHONE, EMAIL, DEPT_ID, ROLE_CODE, STATUS, CREATED_AT)
VALUES (EMP_SEQ.NEXTVAL, 'sachoi',
        '$2a$10$ZQD5z3RVMKuV/xS6j9Q/T.ZM751lDYSug2oIXQfxOYR7aRjcHqhHi',
        '최수아', '010-9043-6172', 'sachoi@hanbitpharm.co.kr',
        (SELECT DEPT_ID FROM DEPARTMENT WHERE DEPT_CODE = 'DEPT_SAL'),
        'EMPLOYEE', 'PENDING', SYSDATE);

-- 인사부 신규 입사자 (승인 대기/거절 확인 — 관리자 승인 화면 데모용)
INSERT INTO EMPLOYEE (EMP_ID, LOGIN_ID, PASSWORD, EMP_NAME, PHONE, EMAIL, DEPT_ID, ROLE_CODE, STATUS, CREATED_AT)
VALUES (EMP_SEQ.NEXTVAL, 'sachoi',
        '$2a$10$ZQD5z3RVMKuV/xS6j9Q/T.ZM751lDYSug2oIXQfxOYR7aRjcHqhHi',
        '도수환', '010-6648-2215', 'su123@hanbitpharm.co.kr',
        (SELECT DEPT_ID FROM DEPARTMENT WHERE DEPT_CODE = 'DEPT_HR'),
        'EMPLOYEE', 'PENDING', SYSDATE);

-- 가입 거절 사례 (거절 메시지 데모용)
INSERT INTO EMPLOYEE (EMP_ID, LOGIN_ID, PASSWORD, EMP_NAME, PHONE, EMAIL, DEPT_ID, ROLE_CODE, STATUS, CREATED_AT)
VALUES (EMP_SEQ.NEXTVAL, 'mkjung',
        '$2a$10$ZQD5z3RVMKuV/xS6j9Q/T.ZM751lDYSug2oIXQfxOYR7aRjcHqhHi',
        '정민규', '010-2271-8845', 'mkjung@hanbitpharm.co.kr',
        (SELECT DEPT_ID FROM DEPARTMENT WHERE DEPT_CODE = 'DEPT_FIN'),
        'EMPLOYEE', 'REJECTED', SYSDATE);

COMMIT;
