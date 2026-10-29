package app.lifeos.commandcentre;

import android.app.Notification;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

public class TransactionNotificationListener extends NotificationListenerService {
    private static final String TAG = "QuantraTxNotifListener";

    // Known financial and UPI app package names in India
    private static final Set<String> TARGET_FINANCIAL_PACKAGES = new HashSet<>(Arrays.asList(
            "com.google.android.apps.nbu.paisa.user", // Google Pay
            "com.phonepe.app",                       // PhonePe
            "net.one97.paytm",                       // Paytm
            "com.cred.club",                         // CRED
            "in.org.npci.upiapp",                    // BHIM
            "com.freecharge.android",                // Freecharge
            "in.amazon.mShop.android.shopping",      // Amazon Pay
            "com.csam.icici.bank.imobile",           // ICICI iMobile
            "com.snapwork.hdfc",                     // HDFC Bank MobileBanking
            "com.mgs.hsbch",                         // HDFC PayZapp
            "com.sbi.lotusintouch",                  // SBI YONO
            "com.axis.mobile",                       // Axis Mobile
            "com.kotak.mbanking",                    // Kotak 811
            "com.indusind.mbanking",                 // IndusInd Bank
            "com.bankofbaroda.mconnect",             // Baroda M-Connect
            "com.canarabank.ai1",                    // Canara ai1
            "com.idfcfirstbank.optimus",             // IDFC First Bank
            "com.fedmobile",                         // Federal Bank
            "com.rblbank.mobank"                     // RBL MoBank
    ));

    // Financial keywords to identify transaction alerts even from unlisted packages
    private static final String[] FINANCIAL_KEYWORDS = {
            "debited", "credited", "paid", "spent", "sent rs", "received rs",
            "inr", "rs.", "rs ", "vpa", "upi ref", "a/c", "acct", "transferred",
            "withdrawn", "payment of", "successful payment", "txn"
    };

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        if (sbn == null || sbn.getNotification() == null) return;

        try {
            String packageName = sbn.getPackageName();
            Bundle extras = sbn.getNotification().extras;
            if (extras == null) return;

            CharSequence titleSeq = extras.getCharSequence(Notification.EXTRA_TITLE);
            CharSequence textSeq = extras.getCharSequence(Notification.EXTRA_TEXT);
            CharSequence bigTextSeq = extras.getCharSequence(Notification.EXTRA_BIG_TEXT);

            String title = titleSeq != null ? titleSeq.toString().trim() : "";
            String text = bigTextSeq != null ? bigTextSeq.toString().trim() : (textSeq != null ? textSeq.toString().trim() : "");

            if (text.isEmpty()) return;

            String combined = (title.isEmpty() ? "" : title + " - ") + text;
            String lowerCombined = combined.toLowerCase(Locale.ENGLISH);

            boolean isTargetPackage = TARGET_FINANCIAL_PACKAGES.contains(packageName);
            boolean containsFinancialKeyword = false;

            for (String kw : FINANCIAL_KEYWORDS) {
                if (lowerCombined.contains(kw)) {
                    containsFinancialKeyword = true;
                    break;
                }
            }

            // Only capture if from financial app OR contains strong transactional keyword
            if (isTargetPackage || containsFinancialKeyword) {
                // Ignore OTP and promotional spam
                if (lowerCombined.contains("otp") || lowerCombined.contains("one time password") || lowerCombined.contains("verification code")) {
                    return;
                }

                Log.d(TAG, "Captured Financial Notification from [" + packageName + "]: " + combined);

                // Save to local persistence store
                TransactionBufferStore.addTransaction(
                        getApplicationContext(),
                        "NOTIFICATION",
                        packageName,
                        combined,
                        sbn.getPostTime()
                );

                // Broadcast in-memory event to active Capacitor webview
                TransactionScannerPlugin.broadcastAlert(combined, packageName, "NOTIFICATION");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error processing notification", e);
        }
    }
}
