import { Capacitor, registerPlugin } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface ActiveTimerInstance {
  id: number;
  type: 'COUNTDOWN' | 'STOPWATCH';
  title: string;
  category: 'TASK' | 'WORKOUT' | 'STUDY';
  startedAt: number;
  targetEndTime?: number;
  initialSeconds: number;
  isRunning: boolean;
  onTick?: (seconds: number) => void;
  onComplete?: () => void;
}

// Native Android Persistent Timer Plugin definition
export interface PersistentTimerPlugin {
  startTimer(options: {
    id: number;
    title: string;
    subtitle?: string;
    isCountdown: boolean;
    targetEndTime?: number;
    startTime?: number;
  }): Promise<{ success: boolean; id: number }>;

  stopTimer(options: { id: number }): Promise<{ success: boolean; id: number }>;

  stopAllTimers(): Promise<{ success: boolean }>;
}

const PersistentTimer = registerPlugin<PersistentTimerPlugin>('PersistentTimer');

const activeTimers = new Map<number, ActiveTimerInstance>();
let permissionsRequested = false;

/**
 * Ensure notification permissions on native devices
 */
async function ensurePermissions() {
  if (permissionsRequested || !Capacitor.isNativePlatform()) return;
  try {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }
    permissionsRequested = true;
  } catch (err) {
    console.warn('[BackgroundTimer] Permission request failed:', err);
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Starts or updates the Native Android Persistent Chronometer Notification
 * Uses native Foreground Service and setUsesChronometer(true) so Android SystemUI
 * ticks in real time every second on Lock Screen, Notification Shade, and Notch
 * without any JavaScript interval dependency or battery drain!
 */
async function syncNativeNotification(timer: ActiveTimerInstance) {
  if (!Capacitor.isNativePlatform()) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const remainingOrElapsed = timer.type === 'COUNTDOWN' && timer.targetEndTime
        ? Math.max(0, Math.round((timer.targetEndTime - Date.now()) / 1000))
        : Math.round((Date.now() - timer.startedAt) / 1000);
      document.title = `(${formatTime(remainingOrElapsed)}) ${timer.title} · Quantra`;
    }
    return;
  }

  await ensurePermissions();

  const isCountdown = timer.type === 'COUNTDOWN';
  const subtitle = isCountdown
    ? `${formatTime(timer.initialSeconds)} Target Session · Live Countdown`
    : `Active Timer · Real-Time Chronometer`;

  try {
    // 1. Primary: Native Android Foreground Service with Real-Time Chronometer
    await PersistentTimer.startTimer({
      id: timer.id,
      title: timer.title,
      subtitle,
      isCountdown,
      targetEndTime: timer.targetEndTime,
      startTime: timer.startedAt,
    });
  } catch (err) {
    console.warn('[BackgroundTimer] Native PersistentTimer call failed, falling back to LocalNotifications:', err);
    // Fallback if native plugin unavailable
    try {
      const remaining = isCountdown && timer.targetEndTime
        ? Math.max(0, Math.round((timer.targetEndTime - Date.now()) / 1000))
        : Math.round((Date.now() - timer.startedAt) / 1000);
      await LocalNotifications.schedule({
        notifications: [
          {
            id: timer.id,
            title: timer.title,
            body: `${formatTime(remaining)} ${isCountdown ? 'remaining' : 'elapsed'} · Tap to open`,
            channelId: 'quantra-active-timers',
            ongoing: true,
            autoCancel: false,
          },
        ],
      });
    } catch (fallbackErr) {
      console.warn('[BackgroundTimer] Fallback notification failed:', fallbackErr);
    }
  }
}

/**
 * Cancels active lock-screen, status-bar, and completion notifications
 */
export async function clearTimerNotifications(id: number) {
  if (typeof document !== 'undefined') {
    document.title = 'Quantra Life OS';
  }
  if (!Capacitor.isNativePlatform()) return;

  try {
    // 1. Stop native Foreground Service
    await PersistentTimer.stopTimer({ id });
  } catch (err) {
    console.warn('[BackgroundTimer] Error stopping native persistent timer:', err);
  }

  try {
    // 2. Also cancel any fallback LocalNotifications
    await LocalNotifications.cancel({
      notifications: [{ id }, { id: id + 10000 }],
    });
  } catch (err) {
    console.warn('[BackgroundTimer] Error cancelling LocalNotifications:', err);
  }
}

/**
 * Core ticker loop and visibility listener
 */
if (typeof window !== 'undefined') {
  // 1. In-app UI ticker (updates React state when app is visible)
  setInterval(() => {
    const now = Date.now();
    activeTimers.forEach((timer, id) => {
      if (!timer.isRunning) return;

      if (timer.type === 'COUNTDOWN') {
        if (!timer.targetEndTime) return;
        const remaining = Math.max(0, Math.round((timer.targetEndTime - now) / 1000));
        timer.onTick?.(remaining);

        if (remaining <= 0) {
          timer.isRunning = false;
          clearTimerNotifications(id);
          timer.onComplete?.();
          activeTimers.delete(id);
        }
      } else {
        // Stopwatch
        const elapsed = Math.round((now - timer.startedAt) / 1000);
        timer.onTick?.(elapsed);
      }
    });
  }, 1000);

  // 2. High-precision Resync when app returns from background or phone is unlocked
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const now = Date.now();
      activeTimers.forEach((timer, id) => {
        if (!timer.isRunning) return;

        if (timer.type === 'COUNTDOWN' && timer.targetEndTime) {
          const remaining = Math.max(0, Math.round((timer.targetEndTime - now) / 1000));
          timer.onTick?.(remaining);
          if (remaining <= 0) {
            timer.isRunning = false;
            clearTimerNotifications(id);
            timer.onComplete?.();
            activeTimers.delete(id);
          }
        } else if (timer.type === 'STOPWATCH') {
          const elapsed = Math.round((now - timer.startedAt) / 1000);
          timer.onTick?.(elapsed);
        }
      });
    }
  });
}

/**
 * Public Background Timer API
 */
export const backgroundTimerManager = {
  /**
   * Start a countdown timer with native real-time lock-screen chronometer
   */
  startCountdown(options: {
    id: number;
    title: string;
    category: 'TASK' | 'WORKOUT' | 'STUDY';
    totalSeconds: number;
    preserveIfRunning?: boolean;
    onTick?: (secondsLeft: number) => void;
    onComplete?: () => void;
  }) {
    const existing = activeTimers.get(options.id);
    const now = Date.now();
    if (
      options.preserveIfRunning &&
      existing &&
      existing.isRunning &&
      existing.targetEndTime &&
      existing.targetEndTime > now
    ) {
      existing.onTick = options.onTick;
      existing.onComplete = options.onComplete;
      existing.title = options.title;
      const rem = Math.max(0, Math.round((existing.targetEndTime - now) / 1000));
      options.onTick?.(rem);
      return existing;
    }

    const targetEndTime = now + options.totalSeconds * 1000;

    const timerInstance: ActiveTimerInstance = {
      id: options.id,
      type: 'COUNTDOWN',
      title: options.title,
      category: options.category,
      startedAt: now,
      targetEndTime,
      initialSeconds: options.totalSeconds,
      isRunning: true,
      onTick: options.onTick,
      onComplete: options.onComplete,
    };

    activeTimers.set(options.id, timerInstance);
    syncNativeNotification(timerInstance);
    return timerInstance;
  },

  /**
   * Start a stopwatch with native real-time lock-screen chronometer
   */
  startStopwatch(options: {
    id: number;
    title: string;
    category: 'TASK' | 'WORKOUT' | 'STUDY';
    initialSeconds?: number;
    preserveIfRunning?: boolean;
    onTick?: (elapsedSeconds: number) => void;
  }) {
    const existing = activeTimers.get(options.id);
    const now = Date.now();
    if (options.preserveIfRunning && existing && existing.isRunning) {
      existing.onTick = options.onTick;
      existing.title = options.title;
      const el = Math.round((now - existing.startedAt) / 1000);
      options.onTick?.(el);
      return existing;
    }

    const initial = options.initialSeconds || 0;
    const startedAt = now - initial * 1000;

    const timerInstance: ActiveTimerInstance = {
      id: options.id,
      type: 'STOPWATCH',
      title: options.title,
      category: options.category,
      startedAt,
      initialSeconds: initial,
      isRunning: true,
      onTick: options.onTick,
    };

    activeTimers.set(options.id, timerInstance);
    syncNativeNotification(timerInstance);
    return timerInstance;
  },

  /**
   * Detach UI tick handler when component unmounts without stopping background execution
   */
  detachHandlers(id: number) {
    const timer = activeTimers.get(id);
    if (timer) {
      timer.onTick = undefined;
    }
  },

  /**
   * Get current real-time seconds remaining (countdown) or elapsed (stopwatch)
   */
  getCurrentSeconds(id: number): number | null {
    const timer = activeTimers.get(id);
    if (!timer || !timer.isRunning) return null;
    const now = Date.now();
    if (timer.type === 'COUNTDOWN' && timer.targetEndTime) {
      return Math.max(0, Math.round((timer.targetEndTime - now) / 1000));
    } else if (timer.type === 'STOPWATCH') {
      return Math.max(0, Math.round((now - timer.startedAt) / 1000));
    }
    return null;
  },

  /**
   * Pause an active timer
   */
  pauseTimer(id: number) {
    const timer = activeTimers.get(id);
    if (timer) {
      timer.isRunning = false;
      clearTimerNotifications(id);
    }
  },

  /**
   * Stop and remove a timer completely
   */
  stopTimer(id: number) {
    activeTimers.delete(id);
    clearTimerNotifications(id);
  },

  /**
   * Check if a timer is active
   */
  isTimerRunning(id: number): boolean {
    return activeTimers.get(id)?.isRunning ?? false;
  },
};
