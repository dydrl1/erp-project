-- DDL
-- EMP_ID 자동 증가용 시퀀스(EMP_SEQ.NEXTVAL에서 사용)
CREATE SEQUENCE EMP_SEQ
    START WITH 1
    INCREMENT BY 1
    NOCACHE;

-- 사원용 테이블
CREATE TABLE EMPLOYEE
(
    EMP_ID     NUMBER   not null primary key,
    LOGIN_ID   VARCHAR2(50)     not null    unique,
    PASSWORD   VARCHAR2(255)    not null,
    EMP_NAME   VARCHAR2(50)     not null,
    PHONE      VARCHAR2(20),
    EMAIL      VARCHAR2(100),
    DEPT_ID    NUMBER      not null,
    ROLE_CODE  VARCHAR2(20)      not null,
    STATUS     VARCHAR2(20) default 'ACTIVE' not null,
    HIRE_DATE  DATE,
    CREATED_AT DATE,
    UPDATED_AT DATE
)
/

-- 리프레시 토큰 테이블
CREATE TABLE REFRESH_TOKEN (
   JWT_ID      VARCHAR2(100) PRIMARY KEY,
   EMP_ID    NUMBER NOT NULL,
   EXPIRES_AT  TIMESTAMP NOT NULL
);