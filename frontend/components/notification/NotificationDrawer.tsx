'use client';

import { useContext } from 'react';
import { Drawer, Empty, Flex, Typography } from 'antd';

import { NotificationContext } from '../../app/providers/NotificationProvider';
import NotificationItem from './NotificationItem';

export default function NotificationDrawer() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('NotificationDrawer는 NotificationProvider 내부에서 사용해야 합니다.');
  }

  const { notifications, unreadCount, drawerOpen, closeDrawer, markAsRead } = context;

  return (
    <Drawer
      title={
        <Flex align="center" gap={8}>
          <span>알림</span>
          <Typography.Text type="secondary">읽지 않음 {unreadCount}건</Typography.Text>
        </Flex>
      }
      placement="right"
      size={420}
      open={drawerOpen}
      onClose={closeDrawer}
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      {notifications.length === 0 ? (
        <Empty description="도착한 알림이 없습니다." style={{ marginTop: 80 }} />
      ) : (
        notifications.map((item) => {
          return <NotificationItem key={item.notificationId} item={item} onRead={markAsRead} />;
        })
      )}
    </Drawer>
  );
}
