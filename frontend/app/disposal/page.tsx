'use client';

import ErpLayout from '@/components/ErpLayout';
import { useEffect, useMemo, useState } from 'react';
import { App, Button, Card, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { disposalApi, DisposalTarget } from '@/lib/api';

const { Title, Text } = Typography;

export default function DisposalPage() {
  const { message, modal } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [targets, setTargets] = useState<DisposalTarget[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [reason, setReason] = useState<string>();

  const loadTargets = async () => {
    try {
      setLoading(true);
      const data = await disposalApi.listTargets();
      setTargets(data);
      setSelectedRowKeys([]);
    } catch (error) {
      message.error('폐기 대상 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTargets();
  }, []);

  const selectedTargets = useMemo(() => {
    return targets.filter((item) => selectedRowKeys.includes(item.inventoryLotId));
  }, [targets, selectedRowKeys]);

  const totalQty = selectedTargets.reduce((sum, item) => sum + item.currentQty, 0);

  const columns: ColumnsType<DisposalTarget> = [
    {
      title: '제품코드',
      dataIndex: 'productCode',
      render: (value?: string) => value ?? '-',
    },
    {
      title: '제품명',
      dataIndex: 'productName',
      render: (value?: string) => value ?? '-',
    },
    {
      title: 'LOT 번호',
      dataIndex: 'lotNo',
      render: (value?: string) => value ?? '-',
    },
    {
      title: '유효기간',
      dataIndex: 'expiryDate',
      render: (value?: string) => value ?? '-',
    },
    {
      title: '현재수량',
      dataIndex: 'currentQty',
      align: 'right',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: '상태',
      dataIndex: 'status',
      render: (value: string) => <Tag>{value}</Tag>,
    },
  ];

  const handleProcessDisposal = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('폐기할 LOT를 선택해주세요.');
      return;
    }

    if (!reason || reason.trim() === '') {
      message.warning('폐기 사유를 선택해주세요.');
      return;
    }

    modal.confirm({
      title: '선택한 재고를 폐기하시겠습니까?',
      content: (
        <div style={{ lineHeight: 1.8 }}>
          선택 LOT: {selectedRowKeys.length}건
          <br />총 폐기 수량: {totalQty.toLocaleString()}개
          <br />
          폐기 사유: {reason || '-'}
          <br />
          폐기 처리 후 해당 LOT의 재고 수량은 차감되며,
          <br />
          재고 이동 이력에 기록됩니다.
        </div>
      ),
      okText: '폐기',
      cancelText: '취소',
      okButtonProps: {
        danger: true,
      },
      async onOk() {
        try {
          await disposalApi.process({
            inventoryLotId: selectedRowKeys.map((key) => Number(key)),
            reason,
          });

          message.success('폐기 처리가 완료되었습니다.');
          await loadTargets();
        } catch (error) {
          message.error('폐기 처리에 실패했습니다.');
        }
      },
    });
  };

  return (
    <ErpLayout title="폐기 관리">
      <Card>
        <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Title level={4}>폐기 대상 목록</Title>
            <Text type="secondary">유효기간이 만료되었고 현재 수량이 남아있는 LOT만 표시됩니다.</Text>
          </div>

          <Space wrap>
            {/* <Select
              placeholder="폐기 사유를 선택하세요"
              style={{ width: 180 }}
              value={reason}
              onChange={setReason}
              options={[
                { value: '유효기간 만료', label: '유효기간 만료' },
                { value: '파손', label: '파손' },
                { value: '오염', label: '오염' },
                { value: '품질 이상', label: '품질 이상' },
                { value: '기타', label: '기타' },
              ]}
            /> */}

            <Button danger type="primary" disabled={selectedRowKeys.length === 0} onClick={handleProcessDisposal}>
              선택 폐기
            </Button>

            <Button onClick={loadTargets}>새로고침</Button>

            {selectedRowKeys.length > 0 && (
              <Text>
                선택 {selectedRowKeys.length}건 / 총 수량 {totalQty.toLocaleString()}개
              </Text>
            )}
          </Space>

          <Table
            rowKey="inventoryLotId"
            loading={loading}
            columns={columns}
            dataSource={targets}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            pagination={{
              pageSize: 10,
            }}
          />
        </Space>
      </Card>
    </ErpLayout>
  );
}
