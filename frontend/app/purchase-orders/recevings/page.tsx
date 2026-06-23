// app/receivings/page.tsx — 입고 가능 목록 (APPROVED 발주)
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import ErpLayout from "@/components/ErpLayout";
import { receivingApi, ReceivableOrder } from "@/lib/api";

const { Text } = Typography;


export default function ReceivableListPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ReceivableOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    receivingApi
      .receivableList()
      .then((data) => setOrders(data as unknown as ReceivableOrder[]))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const columns: ColumnsType<ReceivableOrder> = [
    {
      title: "발주번호",
      dataIndex: "poId",
      render: (poId) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => router.push(`/purchase-orders/${poId}`)}
        >
          PO-{String(poId).padStart(4, "0")}
        </Button>
      ),
    },
    {
      title: "공급처",
      dataIndex: "supplierName",
    },
    {
      title: "기안자",
      dataIndex: "requestEmpName",
    },
    {
      title: "승인자",
      dataIndex: "approveEmpName",
    },
    {
      title: "승인일",
      dataIndex: "approveDate",
      render: (value) => String(value)?.slice(0, 10),
    },
    {
      title: "총금액",
      dataIndex: "totalAmount",
      align: "right",
      render: (value) => `${value?.toLocaleString() ?? 0}원`,
    },
    {
      title: "",
      key: "action",
      width: 110,
      align: "center",
      render: (_, order) => (
        <Button
          type="primary"
          size="small"
          onClick={() => router.push(`/receivings/${order.poId}`)}
        >
          입고하기
        </Button>
      ),
    },
  ];

  return (
    <ErpLayout title="입고 관리">
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Text type="secondary">
          승인 완료된 발주 목록입니다. 물품 도착 후 입고하기를 눌러 처리하세요.
        </Text>

        {error && <Alert type="error" message={error} showIcon />}

        <Table
          rowKey="poId"
          columns={columns}
          dataSource={orders}
          loading={loading}
          pagination={false}
          locale={{
            emptyText: "입고 가능한 발주가 없습니다.",
          }}
        />
      </Space>
    </ErpLayout>
  );
}