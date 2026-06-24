import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import AntdProvider from "./providers/AntdProvider";
import { NotificationProvider } from "./providers/NotificationProvider";
import "antd/dist/reset.css";
import "./globals.css";
import "./erp.css";

export const metadata: Metadata = {
  title: "PharmaFlow ERP",
  description: "Pharmaceutical distribution ERP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AntdRegistry>
          <AntdProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
