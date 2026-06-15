// app/purchase-orders/page.tsx — 발주 목록
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ErpLayout from "@/components/ErpLayout";
import StatusBadge from "@/components/StatusBadge";
import { purchaseOrderApi, PurchaseOrder } from "@/lib/api";

export default function PurchaseOrderListPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 목록 조회 (상태 필터 변경 시 재조회)
  useEffect(() => {
    setLoading(true);
    purchaseOrderApi
      .list(status || undefined)
      .then(setOrders)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [status]);

  // 요약 카드 수치 계산
  const stats = useMemo(
    () => ({
      total: orders.length,
      requested: orders.filter((o) => o.status === "REQUESTED").length,
      approved: orders.filter((o) => o.status === "APPROVED").length,
      rejected: orders.filter((o) => o.status === "REJECTED").length,
    }),
    [orders]
  );

  // 발주번호 검색 (클라이언트 필터)
  const filtered = orders.filter((o) =>
    keyword ? String(o.poId).includes(keyword) : true
  );

  return (
    <ErpLayout title="발주 관리">
      <div className="erp-stats">
        <div className="erp-stat"><p>전체 발주</p><strong>{stats.total}건</strong></div>
        <div className="erp-stat warning"><p>승인 대기</p><strong>{stats.requested}건</strong></div>
        <div className="erp-stat success"><p>승인 완료</p><strong>{stats.approved}건</strong></div>
        <div className="erp-stat danger"><p>반려</p><strong>{stats.rejected}건</strong></div>
      </div>

      <div className="erp-filter">
        <select className="erp-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">상태: 전체</option>
          <option value="REQUESTED">승인 대기</option>
          <option value="APPROVED">승인 완료</option>
          <option value="REJECTED">반려</option>
          <option value="COMPLETED">입고 완료</option>
        </select>
        <input
          className="erp-input"
          placeholder="발주번호 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <div className="spacer" />
        <button className="erp-btn primary" onClick={() => router.push("/purchase-orders/new")}>
          + 발주 등록
        </button>
      </div>

      {error && <p className="erp-warn-text">{error}</p>}

      <div className="erp-table-wrap">
        <table className="erp-table">
          <thead>
            <tr>
              <th>발주번호</th>
              <th>공급처</th>
              <th>기안자</th>
              <th>발주일</th>
              <th>상태</th>
              <th className="num">총금액</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 40 }}>불러오는 중...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 40 }}>발주 내역이 없습니다.</td></tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.poId} onClick={() => router.push(`/purchase-orders/${o.poId}`)}>
                  <td className="link">PO-{String(o.poId).padStart(4, "0")}</td>
                  <td>{o.supplierName}</td>
                  <td>{o.requestEmpName}</td>
                  <td>{o.poDate?.slice(0, 10)}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className="num">{o.totalAmount?.toLocaleString()}원</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </ErpLayout>
  );
}
