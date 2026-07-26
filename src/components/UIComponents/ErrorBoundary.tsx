import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 font-sans max-w-lg mx-auto mt-20 text-center">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-red-700 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-4">
              AI analysis is temporarily unavailable. Your document remains safely uploaded.
            </p>
            <p className="text-sm text-gray-500 mb-6 font-mono">
              {this.state.error?.message || "Unknown error occurred"}
            </p>
            <button
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
