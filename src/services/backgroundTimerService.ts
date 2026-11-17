import { Capacitor } from '@capacitor/core';
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

const activeTimers = new Map<number, ActiveTimerInstance>();
let channelInitialized = false;

/**
 * Initialize high-priority lock-screen notification channel on Android
 */
async function ensureNotificationChannel() {
  if (channelInitialized || !Capacitor.isNativePlatform()) return;
  try {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    await LocalNotifications.createChannel({
      id: 'quantra-active-timers',
      name: 'Active Timers & Stopwatches',
      description: 'Persistent lock-screen notifications for ongoing tasks and workout timers',
      importance: 5, // MAX importance for lock-screen presence
      visibility: 1, // VISIBILITY_PUBLIC (Shows on lock screen)
      vibration: true,
      lights: true,
      lightColor: '#2563eb',
    });
    channelInitialized = true;
  } catch (err) {
    console.warn('[BackgroundTimer] Failed to initialize notification channel:', err);
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Updates or schedules the Android Lock-Screen Notification
 */
async function syncNotification(timer: ActiveTimerInstance, secondsRemainingOrElapsed: number) {
  if (!Capacitor.isNativePlatform()) {
    // Optional Web Notification fallback
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      // Light title update
      document.title = `(${formatTime(secondsRemainingOrElapsed)}) ${timer.title} · Quantra`;
    }
    return;
  }

  try {
    await ensureNotificationChannel();

    const isCountdown = timer.type === 'COUNTDOWN';
    const timeDisplay = formatTime(secondsRemainingOrElapsed);
    const body = isCountdown
      ? `${timeDisplay} remaining · Tap to open session`
      : `${timeDisplay} active elapsed · Tap to open session`;

    // 1. Post/Update ongoing lock-screen notification
    await LocalNotifications.schedule({
      notifications: [
        {
          id: timer.id,
          title: timer.title,
          body,
          channelId: 'quantra-active-timers',
          ongoing: true, // Cannot be swiped away while active
          autoCancel: false,
          schedule: { at: new Date(Date.now() + 100) },
        },
      ],
    });

    // 2. If countdown, schedule completion alert at exact target time
    if (isCountdown && timer.targetEndTime) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: timer.id + 10000,
            title: `🔔 ${timer.title} Finished!`,
            body: 'Timer reached zero. Tap to view and log your session.',
            channelId: 'quantra-active-timers',
            schedule: { at: new Date(timer.targetEndTime) },
          },
        ],
      });
    }
  } catch (err) {
    console.warn('[BackgroundTimer] Error scheduling notification:', err);
  }
}

/**
 * Cancels active lock-screen and completion notifications
 */
export async function clearTimerNotifications(id: number) {
  if (typeof document !== 'undefined') {
    document.title = 'Quantra Life OS';
  }
  if (!Capacitor.isNativePlatform()) return;

  try {
    await LocalNotifications.cancel({
      notifications: [{ id }, { id: id + 10000 }],
    });
  } catch (err) {
    console.warn('[BackgroundTimer] Error cancelling notification:', err);
  }
}

/**
 * Core ticker loop and visibility listener
 */
if (typeof window !== 'undefined') {
  // 1. Heartbeat interval (updates notifications and ticks every 1 second)
  setInterval(() => {
    const now = Date.now();
    activeTimers.forEach((timer, id) => {
      if (!timer.isRunning) return;

      if (timer.type === 'COUNTDOWN') {
        if (!timer.targetEndTime) return;
        const remaining = Math.max(0, Math.round((timer.targetEndTime - now) / 1000));
        timer.onTick?.(remaining);

        // Update notification every 5 seconds (or at 0) to conserve battery
        if (remaining % 5 === 0 || remaining === 0) {
          syncNotification(timer, remaining);
        }

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
        if (elapsed % 5 === 0) {
          syncNotification(timer, elapsed);
        }
      }
    });
  }, 1000);

  // 2. High-precision Resync when app is unlocked or foregrounded
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
   * Start a countdown timer with lock-screen notification support
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
    syncNotification(timerInstance, options.totalSeconds);
    return timerInstance;
  },

  /**
   * Start a stopwatch with lock-screen notification support
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
    syncNotification(timerInstance, initial);
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
