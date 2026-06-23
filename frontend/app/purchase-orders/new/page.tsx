"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Empty,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Statistic,
  Table,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import ErpLayout from "@/components/ErpLayout";
import { purchaseOrderApi } from "@/lib/api";

const { Text } = Typography;

interface Supplier {
  supplierId: number;
  supplierName: string;
}

interface Product {
  productId: number;
  productCode: string;
  productName: string;
  unit: string;
  standardPurchasePrice: number;
}

interface OrderRow {
  productId: number;
  orderQty: number;
  unitPrice: number;
}

export default function PurchaseOrderCreatePage() {
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [supplierId, setSupplierId] = useState<number>();
  const [memo, setMemo] = useState("");
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [processing, setProcessing] = useState(false);

  const [showPicker, setShowPicker] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [checked, setChecked] = useState<React.Key[]>([]);

  useEffect(() => {
    purchaseOrderApi.suppliers().then(setSuppliers).catch((e) => message.error(e.message));
    purchaseOrderApi
      .products()
      .then((data) => setProducts(data as unknown as Product[]))
      .catch((e) => message.error(e.message));
  }, []);

  const selectedIds = useMemo(() => new Set(rows.map((r) => r.productId)), [rows]);

  const getProduct = (productId: number) =>
    products.find((p) => p.productId === productId);

  const filteredProducts = products.filter((p) => {
    if (selectedIds.has(p.productId)) return false;
    if (!keyword) return true;

    return (
      p.productName.toLowerCase().includes(keyword.toLowerCase()) ||
      p.productCode.toLowerCase().includes(keyword.toLowerCase())
    );
  });

  const totalAmount = rows.reduce(
    (sum, row) => sum + row.orderQty * row.unitPrice,
    0,
  );

  const openPicker = () => {
    setChecked([]);
    setKeyword("");
    setShowPicker(true);
  };

  const removeRow = (productId: number) => {
    setRows((prev) => prev.filter((row) => row.productId !== productId));
  };

  const updateRow = (
    productId: number,
    field: "orderQty" | "unitPrice",
    value: number | null,
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.productId === productId
          ? { ...row, [field]: value ?? 0 }
          : row,
      ),
    );
  };

  const addChecked = () => {
    if (checked.length === 0) {
      message.warning("추가할 의약품을 선택해주세요.");
      return;
    }

    const newRows: OrderRow[] = products
      .filter((p) => checked.includes(p.productId))
      .map((p) => ({
        productId: p.productId,
        orderQty: 1,
        unitPrice: p.standardPurchasePrice,
      }));

    setRows((prev) => [...prev, ...newRows]);
    setShowPicker(false);
  };

  const handleSubmit = async () => {
    if (!supplierId) {
      message.warning("공급처를 선택해주세요.");
      return;
    }

    if (rows.length === 0) {
      message.warning("발주할 의약품을 1개 이상 추가해주세요.");
      return;
    }

    for (const row of rows) {
      if (row.orderQty < 1) {
        message.warning("수량은 1 이상이어야 합니다.");
        return;
      }
    }

    setProcessing(true);

    try {
      await purchaseOrderApi.create({
        supplierId,
        memo: memo || undefined,
        details: rows,
      });

      message.success("발주가 등록되었습니다.");
      router.push("/purchase-orders");
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const orderColumns: ColumnsType<OrderRow> = [
    {
      title: "의약품",
      dataIndex: "productId",
      render: (productId) => {
        const product = getProduct(productId);

        return (
          <Space direction="vertical" size={0}>
            <Text strong>{product?.productName}</Text>
            <Text type="secondary">
              {product?.productCode} / {product?.unit}
            </Text>
          </Space>
        );
      },
    },
    {
      title: "수량",
      dataIndex: "orderQty",
      width: 130,
      render: (value, row) => (
        <InputNumber
          min={1}
          value={value}
          style={{ width: "100%" }}
          onChange={(nextValue) =>
            updateRow(row.productId, "orderQty", nextValue)
          }
        />
      ),
    },
    {
      title: "단가",
      dataIndex: "unitPrice",
      width: 150,
      render: (value, row) => (
        <InputNumber
          min={0}
          value={value}
          style={{ width: "100%" }}
          formatter={(nextValue) =>
            `${nextValue}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(nextValue) =>
            Number(nextValue?.replace(/\$\s?|(,*)/g, "") ?? 0)
          }
          onChange={(nextValue) =>
            updateRow(row.productId, "unitPrice", nextValue)
          }
        />
      ),
    },
    {
      title: "금액",
      align: "right",
      width: 150,
      render: (_, row) => `${(row.orderQty * row.unitPrice).toLocaleString()}원`,
    },
    {
      title: "",
      width: 70,
      align: "center",
      render: (_, row) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeRow(row.productId)}
        />
      ),
    },
  ];

  const pickerColumns: ColumnsType<Product> = [
    {
      title: "의약품",
      dataIndex: "productName",
      render: (_, product) => (
        <Space direction="vertical" size={0}>
          <Text strong>{product.productName}</Text>
          <Text type="secondary">
            {product.productCode} / {product.standardPurchasePrice?.toLocaleString()}원
          </Text>
        </Space>
      ),
    },
  ];

  return (
    <ErpLayout title="발주 등록">
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          목록으로
        </Button>

        <Card>
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <Space size={16} style={{ width: "100%" }} align="start">
              <Select
                placeholder="공급처 선택"
                value={supplierId}
                style={{ width: 260 }}
                options={suppliers.map((supplier) => ({
                  value: supplier.supplierId,
                  label: supplier.supplierName,
                }))}
                onChange={setSupplierId}
              />

              <Input
                placeholder="발주 관련 메모 (선택)"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </Space>
          </Space>
        </Card>

        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Text type="secondary">발주 품목 {rows.length}개</Text>

          <Button type="primary" icon={<PlusOutlined />} onClick={openPicker}>
            의약품 추가
          </Button>
        </Space>

        <Table
          rowKey="productId"
          columns={orderColumns}
          dataSource={rows}
          pagination={false}
          locale={{
            emptyText: (
              <Empty description="의약품 추가 버튼으로 품목을 추가하세요." />
            ),
          }}
        />

        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Statistic
            title="총금액"
            value={totalAmount}
            suffix="원"
            styles={{ content: { color: "#1d9e75" } }}
          />
        </Space>

        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button onClick={() => router.back()}>취소</Button>
          <Button type="primary" loading={processing} onClick={handleSubmit}>
            발주 등록
          </Button>
        </Space>

        <Modal
          title="의약품 추가"
          open={showPicker}
          width={620}
          okText="선택 추가"
          cancelText="취소"
          onOk={addChecked}
          onCancel={() => setShowPicker(false)}
        >
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="의약품명 또는 코드 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              autoFocus
            />

            <Table
              rowKey="productId"
              columns={pickerColumns}
              dataSource={filteredProducts}
              pagination={{ pageSize: 6 }}
              rowSelection={{
                selectedRowKeys: checked,
                onChange: setChecked,
              }}
              size="small"
              locale={{
                emptyText: keyword
                  ? "검색 결과가 없습니다."
                  : "추가 가능한 의약품이 없습니다.",
              }}
            />

            <Text type="secondary">{checked.length}개 선택됨</Text>
          </Space>
        </Modal>
      </Space>
    </ErpLayout>
  );
}