import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

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
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen flex-col items-center justify-center space-y-4 p-8 text-center bg-background text-foreground">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                    <h1 className="text-2xl font-bold">Algo salió mal</h1>
                    <div className="max-w-md rounded-md bg-muted p-4 text-left font-mono text-sm overflow-auto">
                        {this.state.error?.message}
                    </div>
                    <button
                        className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                        onClick={() => window.location.href = '/'}
                    >
                        Volver al inicio
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
