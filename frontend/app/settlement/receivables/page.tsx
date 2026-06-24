"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ErpLayout from "@/components/ErpLayout";
import "../settlement.css";

type CustomerReceivable = {
    customerId: number;
    customerName: string;
    monthSalesAmount: number;
    remainAmount: number;
    creditLimit: number;
    creditBalance: number;
};

export default function ReceivablesPage() {
    const router = useRouter();
    const [list, setList] = useState<CustomerReceivable[]>([]);
    const [customerName, setCustomerName] = useState("");
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
    const pagedList = list.slice((page - 1) * pageSize, page * pageSize);
    const pageNumbers = Array.from(
        { length: Math.min(totalPages, 10) },
        (_, i) => i + 1
    );
    
    const formatMoney = (value?: number) => {
        return `${(value ?? 0).toLocaleString()}원`;
    };
    
    const fetchList = () => {
        setLoading(true);
        const query = customerName
        ? `?customerName=${encodeURIComponent(customerName)}`
        : "";
        
        fetch(`http://localhost:8080/api/settlement/receivables/customer-summary${query}`)
        .then((res) => res.json())
        .then((res) => {
            setList(res.data ?? []);
            setPage(1);
        })
        .catch((err) => {
            console.error("거래처별 미수금 조회 실패:", err);
        })
        .finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchList();
    }, []);

    const handleSearch = () => {
        fetchList();
    };

    return (
        <ErpLayout title="거래처별 미수금 현황">
            <div className="erp-filter">
                <input className="erp-input"
                    placeholder="거래처명 검색"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                    }}
                />

                <button className="erp-btn primary" onClick={handleSearch}>
                    검색
                    </button>

                <button className="erp-btn"
                    onClick={() => {
                        setCustomerName("");
                        setTimeout(fetchList, 0);
                    }}
                >
                    초기화
                </button>
            </div>

        <div className="erp-table-wrap">
            <table className="erp-table">
                <thead>
                    <tr>
                        <th>거래처명</th>
                        <th className="num">당월 매출액</th>
                        <th className="num">현재 미수금</th>
                        <th className="num">여신한도</th>
                        <th className="num">여신잔액</th>
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={5} style={{ textAlign: "center", padding: 40 }}>
                            불러오는 중...
                            </td>
                        </tr>
                        ) : list.length === 0 ? (
                        <tr>
                            <td colSpan={5} style={{ textAlign: "center", padding: 40 }}>
                            조회된 거래처가 없습니다.
                            </td>
                        </tr>
                        ) : (
                            pagedList.map((item) => (
                                <tr key={item.customerId}
                                    onClick={() => router.push(`/settlement/invoices/${item.customerId}`)}
                                >
                                    <td className="link">{item.customerName}</td>
                                    <td className="num">{formatMoney(item.monthSalesAmount)}</td>
                                    <td className="num">{formatMoney(item.remainAmount)}</td>
                                    <td className="num">{formatMoney(item.creditLimit)}</td>
                                    <td className="num">{formatMoney(item.creditBalance)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

            {!loading && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 8,
                        padding: 12,
                    }}
                >
                    <button
                        className="erp-btn"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        &lt;
                    </button>

                    {pageNumbers.map((p) => (
                        <button
                            key={p}
                            className="erp-btn"
                            onClick={() => setPage(p)}
                            style={{
                                background: p === page ? "var(--erp-primary)" : "#fff",
                                color: p === page ? "#fff" : "var(--erp-text)",
                                borderColor: p === page ? "var(--erp-primary)" : "var(--erp-line)",
                                minWidth: 36,
                            }}
                        >
                            {p}
                        </button>
                    ))}

                    <button
                        className="erp-btn"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    </ErpLayout>
  );
}