package app.lifeos.commandcentre;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.UUID;

public class TransactionBufferStore {
    private static final String PREF_NAME = "QuantraTxBufferStore";
    private static final String KEY_PENDING_TX = "pending_transactions";
    private static final int MAX_BUFFER_SIZE = 100;

    private static SharedPreferences getPrefs(Context context) {
        return context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    public static synchronized void addTransaction(Context context, String source, String sender, String rawText, long timestamp) {
        if (rawText == null || rawText.trim().isEmpty()) return;

        SharedPreferences prefs = getPrefs(context);
        String existingJson = prefs.getString(KEY_PENDING_TX, "[]");
        try {
            JSONArray array = new JSONArray(existingJson);

            // Deduplication: Avoid storing duplicate alerts with the exact same text within recent buffer
            for (int i = 0; i < array.length(); i++) {
                JSONObject obj = array.getJSONObject(i);
                if (rawText.trim().equals(obj.optString("rawText").trim())) {
                    return; // duplicate
                }
            }

            JSONObject newTx = new JSONObject();
            newTx.put("id", UUID.randomUUID().toString());
            newTx.put("source", source);
            newTx.put("sender", sender != null ? sender : "UNKNOWN");
            newTx.put("rawText", rawText.trim());
            newTx.put("timestamp", timestamp > 0 ? timestamp : System.currentTimeMillis());

            // Limit buffer size to MAX_BUFFER_SIZE
            if (array.length() >= MAX_BUFFER_SIZE) {
                // Remove oldest
                JSONArray trimmed = new JSONArray();
                for (int i = array.length() - (MAX_BUFFER_SIZE - 1); i < array.length(); i++) {
                    trimmed.put(array.get(i));
                }
                array = trimmed;
            }

            array.put(newTx);
            prefs.edit().putString(KEY_PENDING_TX, array.toString()).apply();
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    public static synchronized String getPendingTransactionsJson(Context context) {
        SharedPreferences prefs = getPrefs(context);
        return prefs.getString(KEY_PENDING_TX, "[]");
    }

    public static synchronized void clearPendingTransactions(Context context) {
        SharedPreferences prefs = getPrefs(context);
        prefs.edit().putString(KEY_PENDING_TX, "[]").apply();
    }

    public static synchronized int getPendingCount(Context context) {
        try {
            JSONArray arr = new JSONArray(getPendingTransactionsJson(context));
            return arr.length();
        } catch (JSONException e) {
            return 0;
        }
    }
}
