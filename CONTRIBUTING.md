# 기여 가이드 (Contributing)

약통 ERP 프로젝트의 협업 규칙입니다. 브랜치 전략과 커밋 컨벤션을 지켜 일관성 있게 협업합니다.

---

## 🌿 Git 브랜치 전략

```
main
└── dev
    ├── feature/init-setup       (공통 모듈·인증)
    ├── feature/purchase-order   (발주·입고)
    ├── feature/inventory        (출고·재고)
    ├── feature/master           (거래처·의약품)
    ├── feature/hr               (인사·근태)
    └── feature/settlement       (정산·매출)
```

| 브랜치 | 설명 |
| --- | --- |
| `main` | 최종 배포 브랜치 |
| `dev` | 개발 통합 브랜치 |
| `feature/기능명` | 기능별 작업 브랜치 |

### 작업 순서

1. `dev`에서 `feature/기능명` 브랜치를 생성합니다.
2. 기능 단위로 커밋하고 원격에 push합니다.
3. `dev`로 Pull Request를 생성합니다.
4. 리뷰 후 `dev`에 머지하고, 배포 시점에 `dev` → `main`으로 반영합니다.

---

## ✍️ 커밋 메시지 규칙

```
feat     : 새로운 기능 추가
fix      : 버그 수정
docs     : 문서 수정
style    : 코드 포맷 변경 (기능 변경 없음)
refactor : 코드 리팩토링
test     : 테스트 코드 추가/수정
chore    : 빌드, 패키지 수정
```

**예시**

```
feat: 직원 근태 조회 API 추가
fix: 발주 등록 시 유효성 검사 오류 수정
docs: README 브랜치 전략 업데이트
```

> Jira 연동 시 `ERP-{번호} feat: 설명` 형식을 사용합니다.

---

## ✅ Pull Request 체크리스트

- [ ] 브랜치명이 컨벤션(`feature/기능명`)을 따르는가
- [ ] 커밋 메시지가 컨벤션을 따르는가
- [ ] 로컬에서 정상 동작을 확인했는가
- [ ] 관련 문서(README·API 문서)를 함께 업데이트했는가
