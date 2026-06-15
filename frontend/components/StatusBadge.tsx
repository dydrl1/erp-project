// components/StatusBadge.tsx
const LABELS: Record<string, string> = {
  REQUESTED: "승인 대기",
  APPROVED: "승인 완료",
  REJECTED: "반려",
  COMPLETED: "입고 완료",
};

export default function StatusBadge({ status }: { status: string }) {
  return <span className={`erp-badge ${status}`}>{LABELS[status] ?? status}</span>;
}
