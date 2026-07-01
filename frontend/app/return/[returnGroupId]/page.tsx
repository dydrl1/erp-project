'use client';

import ErpLayout from '@/components/ErpLayout';
import { App, Button, Card, Descriptions, Flex, Modal, Input, Space, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ReturnItem, returnItemApi } from '@/lib/api';
import Table, { ColumnsType } from 'antd/es/table';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
const { Title } = Typography;

export default function ReturnDetailPage() {
  const { returnGroupId } = useParams<{ returnGroupId: string }>();
  const [items, setItems] = useState<ReturnItem[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const { message } = App.useApp();
  const header = items[0];

  const loadReturnDetail = useCallback(async () => {
    returnItemApi
      .listPaging(1, 100, '', undefined, Number(returnGroupId))
      .then((res) => {
        setItems(res.list);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [returnGroupId]);

  useEffect(() => {
    loadReturnDetail();
  }, [loadReturnDetail]);

  const handleApprovalModal = async () => {
    try {
      await returnItemApi.approve(returnGroupId);
    } catch (e) {
      console.log(e);
    } finally {
      setShowApproveModal(false);
      router.push('/shipments');
    }
  };
  const handleRejectModal = async () => {
    try {
      await returnItemApi.reject(returnGroupId, rejectReason);
    } catch (e) {
      console.log(e);
    } finally {
      setShowRejectModal(false);
      setRejectReason('');
      await loadReturnDetail();
    }
  };
  const handleCompleteReturn = async () => {
    try {
      const result = await returnItemApi.complete(returnGroupId);
      console.log(result);
      message.success('반품을 확정했습니다.');
    } catch {
      message.error('반품이 실패했습니다.');
    } finally {
      router.push('/shipments');
    }
  };

  const returnColumns: ColumnsType<ReturnItem> = [
    {
      title: '반품번호',
      dataIndex: 'returnGroupId',
      key: 'returnGroupId',
      render: (text) => `RE-${String(text).padStart(4, '0')}`,
    },
    {
      title: '출고상세번호',
      dataIndex: 'shipmentDetailId',
      key: 'shipmentDetailId',
      render: (text) => `SH-${String(text).padStart(4, '0')}`,
    },
    {
      title: '주문번호',
      dataIndex: 'salesOrderId',
      key: 'salesOrderId',
      render: (text) => `SO-${String(text).padStart(4, '0')}`,
    },
    {
      title: '상품명',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '로트번호',
      dataIndex: 'lotNo',
      key: 'lotNo',
    },
    {
      title: '반품수량',
      dataIndex: 'returnQty',
      key: 'returnQty',
    },
    {
      title: '반품사유',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '반려사유',
      dataIndex: 'rejectReason',
      key: 'rejectReason',
    },
  ];

  return (
    <ErpLayout title={`반품 상세 - RE-${String(returnGroupId).padStart(4, '0')}`}>
      <Flex justify="space-between" align="center">
        <Button onClick={() => router.back()}>목록으로</Button>
      </Flex>
      <Card style={{ marginTop: 16, marginBottom: 16 }}>
        <Descriptions bordered column={3} size="small">
          <Descriptions.Item label="반품 번호">{`RE-${String(returnGroupId).padStart(4, '0')}`}</Descriptions.Item>
          <Descriptions.Item label="주문 번호">{`SO-${String(header?.salesOrderId).padStart(4, '0')}`}</Descriptions.Item>
          <Descriptions.Item label="고객사명">{header?.customerName}</Descriptions.Item>
          <Descriptions.Item label="반품 접수일">{header?.createdAt.slice(0, 10)}</Descriptions.Item>
          <Descriptions.Item label="반품 접수자">{header?.createdByName}</Descriptions.Item>
          <Descriptions.Item label="현재상태">{header?.status}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Table columns={returnColumns} dataSource={items} loading={loading} pagination={false} size="small" />
      {header?.status === 'REQUESTED' && (
        <Flex justify="end" style={{ marginTop: 16, gap: 16 }}>
          <Button danger onClick={() => setShowRejectModal(true)}>
            반려
          </Button>
          <Button type="primary" onClick={() => setShowApproveModal(true)}>
            승인
          </Button>
        </Flex>
      )}
      {header?.status === 'APPROVED' && (
        <Flex justify="end" style={{ marginTop: 16 }}>
          <Button type="primary" onClick={handleCompleteReturn}>
            반품 확정
          </Button>
        </Flex>
      )}
      <Modal
        title={
          <Flex align="center" gap={10}>
            <CheckCircleOutlined style={{ fontSize: 20, color: 'green', lineHeight: 1, padding: 2 }} />
            <Title level={4} style={{ margin: 0 }}>
              해당 요청을 승인 하시겠습니까?
            </Title>
          </Flex>
        }
        open={showApproveModal}
        okText="승인"
        cancelText="취소"
        onOk={handleApprovalModal}
        onCancel={() => setShowApproveModal(false)}
      />
      <Modal
        title={
          <Flex align="center" gap={10}>
            <ExclamationCircleOutlined style={{ fontSize: 20, color: 'red', lineHeight: 1, padding: 2 }} />
            <Title level={4} style={{ margin: 0 }}>
              해당 요청을 반려 하시겠습니까?
            </Title>
          </Flex>
        }
        open={showRejectModal}
        okText="반려"
        cancelText="취소"
        okButtonProps={{ danger: true }}
        onOk={handleRejectModal}
        onCancel={() => setShowRejectModal(false)}
      >
        <div style={{ marginTop: 4 }}>
          <Input.TextArea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="반려 사유를 입력하세요."
            style={{ resize: 'none' }}
          />
        </div>
      </Modal>
    </ErpLayout>
  );
}
