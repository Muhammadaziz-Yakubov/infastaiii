import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

interface NotificationContextType {
  requestPermissions: () => Promise<boolean>;
  scheduleNotification: (title: string, body: string, trigger?: any) => Promise<string | null>;
  cancelNotification: (notificationId: string) => Promise<void>;
  getPushToken: () => Promise<string | undefined>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificationContext, setNotificationContext] = useState<NotificationContextType>({
    requestPermissions: async () => false,
    scheduleNotification: async () => null,
    cancelNotification: async () => {},
    getPushToken: async () => undefined,
  });

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    // Request permissions
    const requestPermissions = async (): Promise<boolean> => {
      if (Platform.OS === 'ios') {
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
      } else {
        return true;
      }
    };

    // Schedule notification
    const scheduleNotification = async (
      title: string, 
      body: string, 
      trigger?: any
    ): Promise<string | null> => {
      try {
        const { id } = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: 'default',
          },
          trigger: trigger || null,
        });
        return id;
      } catch (error) {
        console.error('Error scheduling notification:', error);
        return null;
      }
    };

    // Cancel notification
    const cancelNotification = async (notificationId: string): Promise<void> => {
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      } catch (error) {
        console.error('Error canceling notification:', error);
      }
    };

    // Get push token
    const getPushToken = async (): Promise<string | undefined> => {
      try {
        const { data } = await Notifications.getExpoPushTokenAsync();
        return data;
      } catch (error) {
        console.error('Error getting push token:', error);
        return undefined;
      }
    };

    setNotificationContext({
      requestPermissions,
      scheduleNotification,
      cancelNotification,
      getPushToken,
    });
  };

  return (
    <NotificationContext.Provider value={notificationContext}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
