import { PluginListenerHandle } from '@capacitor/core';
import { ParsedTransactionResult } from './smsParserService';

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

export const nativeTransactionScanner = {
  isSupported(): boolean {
    // Disabled in compliance with Google Play Protect data security standards (zero high-risk background sniffing)
    return false;
  },

  async isNotificationAccessGranted(): Promise<boolean> {
    return false;
  },

  async openNotificationSettings(): Promise<boolean> {
    return false;
  },

  async checkSmsPermission(): Promise<boolean> {
    return false;
  },

  async requestSmsPermission(): Promise<boolean> {
    return false;
  },

  async fetchPendingTransactions(): Promise<{
    raw: RawDetectedAlert[];
    parsed: ParsedTransactionResult[];
  }> {
    return { raw: [], parsed: [] };
  },

  async clearPendingTransactions(): Promise<void> {
    return;
  },

  async listenForLiveTransactions(
    _callback: (item: RawDetectedAlert, parsed: ParsedTransactionResult | null) => void
  ): Promise<PluginListenerHandle | null> {
    return null;
  },
};
