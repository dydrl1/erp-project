"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { notification } from "antd";
import { Client, IMessage } from "@stomp/stompjs";
import { alertApi, type NotificationMessage } from "@/lib/api";
import { userStorage } from "@/lib/api-client";

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

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    const user = userStorage.get();

    try {
      await alertApi.markRead(notificationId, user?.empId ?? 0);
      setNotifications((prev) =>
        prev.map((item) => (item.notificationId === notificationId ? { ...item, isRead: true } : item)),
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  const handleMessage = useCallback(
    (message: IMessage) => {
      try {
        const received = JSON.parse(message.body) as NotificationMessage;
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
          return duplicated ? prev : [newItem, ...prev];
        });

        notificationApi.warning({
          message: getNotificationTitle(received.level),
          description: received.content,
          placement: "topRight",
          duration: 15,
        });
      } catch (error) {
        console.error("Failed to parse notification message:", error);
      }
    },
    [notificationApi],
  );

  useEffect(() => {
    const user = userStorage.get();
    const role = user?.role ?? "";
    const department = user?.deptCode ?? "";

    const client = new Client({
      brokerURL: "ws://localhost:8080/ws-connect",
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe("/topic/notifications", handleMessage);
        if (department) {
          client.subscribe(`/topic/departments/${department}/notifications`, handleMessage);
        }
        if (department && role) {
          client.subscribe(`/topic/departments/${department}/roles/${role}/notifications`, handleMessage);
        }
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
      onWebSocketError: (error) => {
        console.error("WebSocket error:", error);
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
    case "SAFETY_STOCK_LOW":
      return "Safety stock low";
    case "EXPIRED":
      return "Expired";
    case "EXPIRY_10":
      return "Expires within 10 days";
    case "EXPIRY_30":
      return "Expires within 30 days";
    case "EXPIRY_90":
      return "Expires within 90 days";
    default:
      return "New notification";
  }
}
