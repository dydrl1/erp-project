'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge, Button, Card, Flex, Space, Table, Tabs, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import ErpLayout from '@/components/ErpLayout';
import StatusBadge from '@/components/StatusBadge';
import { salesOrderApi, SalesOrder } from '@/lib/api';

const TABS = [
  { key: '', label: '전체' },
  { key: 'REQUESTED', label: '승인 대기' },
  { key: 'APPROVED', label: '승인 완료 ' },
  { key: 'SHIPPED', label: '출고 완료' },
  { key: 'CANCELED', label: '취소됨' },
];

export default function SalesOrderListPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  const searchParams = useSearchParams();
  const status = searchParams.get('status') ?? '';
  const page = Number(searchParams.get('page') ?? '1');

  const handleTabChange = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key) {
      params.set('status', key);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    router.push(`/sales-orders?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status) {
      params.set('status', status);
    }
    params.set('page', String(page));
    router.push(`/sales-orders?${params.toString()}`);
  };

  useEffect(() => {
    salesOrderApi
      .statusCount()
      .then(setCounts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      salesOrderApi
        .listPaging(status, page, 20)
        .then((res) => {
          setOrders(res.list);
          setTotal(res.total);
        })
        .finally(() => setLoading(false));
    }, 0);
    return () => clearTimeout(timer);
  }, [status, page]);

  const columns = useMemo<ColumnsType<SalesOrder>>(
    () => [
      {
        title: '주문번호',
        dataIndex: 'soId',
        render: (soId: number) => (
          <Typography.Text strong style={{ color: '#3A7CA5' }}>
            SO-{String(soId).padStart(4, '0')}
          </Typography.Text>
        ),
      },
      {
        title: '고객사명',
        dataIndex: 'customerName',
      },
      {
        title: '기안자',
        dataIndex: 'reqEmployeeName',
      },
      {
        title: '주문접수일',
        dataIndex: 'orderDate',
        render: (value?: string) => value?.slice(0, 10) ?? '-',
      },
      {
        title: '상태',
        dataIndex: 'status',
        render: (status: string) => <StatusBadge status={status} />,
      },
      {
        title: '총금액',
        dataIndex: 'totalAmount',
        align: 'right',
        render: (value?: number) => `${value?.toLocaleString() ?? 0}원`,
      },
    ],
    [],
  );

  return (
    <ErpLayout title="판매 주문 관리">
      <Card>
        <Tabs
          activeKey={status}
          onChange={handleTabChange}
          items={TABS.map((item) => ({
            key: item.key,
            label: (
              <Space size={6}>
                {item.label}
                <Badge
                  count={item.key === '' ? totalCount : (counts[item.key] ?? 0)}
                  showZero
                  color={status === item.key ? '#69B981' : '#B8C7BA'}
                />
              </Space>
            ),
          }))}
        />

        <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
          <Typography.Text type="secondary">총 {total}건</Typography.Text>

          <Button type="primary" onClick={() => router.push('/sales-orders/new')}>
            판매 주문 등록
          </Button>
        </Flex>

        <Table
          rowKey="soId"
          loading={loading}
          columns={columns}
          dataSource={orders}
          pagination={{
            current: page,
            pageSize: 20,
            total,
            showSizeChanger: false,
            onChange: handlePageChange,
          }}
          locale={{ emptyText: '주문 내역이 없습니다.' }}
          onRow={(record) => ({
            className: 'erp-clickable-row',
            onClick: () => {
              router.push(`/sales-orders/${record.soId}`);
            },
          })}
        />
      </Card>
    </ErpLayout>
  );
}
