import { Capacitor, registerPlugin, PluginListenerHandle } from '@capacitor/core';
import { parseFinancialSms, ParsedTransactionResult } from './smsParserService';

export interface RawDetectedAlert {
  id: string;
  source: 'NOTIFICATION' | 'SMS';
  sender: string;
  rawText: string;
  timestamp: number;
}

export interface TransactionScannerPlugin {
  isNotificationAccessGranted(): Promise<{ granted: boolean }>;
  openNotificationAccessSettings(): Promise<{ opened: boolean }>;
  checkSmsPermission(): Promise<{ granted: boolean }>;
  requestSmsPermission(): Promise<{ granted: boolean }>;
  getPendingTransactions(): Promise<{ transactions: RawDetectedAlert[]; count: number }>;
  clearPendingTransactions(): Promise<{ cleared: boolean }>;
  addListener(
    eventName: 'onTransactionDetected',
    listenerFunc: (data: { rawText: string; sender: string; source: string; timestamp: number }) => void
  ): Promise<PluginListenerHandle>;
}

const NativeScanner = registerPlugin<TransactionScannerPlugin>('TransactionScanner');

export const nativeTransactionScanner = {
  isSupported(): boolean {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  },

  async isNotificationAccessGranted(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const res = await NativeScanner.isNotificationAccessGranted();
      return !!res.granted;
    } catch (e) {
      console.warn('Failed to check notification access', e);
      return false;
    }
  },

  async openNotificationSettings(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const res = await NativeScanner.openNotificationAccessSettings();
      return !!res.opened;
    } catch (e) {
      console.warn('Failed to open notification settings', e);
      return false;
    }
  },

  async checkSmsPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const res = await NativeScanner.checkSmsPermission();
      return !!res.granted;
    } catch (e) {
      console.warn('Failed to check SMS permission', e);
      return false;
    }
  },

  async requestSmsPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const res = await NativeScanner.requestSmsPermission();
      return !!res.granted;
    } catch (e) {
      console.warn('Failed to request SMS permission', e);
      return false;
    }
  },

  async fetchPendingTransactions(): Promise<{
    raw: RawDetectedAlert[];
    parsed: ParsedTransactionResult[];
  }> {
    if (!this.isSupported()) return { raw: [], parsed: [] };
    try {
      const res = await NativeScanner.getPendingTransactions();
      const rawList = res.transactions || [];
      const parsedList: ParsedTransactionResult[] = [];

      for (const item of rawList) {
        const parsed = parseFinancialSms(item.rawText);
        if (parsed) {
          // Carry forward source tracking
          parsed.sourceApp = item.source === 'NOTIFICATION' ? item.sender : 'SMS';
          parsedList.push(parsed);
        }
      }

      return { raw: rawList, parsed: parsedList };
    } catch (e) {
      console.warn('Failed to get pending transactions', e);
      return { raw: [], parsed: [] };
    }
  },

  async clearPendingTransactions(): Promise<void> {
    if (!this.isSupported()) return;
    try {
      await NativeScanner.clearPendingTransactions();
    } catch (e) {
      console.warn('Failed to clear pending transactions', e);
    }
  },

  async listenForLiveTransactions(
    callback: (item: RawDetectedAlert, parsed: ParsedTransactionResult | null) => void
  ): Promise<PluginListenerHandle | null> {
    if (!this.isSupported()) return null;
    try {
      return await NativeScanner.addListener('onTransactionDetected', (data) => {
        const rawAlert: RawDetectedAlert = {
          id: `live_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          source: (data.source as 'NOTIFICATION' | 'SMS') || 'NOTIFICATION',
          sender: data.sender || 'UNKNOWN',
          rawText: data.rawText,
          timestamp: data.timestamp || Date.now(),
        };
        const parsed = parseFinancialSms(data.rawText);
        if (parsed) {
          parsed.sourceApp = rawAlert.source === 'NOTIFICATION' ? rawAlert.sender : 'SMS';
        }
        callback(rawAlert, parsed);
      });
    } catch (e) {
      console.warn('Failed to add live transaction listener', e);
      return null;
    }
  },
};
