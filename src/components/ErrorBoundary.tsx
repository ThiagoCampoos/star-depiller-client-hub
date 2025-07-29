import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Se for o erro específico de removeChild, podemos tentar forçar uma remontagem
    if (error.message.includes("removeChild") && error.message.includes("Node")) {
      // Forçar remontagem após um breve atraso
      setTimeout(() => {
        this.setState({ hasError: false });
      }, 100);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-destructive rounded-md bg-destructive/10 text-destructive">
          <h2 className="text-lg font-semibold">Algo deu errado.</h2>
          <p>Tente novamente ou contate o suporte se o problema persistir.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;