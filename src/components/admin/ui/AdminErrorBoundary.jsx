import React from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';

export default class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[AdminErrorBoundary caught an error]:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-2xl bg-white dark:bg-[#101112] border border-rose-200 dark:border-rose-900/40 shadow-lg text-center space-y-5 animate-fade-in my-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center border border-rose-200 dark:border-rose-900/60">
            <AlertTriangle size={28} />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Unable to display this admin section
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              An unexpected error occurred while rendering this management console.
            </p>
            {this.state.error?.message && (
              <p className="text-xs font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-left overflow-auto max-h-24 mt-2">
                {this.state.error.message}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Retry Section</span>
            </button>
            {this.props.onResetTab && (
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  this.props.onResetTab();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-white/[0.06] hover:bg-neutral-200 dark:hover:bg-white/[0.10] text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-white/10 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LayoutDashboard size={14} />
                <span>Return to Overview</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
