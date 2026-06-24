"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ErpLayout from "@/components/ErpLayout";
import "../../../settlement.css";

type ReceivableInfo = {
  arId: number;
  customerId: number;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  remainAmount: number;
  dueDate: string;
  status: string;
};

export default function PaymentNewPage() {
  const router = useRouter();
  const params = useParams();
  const arId = params.arId as string;

  const [receivable, setReceivable] = useState<ReceivableInfo | null>(null);
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState("계좌이체");
  const createdBy = 1; // TODO: 로그인 연동 시 사용자 ID로 변경
  //const userId = localStorage.getItem("userId");
  const [loading, setLoading] = useState(true);

  const formatMoney = (value?: number) => {
    return `${(value ?? 0).toLocaleString()}원`;
  };

  useEffect(() => {
    if (!arId) {
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }

    fetch(`http://localhost:8080/api/settlement/receivables/${arId}`)
      .then((res) => res.json())
      .then((res) => {
        setReceivable(res.data ?? null);
      })
      .catch((err) => {
        console.error("미수금 상세 조회 실패:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [arId]);

  const handleSubmit = () => {
    if (!receivable) {
      alert("미수금 정보가 없습니다.");
      return;
    }

    if (!paymentDate || !paymentAmount) {
      alert("수금일자와 수금금액을 입력해주세요.");
      return;
    }

    const amount = Number(paymentAmount);

    if (amount <= 0) {
      alert("수금금액은 0보다 커야 합니다.");
      return;
    }

    if (amount > receivable.remainAmount) {
      alert("수금금액은 남은 미수금보다 클 수 없습니다.");
      return;
    }

    const body = {
        arId: receivable.arId,
        customerId: receivable.customerId,
        paymentDate,
        paymentAmount: amount,
        paymentType,
        createdBy: 1,
        //createdBy: Number(userId),
    };

    fetch("http://localhost:8080/api/settlement/payments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    })
        .then(async (res) => {
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "수금 처리 실패");
            }
            return res.text();
        })
        .then(() => {
            alert("수금 처리가 완료되었습니다.");
            router.push("/settlement/payments/history");
        })
        .catch((err) => {
            console.error(err);
            alert("수금 처리 중 오류가 발생했습니다.");
        });
    };

  return (
    <ErpLayout title="수금 등록">
      {loading ? (
        <div className="erp-card">불러오는 중...</div>
      ) : (
        <>
          <div className="erp-card">
            <h3>미수금 정보</h3>

            {receivable ? (
              <div className="erp-cards">
                <div className="erp-card">
                  <p>거래처명</p>
                  <strong>{receivable.customerName}</strong>
                </div>

                <div className="erp-card">
                  <p>청구금액</p>
                  <strong>{formatMoney(receivable.totalAmount)}</strong>
                </div>

                <div className="erp-card">
                  <p>누적 수금액</p>
                  <strong>{formatMoney(receivable.paidAmount)}</strong>
                </div>

                <div className="erp-card warning">
                  <p>남은 미수금</p>
                  <strong>{formatMoney(receivable.remainAmount)}</strong>
                </div>

                <div className="erp-card">
                  <p>만기일</p>
                  <strong>{receivable.dueDate}</strong>
                </div>

                <div className="erp-card">
                  <p>상태</p>
                  <strong>{receivable.status}</strong>
                </div>
              </div>
            ) : (
              <p style={{ color: "var(--erp-text-muted)" }}>
                미수금 정보를 찾을 수 없습니다.
              </p>
            )}
          </div>

          <div className="erp-card">
            <h3>수금 정보</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <p style={{ fontSize: 13, color: "var(--erp-text-muted)" }}>
                  수금일자
                </p>
                <input
                  className="erp-input"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <p style={{ fontSize: 13, color: "var(--erp-text-muted)" }}>
                  수금금액
                </p>
                <input
                  className="erp-input"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="수금금액 입력"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <p style={{ fontSize: 13, color: "var(--erp-text-muted)" }}>
                  수금방법
                </p>
                <select
                  className="erp-select"
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  style={{ width: "100%" }}
                >
                  <option value="계좌이체">계좌이체</option>
                  <option value="현금">현금</option>
                  <option value="카드">카드</option>
                </select>
              </div>

            </div>

            <div className="erp-page-actions">
              <button
                className="erp-btn"
                onClick={() => router.push("/settlement/payments")}
              >
                목록
              </button>

              <button className="erp-btn primary" onClick={handleSubmit}>
                수금 등록
              </button>
            </div>
          </div>
        </>
      )}
    </ErpLayout>
  );
}