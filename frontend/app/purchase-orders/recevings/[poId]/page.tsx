"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Button,
  DatePicker,
  Input,
  InputNumber,
  Popconfirm,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowLeftOutlined, CheckOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import ErpLayout from "@/components/ErpLayout";
import { receivingApi, ReceivingDetailInput } from "@/lib/api";

const { Text } = Typography;

export default function ReceivingProcessPage() {
  const { poId } = useParams<{ poId: string }>();
  const router = useRouter();

  const [rows, setRows] = useState<ReceivingDetailInput[]>([]);
  const [memo, setMemo] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    receivingApi
      .detailsByPoId(Number(poId))
      .then((details) =>
        setRows(
          details.map((detail) => ({
            productId: detail.productId,
            productName: detail.productName,
            orderQty: detail.orderQty,
            lotNo: "",
            expiryDate: "",
            receivedQty: detail.orderQty,
            unitPrice: detail.unitPrice,
          })),
        ),
      )
      .catch((e: Error) => setError(e.message));
  }, [poId]);

  const updateRow = (
    index: number,
    field: keyof ReceivingDetailInput,
    value: string | number,
  ) => {
    setRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
  };

  const isExpired = (date: string) =>
    date !== "" && dayjs(date).isBefore(dayjs(), "day");

  const handleSubmit = async () => {
    for (const row of rows) {
      if (!row.lotNo.trim()) {
        message.warning(`${row.productName}: enter lot number.`);
        return;
      }

      if (!row.expiryDate) {
        message.warning(`${row.productName}: enter expiry date.`);
        return;
      }

      if (isExpired(row.expiryDate)) {
        message.warning(`${row.productName}: expiry date is already past.`);
        return;
      }

      if (!row.receivedQty || row.receivedQty < 1) {
        message.warning(`${row.productName}: check received quantity.`);
        return;
      }
    }

    setProcessing(true);

    try {
      await receivingApi.process({
        poId: Number(poId),
        memo: memo || undefined,
        details: rows.map(({ productName, orderQty, ...rest }) => rest),
      });

      message.success("Receiving completed.");
      router.push("/receivings");
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const columns: ColumnsType<ReceivingDetailInput> = [
    {
      title: "Product",
      dataIndex: "productName",
      render: (value) => <Text strong>{value}</Text>,
    },
    {
      title: "Ordered Qty",
      dataIndex: "orderQty",
      align: "right",
      width: 110,
      render: (value) => value?.toLocaleString(),
    },
    {
      title: "Lot No.",
      dataIndex: "lotNo",
      width: 180,
      render: (value, _row, index) => (
        <Input
          placeholder="LOT-2606-A01"
          value={value}
          onChange={(e) => updateRow(index, "lotNo", e.target.value)}
        />
      ),
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      width: 180,
      render: (value, _row, index) => (
        <DatePicker
          value={value ? dayjs(value) : null}
          status={isExpired(value) ? "error" : undefined}
          style={{ width: "100%" }}
          onChange={(date) =>
            updateRow(index, "expiryDate", date ? date.format("YYYY-MM-DD") : "")
          }
        />
      ),
    },
    {
      title: "Received Qty",
      dataIndex: "receivedQty",
      width: 130,
      render: (value, _row, index) => (
        <InputNumber
          min={1}
          value={value}
          style={{ width: "100%" }}
          onChange={(nextValue) =>
            updateRow(index, "receivedQty", nextValue ?? 0)
          }
        />
      ),
    },
  ];

  const hasExpiredItem = rows.some((row) => isExpired(row.expiryDate));

  return (
    <ErpLayout title={`Receiving - PO-${String(poId).padStart(4, "0")}`}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          Back
        </Button>

        {error && <Alert type="error" message={error} showIcon />}

        <Table
          rowKey="productId"
          columns={columns}
          dataSource={rows}
          pagination={false}
          locale={{ emptyText: "No items to receive." }}
        />

        {hasExpiredItem && (
          <Alert
            type="warning"
            message="Some items have expired dates. Check the dates."
            showIcon
          />
        )}

        <Space direction="vertical" size={6} style={{ width: "100%" }}>
          <Text strong>Memo</Text>
          <Input
            placeholder="Optional receiving memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </Space>

        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button onClick={() => router.back()}>Cancel</Button>

          <Popconfirm
            title="Process receiving"
            description="Process receiving and create inventory lots?"
            okText="Process"
            cancelText="Cancel"
            onConfirm={handleSubmit}
          >
            <Button
              type="primary"
              icon={<CheckOutlined />}
              loading={processing}
              disabled={rows.length === 0}
            >
              Complete Receiving
            </Button>
          </Popconfirm>
        </Space>
      </Space>
    </ErpLayout>
  );
}
