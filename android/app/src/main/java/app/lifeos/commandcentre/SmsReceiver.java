package app.lifeos.commandcentre;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.provider.Telephony;
import android.telephony.SmsMessage;
import android.util.Log;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class SmsReceiver extends BroadcastReceiver {
    private static final String TAG = "QuantraSmsReceiver";

    private static final String[] SMS_FINANCIAL_KEYWORDS = {
            "debited", "credited", "spent", "paid", "sent rs", "received rs",
            "inr", "rs.", "rs ", "upi ref", "a/c", "acct", "transferred",
            "withdrawn", "payment of", "successful payment", "txn", "vpa"
    };

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !Telephony.Sms.Intents.SMS_RECEIVED_ACTION.equals(intent.getAction())) {
            return;
        }

        try {
            SmsMessage[] messages = Telephony.Sms.Intents.getMessagesFromIntent(intent);
            if (messages == null || messages.length == 0) return;

            // Group multi-part SMS messages by sender
            Map<String, StringBuilder> messageMap = new HashMap<>();
            long timestamp = System.currentTimeMillis();

            for (SmsMessage sms : messages) {
                if (sms == null) continue;
                String sender = sms.getOriginatingAddress();
                if (sender == null) sender = "BANK_SMS";
                String body = sms.getMessageBody();
                if (body == null) continue;

                if (!messageMap.containsKey(sender)) {
                    messageMap.put(sender, new StringBuilder());
                    timestamp = sms.getTimestampMillis();
                }
                messageMap.get(sender).append(body);
            }

            for (Map.Entry<String, StringBuilder> entry : messageMap.entrySet()) {
                String sender = entry.getKey();
                String fullBody = entry.getValue().toString().trim();
                String lowerBody = fullBody.toLowerCase(Locale.ENGLISH);

                // Ignore OTPs and non-financial messages
                if (lowerBody.contains("otp") || lowerBody.contains("verification code") || lowerBody.contains("one time password")) {
                    continue;
                }

                boolean isFinancial = false;
                for (String kw : SMS_FINANCIAL_KEYWORDS) {
                    if (lowerBody.contains(kw)) {
                        isFinancial = true;
                        break;
                    }
                }

                if (isFinancial) {
                    Log.d(TAG, "Captured Financial SMS from [" + sender + "]: " + fullBody);

                    // Save to persistent buffer
                    TransactionBufferStore.addTransaction(
                            context.getApplicationContext(),
                            "SMS",
                            sender,
                            fullBody,
                            timestamp
                    );

                    // Broadcast in-memory event to active Capacitor webview
                    TransactionScannerPlugin.broadcastAlert(fullBody, sender, "SMS");
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error handling SMS_RECEIVED", e);
        }
    }
}
