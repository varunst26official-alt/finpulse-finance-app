package app.lifeos.commandcentre;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(TransactionScannerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
