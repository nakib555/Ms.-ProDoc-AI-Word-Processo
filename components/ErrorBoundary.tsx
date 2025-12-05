import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center h-full w-full p-6 bg-red-50 dark:bg-red-900/20 text-center rounded-lg border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
          <h2 className="text-lg font-bold text-red-700 dark:text-red-300 mb-2">Something went wrong</h2>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4 max-w-md">
            {error?.message || "An unexpected error occurred while rendering this component."}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-red-950 border border-red-300 dark:border-red-700 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-50 transition-colors"
          >
            <RefreshCw size={14} /> Reload Application
          </button>
        </div>
      );
    }

    return children;
  }
}
