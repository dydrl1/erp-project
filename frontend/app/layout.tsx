import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import AntdProvider from './providers/AntdProvider';
import 'antd/dist/reset.css';
import './globals.css';
import { NotificationProvider } from './providers/NotificationProvider';

export const metadata: Metadata = {
  title: '약통 ERP',
  description: '의약품 유통 관리 시스템',
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
