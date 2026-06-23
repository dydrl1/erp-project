"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ErpLayout from "@/components/ErpLayout";
import "../../settlement.css";

export default function SettlementNewPage() {
  const router = useRouter();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [createdBy] = useState(1);

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      alert("정산 시작일과 종료일을 입력해주세요.");
      return;
    }

    if (startDate > endDate) {
      alert("시작일은 종료일보다 늦을 수 없습니다.");
      return;
    }

    const body = {
      startDate,
      endDate,
      createdBy,
    };

    fetch("http://localhost:8080/api/settlement/settlements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "손익정산 등록 실패");
        }
        return res.text();
      })
      .then(() => {
        alert("손익정산이 등록되었습니다.");
        router.push("/settlement/settlements");
      })
      .catch((err) => {
        console.error(err);
        alert("손익정산 등록 중 오류가 발생했습니다.");
      });
  };

  return (
    <ErpLayout title="손익정산 등록">
      <div className="erp-card">
        <h3>정산 기간 선택</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <p style={{ fontSize: 13, color: "var(--erp-text-muted)" }}>
              시작일
            </p>
            <input
              className="erp-input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <p style={{ fontSize: 13, color: "var(--erp-text-muted)" }}>
              종료일
            </p>
            <input
              className="erp-input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div className="erp-page-actions">
          <button
            className="erp-btn"
            onClick={() => router.push("/settlement/settlements")}
          >
            목록
          </button>

          <button className="erp-btn primary" onClick={handleSubmit}>
            손익정산 등록
          </button>
        </div>
      </div>
    </ErpLayout>
  );
}