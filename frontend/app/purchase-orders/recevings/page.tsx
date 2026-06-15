// app/receivings/page.tsx — 입고 가능 목록 (APPROVED 발주)
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ErpLayout from "@/components/ErpLayout";
import { receivingApi } from "@/lib/api";

interface ReceivableOrder {
  poId: number;
  supplierName: string;
  requestEmpName: string;
  approveEmpName: string;
  approveDate: string;
  totalAmount: number;
}

export default function ReceivableListPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ReceivableOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    receivingApi
      .receivableList()
      .then((data) => setOrders(data as unknown as ReceivableOrder[]))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ErpLayout title="입고 관리">
      <p style={{ fontSize: 13, color: "var(--erp-text-muted)", margin: 0 }}>
        승인 완료된 발주 목록입니다. 물품 도착 후 입고하기를 눌러 처리하세요.
      </p>

      {error && <p className="erp-warn-text">{error}</p>}

      <div className="erp-table-wrap">
        <table className="erp-table">
          <thead>
            <tr>
              <th>발주번호</th>
              <th>공급처</th>
              <th>기안자</th>
              <th>승인자</th>
              <th>승인일</th>
              <th className="num">총금액</th>
              <th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: 40 }}>불러오는 중...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: 40 }}>입고 가능한 발주가 없습니다.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.poId} style={{ cursor: "default" }}>
                  <td className="link">PO-{String(o.poId).padStart(4, "0")}</td>
                  <td>{o.supplierName}</td>
                  <td>{o.requestEmpName}</td>
                  <td>{o.approveEmpName}</td>
                  <td>{String(o.approveDate)?.slice(0, 10)}</td>
                  <td className="num">{o.totalAmount?.toLocaleString()}원</td>
                  <td>
                    <button
                      className="erp-btn primary"
                      style={{ height: 30, padding: "0 12px" }}
                      onClick={() => router.push(`/receivings/${o.poId}`)}
                    >
                      입고하기
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </ErpLayout>
  );
}
