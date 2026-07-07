"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ErpLayout from "@/components/ErpLayout";
import {
  AccountPayable,
  AccountReceivable,
  PurchaseInvoice,
  SalesInvoice,
  Settlement,
  settlementApi,
  settlementInvoiceApi,
  settlementPayableApi,
  settlementPurchaseInvoiceApi,
  settlementReceivableApi,
} from "@/lib/api";
import "../../settlement.css";

type TabKey = "sales" | "purchase" | "receivable" | "payable";

export default function SettlementDetailPage() {
  const router = useRouter();
  const params = useParams<{ settlementId: string }>();
  const settlementId = Number(params.settlementId);

  const [settlement, setSettlement] = useState<Settlement | null>(null);
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>([]);
  const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
  const [payables, setPayables] = useState<AccountPayable[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("sales");
  const [loading, setLoading] = useState(true);

  const formatMoney = (value?: number) => {
    return `${(value ?? 0).toLocaleString()}원`;
  };

  const formatDate = (value?: string) => {
    return value ? value.slice(0, 10) : "-";
  };

  useEffect(() => {
    if (!settlementId || Number.isNaN(settlementId)) {
      setLoading(false);
      return;
    }

    setLoading(true);

    settlementApi
      .detail(settlementId)
      .then((data) => {
        setSettlement(data);

        const startDate = data.startDate?.slice(0, 10);
        const endDate = data.endDate?.slice(0, 10);

        return Promise.all([
          settlementInvoiceApi.list({
            startDate,
            endDate,
          }),
          settlementPurchaseInvoiceApi.list({
            startDate,
            endDate,
          }),
          settlementReceivableApi.list({
            startDate,
            endDate,
          }),
          settlementPayableApi.list({
            startDate,
            endDate,
          }),
        ]);
      })
      .then(([salesData, purchaseData, receivableData, payableData]) => {
        setSalesInvoices(salesData ?? []);
        setPurchaseInvoices(purchaseData ?? []);
        setReceivables(receivableData ?? []);
        setPayables(payableData ?? []);
      })
      .catch((err) => {
        console.error("손익정산 상세 조회 실패:", err);
        alert(err.message || "손익정산 상세 조회 중 오류가 발생했습니다.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [settlementId]);

  const tabLabel = useMemo(
    () => ({
      sales: `매출청구 ${salesInvoices.length}`,
      purchase: `매입청구 ${purchaseInvoices.length}`,
      receivable: `미수금 ${receivables.length}`,
      payable: `미지급금 ${payables.length}`,
    }),
    [salesInvoices.length, purchaseInvoices.length, receivables.length, payables.length]
  );

  const renderTabContent = () => {
    if (activeTab === "sales") {
      return (
        <table className="erp-table">
          <thead>
            <tr>
              <th>청구번호</th>
              <th>수주번호</th>
              <th>거래처명</th>
              <th>청구일자</th>
              <th className="num">청구금액</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {salesInvoices.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 32 }}>
                  조회된 매출청구가 없습니다.
                </td>
              </tr>
            ) : (
              salesInvoices.map((item) => (
                <tr key={item.salesInvoiceId}>
                  <td>SI-{String(item.salesInvoiceId).padStart(4, "0")}</td>
                  <td>SO-{String(item.soId).padStart(4, "0")}</td>
                  <td>{item.customerName}</td>
                  <td>{formatDate(item.issueDate)}</td>
                  <td className="num">{formatMoney(item.totalAmount)}</td>
                  <td>{item.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }

    if (activeTab === "purchase") {
      return (
        <table className="erp-table">
          <thead>
            <tr>
              <th>청구번호</th>
              <th>발주번호</th>
              <th>공급처명</th>
              <th>청구일자</th>
              <th className="num">청구금액</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {purchaseInvoices.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 32 }}>
                  조회된 매입청구가 없습니다.
                </td>
              </tr>
            ) : (
              purchaseInvoices.map((item) => (
                <tr key={item.purchaseInvoiceId}>
                  <td>PI-{String(item.purchaseInvoiceId).padStart(4, "0")}</td>
                  <td>PO-{String(item.poId).padStart(4, "0")}</td>
                  <td>{item.supplierName}</td>
                  <td>{formatDate(item.issueDate)}</td>
                  <td className="num">{formatMoney(item.totalAmount)}</td>
                  <td>{item.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }

    if (activeTab === "receivable") {
      return (
        <table className="erp-table">
          <thead>
            <tr>
              <th>미수금번호</th>
              <th>매출청구번호</th>
              <th>거래처명</th>
              <th className="num">총액</th>
              <th className="num">수금액</th>
              <th className="num">잔액</th>
              <th>만기일</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {receivables.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 32 }}>
                  조회된 미수금이 없습니다.
                </td>
              </tr>
            ) : (
              receivables.map((item) => (
                <tr key={item.arId}>
                  <td>AR-{String(item.arId).padStart(4, "0")}</td>
                  <td>SI-{String(item.salesInvoiceId).padStart(4, "0")}</td>
                  <td>{item.customerName}</td>
                  <td className="num">{formatMoney(item.totalAmount)}</td>
                  <td className="num">{formatMoney(item.paidAmount)}</td>
                  <td className="num">{formatMoney(item.remainAmount)}</td>
                  <td>{formatDate(item.dueDate)}</td>
                  <td>{item.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }

    return (
      <table className="erp-table">
        <thead>
          <tr>
            <th>미지급금번호</th>
            <th>매입청구번호</th>
            <th>공급처명</th>
            <th className="num">총액</th>
            <th className="num">지급액</th>
            <th className="num">잔액</th>
            <th>지급예정일</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {payables.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", padding: 32 }}>
                조회된 미지급금이 없습니다.
              </td>
            </tr>
          ) : (
            payables.map((item) => (
              <tr key={item.apId}>
                <td>AP-{String(item.apId).padStart(4, "0")}</td>
                <td>PI-{String(item.purchaseInvoiceId).padStart(4, "0")}</td>
                <td>{item.supplierName}</td>
                <td className="num">{formatMoney(item.totalAmount)}</td>
                <td className="num">{formatMoney(item.paidAmount)}</td>
                <td className="num">{formatMoney(item.remainAmount)}</td>
                <td>{formatDate(item.dueDate)}</td>
                <td>{item.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    );
  };

  return (
    <ErpLayout title="손익정산 상세">
      {loading ? (
        <div className="erp-card">불러오는 중...</div>
      ) : !settlement ? (
        <div className="erp-card">
          <p style={{ marginTop: 0 }}>손익정산 정보를 찾을 수 없습니다.</p>
          <button className="erp-btn" onClick={() => router.push("/settlement/settlements")}>
            목록
          </button>
        </div>
      ) : (
        <>
          <div className="erp-page-actions" style={{ justifyContent: "space-between" }}>
            <button className="erp-btn" onClick={() => router.push("/settlement/settlements")}>
              목록
            </button>
          </div>

          <div className="erp-card">
            <h3 style={{ marginTop: 0 }}>
              ST-{String(settlement.settlementId).padStart(4, "0")}
            </h3>

            <div className="erp-cards">
              <div className="erp-card">
                <p>정산기간</p>
                <strong>
                  {formatDate(settlement.startDate)} ~ {formatDate(settlement.endDate)}
                </strong>
              </div>

              <div className="erp-card">
                <p>생성자</p>
                <strong>
                  {settlement.createdByName ?? `직원 ${settlement.createdBy}`}
                </strong>
              </div>

              <div className="erp-card">
                <p>생성일</p>
                <strong>{formatDate(settlement.createdAt)}</strong>
              </div>

              <div className="erp-card">
                <p>이익률</p>
                <strong>{settlement.profitRate ?? 0}%</strong>
              </div>
            </div>
          </div>

          <div className="settlement-stats">
            <div className="erp-stat">
              <p>총매출</p>
              <strong>{formatMoney(settlement.totalSales)}</strong>
            </div>

            <div className="erp-stat success">
              <p>총매입</p>
              <strong>{formatMoney(settlement.totalPurchase)}</strong>
            </div>

            <div className="erp-stat warning">
              <p>미수금</p>
              <strong>{formatMoney(settlement.totalReceivable)}</strong>
            </div>

            <div className="erp-stat danger">
              <p>미지급금</p>
              <strong>{formatMoney(settlement.totalPayable)}</strong>
            </div>

            <div className="erp-stat success">
              <p>매출총이익</p>
              <strong>{formatMoney(settlement.grossProfit)}</strong>
            </div>
          </div>

          <div className="erp-card">
            <div className="erp-filter">
              {(["sales", "purchase", "receivable", "payable"] as TabKey[]).map((tab) => (
                <button
                  key={tab}
                  className={`erp-btn ${activeTab === tab ? "primary" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tabLabel[tab]}
                </button>
              ))}
            </div>

            <div className="erp-table-wrap">{renderTabContent()}</div>
          </div>
        </>
      )}
    </ErpLayout>
  );
}