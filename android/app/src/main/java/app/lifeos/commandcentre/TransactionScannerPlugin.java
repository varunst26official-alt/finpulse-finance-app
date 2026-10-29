package app.lifeos.commandcentre;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.provider.Settings;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import org.json.JSONArray;
import org.json.JSONException;
import java.util.Set;

@CapacitorPlugin(
    name = "TransactionScanner",
    permissions = {
        @Permission(
            alias = "sms",
            strings = { Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS }
        )
    }
)
public class TransactionScannerPlugin extends Plugin {
    private static TransactionScannerPlugin instance;

    @Override
    public void load() {
        super.load();
        instance = this;
    }

    public static void broadcastAlert(String rawText, String sender, String source) {
        if (instance != null) {
            JSObject data = new JSObject();
            data.put("rawText", rawText);
            data.put("sender", sender);
            data.put("source", source);
            data.put("timestamp", System.currentTimeMillis());
            instance.notifyListeners("onTransactionDetected", data);
        }
    }

    @PluginMethod
    public void isNotificationAccessGranted(PluginCall call) {
        Context context = getContext();
        Set<String> packageNames = NotificationManagerCompat.getEnabledListenerPackages(context);
        boolean isGranted = packageNames.contains(context.getPackageName());
        JSObject ret = new JSObject();
        ret.put("granted", isGranted);
        call.resolve(ret);
    }

    @PluginMethod
    public void openNotificationAccessSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            JSObject ret = new JSObject();
            ret.put("opened", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Could not open notification settings", e);
        }
    }

    @PluginMethod
    public void checkSmsPermission(PluginCall call) {
        boolean granted = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.RECEIVE_SMS) == PackageManager.PERMISSION_GRANTED;
        JSObject ret = new JSObject();
        ret.put("granted", granted);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestSmsPermission(PluginCall call) {
        if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.RECEIVE_SMS) == PackageManager.PERMISSION_GRANTED) {
            JSObject ret = new JSObject();
            ret.put("granted", true);
            call.resolve(ret);
        } else {
            requestPermissionForAlias("sms", call, "smsPermsCallback");
        }
    }

    @PermissionCallback
    private void smsPermsCallback(PluginCall call) {
        boolean granted = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.RECEIVE_SMS) == PackageManager.PERMISSION_GRANTED;
        JSObject ret = new JSObject();
        ret.put("granted", granted);
        call.resolve(ret);
    }

    @PluginMethod
    public void getPendingTransactions(PluginCall call) {
        try {
            String jsonStr = TransactionBufferStore.getPendingTransactionsJson(getContext());
            JSONArray jsonArr = new JSONArray(jsonStr);
            JSArray retArray = new JSArray();
            for (int i = 0; i < jsonArr.length(); i++) {
                retArray.put(new JSObject(jsonArr.getJSONObject(i).toString()));
            }
            JSObject result = new JSObject();
            result.put("transactions", retArray);
            result.put("count", jsonArr.length());
            call.resolve(result);
        } catch (JSONException e) {
            call.reject("Failed to parse transactions", e);
        }
    }

    @PluginMethod
    public void clearPendingTransactions(PluginCall call) {
        TransactionBufferStore.clearPendingTransactions(getContext());
        JSObject ret = new JSObject();
        ret.put("cleared", true);
        call.resolve(ret);
    }
}
