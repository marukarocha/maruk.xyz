import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
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
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
        if (this.props.fallback) return this.props.fallback;
        
        return (
            <div className="min-h-screen bg-black text-red-500 p-10 font-mono">
                <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
                <div className="bg-red-900/20 p-4 rounded border border-red-500/50">
                    {this.state.error?.toString()}
                </div>
            </div>
        );
    }

    return this.props.children;
  }
}
