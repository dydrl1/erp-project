'use client';

import ErpLayout from '@/components/ErpLayout';
import { ReturnGroup, returnItemApi } from '@/lib/api';
import { Badge, Flex, Space, Table, Tabs, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import StatusBadge from '@/components/StatusBadge';

function ReturnPage() {
  const router = useRouter();
  const [returnGroup, setReturnGroup] = useState<ReturnGroup[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const status = searchParams.get('status') ?? '';
  const page = Number(searchParams.get('page') ?? '1');

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  const TABS = [
    { key: '', label: '전체' },
    { key: 'REQUESTED', label: '승인 대기' },
    { key: 'APPROVED', label: '승인 완료' },
    { key: 'COMPLETED', label: '반품 완료' },
    { key: 'REJECTED', label: '반품 반려' },
  ];

  const handleTabChange = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key) {
      params.set('status', key);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    router.push(`/return?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status) {
      params.set('status', status);
    }
    params.set('page', String(page));
    router.push(`/return?${params.toString()}`);
  };

  useEffect(() => {
    returnItemApi
      .statusCount()
      .then(setCounts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    returnItemApi
      .listGroupPaging(page, 10, status || undefined)
      .then((res) => {
        setReturnGroup(res.list);
        setTotal(res.total);
      })
      .finally(() => setLoading(false));
  }, [page, status]);

  const columns = useMemo<ColumnsType<ReturnGroup>>(
    () => [
      {
        title: '반품요청번호',
        dataIndex: 'returnGroupId',
        render: (returnGroupId: number) => (
          <Typography.Text strong style={{ color: '#3A7CA5' }}>
            RE-{String(returnGroupId).padStart(4, '0')}
          </Typography.Text>
        ),
      },
      {
        title: '주문번호',
        dataIndex: 'salesOrderId',
        render: (salesOrderId: number) => (salesOrderId ? `SO-${String(salesOrderId).padStart(4, '0')}` : '-'),
      },
      {
        title: '고객사',
        dataIndex: 'customerName',
      },
      {
        title: '반품 항목',
        dataIndex: 'productSummary',
        render: (value?: string) => value ?? '-',
      },
      {
        title: '항목 수',
        dataIndex: 'itemCount',
        render: (value?: number) => value ?? 0,
      },
      {
        title: '총 반품 수량',
        dataIndex: 'totalReturnQty',
        render: (value?: number) => value ?? 0,
      },
      {
        title: '반품 사유',
        dataIndex: 'reason',
      },
      {
        title: '반품 접수일',
        dataIndex: 'createdAt',
        render: (value?: string) => value?.slice(0, 10) ?? '-',
      },
      {
        title: '상태',
        dataIndex: 'status',
        render: (value: string) => <StatusBadge status={value} />,
      },
    ],
    [],
  );

  return (
    <ErpLayout title="반품 관리">
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
      ></Tabs>
      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <Typography.Text type="secondary">총 {total}건</Typography.Text>
      </Flex>
      <Table
        rowKey="returnGroupId"
        loading={loading}
        columns={columns}
        dataSource={returnGroup}
        pagination={{
          current: page,
          total,
          showSizeChanger: false,
          onChange: handlePageChange,
        }}
        locale={{ emptyText: '반품 요청 내역이 없습니다.' }}
        onRow={(record) => ({
          className: 'erp-clickable-row',
          onClick: () => {
            router.push(`/return/${record.returnGroupId}`);
          },
        })}
      />
    </ErpLayout>
  );
}
export default function returnListPage() {
  return (
    <Suspense fallback={null}>
      <ReturnPage />
    </Suspense>
  );
}
