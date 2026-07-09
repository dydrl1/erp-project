"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ErpLayout from "@/components/ErpLayout";
import {
  AccountReceivable,
  PaymentHistory,
  SalesInvoice,
  settlementInvoiceApi,
  settlementPaymentApi,
  settlementReceivableApi,
} from "@/lib/api";
import "../../settlement.css";

export default function SalesInvoiceDetailPage() {
  const router = useRouter();
  const params = useParams<{ salesInvoiceId: string }>();
  const salesInvoiceId = Number(params.salesInvoiceId);

  const [invoice, setInvoice] = useState<SalesInvoice | null>(null);
  const [receivable, setReceivable] = useState<AccountReceivable | null>(null);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const formatMoney = (value?: number) => `${(value ?? 0).toLocaleString()}원`;
  const formatDate = (value?: string) => (value ? value.slice(0, 10) : "-");

  useEffect(() => {
    if (!salesInvoiceId || Number.isNaN(salesInvoiceId)) {
      setLoading(false);
      return;
    }

    setLoading(true);

    settlementInvoiceApi
      .detail(salesInvoiceId)
      .then(async (invoiceData) => {
        setInvoice(invoiceData ?? null);

        const receivables = await settlementReceivableApi.list({});
        const matchedReceivable =
          receivables?.find((item) => item.salesInvoiceId === invoiceData.salesInvoiceId) ?? null;

        setReceivable(matchedReceivable);

        if (!matchedReceivable) {
          setPayments([]);
          return;
        }

        const paymentList = await settlementPaymentApi.list({
          customerName: invoiceData.customerName,
        });

        setPayments((paymentList ?? []).filter((item) => item.arId === matchedReceivable.arId));
      })
      .catch((err) => {
        console.error("매출청구 상세 조회 실패:", err);
        alert(err.message || "매출청구 상세 조회 중 오류가 발생했습니다.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [salesInvoiceId]);

  return (
    <ErpLayout title="매출청구 상세">
      {loading ? (
        <div className="erp-card">불러오는 중...</div>
      ) : !invoice ? (
        <div className="erp-card">
          <p style={{ marginTop: 0 }}>매출청구 정보를 찾을 수 없습니다.</p>
          <button className="erp-btn" onClick={() => router.push("/settlement/invoices")}>
            목록
          </button>
        </div>
      ) : (
        <>
          <div className="erp-page-actions" style={{ justifyContent: "space-between" }}>
            <button className="erp-btn" onClick={() => router.push("/settlement/invoices")}>
              목록
            </button>
          </div>

          <div className="erp-card">
            <h3 style={{ marginTop: 0 }}>매출청구 정보</h3>

            <div className="erp-cards">
              <div className="erp-card">
                <p>청구번호</p>
                <strong>SI-{String(invoice.salesInvoiceId).padStart(4, "0")}</strong>
              </div>

              <div className="erp-card">
                <p>수주번호</p>
                <strong>SO-{String(invoice.soId).padStart(4, "0")}</strong>
              </div>

              <div className="erp-card">
                <p>거래처명</p>
                <strong>{invoice.customerName ?? `거래처 ${invoice.customerId}`}</strong>
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
            <h3 style={{ marginTop: 0 }}>미수금 정보</h3>

            {!receivable ? (
              <p style={{ margin: 0, color: "var(--erp-text-muted)" }}>
                미수금 정보가 없습니다.
              </p>
            ) : (
              <div className="erp-cards">
                <div className="erp-card">
                  <p>미수금번호</p>
                  <strong>AR-{String(receivable.arId).padStart(4, "0")}</strong>
                </div>

                <div className="erp-card">
                  <p>총 미수금</p>
                  <strong>{formatMoney(receivable.totalAmount)}</strong>
                </div>

                <div className="erp-card success">
                  <p>수금액</p>
                  <strong>{formatMoney(receivable.paidAmount)}</strong>
                </div>

                <div className="erp-card warning">
                  <p>잔액</p>
                  <strong>{formatMoney(receivable.remainAmount)}</strong>
                </div>

                <div className="erp-card">
                  <p>만기일</p>
                  <strong>{formatDate(receivable.dueDate)}</strong>
                </div>

                <div className="erp-card">
                  <p>상태</p>
                  <strong>{receivable.status}</strong>
                </div>
              </div>
            )}
          </div>

          <div className="erp-card">
            <h3 style={{ marginTop: 0 }}>수금 내역</h3>

            <div className="erp-table-wrap">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>수금번호</th>
                    <th>수금일자</th>
                    <th className="num">수금금액</th>
                    <th>수금방식</th>
                    <th>처리자</th>
                    <th>처리일시</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: 32 }}>
                        수금 내역이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment.paymentId}>
                        <td>PM-{String(payment.paymentId).padStart(4, "0")}</td>
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