"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { tokenStorage } from "@/lib/api";

const MENUS = [
  { href: "/", label: "홈" },
  { href: "/attendance", label: "근태 관리" },
  { href: "/customers", label: "거래처 관리" },
  { href: "/products", label: "의약품 관리" },
  { href: "/purchase-orders", label: "입고 / 승인" },
  { href: "/inventory", label: "출고 / 재고" },
  { href: "/settlement", label: "정산 / 매출" },
  { href: "/ai", label: "AI 분석" },
];

export default function ErpLayout({ title, children }: { title: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [empName, setEmpName] = useState("");

  // localStorage에서 사용자명 가져오기
  useEffect(() => {
    setEmpName(localStorage.getItem("empName") ?? "사용자");
  }, []);

  // 로그아웃
  const handleLogout = () => {
    if (!confirm("로그아웃 하시겠습니까?")) return;
    tokenStorage.clear();
    localStorage.removeItem("empName");
    localStorage.removeItem("role");
    router.push("/login");
  };

  return (
    <div className="erp-layout">
      <aside className="erp-sidebar">
        <div className="erp-logo">
          <span className="erp-logo-mark">약</span>
          약통 ERP
        </div>
        <nav className="erp-menu">
          {MENUS.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className={pathname.startsWith(menu.href) && menu.href !== "/" ? "active" : ""}
            >
              {menu.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="erp-main">
        <header className="erp-header">
          <h1>{title}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="erp-user">{empName} 님</span>
            <button
              className="erp-btn"
              style={{ height: 30, padding: "0 12px", fontSize: 12 }}
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </div>
        </header>
        <main className="erp-content">{children}</main>
      </div>
    </div>
  );
}
