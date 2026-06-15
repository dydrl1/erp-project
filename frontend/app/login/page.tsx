"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, tokenStorage } from "@/lib/api";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  empId: number;
  loginId: string;
  empName: string;
  role: string;
  deptId: number;
}

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.post<LoginResponse>("/api/auth/login", {
        loginId,
        password,
      });
      tokenStorage.set(data.accessToken);
      localStorage.setItem("empName", data.empName);
      localStorage.setItem("role", data.role);
      router.push("/purchase-orders");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f7fa" }}>
      <form onSubmit={handleLogin} style={{ width: 360, background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 32, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#1d9e75", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>약</div>
          <h2 style={{ margin: "10px 0 0", fontSize: 18 }}>약통 ERP</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>의약품 유통 관리 시스템</p>
        </div>

        <div>
          <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 6px" }}>아이디</p>
          <input className="erp-input" style={{ width: "100%" }} value={loginId} onChange={(e) => setLoginId(e.target.value)} placeholder="아이디를 입력하세요" />
        </div>

        <div>
          <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 6px" }}>비밀번호</p>
          <input type="password" className="erp-input" style={{ width: "100%" }} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호를 입력하세요" />
        </div>

        {error && <p className="erp-warn-text" style={{ margin: 0 }}>{error}</p>}

        <button type="submit" className="erp-btn primary" disabled={loading} style={{ width: "100%", height: 40 }}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}