'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationContainer from '@/components/ui/Notification';
import { MessageType } from '@/types/notifications';

interface Notification {
  id: string;
  type: MessageType;
  message: string;
}

interface NotificationContextProps {
  showNotification: (type: MessageType, message: string) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);  

  const showNotification = useCallback((type: MessageType, message: string) => {
    const id = `${Date.now()}-${Math.random()}`; // unique string id ✅
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeNotification(id), 4000);
  }, [removeNotification]);
  

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <NotificationContainer
        notifications={notifications}
        removeNotification={removeNotification}
        position="top-right"
        animationDirection="right"
      />
    </NotificationContext.Provider>
  );
};

export const useGlobalNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useGlobalNotifications must be used within a NotificationProvider');
  }
  return context;
};
