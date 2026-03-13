import { useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { WeatherAlert } from '@/components/SevereWeatherAlert';

export const usePushNotifications = () => {
  const initialized = useRef(false);

  const initialize = useCallback(async () => {
    if (initialized.current) return;
    
    if (Capacitor.isNativePlatform()) {
      // Native push notifications
      try {
        const permResult = await PushNotifications.requestPermissions();
        if (permResult.receive === 'granted') {
          await PushNotifications.register();
          initialized.current = true;

          PushNotifications.addListener('registration', (token) => {
            console.log('[Push] Registered with token:', token.value);
            // Store token for backend to send targeted alerts
            localStorage.setItem('push-token', token.value);
          });

          PushNotifications.addListener('registrationError', (err) => {
            console.error('[Push] Registration error:', err);
          });

          PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('[Push] Received:', notification);
          });

          PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
            console.log('[Push] Action:', action);
          });
        }
      } catch (e) {
        console.warn('[Push] Native push not available:', e);
      }

      // Also set up local notifications permission
      try {
        await LocalNotifications.requestPermissions();
      } catch (e) {
        console.warn('[LocalNotif] Not available:', e);
      }
    } else {
      // Web: request Notification API permission
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      initialized.current = true;
    }
  }, []);

  const sendWeatherAlert = useCallback(async (alert: WeatherAlert) => {
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Date.now(),
              title: `⚠️ ${alert.title}`,
              body: alert.description,
              schedule: { at: new Date() },
              sound: 'alert.wav',
              extra: {
                type: alert.type,
                severity: alert.severity,
                steps: JSON.stringify(alert.survivalSteps),
              },
              channelId: 'severe-weather',
            },
          ],
        });
      } catch (e) {
        console.warn('[LocalNotif] Failed to schedule:', e);
      }
    } else if ('Notification' in window && Notification.permission === 'granted') {
      // Web fallback
      try {
        new Notification(`⚠️ ${alert.title}`, {
          body: alert.description,
          icon: '/icon-512.png',
          badge: '/icon-512.png',
          tag: `weather-alert-${alert.type}`,
          requireInteraction: true,
          vibrate: [200, 100, 200, 100, 200] as any,
        });
      } catch (e) {
        console.warn('[WebNotif] Failed:', e);
      }
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Create Android notification channel on native
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    
    LocalNotifications.createChannel({
      id: 'severe-weather',
      name: 'Severe Weather Alerts',
      description: 'Critical weather warnings and emergency notifications',
      importance: 5,
      visibility: 1,
      sound: 'alert.wav',
      vibration: true,
      lights: true,
      lightColor: '#E63946',
    }).catch(() => {});
  }, []);

  return { sendWeatherAlert, initialize };
};
