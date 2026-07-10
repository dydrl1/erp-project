'use client';

import { useContext } from 'react';
import { Button, Drawer, Empty, Flex, Typography } from 'antd';
import { NotificationContext } from '../../app/providers/NotificationProvider';
import NotificationItem from './NotificationItem';

export default function NotificationDrawer() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('NotificationDrawer must be used inside NotificationProvider.');
  }

  const { notifications, unreadCount, drawerOpen, closeDrawer, markAsRead, markAll } = context;

  return (
    <Drawer
      title={
        <Flex align="center" gap={8}>
          <Typography.Text type="secondary">Unread {unreadCount}</Typography.Text>
          <Button
            type="text"
            disabled={unreadCount === 0}
            onClick={markAll}
            style={{
              color: unreadCount > 0 ? '#4096ff' : 'gray',
              fontSize: unreadCount > 0 ? 14 : 12,
              fontWeight: unreadCount > 0 ? 600 : 400,
            }}
          >
            모두 읽음
          </Button>
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
        <Empty description="No notifications." style={{ marginTop: 80 }} />
      ) : (
        notifications.map((item) => <NotificationItem key={item.notificationId} item={item} onRead={markAsRead} />)
      )}
    </Drawer>
  );
}
