
import React, { Component, ErrorInfo, ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppWrapper } from './components/app/AppWrapper';

const TAG = "NewgatePOS";
const logNative = (msg: string, isError = false) => {
  if ((window as any).logToNative) {
    (window as any).logToNative(TAG, msg, isError);
  } else if ((window as any).NewgateNativeBridge) {
    try {
      if (isError) (window as any).NewgateNativeBridge.logError(TAG, msg);
      else (window as any).NewgateNativeBridge.logInfo(TAG, msg);
    } catch {}
  }
};

// 4: Log JS bundle loaded
console.log("JS bundle loaded");
logNative("JS bundle loaded");

// 5: Log Capacitor bridge ready
const checkCapacitorBridge = () => {
  if (typeof window !== 'undefined' && (window as any).Capacitor) {
    console.log("Capacitor bridge ready");
    logNative("Capacitor bridge ready");
  } else {
    document.addEventListener("deviceready", () => {
      console.log("Capacitor bridge ready");
      logNative("Capacitor bridge ready");
    }, { once: true });

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if ((window as any).Capacitor) {
        clearInterval(interval);
        console.log("Capacitor bridge ready");
        logNative("Capacitor bridge ready");
      } else if (attempts > 30) {
        clearInterval(interval);
      }
    }, 100);
  }
};
checkCapacitorBridge();

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };
  props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[RootErrorBoundary] Uncaught application error:', error, errorInfo);
    logNative(`[RootErrorBoundary] Uncaught application error: ${error.message}\nStack: ${error.stack}\nComponent: ${errorInfo.componentStack}`, true);
  }

  handleReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#090d16',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'Inter, system-ui, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '520px',
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#f43f5e', marginBottom: '12px' }}>
              Application Recovery
            </h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.6' }}>
              The application encountered an unexpected runtime error. You can reload the application or reset local cache to restore standard operation.
            </p>
            {this.state.error && (
              <pre style={{
                textAlign: 'left',
                fontSize: '11px',
                color: '#cbd5e1',
                backgroundColor: '#020617',
                padding: '12px',
                borderRadius: '8px',
                overflowX: 'auto',
                marginBottom: '20px',
                maxHeight: '160px'
              }}>
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              style={{
                backgroundColor: '#6366f1',
                color: '#ffffff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Reset & Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ReactMountNotifier: React.FC = () => {
  React.useEffect(() => {
    console.log("React mounted");
    logNative("React mounted");
  }, []);
  return null;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = (ReactDOM as any).createRoot
  ? (ReactDOM as any).createRoot(rootElement)
  : (ReactDOM as any).default.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <RootErrorBoundary>
      <ReactMountNotifier />
      <AppWrapper>
        <App />
      </AppWrapper>
    </RootErrorBoundary>
  </React.StrictMode>
);
