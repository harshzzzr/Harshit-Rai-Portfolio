import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught an error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F2F1ED] dark:bg-[#0C0C0C] text-[#101112] dark:text-[#D7E2EA] flex items-center justify-center p-6 bg-architectural-grid">
          <div className="max-w-md w-full bg-white/90 dark:bg-[#141516]/90 border border-neutral-300/80 dark:border-white/10 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 dark:text-amber-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white tracking-tight">Something went wrong</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              An unexpected error occurred while rendering the page. Reloading the experience usually resolves this.
            </p>
            {this.state.error?.message && (
              <pre className="text-xs bg-neutral-100 dark:bg-[#101112] p-3 rounded-lg text-rose-600 dark:text-rose-400 font-mono text-left mb-6 overflow-auto max-h-32 border border-neutral-200 dark:border-white/10">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-colors shadow-md shadow-primary-500/20 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-200/80 hover:bg-neutral-300 dark:bg-white/[0.06] dark:hover:bg-white/[0.10] text-neutral-800 dark:text-neutral-200 border border-neutral-300/60 dark:border-white/10 font-medium text-sm transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
