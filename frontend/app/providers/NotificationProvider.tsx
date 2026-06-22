'use client';

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { notification } from 'antd';
import { Client, IMessage } from '@stomp/stompjs';
import { alertApi } from '@/lib/api';

import type { NotificationMessage } from '@/lib/api';

interface NotificationContextValue {
  notifications: NotificationMessage[];
  unreadCount: number;
  drawerOpen: boolean;

  openDrawer: () => void;
  closeDrawer: () => void;
  markAsRead: (notificationId: number) => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notificationApi, contextHolder] = notification.useNotification();
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);
  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      // 실제 API 호출
      await alertApi.markRead(notificationId, 1);

      setNotifications((prev) =>
        prev.map((item) => (item.notificationId === notificationId ? { ...item, isRead: true } : item)),
      );
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  }, []);

  const handleMessage = useCallback(
    (message: IMessage) => {
      try {
        const received = JSON.parse(message.body) as NotificationMessage;
        console.log(received);
        const newItem: NotificationMessage = {
          notificationId: received.notificationId,
          level: received.level,
          receiver: received.receiver,
          content: received.content,
          dateTime: received.dateTime,
          isRead: false,
        };

        setNotifications((prev) => {
          const duplicated = prev.some((item) => item.notificationId === newItem.notificationId);

          if (duplicated) {
            return prev;
          }

          return [newItem, ...prev];
        });

        notificationApi.warning({
          title: getNotificationTitle(received.level),
          description: received.content,
          placement: 'topRight',
          duration: 15,
        });
      } catch (error) {
        console.error('알림 메시지 파싱 실패:', error);
      }
    },
    [notificationApi],
  );

  useEffect(() => {
    // const token = localStorage.getItem('accessToken');
    // console.log('[알림] token:', token);
    // if (!token) {
    // console.warn('[알림] 토큰이 없어서 STOMP 연결을 중단합니다.');
    // return;
    // }
    const role = localStorage.getItem('role') ?? '';
    const department = localStorage.getItem('deptCode') ?? '';
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws-connect',

      reconnectDelay: 5000,

      // connectHeaders: {
      // Authorization: `Bearer ${token}`,
      // },

      onConnect: () => {
        client.subscribe('/topic/notifications', handleMessage);
        if (department) {
          client.subscribe(`/topic/departments/${department}/notifications`, handleMessage);
        }
        if (department && role) {
          client.subscribe(`/topic/departments/${department}/roles/${role}/notifications`, handleMessage);
        }
      },

      onStompError: (frame) => {
        console.error('STOMP 오류:', frame);
      },

      onWebSocketError: (error) => {
        console.error('WebSocket 오류:', error);
      },
    });

    client.activate();

    return () => {
      void client.deactivate();
    };
  }, [handleMessage]);

  const contextValue = useMemo(
    () => ({
      notifications,
      unreadCount,
      drawerOpen,
      openDrawer,
      closeDrawer,
      markAsRead,
    }),
    [notifications, unreadCount, drawerOpen, openDrawer, closeDrawer, markAsRead],
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
}

function getNotificationTitle(alertType?: string) {
  switch (alertType) {
    case 'SAFETY_STOCK_LOW':
      return '안전재고 부족';

    case 'EXPIRED':
      return '유효기간 만료';

    case 'EXPIRY_10':
      return '유효기간 10일 이내';

    case 'EXPIRY_30':
      return '유효기간 30일 이내';

    case 'EXPIRY_90':
      return '유효기간 90일 이내';

    default:
      return '새로운 알림';
  }
}
