'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ErpLayout from '@/components/ErpLayout';
import { AccountReceivable, settlementReceivableApi } from '@/lib/api';
import '../settlement.css';
import StatusBadge from '@/components/StatusBadge';

export default function ReceivablesPage() {
  const router = useRouter();

  const [status, setStatus] = useState('');
  const [list, setList] = useState<AccountReceivable[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const pagedList = list.slice((page - 1) * pageSize, page * pageSize);
  const pageNumbers = Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1);

  const formatMoney = (value?: number) => {
    return `${(value ?? 0).toLocaleString()}원`;
  };

  const isOverdue = (dueDate?: string, remainAmount?: number) => {
    if (!dueDate || (remainAmount ?? 0) <= 0) return false;

    const today = new Date();
    const due = new Date(dueDate);

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    return due < today;
  };

  const getPaymentStatus = (item: AccountReceivable) => {
    if ((item.remainAmount ?? 0) <= 0) return 'PAID';
    if ((item.paidAmount ?? 0) > 0) return 'PARTIAL';
    return 'UNPAID';
  };

  const fetchList = () => {
    setLoading(true);

    settlementReceivableApi
      .list({
        customerName,
        status,
        startDate,
        endDate,
      })
      .then((data) => {
        setList(data ?? []);
        setPage(1);
      })
      .catch((err) => {
        console.error('거래처별 미수금 조회 실패:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const timer = setTimeout(fetchList, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    fetchList();
  };

  return (
    <ErpLayout title="미수금 관리">
      <div className="erp-filter">
        <input
          className="erp-input"
          placeholder="거래처명 검색"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
        />

        <select className="erp-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">전체 상태</option>
          <option value="UNPAID">UNPAID</option>
          <option value="PARTIAL">PARTIAL</option>
          <option value="PAID">PAID</option>
        </select>

        <input className="erp-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

        <input className="erp-input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

        <button className="erp-btn primary" onClick={handleSearch}>
          검색
        </button>

        <button
          className="erp-btn"
          onClick={() => {
            setCustomerName('');
            setStatus('');
            setStartDate('');
            setEndDate('');
            setTimeout(fetchList, 0);
          }}
        >
          초기화
        </button>

        <button className="erp-btn" onClick={() => router.push('/settlement/payments/history')}>
          수금내역
        </button>
      </div>

      <div className="erp-table-wrap">
        <table className="erp-table">
          <thead>
            <tr>
              <th>미수금번호</th>
              <th>매출청구번호</th>
              <th>거래처명</th>
              <th className="num">청구금액</th>
              <th className="num">수금금액</th>
              <th className="num">남은 미수금</th>
              <th>만기일</th>
              <th>상태</th>
              <th>수금등록</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: 40 }}>
                  불러오는 중...
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: 40 }}>
                  조회된 거래처가 없습니다.
                </td>
              </tr>
            ) : (
              pagedList.map((item) => (
                <tr key={item.arId}>
                  <td>AR-{String(item.arId).padStart(4, '0')}</td>
                  <td>SI-{String(item.salesInvoiceId).padStart(4, '0')}</td>
                  <td>{item.customerName}</td>
                  <td className="num">{formatMoney(item.totalAmount)}</td>
                  <td className="num">{formatMoney(item.paidAmount)}</td>
                  <td className="num">{formatMoney(item.remainAmount)}</td>
                  <td>{item.dueDate?.slice(0, 10)}</td>
                  <td>
                    <StatusBadge status={item.status === 'OVERDUE' ? getPaymentStatus(item) : item.status} />
                    {isOverdue(item.dueDate, item.remainAmount) && (
                      <span
                        style={{
                          display: 'inline-block',
                          marginLeft: item.status !== 'OVERDUE' ? 8 : 0,
                          padding: '2px 8px',
                          borderRadius: 999,
                          backgroundColor: '#fee2e2',
                          color: '#b91c1c',
                          fontSize: 12,
                          fontWeight: 600,
                          lineHeight: 1.4,
                        }}
                      >
                        연체
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className="erp-btn primary"
                      disabled={item.remainAmount <= 0}
                      onClick={() => router.push(`/settlement/payments/new/${item.arId}`)}
                    >
                      등록
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              padding: 12,
            }}
          >
            <button className="erp-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
              &lt;
            </button>

            {pageNumbers.map((p) => (
              <button
                key={p}
                className="erp-btn"
                onClick={() => setPage(p)}
                style={{
                  background: p === page ? 'var(--erp-primary)' : '#fff',
                  color: p === page ? '#fff' : 'var(--erp-text)',
                  borderColor: p === page ? 'var(--erp-primary)' : 'var(--erp-line)',
                  minWidth: 36,
                }}
              >
                {p}
              </button>
            ))}

            <button className="erp-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              &gt;
            </button>
          </div>
        )}
      </div>
    </ErpLayout>
  );
}
