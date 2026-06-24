"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Pagination, Space, Table, Tabs, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import ErpLayout from "@/components/ErpLayout";
import StatusBadge from "@/components/StatusBadge";
import { purchaseOrderApi, PurchaseOrder } from "@/lib/api";

const { Text } = Typography;

const TABS = [
  { key: "", label: "All" },
  { key: "REQUESTED", label: "Requested" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
  { key: "COMPLETED", label: "Completed" },
];

export default function PurchaseOrderListPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [tab, setTab] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    purchaseOrderApi.statusCounts().then(setCounts).catch(() => {});
  }, [orders]);

  useEffect(() => {
    setLoading(true);

    purchaseOrderApi
      .listPaging(tab, page, 10)
      .then((res) => {
        setOrders(res.list);
        setTotalPages(res.totalPages);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab, page]);

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  const columns: ColumnsType<PurchaseOrder> = [
    {
      title: "PO No.",
      dataIndex: "poId",
      render: (poId) => `PO-${String(poId).padStart(4, "0")}`,
    },
    {
      title: "Supplier",
      dataIndex: "supplierName",
    },
    {
      title: "Requester",
      dataIndex: "requestEmpName",
    },
    {
      title: "Order Date",
      dataIndex: "poDate",
      render: (value) => value?.slice(0, 10),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      align: "right",
      render: (value) => `${value?.toLocaleString() ?? 0}`,
    },
  ];

  const tabItems = useMemo(
    () =>
      TABS.map((item) => {
        const count = item.key === "" ? totalCount : counts[item.key] ?? 0;

        return {
          key: item.key,
          label: `${item.label} ${count}`,
        };
      }),
    [counts, totalCount],
  );

  return (
    <ErpLayout title="Purchase Orders">
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Tabs
          activeKey={tab}
          items={tabItems}
          onChange={(key) => {
            setTab(key);
            setPage(1);
          }}
        />

        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Text type="secondary">Total {total}</Text>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push("/purchase-orders/new")}
          >
            New Purchase Order
          </Button>
        </Space>

        <Table
          rowKey="poId"
          columns={columns}
          dataSource={orders}
          loading={loading}
          pagination={false}
          onRow={(record) => ({
            onClick: () => router.push(`/purchase-orders/${record.poId}`),
            style: { cursor: "pointer" },
          })}
        />

        {totalPages > 1 && (
          <Pagination
            current={page}
            total={total}
            pageSize={10}
            align="center"
            onChange={setPage}
            showSizeChanger={false}
          />
        )}
      </Space>
    </ErpLayout>
  );
}
