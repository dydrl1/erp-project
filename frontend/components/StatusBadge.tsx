// components/StatusBadge.tsx
import { Tag } from "antd";

const STATUS_META: Record<string, { label: string; color: string }> = {
  REQUESTED: {
    label: "승인 대기",
    color: "gold",
  },
  APPROVED: {
    label: "승인 완료",
    color: "green",
  },
  REJECTED: {
    label: "반려",
    color: "red",
  },
  COMPLETED: {
    label: "입고 완료",
    color: "blue",
  },
};

export default function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status];

  return <Tag color={meta?.color}>{meta?.label ?? status}</Tag>;
}