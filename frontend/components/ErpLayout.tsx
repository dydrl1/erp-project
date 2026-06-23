"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Avatar, Button, Layout, Menu, Space, Typography } from "antd";
import { LogoutOutlined, MedicineBoxOutlined, UserOutlined } from "@ant-design/icons";
import { tokenStorage } from "@/lib/api";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const MENUS = [
  { href: "/", label: "홈" },
  { href: "/attendance", label: "근태 관리" },
  { href: "/customers", label: "거래처 관리" },
  { href: "/products", label: "의약품 관리" },
  { href: "/purchase-orders", label: "입고 / 승인" },
  { href: "/inventory", label: "출고 / 재고" },
  { href: "/recall-drugs", label: "위해의약품" },
  { href: "/settlement", label: "정산 / 매출" },
  { href: "/ai", label: "AI 분석" },
];

export default function ErpLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [empName, setEmpName] = useState("");

  useEffect(() => {
    setEmpName(localStorage.getItem("empName") ?? "사용자");
  }, []);

  const selectedKey = useMemo(() => {
    if (pathname === "/") return "/";

    return (
      MENUS.find((menu) => menu.href !== "/" && pathname.startsWith(menu.href))
        ?.href ?? pathname
    );
  }, [pathname]);

  const handleLogout = () => {
    if (!confirm("로그아웃 하시겠습니까?")) return;

    tokenStorage.clear();
    localStorage.removeItem("empName");
    localStorage.removeItem("role");
    router.push("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={230} theme="light" style={{ borderRight: "1px solid #f0f0f0" }}>
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 20px",
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          <Avatar
            shape="square"
            icon={<MedicineBoxOutlined />}
            style={{ backgroundColor: "#1d9e75" }}
          />
          약통 ERP
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={MENUS.map((menu) => ({
            key: menu.href,
            label: <Link href={menu.href}>{menu.label}</Link>,
          }))}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            height: 64,
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            {title}
          </Title>

          <Space size={12}>
            <Avatar icon={<UserOutlined />} />
            <Text>{empName} 님</Text>
            <Button size="small" icon={<LogoutOutlined />} onClick={handleLogout}>
              로그아웃
            </Button>
          </Space>
        </Header>

        <Content style={{ padding: 24, background: "#f5f7f9" }}>{children}</Content>
      </Layout>
    </Layout>
  );
}