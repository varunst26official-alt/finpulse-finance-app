package app.lifeos.commandcentre;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class PersistentTimerService extends Service {
    private static final String TAG = "PersistentTimerService";
    public static final String CHANNEL_ID = "quantra_live_timers";
    public static final String CHANNEL_NAME = "Active Live Timers";

    public static final String ACTION_START = "app.lifeos.commandcentre.START_TIMER";
    public static final String ACTION_STOP = "app.lifeos.commandcentre.STOP_TIMER";
    public static final String ACTION_STOP_ALL = "app.lifeos.commandcentre.STOP_ALL_TIMERS";

    private final Handler completionHandler = new Handler(Looper.getMainLooper());
    private Runnable completionRunnable = null;
    private int currentTimerId = 1001;
    private String currentTitle = "Active Timer";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    CHANNEL_NAME,
                    NotificationManager.IMPORTANCE_HIGH
                );
                channel.setDescription("Real-time live ticking timers, chronometers, and countdown notifications");
                channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                channel.enableLights(true);
                channel.setLightColor(Color.BLUE);
                channel.enableVibration(false); // Alert once only so ticking does not buzz continuously
                channel.setShowBadge(true);
                manager.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) {
            return START_NOT_STICKY;
        }

        String action = intent.getAction();
        Log.i(TAG, "onStartCommand action=" + action);

        if (ACTION_START.equals(action)) {
            handleStartTimer(intent);
        } else if (ACTION_STOP.equals(action)) {
            handleStopTimer(intent);
        } else if (ACTION_STOP_ALL.equals(action)) {
            handleStopAll();
        }

        return START_NOT_STICKY;
    }

    private void handleStartTimer(Intent intent) {
        int id = intent.getIntExtra("id", 1001);
        String title = intent.getStringExtra("title");
        if (title == null || title.isEmpty()) {
            title = "Active Timer";
        }
        String subtitle = intent.getStringExtra("subtitle");
        boolean isCountdown = intent.getBooleanExtra("isCountdown", true);
        long targetEndTime = intent.getLongExtra("targetEndTime", 0L);
        long startTime = intent.getLongExtra("startTime", System.currentTimeMillis());

        this.currentTimerId = id;
        this.currentTitle = title;

        Log.i(TAG, "handleStartTimer id=" + id + " title=" + title + " countdown=" + isCountdown + " target=" + targetEndTime);

        // Cancel previous completion runnable if any
        if (completionRunnable != null) {
            completionHandler.removeCallbacks(completionRunnable);
            completionRunnable = null;
        }

        // 1. Content Intent to bring app to front on tap
        Intent openAppIntent = new Intent(this, MainActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentPendingIntent = PendingIntent.getActivity(
            this,
            0,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        // 2. Action Intent to stop timer directly from lock screen / notification shade
        Intent stopIntent = new Intent(this, PersistentTimerService.class);
        stopIntent.setAction(ACTION_STOP);
        stopIntent.putExtra("id", id);
        PendingIntent stopPendingIntent = PendingIntent.getService(
            this,
            id,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        // 3. Build persistent Chronometer notification
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(subtitle != null && !subtitle.isEmpty() ? subtitle : (isCountdown ? "Countdown running" : "Stopwatch running"))
            .setOngoing(true)
            .setAutoCancel(false)
            .setOnlyAlertOnce(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC) // Visible on Lock Screen
            .setPriority(NotificationCompat.PRIORITY_MAX)        // Notch, Heads-Up, Shade Priority
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setContentIntent(contentPendingIntent)
            .setUsesChronometer(true)
            .setShowWhen(true)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Stop Timer", stopPendingIntent);

        if (isCountdown && targetEndTime > 0) {
            builder.setWhen(targetEndTime);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                builder.setChronometerCountDown(true);
            }
        } else {
            builder.setWhen(startTime > 0 ? startTime : System.currentTimeMillis());
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                builder.setChronometerCountDown(false);
            }
        }

        Notification notification = builder.build();

        // 4. Start as Foreground Service
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                startForeground(id, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
            } else {
                startForeground(id, notification);
            }
        } catch (Throwable t) {
            Log.w(TAG, "Fallback to basic startForeground", t);
            startForeground(id, notification);
        }

        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.notify(id, notification);
        }

        // 5. If countdown, schedule completion trigger
        long remainingMs = targetEndTime - System.currentTimeMillis();
        if (isCountdown && remainingMs > 0) {
            completionRunnable = () -> onCountdownFinished(id, currentTitle);
            completionHandler.postDelayed(completionRunnable, remainingMs);
        }
    }

    private void onCountdownFinished(int id, String title) {
        Log.i(TAG, "Countdown finished for timer: " + id);

        // Remove ongoing foreground notification
        stopForegroundStatus();

        // Intent to open app
        Intent openAppIntent = new Intent(this, MainActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentPendingIntent = PendingIntent.getActivity(
            this,
            0,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        // Show completed notification
        NotificationCompat.Builder doneBuilder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("🔔 " + title + " Finished!")
            .setContentText("Target time reached. Tap to open Quantra and log your session.")
            .setOngoing(false)
            .setAutoCancel(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setContentIntent(contentPendingIntent);

        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.notify(id + 10000, doneBuilder.build());
        }

        // Play alarm sound and vibration
        try {
            Uri soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            Ringtone r = RingtoneManager.getRingtone(getApplicationContext(), soundUri);
            if (r != null) {
                r.play();
            }
            Vibrator vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createWaveform(new long[]{0, 400, 200, 400}, -1));
                } else {
                    vibrator.vibrate(400);
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to play completion sound/vibrate", e);
        }

        stopSelf();
    }

    private void handleStopTimer(Intent intent) {
        int id = intent.getIntExtra("id", currentTimerId);
        Log.i(TAG, "handleStopTimer id=" + id);

        if (completionRunnable != null) {
            completionHandler.removeCallbacks(completionRunnable);
            completionRunnable = null;
        }

        stopForegroundStatus();

        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.cancel(id);
            manager.cancel(id + 10000);
        }

        stopSelf();
    }

    private void handleStopAll() {
        Log.i(TAG, "handleStopAll");

        if (completionRunnable != null) {
            completionHandler.removeCallbacks(completionRunnable);
            completionRunnable = null;
        }

        stopForegroundStatus();

        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.cancel(currentTimerId);
            manager.cancel(currentTimerId + 10000);
            manager.cancelAll();
        }

        stopSelf();
    }

    private void stopForegroundStatus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE);
        } else {
            stopForeground(true);
        }
    }

    @Override
    public void onDestroy() {
        if (completionRunnable != null) {
            completionHandler.removeCallbacks(completionRunnable);
            completionRunnable = null;
        }
        stopForegroundStatus();
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
