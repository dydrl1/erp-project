"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Input,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import ErpLayout from "@/components/ErpLayout";
import StatusBadge from "@/components/StatusBadge";
import { purchaseOrderApi, PurchaseOrder } from "@/lib/api";

const { Text } = Typography;
const { TextArea } = Input;

type PurchaseOrderDetail = NonNullable<PurchaseOrder["details"]>[number];

export default function PurchaseOrderDetailPage() {
  const { poId } = useParams<{ poId: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const load = () => {
    purchaseOrderApi
      .detail(Number(poId))
      .then(setOrder)
      .catch((e: Error) => setError(e.message));
  };

  useEffect(load, [poId]);

  useEffect(() => {
    const timer = setTimeout(() => setRole(localStorage.getItem("role") ?? ""), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleApprove = async () => {
    setProcessing(true);

    try {
      await purchaseOrderApi.approve(Number(poId));
      router.push("/purchase-orders");
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Enter a reject reason.");
      return;
    }

    setProcessing(true);

    try {
      await purchaseOrderApi.reject(Number(poId), rejectReason);
      setShowRejectModal(false);
      router.push("/purchase-orders");
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const columns: ColumnsType<PurchaseOrderDetail> = [
    {
      title: "Product Code",
      dataIndex: "productCode",
    },
    {
      title: "Product",
      dataIndex: "productName",
    },
    {
      title: "Qty",
      dataIndex: "orderQty",
      align: "right",
      render: (value) => value?.toLocaleString(),
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      align: "right",
      render: (value) => `${value?.toLocaleString() ?? 0}`,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      align: "right",
      render: (value) => `${value?.toLocaleString() ?? 0}`,
    },
  ];

  if (error) {
    return (
      <ErpLayout title="Purchase Order Detail">
        <Alert type="error" message={error} showIcon />
      </ErpLayout>
    );
  }

  if (!order) {
    return (
      <ErpLayout title="Purchase Order Detail">
        <Spin />
      </ErpLayout>
    );
  }

  const canApprove =
    order.status === "REQUESTED" && (role === "MANAGER" || role === "ADMIN");

  return (
    <ErpLayout title={`Purchase Order - PO-${String(order.poId).padStart(4, "0")}`}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
            Back
          </Button>

          <StatusBadge status={order.status} />
        </Space>

        <Card>
          <Descriptions column={3} bordered size="middle">
            <Descriptions.Item label="Supplier">
              <Space direction="vertical" size={2}>
                <Text strong>{order.supplierName}</Text>
                {order.supplierPhone && (
                  <Text type="secondary">{order.supplierPhone}</Text>
                )}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Requester">
              <Space direction="vertical" size={2}>
                <Text strong>{order.requestEmpName}</Text>
                <Text type="secondary">
                  Order date {order.poDate?.slice(0, 10)}
                </Text>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Total">
              <Space direction="vertical" size={2}>
                <Text strong>
                  {order.totalAmount?.toLocaleString() ?? 0}
                </Text>
                {order.approveEmpName && (
                  <Text type="secondary">Approver {order.approveEmpName}</Text>
                )}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Table
          rowKey="poDetailId"
          columns={columns}
          dataSource={order.details ?? []}
          pagination={false}
        />

        {order.memo && (
          <Alert type="info" message={`Memo: ${order.memo}`} showIcon />
        )}

        {canApprove && (
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button
              danger
              icon={<CloseOutlined />}
              disabled={processing}
              onClick={() => setShowRejectModal(true)}
            >
              Reject
            </Button>

            <Popconfirm
              title="Approve purchase order"
              description="Approve this purchase order?"
              okText="Approve"
              cancelText="Cancel"
              onConfirm={handleApprove}
            >
              <Button
                type="primary"
                icon={<CheckOutlined />}
                loading={processing}
              >
                Approve
              </Button>
            </Popconfirm>
          </Space>
        )}

        <Modal
          title="Reject purchase order"
          open={showRejectModal}
          okText="Reject"
          cancelText="Cancel"
          okButtonProps={{ danger: true, loading: processing }}
          onOk={handleReject}
          onCancel={() => setShowRejectModal(false)}
        >
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Text type="secondary">
              The reject reason will be sent to the requester.
            </Text>

            <TextArea
              rows={4}
              placeholder="Enter reject reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </Space>
        </Modal>
      </Space>
    </ErpLayout>
  );
}
