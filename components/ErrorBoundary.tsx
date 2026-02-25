import * as React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State;
  public props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-red-100 p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="text-red-500" size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif-elegant text-stone-800">Something went wrong</h2>
              <p className="text-stone-500 text-sm">
                An unexpected error occurred in the Admin Dashboard.
              </p>
              {this.state.error && (
                <div className="mt-4 p-4 bg-stone-50 rounded-xl border border-stone-100 text-left">
                  <p className="text-[10px] font-mono text-red-600 break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#008080] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#006666] transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <RefreshCw size={18} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
