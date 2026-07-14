# 약통 ERP — 의약품 유통 관리 시스템

> 의약품 도매·유통 업무를 통합 관리하는 ERP 시스템
> 발주·입고, 출고·재고, 인사·근태, 정산·매출을 하나의 흐름으로 연결합니다.

---

## 📌 프로젝트 소개

본 프로젝트는 의약품 유통 도매업체의 핵심 업무를 디지털화한 ERP 시스템입니다.
제약사·도매처로부터의 **사입(발주·입고)** 부터 약국·병원으로의 **출고·재고 관리**, 그리고 **정산·매출**까지 실제 의약품 유통 흐름을 반영해 설계했습니다.

### 주요 기능

- 📥 **입고·승인** : 발주 등록 → 승인/반려 → 입고 처리(로트번호·유효기간 기반 재고 생성)
- 📤 **출고·재고** : 주문 접수·승인, FEFO 재고 차감, 로트별 재고 현황, 유효기간 임박 알림
- 🗂 **기준정보** : 거래처·의약품 마스터 관리 (여신한도·보관조건·마약류 여부)
- 👥 **인사·근태** : 직원 관리, 출퇴근 기록, 근태 현황 조회
- 💰 **정산·매출** : 매입·매출 정산, 여신·미수금 관리, 손익 계산, 매출 대시보드

---

## 🛠 기술 스택

| 분류 | 기술 |
| --- | --- |
| **Frontend** | Next.js, React |
| **Backend** | Java 17, Spring Boot 3.5, MyBatis |
| **Database** | Oracle 21c XE (로컬) / Oracle Cloud Autonomous DB 19c (배포) |
| **인증** | JWT (Access / Refresh), Spring Security |
| **배포** | Docker, Kubernetes, GitHub Actions, 가비아 클라우드 |
| **협업** | Notion, Discord, Jira, Git |
| **Tool** | Swagger, Postman, Figma, ERDCloud |

---

## 👨‍👩‍👧‍👦 팀원 소개

| 이름 | 담당 영역 | 주요 기능 |
| --- | --- | --- |
| 이용기 | 입고·승인 | 발주 등록·승인·반려, 입고 처리, 공통 모듈·인증 기반 |
| 박소은 | 관리자·인증·문서화 | 관리자 대시보드, 로그인·계정 관리, 문서화 |
| 김현식 | 출고·재고 | 주문·출고, FEFO 재고 차감, 재고 현황, 실시간 알림 |
| 이상영 | 거래처·약품·인사 | 거래처·의약품 마스터(공공API), 인사·근태 |
| 박소정 | 정산·매출 | 매입·매출 정산, 여신·미수금, 손익·매출 대시보드 |

---

## ☁️ 배포 (Deployment)

로컬에서 검증한 애플리케이션을 **Docker로 컨테이너화**하고 **Kubernetes**로 오케스트레이션하여 **가비아 클라우드(Gabia Cloud)** 에 배포했습니다.
데이터베이스는 애플리케이션 서버와 분리하여 **Oracle Cloud Autonomous Database** 로 운영하며, 코드가 반영되면 **GitHub Actions** 가 빌드부터 배포까지 자동으로 처리합니다.

### 배포 아키텍처

```
        [ 개발자 git push ]
                │
                ▼
      ┌────────────────────┐
      │   GitHub Actions    │   빌드 → 이미지 push → 배포
      └─────────┬──────────┘
                │
                ▼
 ┌──────── Gabia Cloud (Kubernetes) ────────┐
 │                                            │
 │   ┌──────────────┐   ┌────────────────┐   │
 │   │ Next.js Pod  │   │ Spring Boot Pod │   │
 │   │  (Frontend)  │   │   (Backend)     │   │
 │   └──────────────┘   └───────┬────────┘   │
 └──────────────────────────────┼────────────┘
                                 │  Wallet (mTLS)
                                 ▼
              Oracle Cloud — Autonomous Database
```

### 배포 스택

| 분류 | 기술 |
| --- | --- |
| **컨테이너** | Docker |
| **오케스트레이션** | Kubernetes |
| **호스팅** | 가비아 클라우드 (Gabia Cloud) |
| **데이터베이스** | Oracle Cloud Autonomous Database (19c) |
| **CI/CD** | GitHub Actions |
| **레지스트리** | Docker Hub |

### 배포 흐름

1. 코드를 원격 저장소에 반영
2. GitHub Actions가 프론트엔드·백엔드 Docker 이미지 빌드
3. Docker Hub에 이미지 push
4. 가비아 클라우드 Kubernetes 클러스터에 배포 (Pod 롤아웃)
5. Spring Boot ↔ Oracle Cloud DB를 Wallet(mTLS)로 연결

> DB를 애플리케이션 서버와 분리해 배포 서버는 가볍게 유지하고, Oracle 쿼리는 수정 없이 그대로 사용했습니다.

---

## 🚀 시작하는 방법 (Getting Started)

### Frontend

```bash
git clone [레포 URL]
cd frontend
npm install
npm run dev
```

> `.env.local` 에 `NEXT_PUBLIC_API_URL=http://localhost:8080` 설정 필요

### Backend

```bash
cd backend
./gradlew bootRun
```

> ⚠️ `application.yml` 의 DB 접속 정보 및 JWT 설정 필요 (팀 Discord에서 공유)
> Oracle 계정: `sql/init.sql` 실행 후 erp 계정 생성

---

## 📁 폴더 구조

```
erp-project/
├── frontend/
│   ├── app/              (App Router 페이지)
│   ├── components/       (공통 컴포넌트)
│   └── lib/             (API 클라이언트)
├── backend/
│   └── src/main/
│       ├── java/com/erp/backend/
│       │   ├── auth/        (인증·JWT)
│       │   ├── inventory/   (발주·입고)
│       │   ├── common/      (공통 모듈)
│       │   └── config/      (Security·Swagger)
│       └── resources/
│           └── mapper/      (MyBatis XML)
├── sql/                 (DDL·초기 데이터)
└── README.md
```

---

## 📄 API 문서

- Swagger : `http://localhost:8080/swagger-ui/index.html`
- Postman : 팀 워크스페이스 공유

---

## 🤝 협업 규칙

브랜치 전략과 커밋 메시지 컨벤션은 [CONTRIBUTING.md](./CONTRIBUTING.md)를 참고하세요.

---

## 📅 개발 일정

| 기간 | 내용 |
| --- | --- |
| 1주차 | 요구사항 분석, ERD 설계, 환경 세팅 |
| 2주차 | 공통 모듈·인증, 발주·입고, 거래처·의약품 |
| 3주차 | 출고·재고, 정산·매출, 인사·근태 |
| 4주차 | 통합 테스트, 프론트 연동, 최종 발표 |
