package app.lifeos.commandcentre;

import android.content.Intent;
import android.os.Build;
import android.util.Log;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "PersistentTimer")
public class PersistentTimerPlugin extends Plugin {
    private static final String TAG = "PersistentTimerPlugin";

    @PluginMethod
    public void startTimer(PluginCall call) {
        try {
            int id = 1001;
            if (call.hasOption("id")) {
                Object idObj = call.getData().opt("id");
                if (idObj instanceof Number) {
                    id = ((Number) idObj).intValue();
                }
            }

            String title = call.getString("title", "Active Timer");
            String subtitle = call.getString("subtitle", "Timer Running");
            boolean isCountdown = Boolean.TRUE.equals(call.getBoolean("isCountdown", true));

            long targetEndTime = 0L;
            if (call.hasOption("targetEndTime")) {
                Object targetObj = call.getData().opt("targetEndTime");
                if (targetObj instanceof Number) {
                    targetEndTime = ((Number) targetObj).longValue();
                }
            }

            long startTime = System.currentTimeMillis();
            if (call.hasOption("startTime")) {
                Object startObj = call.getData().opt("startTime");
                if (startObj instanceof Number) {
                    startTime = ((Number) startObj).longValue();
                }
            }

            Log.i(TAG, "Starting persistent timer id=" + id + " title=" + title + " countdown=" + isCountdown + " target=" + targetEndTime);

            Intent intent = new Intent(getContext(), PersistentTimerService.class);
            intent.setAction(PersistentTimerService.ACTION_START);
            intent.putExtra("id", id);
            intent.putExtra("title", title);
            intent.putExtra("subtitle", subtitle);
            intent.putExtra("isCountdown", isCountdown);
            intent.putExtra("targetEndTime", targetEndTime);
            intent.putExtra("startTime", startTime);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getContext().startForegroundService(intent);
            } else {
                getContext().startService(intent);
            }

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("id", id);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Error starting persistent timer", e);
            call.reject("Failed to start persistent timer: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void stopTimer(PluginCall call) {
        try {
            int id = 1001;
            if (call.hasOption("id")) {
                Object idObj = call.getData().opt("id");
                if (idObj instanceof Number) {
                    id = ((Number) idObj).intValue();
                }
            }

            Log.i(TAG, "Stopping persistent timer id=" + id);

            Intent intent = new Intent(getContext(), PersistentTimerService.class);
            intent.setAction(PersistentTimerService.ACTION_STOP);
            intent.putExtra("id", id);
            getContext().startService(intent);

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("id", id);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Error stopping persistent timer", e);
            call.reject("Failed to stop persistent timer: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void stopAllTimers(PluginCall call) {
        try {
            Log.i(TAG, "Stopping all persistent timers");

            Intent intent = new Intent(getContext(), PersistentTimerService.class);
            intent.setAction(PersistentTimerService.ACTION_STOP_ALL);
            getContext().startService(intent);

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Error stopping all persistent timers", e);
            call.reject("Failed to stop all persistent timers: " + e.getMessage(), e);
        }
    }
}
