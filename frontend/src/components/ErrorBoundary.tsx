import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowRight, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    if (import.meta.env.DEV) console.error("CLARIVON page error:", error);
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-xl mb-4">Something went wrong while loading this page.</h2>
            <p className="text-muted-foreground mb-6">Please retry or return to your dashboard.</p>

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer"
              )}
            >
              <RotateCcw size={16} />
              Try again
            </button>
            <button
              onClick={() => { window.history.pushState({}, "", "/discovery/dashboard"); window.dispatchEvent(new PopStateEvent("popstate")); this.setState({ hasError: false, error: null }); }}
              className="flex items-center gap-2 px-4 py-2 mt-3 rounded-lg text-muted-foreground hover:opacity-80 cursor-pointer"
            >
              Go to Dashboard <ArrowRight size={16} />
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
