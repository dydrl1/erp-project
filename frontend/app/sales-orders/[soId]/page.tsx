'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  App,
  Button,
  Card,
  Checkbox,
  Descriptions,
  Flex,
  Input,
  InputNumber,
  Modal,
  Space,
  Steps,
  Table,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import ErpLayout from '@/components/ErpLayout';
import StatusBadge from '@/components/StatusBadge';
import { salesOrderApi, SalesOrderDetail, SalesOrder, shipmentApi, ReturnItem, returnItemApi } from '@/lib/api';
const { Text } = Typography;

export default function SalesOrderDetailPage() {
  const { soId } = useParams<{ soId: string }>();
  const router = useRouter();
  const { message, modal } = App.useApp();
  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [error, setError] = useState('');
  const [role, setRole] = useState('');
  const [processing, setProcessing] = useState(false);
  const statusStep: Record<string, number> = {
    REQUESTED: 1,
    APPROVED: 2,
    SHIPPED: 3,
  };

  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [reason, setReason] = useState<string>('');
  type ReturnFormRow = ReturnItem & {
    checked?: boolean;
    returnQty?: number;
    returnReason?: string;
  };

  const [returnFormRows, setReturnFormRows] = useState<ReturnFormRow[]>([]);
  const [returnList, setReturnList] = useState<ReturnItem[]>([]);
  const [returnCount, setReturnCount] = useState<number>(0);
  const [totalReturnQty, setTotalReturnQty] = useState<number>(0);
  const [latestReturnDate, setLatestReturnDate] = useState<string>();

  const returnGroupCount = new Set(returnList.map((item) => item.returnGroupId)).size;
  const returnItemCount = returnList.length;

  const load = useCallback(() => {
    salesOrderApi
      .detail(Number(soId))
      .then(setOrder)
      .catch((e: Error) => setError(e.message));
    returnItemApi
      .listPaging(1, 10, undefined, Number(soId))
      .then((res) => {
        setReturnList(res.list);
        setReturnCount(res.list.length);
        setTotalReturnQty(res.list.reduce((acc, item) => acc + (item.totalReturnQty ?? 0), 0));
        setLatestReturnDate(res.list[0]?.createdAt);
      })
      .catch(() => {
        setReturnList([]);
        setReturnCount(0);
        setTotalReturnQty(0);
        setLatestReturnDate(undefined);
      });
  }, [soId]);

  useEffect(() => {
    setRole(localStorage.getItem('role') ?? '');
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = setTimeout(() => setRole(localStorage.getItem('role') ?? ''), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleApprove = async () => {
    modal.confirm({
      title: '판매 주문 승인',
      content: '이 판매주문 주문을 승인하시겠습니까?',
      okText: '승인',
      cancelText: '취소',
      onOk: async () => {
        setProcessing(true);

        try {
          await salesOrderApi.approve(Number(soId));
          message.success('주문이 승인되었습니다.');
          router.push('/sales-orders');
        } catch (e) {
          message.error((e as Error).message);
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const handleReject = () => {
    let reason = '';

    modal.confirm({
      title: '판매 주문 반려',
      width: 520,
      okText: '주문 반려 확정',
      cancelText: '취소',
      okButtonProps: { danger: true },
      content: (
        <Space orientation="vertical" style={{ width: '100%' }}>
          <Text type="secondary">
            SO-{String(order?.soId).padStart(4, '0')} 판매주문을 반려합니다. 반려 사유는 기안자에게 전달됩니다.
          </Text>
          <Input.TextArea
            rows={4}
            placeholder="반려 사유를 입력해주세요"
            onChange={(e) => {
              reason = e.target.value;
            }}
          />
        </Space>
      ),
      onOk: async () => {
        if (!reason.trim()) {
          message.warning('반려 사유를 입력해주세요.');
          return Promise.reject();
        }

        setProcessing(true);

        try {
          // await purchaseOrderApi.reject(Number(soId), reason.trim());
          //주문반려 등록 필요
          message.success('판매 주문이 반려되었습니다.');
          router.push('/sales-orders');
        } catch (e) {
          message.error((e as Error).message);
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const handleShipping = async () => {
    modal.confirm({
      title: '출고 승인',
      content: '이 출고요청을 승낙하시겠습니다?',
      okText: '확인',
      cancelText: '취소',
      onOk: async () => {
        setProcessing(true);
        try {
          const verified = await shipmentApi.verify(Number(soId));
          if (!verified || verified.length === 0) {
            message.error('출고 가능한 주문이 아닙니다.');
            return;
          }
          await shipmentApi.process(Number(soId));
          message.success('출고 처리과 완료되었습니다.');
          router.push('/shipments');
        } catch (e) {
          message.error((e as Error).message);
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const moveToReturnList = () => {
    router.push(`/return?salesOrderId=${order?.soId}`);
  };

  const changeChecked = (shipmentDetailId: number, checked: boolean) => {
    setReturnFormRows((prev) =>
      prev.map((row) =>
        row.shipmentDetailId === shipmentDetailId
          ? { ...row, checked, returnQty: checked ? row.returnQty : 0, reason: checked ? row.reason : '' }
          : row,
      ),
    );
  };

  const changeReturnQty = (shipmentDetailId: number, value: number | null) => {
    setReturnFormRows((prev) =>
      prev.map((row) => (row.shipmentDetailId === shipmentDetailId ? { ...row, returnQty: value ?? undefined } : row)),
    );
  };

  const handleReturnModalOpen = async () => {
    try {
      setProcessing(true);
      const target = await returnItemApi.getReturnTarget(Number(soId));
      setReturnFormRows(
        target.map((item) => ({
          ...item,
          checked: false,
          returnQty: 0,
          returnReason: '',
        })),
      );
      setReturnModalOpen(true);
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const submitReturnRequest = async () => {
    const selectedRows = returnFormRows.filter((row) => row.checked);
    const requestBody = selectedRows.map((row) => ({
      salesOrderId: row.salesOrderId,
      shipmentDetailId: row.shipmentDetailId,
      returnQty: row.returnQty ?? 0,
      reason: reason,
    }));

    try {
      setProcessing(true);
      console.log(requestBody);
      await returnItemApi.request(requestBody);
      message.success('반품 요청이 등록되었습니다.');
      setReturnModalOpen(false);
      setReason('');
      load();
    } catch (e) {
      message.error('반품 요청에 실패했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const currentStep = statusStep[order?.status ?? 'REQUESTED'];

  const columns = useMemo<ColumnsType<SalesOrderDetail>>(
    () => [
      { title: '제품코드', dataIndex: 'productCode' },
      { title: '제품명', dataIndex: 'productName' },
      {
        title: '수량',
        dataIndex: 'orderQty',
        align: 'right',
        render: (value?: number) => value?.toLocaleString() ?? 0,
      },
      {
        title: '단가',
        dataIndex: 'unitPrice',
        align: 'right',
        render: (value?: number) => value?.toLocaleString() ?? 0,
      },
      {
        title: '금액',
        dataIndex: 'amount',
        align: 'right',
        render: (value?: number) => `${value?.toLocaleString() ?? 0}원`,
      },
    ],
    [],
  );

  const returnColumns: ColumnsType<ReturnFormRow> = [
    {
      title: '선택',
      render: (_, record) => (
        <Checkbox checked={record.checked} onChange={(e) => changeChecked(record.shipmentDetailId, e.target.checked)} />
      ),
    },
    {
      title: '상품명',
      dataIndex: 'productName',
    },
    {
      title: '로트번호',
      dataIndex: 'lotNo',
    },
    {
      title: '반품가능수량',
      dataIndex: 'returnableQty',
    },
    {
      title: '반품수량',
      render: (_, record) => (
        <InputNumber
          min={1}
          max={record.returnableQty}
          value={record.returnQty}
          onChange={(value) => changeReturnQty(record.shipmentDetailId, value)}
        />
      ),
    },
  ];

  if (error) {
    return (
      <ErpLayout title="판매 주문 상세">
        <Card>
          <Text type="danger">{error}</Text>
        </Card>
      </ErpLayout>
    );
  }

  if (!order) {
    return (
      <ErpLayout title="판매 주문 상세">
        <Card loading />
      </ErpLayout>
    );
  }

  return (
    <ErpLayout title={`주문 상세 — SO-${String(order.soId).padStart(4, '0')}`}>
      <Flex justify="space-between" align="center">
        <Button onClick={() => router.back()}>목록으로</Button>
      </Flex>

      <Card>
        <Descriptions bordered column={3} size="small">
          <Descriptions.Item label="고객사명">{order.customerName}</Descriptions.Item>
          <Descriptions.Item label="주문자">{order.reqEmployeeName}</Descriptions.Item>
          <Descriptions.Item label="주문일">{order.orderDate?.slice(0, 10)}</Descriptions.Item>
          <Descriptions.Item label="총금액">
            <Text strong>{order.totalAmount?.toLocaleString()}원</Text>
          </Descriptions.Item>
          <Descriptions.Item label="승인자">{order.appEmployeeName ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="상태">
            <StatusBadge status={order.status} />
          </Descriptions.Item>
        </Descriptions>
      </Card>
      {order.status === 'SHIPPED' && returnCount > 0 && (
        <Card title="반품 현황" style={{ marginTop: 16, marginBottom: 16 }}>
          <Flex justify="space-between" align="center">
            <Space orientation="vertical" size={4}>
              <Text>
                반품 요청 <Text strong>{returnGroupCount}</Text>건에 반품 품목 <Text strong>{returnItemCount}</Text>개가
                있습니다.
              </Text>
              <Text type="secondary">
                총 반품수량: {totalReturnQty.toLocaleString()}개
                {latestReturnDate ? ` / 최근 요청일: ${String(latestReturnDate).slice(0, 10)}` : ''}
              </Text>
            </Space>
            <Button onClick={moveToReturnList}>반품 내역 보기</Button>
          </Flex>
        </Card>
      )}
      {order.status !== 'CANCELED' && (
        <Card style={{ marginTop: 16, marginBottom: 16 }}>
          <div className="order-detail-steps">
            <Steps
              current={currentStep}
              titlePlacement="vertical"
              items={[{ title: '주문 생성' }, { title: '승인대기' }, { title: '승인 완료' }, { title: '출고 완료' }]}
            />
          </div>
          <style jsx global>{`
            .order-detail-steps {
              padding: 16px 24px;
            }
            .order-detail-steps .ant-steps-item-icon {
              width: 48px;
              height: 48px;
              line-height: 48px;
              font-size: 20px;
            }
            .order-detail-steps .ant-steps-icon {
              font-size: 20px;
            }
            .order-detail-steps .ant-steps-item-title {
              font-size: 18px;
              font-weight: 700;
            }
            .order-detail-steps .ant-steps-item-tail {
              top: 23px;
            }
          `}</style>
        </Card>
      )}

      <Card title="주문 품목">
        <Table
          rowKey="soDetailId"
          columns={columns}
          dataSource={order.detailList ?? []}
          pagination={false}
          locale={{ emptyText: '주문 품목이 없습니다.' }}
        />
      </Card>

      {order.memo && (
        <Card>
          <Text type="secondary">메모</Text>
          <div style={{ marginTop: 6 }}>{order.memo}</div>
        </Card>
      )}

      {order?.status === 'REQUESTED' && (role === 'MANAGER' || role === 'ADMIN') && (
        <div className="erp-page-actions">
          <Button danger disabled={processing} onClick={handleReject}>
            반려
          </Button>
          <Button type="primary" loading={processing} onClick={handleApprove}>
            승인
          </Button>
        </div>
      )}
      {order.status === 'APPROVED' && (
        <div className="erp-page-actions">
          <Button type="primary" loading={processing} onClick={handleShipping}>
            출고처리
          </Button>
        </div>
      )}
      {order.status == 'SHIPPED' && returnCount <= 0 && (
        <div className="erp-page-actions">
          <Button type="primary" loading={processing} onClick={handleReturnModalOpen}>
            반품요청
          </Button>
        </div>
      )}
      <Modal
        title="반품 요청"
        open={returnModalOpen}
        onCancel={() => {
          setReturnModalOpen(false);
          setReason('');
        }}
        onOk={submitReturnRequest}
        confirmLoading={processing}
        okText="요청"
        cancelText="취소"
        width={800}
      >
        <Table
          rowKey="shipmentDetailId"
          columns={returnColumns}
          dataSource={returnFormRows ?? []}
          pagination={false}
          size="small"
        />

        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8 }}>반품 사유</div>
          <Input.TextArea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="반품 사유를 입력하세요"
          />
        </div>
      </Modal>
    </ErpLayout>
  );
}
