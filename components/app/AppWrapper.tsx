/**
 * AppWrapper
 * Root context and provider composition wrapper for Newgate POS.
 * Initializes singleton services (SyncService, RealtimeTransport) once at the root level,
 * wraps the application with SettingsProvider, and provides a stable application context.
 */

import React, { useEffect } from 'react';
import { ApiClient } from '../../services/apiClient';
import { SyncService } from '../../services/syncService';
import { RealtimeTransport } from '../../services/realtimeTransport';
import { StorageMigrationService } from '../../services/storageMigrationService';

export const AppWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    StorageMigrationService.run();
    const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env || {};
    const api = new ApiClient({ baseUrl: env.VITE_API_BASE_URL });
    SyncService.configure(api);
    const flush = () => { void SyncService.flushIfOnline(); };
    window.addEventListener('online', flush);
    flush();

    const realtime = env.VITE_WS_URL
      ? new RealtimeTransport({ url: env.VITE_WS_URL, onEvent: event => window.dispatchEvent(new CustomEvent(`newgate:${event.type}`, { detail: event })) })
      : null;
    realtime?.connect();
    return () => {
      window.removeEventListener('online', flush);
      realtime?.close();
    };
  }, []);

  return <>{children}</>;
};

