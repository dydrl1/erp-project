-- =====================================================================
-- DDL : 신규 DB 전체 생성 스크립트
-- 실행 순서 : schema.sql → data.sql
-- =====================================================================

-- 재실행(초기화) 시 주석 해제 후 사용
-- DROP TABLE REFRESH_TOKEN;
-- DROP TABLE EMPLOYEE;
-- DROP TABLE DEPARTMENT;
-- DROP SEQUENCE EMP_SEQ;
-- DROP SEQUENCE SEQ_DEP_ID;

-- ---------------------------------------------------------------------
-- 1. 부서
-- ---------------------------------------------------------------------
CREATE TABLE DEPARTMENT (
    DEPT_ID      NUMBER           NOT NULL,
    DEPT_NAME    VARCHAR2(50)     NOT NULL,
    DEPT_CODE    VARCHAR2(50)     NOT NULL,
    DESCRIPTION  VARCHAR2(300),
    USE_YN       CHAR(1)          DEFAULT 'Y' NOT NULL,
    CREATED_AT   DATE             DEFAULT SYSDATE       ,

    CONSTRAINT PK_DEPARTMENT PRIMARY KEY (DEPT_ID),
    CONSTRAINT UQ_DEPT_CODE    UNIQUE (DEPT_CODE),
    CONSTRAINT CK_DEPT_USE_YN  CHECK (USE_YN IN ('Y', 'N'))
);

CREATE SEQUENCE SEQ_DEP_ID
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- ---------------------------------------------------------------------
-- 2. 사원
-- ---------------------------------------------------------------------
CREATE TABLE EMPLOYEE
(
    EMP_ID     NUMBER   not null,
    LOGIN_ID   VARCHAR2(50)     not null,
    PASSWORD   VARCHAR2(255)    not null,                   -- BCrypt 해시 저장
    EMP_NAME   VARCHAR2(50)     not null,
    PHONE      VARCHAR2(20),
    EMAIL      VARCHAR2(100),
    DEPT_ID    NUMBER      not null,
    ROLE_CODE  VARCHAR2(20) default 'EMPLOYEE'  not null,
    STATUS     VARCHAR2(20) default 'PENDING' not null,     -- 가입 기본값은 승인 대기
    HIRE_DATE  DATE,
    CREATED_AT DATE  default  SYSDATE,
    UPDATED_AT DATE,

    CONSTRAINT PK_EMPLOYEE      PRIMARY KEY (EMP_ID),
    CONSTRAINT UQ_EMP_LOGIN_ID  UNIQUE (LOGIN_ID),
    CONSTRAINT CK_EMP_ROLE      CHECK (ROLE_CODE IN ('EMPLOYEE', 'MANAGER', 'ADMIN')),
    CONSTRAINT CK_EMP_STATUS    CHECK (STATUS IN ('PENDING', 'ACTIVE', 'REJECTED', 'INACTIVE'))
);

CREATE SEQUENCE EMP_SEQ
    START WITH 1
    INCREMENT BY 1
    NOCACHE;

/
-- ---------------------------------------------------------------------
-- 3. 리프레시 토큰
-- ---------------------------------------------------------------------
CREATE TABLE REFRESH_TOKEN (
   JWT_ID      VARCHAR2(100)    NOT NULL,
   EMP_ID      NUMBER           NOT NULL,
   EXPIRES_AT  TIMESTAMP        NOT NULL,

   CONSTRAINT PK_REFRESH_TOKEN PRIMARY KEY (JWT_ID)
);

--