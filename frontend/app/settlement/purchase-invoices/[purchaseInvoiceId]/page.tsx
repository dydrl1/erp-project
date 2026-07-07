"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ErpLayout from "@/components/ErpLayout";
import {
  AccountPayable,
  PayablePayment,
  PurchaseInvoice,
  settlementPayableApi,
  settlementPayablePaymentApi,
  settlementPurchaseInvoiceApi,
} from "@/lib/api";
import "../../settlement.css";

export default function PurchaseInvoiceDetailPage() {
  const router = useRouter();
  const params = useParams<{ purchaseInvoiceId: string }>();
  const purchaseInvoiceId = Number(params.purchaseInvoiceId);

  const [invoice, setInvoice] = useState<PurchaseInvoice | null>(null);
  const [payable, setPayable] = useState<AccountPayable | null>(null);
  const [payments, setPayments] = useState<PayablePayment[]>([]);
  const [loading, setLoading] = useState(true);

  const formatMoney = (value?: number) => `${(value ?? 0).toLocaleString()}원`;
  const formatDate = (value?: string) => (value ? value.slice(0, 10) : "-");

  useEffect(() => {
    if (!purchaseInvoiceId || Number.isNaN(purchaseInvoiceId)) {
      setLoading(false);
      return;
    }

    setLoading(true);

    settlementPurchaseInvoiceApi
      .detail(purchaseInvoiceId)
      .then(async (invoiceData) => {
        setInvoice(invoiceData ?? null);

        const payables = await settlementPayableApi.list({});
        const matchedPayable =
          payables?.find((item) => item.purchaseInvoiceId === invoiceData.purchaseInvoiceId) ?? null;

        setPayable(matchedPayable);

        if (!matchedPayable) {
          setPayments([]);
          return;
        }

        const paymentList = await settlementPayablePaymentApi.list({
          supplierName: invoiceData.supplierName,
        });

        setPayments((paymentList ?? []).filter((item) => item.apId === matchedPayable.apId));
      })
      .catch((err) => {
        console.error("매입청구 상세 조회 실패:", err);
        alert(err.message || "매입청구 상세 조회 중 오류가 발생했습니다.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [purchaseInvoiceId]);

  return (
    <ErpLayout title="매입청구 상세">
      {loading ? (
        <div className="erp-card">불러오는 중...</div>
      ) : !invoice ? (
        <div className="erp-card">
          <p style={{ marginTop: 0 }}>매입청구 정보를 찾을 수 없습니다.</p>
          <button className="erp-btn" onClick={() => router.push("/settlement/purchase-invoices")}>
            목록
          </button>
        </div>
      ) : (
        <>
          <div className="erp-page-actions" style={{ justifyContent: "space-between" }}>
            <button className="erp-btn" onClick={() => router.push("/settlement/purchase-invoices")}>
              목록
            </button>
          </div>

          <div className="erp-card">
            <h3 style={{ marginTop: 0 }}>매입청구 정보</h3>

            <div className="erp-cards">
              <div className="erp-card">
                <p>매입청구번호</p>
                <strong>PI-{String(invoice.purchaseInvoiceId).padStart(4, "0")}</strong>
              </div>

              <div className="erp-card">
                <p>발주번호</p>
                <strong>PO-{String(invoice.poId).padStart(4, "0")}</strong>
              </div>

              <div className="erp-card">
                <p>공급처명</p>
                <strong>{invoice.supplierName ?? `공급처 ${invoice.supplierId}`}</strong>
              </div>

              <div className="erp-card">
                <p>청구일자</p>
                <strong>{formatDate(invoice.issueDate)}</strong>
              </div>

              <div className="erp-card">
                <p>청구금액</p>
                <strong>{formatMoney(invoice.totalAmount)}</strong>
              </div>

              <div className="erp-card">
                <p>상태</p>
                <strong>{invoice.status}</strong>
              </div>

              <div className="erp-card">
                <p>생성일</p>
                <strong>{formatDate(invoice.createdAt)}</strong>
              </div>
            </div>
          </div>

          <div className="erp-card">
            <h3 style={{ marginTop: 0 }}>미지급금 정보</h3>

            {!payable ? (
              <p style={{ margin: 0, color: "var(--erp-text-muted)" }}>
                미지급금 정보가 없습니다.
              </p>
            ) : (
              <div className="erp-cards">
                <div className="erp-card">
                  <p>미지급금번호</p>
                  <strong>AP-{String(payable.apId).padStart(4, "0")}</strong>
                </div>

                <div className="erp-card">
                  <p>총 지급금</p>
                  <strong>{formatMoney(payable.totalAmount)}</strong>
                </div>

                <div className="erp-card success">
                  <p>지급완료금</p>
                  <strong>{formatMoney(payable.paidAmount)}</strong>
                </div>

                <div className="erp-card warning">
                  <p>잔액</p>
                  <strong>{formatMoney(payable.remainAmount)}</strong>
                </div>

                <div className="erp-card">
                  <p>지급예정일</p>
                  <strong>{formatDate(payable.dueDate)}</strong>
                </div>

                <div className="erp-card">
                  <p>상태</p>
                  <strong>{payable.status}</strong>
                </div>
              </div>
            )}
          </div>

          <div className="erp-card">
            <h3 style={{ marginTop: 0 }}>지급 내역</h3>

            <div className="erp-table-wrap">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>지급번호</th>
                    <th>지급일자</th>
                    <th className="num">지급금액</th>
                    <th>지급방식</th>
                    <th>처리자</th>
                    <th>처리일시</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: 32 }}>
                        지급 내역이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment.payablePaymentId}>
                        <td>PP-{String(payment.payablePaymentId).padStart(4, "0")}</td>
                        <td>{formatDate(payment.paymentDate)}</td>
                        <td className="num">{formatMoney(payment.paymentAmount)}</td>
                        <td>{payment.paymentType}</td>
                        <td>{payment.createdByName ?? `직원 ${payment.createdBy}`}</td>
                        <td>{formatDate(payment.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </ErpLayout>
  );
}