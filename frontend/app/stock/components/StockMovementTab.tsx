'use client';

import { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { App, Input, InputNumber, Select, Button, Card, Space, Table, Tag, Typography, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { StockMovement, stockMovementApi } from '@/lib/api';
import { Dayjs } from 'dayjs';

type StockMovementTabProps = {
  tabs: ReactNode;
};

export default function StockMovementTab({ tabs }: StockMovementTabProps) {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [StockMovement, setStockMovement] = useState<StockMovement[]>([]);
  const [productName, setProductName] = useState('');
  const [lotNo, setLotNo] = useState('');
  const [movementType, setMovementType] = useState('');
  const [sourceType, setSourceType] = useState('');
  const [sourceId, setSourceId] = useState<number | undefined>();
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const sourceIdPlaceholder: Record<string, string> = {
    IN: '입고번호',
    OUT: '출고상세번호',
    RETURN: '반품번호',
    DISPOSAL: '폐기번호',
    ADJUST: '조정번호',
  };
  const handleReset = async () => {
    setProductName('');
    setLotNo('');
    setMovementType('');
    setSourceId(undefined);
    setSourceType('');
    setStartDate(null);
    setEndDate(null);
    setStockMovement([]);
    setCurrentPage(1);
    await loadAllStockMovements();
  };

  const handleSearch = async () => {
    if (startDate && endDate && startDate.isAfter(endDate, 'day')) {
      message.warning('시작일은 종료일보다 늦을 수 없습니다.');
      return;
    }
    setLoading(true);
    try {
      const result = await stockMovementApi.search({
        productName: productName.trim() || undefined,
        lotNo: lotNo.trim() || undefined,
        movementType: movementType || undefined,
        sourceType: sourceType || undefined,
        sourceId,
        startDate: startDate?.format('YYYY-MM-DDT00:00:00'),
        endDate: endDate?.format('YYYY-MM-DDT23:59:59'),
      });
      setStockMovement(result);
      setCurrentPage(1);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadAllStockMovements = async () => {
    setLoading(true);
    try {
      const result = await stockMovementApi.search({});
      setStockMovement(result);
      setCurrentPage(1);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadingInitialData = async () => {
      setLoading(true);
      try {
        const result = await stockMovementApi.search({});
        setStockMovement(result);
      } catch (error) {
        message.error((error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    void loadingInitialData();
  }, [message]);
  const columns: ColumnsType<StockMovement> = [
    {
      title: '변경번호',
      dataIndex: 'movementId',
      width: 100,
      align: 'center',
    },
    {
      title: '이동일시',
      dataIndex: 'createdAt',
      width: 170,
      render: (value?: string) => (value ? value.replace('T', ' ').slice(0, 19) : '-'),
    },
    {
      title: '제품명',
      dataIndex: 'productName',
      width: 180,
    },
    {
      title: '로트번호',
      dataIndex: 'lotNo',
      width: 140,
    },
    {
      title: '유형',
      dataIndex: 'movementType',
      width: 100,
      render: (value: string) => {
        const labels: Record<string, string> = {
          IN: '재고 증가',
          OUT: '재고 감소',
          RETURN: '반품 입고',
          DISPOSAL: '폐기 출고',
          ADJUST: '재고 조정',
        };
        return <Tag>{labels[value] ?? value}</Tag>;
      },
      responsive: ['md'],
    },
    {
      title: '업무구분',
      dataIndex: 'sourceType',
      width: 140,
      render: (value: string) => {
        const labels: Record<string, string> = {
          INVENTORY_LOT: '입고 처리',
          RECEIVING: '입고 처리',
          SALES_SHIPMENT: '출고 처리',
          SHIPMENT_DETAIL: '출고 처리',
          RETURN: '반품 처리',
          RETURN_REQUEST: '반품 처리',
          DISPOSAL: '폐기 처리',
          DISPOSAL_DETAIL: '폐기 처리',
          ADJUST: '재고 조정',
        };
        return <Tag>{labels[value] ?? value}</Tag>;
      },
      responsive: ['md'],
    },
    {
      title: '변경 전',
      dataIndex: 'beforeQty',
      width: 120,
      align: 'right',
      render: (value: number) => value?.toLocaleString() ?? 0,
    },
    {
      title: '이동수량',
      dataIndex: 'qty',
      width: 120,
      align: 'right',
      render: (qty: number, record) => {
        const isDecrease = record.afterQty < record.beforeQty;
        return (
          <Typography.Text
            strong
            type={isDecrease ? 'danger' : 'success'}
          >{`${isDecrease ? '-' : '+'}${qty.toLocaleString()}`}</Typography.Text>
        );
      },
    },
    {
      title: '변경 후',
      dataIndex: 'afterQty',
      width: 120,
      align: 'right',
      render: (value: number) => value?.toLocaleString() ?? 0,
    },
  ];

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        {tabs}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <Input
            placeholder="제품명"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
          />
          <Input
            placeholder="로트번호"
            value={lotNo}
            onChange={(e) => setLotNo(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
          />
          <Select
            placeholder="이동유형"
            value={movementType || undefined}
            onChange={(value) => {
              setMovementType(value);
              setSourceId(undefined);
            }}
            allowClear
            options={[
              { value: 'IN', label: '입고' },
              { value: 'OUT', label: '출고' },
              { value: 'RETURN', label: '반품' },
              { value: 'DISPOSAL', label: '폐기' },
              { value: 'ADJUST', label: '재고조정' },
            ]}
          />
          <InputNumber
            placeholder={sourceIdPlaceholder[movementType] ?? '업무번호'}
            value={sourceId}
            onChange={(value) => setSourceId(value ?? undefined)}
            min={1}
            controls={false}
            style={{ width: '100%' }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            marginTop: 16,
          }}
        >
          <Space wrap>
            <DatePicker
              placeholder="시작일"
              value={startDate}
              onChange={setStartDate}
              disabledDate={(current) => (endDate ? current.isAfter(endDate, 'day') : false)}
            />
            <span>-</span>
            <DatePicker
              placeholder="종료일"
              value={endDate}
              onChange={setEndDate}
              disabledDate={(current) => (startDate ? current.isBefore(startDate, 'day') : false)}
            />
          </Space>
          <Space>
            <Button onClick={handleReset}>초기화</Button>
            <Button type="primary" onClick={handleSearch} style={{ width: 80 }}>
              검색
            </Button>
          </Space>
        </div>
      </Card>
      <Card
        title="재고 이동 이력"
        extra={<Typography.Text type="secondary"> 총 {StockMovement.length.toLocaleString()}건</Typography.Text>}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          columns={columns}
          dataSource={StockMovement}
          rowKey="movementId"
          loading={loading}
          tableLayout="auto"
          locale={{
            emptyText: '조회된 재고 이동 이력이 없습니다.',
          }}
          pagination={{
            current: currentPage,
            pageSize,
            showSizeChanger: false,
            pageSizeOptions: ['10', '20', '50'],
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </>
  );
}
