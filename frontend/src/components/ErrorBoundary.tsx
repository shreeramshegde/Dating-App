import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

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
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-hinge-cream flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-hinge-border shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-hinge-black">
              Something unexpected happened
            </h2>
            <p className="text-xs text-neutral-600">
              {this.state.error?.message || 'An error occurred while rendering the page.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-full bg-hinge-black text-white text-xs font-bold flex items-center gap-2 mx-auto hover:bg-neutral-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
