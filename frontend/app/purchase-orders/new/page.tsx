// app/purchase-orders/new/page.tsx — 발주 등록
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ErpLayout from "@/components/ErpLayout";
import { purchaseOrderApi } from "@/lib/api";

interface Supplier {
  supplierId: number;
  supplierName: string;
}

interface Product {
  productId: number;
  productCode: string;
  productName: string;
  unit: string;
  standardPurchasePrice: number;
}

interface OrderRow {
  productId: number;
  orderQty: number;
  unitPrice: number;
}

export default function PurchaseOrderCreatePage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [supplierId, setSupplierId] = useState<number>(0);
  const [memo, setMemo] = useState("");
  const [rows, setRows] = useState<OrderRow[]>([{ productId: 0, orderQty: 1, unitPrice: 0 }]);
  const [processing, setProcessing] = useState(false);

  // 공급처·의약품 목록 조회
  useEffect(() => {
    purchaseOrderApi.suppliers().then(setSuppliers).catch((e) => alert(e.message));
    purchaseOrderApi.products()
      .then((data) => setProducts(data as unknown as Product[]))
      .catch((e) => alert(e.message));
  }, []);

  // 품목 행 추가
  const addRow = () => setRows([...rows, { productId: 0, orderQty: 1, unitPrice: 0 }]);

  // 품목 행 삭제
  const removeRow = (index: number) => {
    if (rows.length === 1) return alert("발주 품목은 최소 1개 이상이어야 합니다.");
    setRows(rows.filter((_, i) => i !== index));
  };

  // 행 수정 (의약품 선택 시 표준 매입가 자동 입력)
  const updateRow = (index: number, field: keyof OrderRow, value: number) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const updated = { ...row, [field]: value };
        if (field === "productId") {
          const product = products.find((p) => p.productId === value);
          if (product) updated.unitPrice = product.standardPurchasePrice;
        }
        return updated;
      })
    );
  };

  // 총금액 계산
  const totalAmount = rows.reduce((sum, r) => sum + r.orderQty * r.unitPrice, 0);

  // 발주 등록
  const handleSubmit = async () => {
    if (!supplierId) return alert("공급처를 선택해주세요.");
    for (const row of rows) {
      if (!row.productId) return alert("의약품을 선택해주세요.");
      if (row.orderQty < 1) return alert("수량은 1 이상이어야 합니다.");
    }

    setProcessing(true);
    try {
      const poId = await purchaseOrderApi.create({
        supplierId,
        memo: memo || undefined,
        details: rows,
      });
      alert("발주가 등록되었습니다.");
      router.push(`/purchase-orders`); // 목록으로 이동
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ErpLayout title="발주 등록">
      <button className="erp-btn" style={{ alignSelf: "flex-start" }} onClick={() => router.back()}>
        ← 목록으로
      </button>

      <div className="erp-cards" style={{ gridTemplateColumns: "1fr 2fr" }}>
        <div className="erp-card">
          <p>공급처 *</p>
          <select
            className="erp-select"
            style={{ width: "100%" }}
            value={supplierId}
            onChange={(e) => setSupplierId(Number(e.target.value))}
          >
            <option value={0}>공급처 선택</option>
            {suppliers.map((s) => (
              <option key={s.supplierId} value={s.supplierId}>{s.supplierName}</option>
            ))}
          </select>
        </div>
        <div className="erp-card">
          <p>메모</p>
          <input
            className="erp-input"
            style={{ width: "100%" }}
            placeholder="발주 관련 메모 (선택)"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
      </div>

      <div className="erp-table-wrap">
        <table className="erp-table">
          <thead>
            <tr>
              <th>의약품 *</th>
              <th style={{ width: 110 }}>수량 *</th>
              <th style={{ width: 130 }}>단가 *</th>
              <th className="num" style={{ width: 120 }}>금액</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ cursor: "default" }}>
                <td>
                  <select
                    className="erp-select"
                    style={{ width: "100%" }}
                    value={row.productId}
                    onChange={(e) => updateRow(i, "productId", Number(e.target.value))}
                  >
                    <option value={0}>의약품 선택</option>
                    {products.map((p) => (
                      <option key={p.productId} value={p.productId}>
                        [{p.productCode}] {p.productName}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    className="erp-input"
                    style={{ width: "100%", textAlign: "right" }}
                    min={1}
                    value={row.orderQty}
                    onChange={(e) => updateRow(i, "orderQty", Number(e.target.value))}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="erp-input"
                    style={{ width: "100%", textAlign: "right" }}
                    min={0}
                    value={row.unitPrice}
                    onChange={(e) => updateRow(i, "unitPrice", Number(e.target.value))}
                  />
                </td>
                <td className="num">{(row.orderQty * row.unitPrice).toLocaleString()}</td>
                <td>
                  <button className="erp-btn danger-outline" style={{ height: 30, padding: "0 10px" }} onClick={() => removeRow(i)}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button className="erp-btn" onClick={addRow}>+ 품목 추가</button>
        <p style={{ margin: 0, fontSize: 15 }}>
          총금액 <strong style={{ fontSize: 18 }}>{totalAmount.toLocaleString()}원</strong>
        </p>
      </div>

      <div className="erp-page-actions">
        <button className="erp-btn" onClick={() => router.back()}>취소</button>
        <button className="erp-btn primary" disabled={processing} onClick={handleSubmit}>
          {processing ? "등록 중..." : "발주 등록"}
        </button>
      </div>
    </ErpLayout>
  );
}