"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import { authApi, tokenStorage, userStorage } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authApi.login(loginId, password);
      tokenStorage.set(data.accessToken);
      userStorage.set(data);
      router.push("/purchase-orders");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="PharmaFlow ERP"
      subtitle="Pharmaceutical distribution management"
      onSubmit={handleLogin}
      footer={
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--erp-text-muted)", textAlign: "center" }}>
          Need an account?{" "}
          <Link href="/signup" style={{ color: "var(--erp-primary)", fontWeight: 600 }}>
            Sign up
          </Link>
        </p>
      }
    >
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 6px" }}>Login ID</p>
        <input
          className="erp-input"
          style={{ width: "100%" }}
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          placeholder="Enter your login ID"
        />
      </div>

      <div>
        <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 6px" }}>Password</p>
        <input
          type="password"
          className="erp-input"
          style={{ width: "100%" }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
      </div>

      {error && <p className="erp-warn-text" style={{ margin: 0 }}>{error}</p>}

      <button type="submit" className="erp-btn primary" disabled={loading} style={{ width: "100%", height: 40 }}>
        {loading ? "Logging in..." : "Log in"}
      </button>
    </AuthShell>
  );
}
